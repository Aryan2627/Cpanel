import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const pos = await prisma.purchaseOrder.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(pos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    const data = await request.json();
    
    // --- DYNAMIC APPROVAL RULES ENGINE ---
    const totalAmount = parseFloat(data.total || 0);
    
    // Fetch all rules from the Routing Engine, sorted by hierarchy (step order)
    const rules = await prisma.approvalRule.findMany({
      orderBy: { hierarchyLevel: 'asc' }
    });
    
    let triggeredApprovers: string[] = [];
    
    // Evaluate the rules against the PO Amount (TPA)
    for (const rule of rules) {
      if (rule.field === 'estimatedValue') {
        const ruleValue = parseFloat(rule.value);
        if (rule.operator === '>=' && totalAmount >= ruleValue) {
          triggeredApprovers.push(rule.approverRole);
        } else if (rule.operator === '==' && totalAmount === ruleValue) {
          triggeredApprovers.push(rule.approverRole);
        }
      }
    }
    
    // Deduplicate approvers while maintaining their sorted hierarchy order
    triggeredApprovers = [...new Set(triggeredApprovers)];
    
    const requiresApproval = triggeredApprovers.length > 0;
    
    const finalStatus = requiresApproval ? 'Pending Approval' : (data.status || 'Pending Vendor');
    const finalErpStatus = requiresApproval ? 'Blocked - Pending Finance Approval' : 'Pending Sync';

    const po = await prisma.purchaseOrder.create({
      data: {
        organizationId: orgId,
        poNumber: data.poNumber,
        title: data.title,
        status: finalStatus,
        vendorId: data.vendorId,
        eventId: data.eventId,
        total: totalAmount,
        details: data.details || null,
        erpStatus: finalErpStatus
      }
    });

    // Update Intakes based on awarded quantities
    if (data.details) {
      try {
        const detailsObj = JSON.parse(data.details);
        if (detailsObj.awardedPrs) {
          const prs = detailsObj.awardedPrs;
          for (const [refId, awardedQtyStr] of Object.entries(prs)) {
            const awardedQty = Number(awardedQtyStr);
            const intake = await prisma.intake.findUnique({ where: { refId } });
            
            if (intake && awardedQty > 0) {
              if (awardedQty >= intake.quantity) {
                // Fully awarded -> mark as Approved (Completed)
                await prisma.intake.update({
                  where: { id: intake.id },
                  data: { status: 'Approved' }
                });
              } else {
                // Partially awarded -> split the PR
                const remaining = intake.quantity - awardedQty;
                
                await prisma.intake.update({
                  where: { id: intake.id },
                  data: { status: 'Approved', quantity: awardedQty }
                });
                
                await prisma.intake.create({
                  data: {
                    organizationId: intake.organizationId,
                    refId: intake.refId + '-REM' + Math.floor(Math.random() * 1000), 
                    title: intake.title,
                    reqName: intake.reqName,
                    status: 'Open', 
                    type: intake.type,
                    buyer: intake.buyer,
                    reqAt: intake.reqAt,
                    updAt: intake.updAt,
                    source: intake.source,
                    erpId: intake.erpId,
                    quantity: remaining
                  }
                });
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to update PR quantities:", e);
      }
    }

    if (requiresApproval) {
      // Create a unique dynamic workflow just for this PO
      const workflow = await prisma.workflow.create({
        data: {
          name: `Dynamic Approval - ${po.poNumber}`,
          category: 'Finance PO Approval',
          approvers: JSON.stringify(triggeredApprovers),
          isActive: true
        }
      });

      await prisma.approvalRequest.create({
        data: {
          organizationId: orgId,
          eventId: po.eventId, 
          workflowId: workflow.id,
          status: 'Pending',
          currentStep: 0,
          history: JSON.stringify([{ 
            action: 'Created', 
            by: 'System (Routing Engine)', 
            date: new Date().toISOString(),
            poId: po.id, 
            type: 'PO_APPROVAL'
          }])
        }
      });

      return NextResponse.json(po, { status: 201 });
    }

    // If no rules triggered, auto-push to ERP Sync Service (Microservice)
    fetch('http://localhost:3001/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(po)
    })
      .then(async (res) => {
        if (res.ok) {
          const syncData = await res.json();
          await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { erpStatus: 'Synced', erpId: syncData.erpPoId || po.poNumber, source: 'ERP Sync Service' }
          });
        }
      })
      .catch(err => {
        console.error('Failed to push PO to ERP Microservice:', err.message);
      });

    return NextResponse.json(po, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
