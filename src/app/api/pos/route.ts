import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

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
    
    // SoD (Segregation of Duties) Check - If PO > 500,000 INR
    const requiresApproval = parseFloat(data.total || 0) > 500000;
    
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
        total: parseFloat(data.total || 0),
        details: data.details || null,
        erpStatus: finalErpStatus
      }
    });

    if (requiresApproval) {
      let workflow = await prisma.workflow.findFirst({ where: { category: 'Finance PO Approval' }});
      if (!workflow) {
        workflow = await prisma.workflow.create({
          data: {
            name: 'High Value PO Approval',
            category: 'Finance PO Approval',
            approvers: JSON.stringify(['finance_director@company.com']),
            isActive: true
          }
        });
      }

      await prisma.approvalRequest.create({
        data: {
          eventId: po.eventId, // Link to the same event
          workflowId: workflow.id,
          status: 'Pending',
          currentStep: 0,
          history: JSON.stringify([{ 
            action: 'Created', 
            by: 'System (SoD Policy)', 
            date: new Date().toISOString(),
            poId: po.id, // Embedding PO ID here so the approval engine knows it's a PO approval
            type: 'PO_APPROVAL'
          }])
        }
      });

      return NextResponse.json(po, { status: 201 });
    }

    // Asynchronously push to ERP Sync Service (Microservice)
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
