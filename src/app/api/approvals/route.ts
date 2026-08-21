import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET all approval requests
export async function GET() {
  try {
    const approvals = await prisma.approvalRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // We need to fetch the event details for these approvals
    const eventIds = approvals.map(a => a.eventId);
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } }
    });
    
    const workflows = await prisma.workflow.findMany();

    const richApprovals = approvals.map(approval => {
      const event = events.find(e => e.id === approval.eventId);
      const workflow = workflows.find(w => w.id === approval.workflowId);
      
      let approvers = [];
      try {
        approvers = workflow ? JSON.parse(workflow.approvers) : [];
      } catch (e) {}

      return {
        ...approval,
        eventTitle: event?.title || 'Unknown Event',
        eventRef: event?.refId || '-',
        category: workflow?.category || '-',
        currentApproverEmail: approvers[approval.currentStep] || 'Unknown',
        totalSteps: approvers.length
      };
    });

    return NextResponse.json(richApprovals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST to act on an approval (Approve or Reject)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { approvalId, action, comment, userEmail } = data; // action: 'approve' or 'reject'

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

    history.push({
      action,
      user: userEmail || 'System',
      comment: comment || '',
      date: new Date().toISOString()
    });

    if (action === 'reject') {
      // If rejected, entire workflow is rejected, event goes back to Draft or Rejected
      await prisma.approvalRequest.update({
        where: { id: approvalId },
        data: { status: 'Rejected', history: JSON.stringify(history) }
      });
      
      await prisma.event.update({
        where: { id: approval.eventId },
        data: { status: 'Rejected' } // Assuming 'Rejected' is a valid status, or map to 'Draft'
      });

      console.log(`[Email Mock] Sent REJECTION email to event owner.`);
      return NextResponse.json({ success: true, status: 'Rejected' });
    } 
    
    if (action === 'approve') {
      const nextStep = approval.currentStep + 1;
      
      if (nextStep >= approvers.length) {
        // Fully approved!
        await prisma.approvalRequest.update({
          where: { id: approvalId },
          data: { status: 'Approved', currentStep: nextStep, history: JSON.stringify(history) }
        });
        
        await prisma.event.update({
          where: { id: approval.eventId },
          data: { status: 'Active' } // Event is now active and floated to suppliers
        });
        
        console.log(`[Email Mock] Sent FULLY APPROVED email to event owner.`);
        return NextResponse.json({ success: true, status: 'Approved' });
      } else {
        // Move to next approver
        await prisma.approvalRequest.update({
          where: { id: approvalId },
          data: { currentStep: nextStep, history: JSON.stringify(history) }
        });
        
        const nextApprover = approvers[nextStep];
        console.log(`[Email Mock] Sent APPROVAL REQUIRED email to ${nextApprover}.`);
        return NextResponse.json({ success: true, status: 'Pending', nextApprover });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
