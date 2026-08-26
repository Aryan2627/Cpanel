import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const approvals = await prisma.approvalRequest.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    
    const eventIds = approvals.map(a => a.eventId);
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } }
    });
    
    const workflows = await prisma.workflow.findMany();

    const richApprovals = approvals.map(approval => {
      const event = events.find(e => e.id === approval.eventId);
      const workflow = workflows.find(w => w.id === approval.workflowId);
      
      let approvers = [];
      try { approvers = workflow ? JSON.parse(workflow.approvers) : []; } catch (e) {}

      let history = [];
      try { if (approval.history) history = JSON.parse(approval.history); } catch (e) {}
      
      const isPoApproval = history.length > 0 && history[0].type === 'PO_APPROVAL';
      const poId = isPoApproval ? history[0].poId : null;

      return {
        ...approval,
        eventTitle: isPoApproval ? `Purchase Order for: ${event?.title || 'Unknown'}` : (event?.title || 'Unknown Event'),
        eventRef: event?.refId || '-',
        category: workflow?.category || '-',
        currentApproverEmail: approvers[approval.currentStep] || 'Unknown',
        totalSteps: approvers.length,
        isPoApproval,
        poId
      };
    });

    return NextResponse.json(richApprovals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { approvalId, action, comment, userEmail } = data; 

    if (!approvalId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const approval = await prisma.approvalRequest.findUnique({
      where: { id: approvalId }
    });

    if (!approval) return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    if (approval.status !== 'Pending') return NextResponse.json({ error: 'Approval already processed' }, { status: 400 });

    const workflow = await prisma.workflow.findUnique({ where: { id: approval.workflowId } });
    let approvers: string[] = [];
    if (workflow) {
      try { approvers = JSON.parse(workflow.approvers); } catch (e) {}
    }

    let history: any[] = [];
    try { if (approval.history) history = JSON.parse(approval.history); } catch (e) {}
    
    const isPoApproval = history.length > 0 && history[0].type === 'PO_APPROVAL';
    const poId = isPoApproval ? history[0].poId : null;

    history.push({
      action,
      user: userEmail || 'System',
      comment: comment || '',
      date: new Date().toISOString()
    });

    if (action === 'reject') {
      await prisma.approvalRequest.update({
        where: { id: approvalId },
        data: { status: 'Rejected', history: JSON.stringify(history) }
      });
      
      if (isPoApproval && poId) {
         await prisma.purchaseOrder.update({
            where: { id: poId },
            data: { status: 'Rejected', erpStatus: 'Voided' }
         });
      } else {
         await prisma.event.update({
           where: { id: approval.eventId },
           data: { status: 'Rejected' }
         });
      }
      return NextResponse.json({ success: true, status: 'Rejected' });
    } 
    
    if (action === 'approve') {
      const nextStep = approval.currentStep + 1;
      
      if (nextStep >= approvers.length) {
        // Fully approved
        await prisma.approvalRequest.update({
          where: { id: approvalId },
          data: { status: 'Approved', currentStep: nextStep, history: JSON.stringify(history) }
        });
        
        if (isPoApproval && poId) {
           await prisma.purchaseOrder.update({
              where: { id: poId },
              data: { status: 'Pending Vendor', erpStatus: 'Pending Sync' } // Unblocks ERP sync and Vendor release
           });
           
           // Theoretically we could trigger the ERP fetch here, but async is fine for demo
        } else {
           await prisma.event.update({
             where: { id: approval.eventId },
             data: { status: 'Active' }
           });
        }
        
        return NextResponse.json({ success: true, status: 'Approved' });
      } else {
        await prisma.approvalRequest.update({
          where: { id: approvalId },
          data: { currentStep: nextStep, history: JSON.stringify(history) }
        });
        const nextApprover = approvers[nextStep];
        return NextResponse.json({ success: true, status: 'Pending', nextApprover });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
