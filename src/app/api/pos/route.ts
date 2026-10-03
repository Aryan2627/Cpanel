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
    
    // --- DYNAMIC APPROVAL RULES ENGINE (MATRIX) ---
    const totalAmount = parseFloat(data.total || 0);
    
    const rules = await prisma.approvalRule.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'asc' }
    });
    
    let triggeredApprovers: string[] = [];
    
    // Evaluate the matrix rules against the PO Amount (TPA)
    for (const rule of rules) {
      if (rule.type === 'TPA' || rule.type === 'estimatedValue') {
        const ruleValue1 = parseFloat(rule.value1);
        const ruleValue2 = rule.value2 ? parseFloat(rule.value2) : 0;
        
        let matches = false;
        if (rule.logic === 'More than' && totalAmount > ruleValue1) matches = true;
        else if (rule.logic === 'Less than' && totalAmount < ruleValue1) matches = true;
        else if (rule.logic === '>=' && totalAmount >= ruleValue1) matches = true;
        else if (rule.logic === '<=' && totalAmount <= ruleValue1) matches = true;
        else if (rule.logic === 'Between' && totalAmount >= ruleValue1 && totalAmount <= ruleValue2) matches = true;
        
        if (matches) {
          try {
            const ruleApprovers = JSON.parse(rule.approvers);
            if (Array.isArray(ruleApprovers)) {
               triggeredApprovers.push(...ruleApprovers);
            }
          } catch(e) {}
        }
      }
    }
    
    // Deduplicate approvers while maintaining their sequence order
    triggeredApprovers = [...new Set(triggeredApprovers)].filter(Boolean);
    
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
                await prisma.intake.update({
                  where: { id: intake.id },
                  data: { status: 'Approved' }
                });
              } else {
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
      const workflow = await prisma.workflow.create({
        data: {
          name: `Matrix Approval - ${po.poNumber}`,
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
            by: 'System (Matrix Engine)', 
            date: new Date().toISOString(),
            poId: po.id, 
            type: 'PO_APPROVAL'
          }])
        }
      });

      return NextResponse.json(po, { status: 201 });
    }

    fetch('http://localhost:3001/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(po)
    }).then(async (res) => {
        if (res.ok) {
          const syncData = await res.json();
          await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { erpStatus: 'Synced', erpId: syncData.erpPoId || po.poNumber, source: 'ERP Sync Service' }
          });
        }
    }).catch(err => {
      console.error('Failed to push PO to ERP Microservice:', err.message);
    });

    return NextResponse.json(po, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
