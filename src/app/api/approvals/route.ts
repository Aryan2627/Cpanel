import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const approvals = await prisma.approvalRequest.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    
    const workflows = await prisma.workflow.findMany({ where: { organizationId: orgId } });

    const richApprovals = approvals.map(approval => {
      const workflow = workflows.find(w => w.id === approval.workflowId);
      
      let approvers = [];
      try { approvers = workflow ? JSON.parse(workflow.approvers) : []; } catch (e) {}

      let history = [];
      try { if (approval.history) history = JSON.parse(approval.history); } catch (e) {}
      
      const type = history.length > 0 ? history[0].type : 'GENERIC_APPROVAL';
      const poId = history.length > 0 ? history[0].poId : null; // we overloaded poId for general reference ID

      let title = workflow?.name || 'Approval Request';
      if (type === 'PO_APPROVAL') title = `Purchase Order Approval`;
      if (type === 'INTAKE_APPROVAL') title = `Intake/PR Approval`;
      if (type === 'EVENT_APPROVAL') title = `Event Creation Approval`;
      if (type === 'PRODUCT_APPROVAL') title = `Product Approval`;
      if (type === 'USER_APPROVAL') title = `User Approval`;

      return {
        ...approval,
        eventTitle: title,
        eventRef: poId || approval.eventId || '-',
        category: workflow?.category || '-',
        currentApproverEmail: approvers[approval.currentStep] || 'Unknown',
        totalSteps: approvers.length,
        type,
        refId: poId // ID of the underlying entity
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
    
    const type = history.length > 0 ? history[0].type : 'GENERIC_APPROVAL';
    const refId = history.length > 0 ? history[0].poId : null; // overloaded poId

    history.push({
      action,
      user: userEmail || 'System',
      comment: comment || '',
      date: new Date().toISOString()
    });

    if (action === 'reject') {
      const result = await prisma.approvalRequest.updateMany({
        where: { id: approvalId, status: 'Pending' },
        data: { status: 'Rejected', history: JSON.stringify(history) }
      });

      if (result.count === 0) {
        return NextResponse.json({ error: 'Conflict: Approval request has already been processed by another user or session.' }, { status: 409 });
      }
      
      if (type === 'PO_APPROVAL' && refId) {
         await prisma.purchaseOrder.update({ where: { id: refId }, data: { status: 'Rejected', erpStatus: 'Voided' } });
      } else if (type === 'INTAKE_APPROVAL' && refId) {
         await prisma.intake.update({ where: { id: refId }, data: { status: 'Rejected' } });
      } else if (type === 'EVENT_APPROVAL' && approval.eventId && approval.eventId !== 'GLOBAL') {
         await prisma.event.update({ where: { id: approval.eventId }, data: { status: 'Rejected' } });
      } else if (type === 'PRODUCT_APPROVAL' && refId) {
         await prisma.product.update({ where: { id: refId }, data: { status: 'Rejected' } });
      } else if (type === 'USER_APPROVAL' && refId) {
         await prisma.user.update({ where: { id: refId }, data: { status: 'Rejected' } });
      }

      return NextResponse.json({ success: true, status: 'Rejected' });
    } 
    
    if (action === 'approve') {
      const nextStep = approval.currentStep + 1;
      
      if (nextStep >= approvers.length) {
        // Fully approved - Optimistic Concurrency check
        const result = await prisma.approvalRequest.updateMany({
          where: { id: approvalId, status: 'Pending' },
          data: { status: 'Approved', currentStep: nextStep, history: JSON.stringify(history) }
        });

        if (result.count === 0) {
          return NextResponse.json({ error: 'Conflict: Approval request has already been processed by another user or session.' }, { status: 409 });
        }
        
        // Unblock the underlying entity
        if (type === 'PO_APPROVAL' && refId) {
           await prisma.purchaseOrder.update({ where: { id: refId }, data: { status: 'Pending Vendor', erpStatus: 'Pending Sync' } });
        } else if (type === 'INTAKE_APPROVAL' && refId) {
           await prisma.intake.update({ where: { id: refId }, data: { status: 'Draft' } });
        } else if (type === 'EVENT_APPROVAL' && approval.eventId && approval.eventId !== 'GLOBAL') {
           await prisma.event.update({ where: { id: approval.eventId }, data: { status: 'Active' } });
        } else if (type === 'PRODUCT_APPROVAL' && refId) {
           await prisma.product.update({ where: { id: refId }, data: { status: 'Active' } });
        } else if (type === 'USER_APPROVAL' && refId) {
           await prisma.user.update({ where: { id: refId }, data: { status: 'Active' } });
        }
        
        return NextResponse.json({ success: true, status: 'Approved' });
      } else {
        const result = await prisma.approvalRequest.updateMany({
          where: { id: approvalId, status: 'Pending' },
          data: { currentStep: nextStep, history: JSON.stringify(history) }
        });

        if (result.count === 0) {
          return NextResponse.json({ error: 'Conflict: Approval request has already been processed by another user or session.' }, { status: 409 });
        }

        const nextApprover = approvers[nextStep];
        return NextResponse.json({ success: true, status: 'Pending', nextApprover });
      }
    }

    if (action === 'force_approve') {
      history.push({
        action: 'Admin Override',
        user: userEmail || 'System',
        comment: comment || 'Bypassed assigned approver',
        date: new Date().toISOString()
      });

      const result = await prisma.approvalRequest.updateMany({
        where: { id: approvalId, status: 'Pending' },
        data: { status: 'Approved', currentStep: approvers.length, history: JSON.stringify(history) }
      });

      if (result.count === 0) {
        return NextResponse.json({ error: 'Conflict: Approval request has already been processed by another user or session.' }, { status: 409 });
      }

      await prisma.auditLog.create({
        data: {
          action: 'Admin Override',
          entityType: 'ApprovalRequest',
          entityRef: approvalId,
          actorEmail: userEmail || 'Admin',
          organizationId: approval.organizationId,
          details: JSON.stringify({ reason: 'Forced approval by admin', bypassed: approvers[approval.currentStep] || 'Unknown' })
        }
      });
      
      if (type === 'PO_APPROVAL' && refId) {
         await prisma.purchaseOrder.update({
            where: { id: refId },
            data: { status: 'Pending Vendor', erpStatus: 'Pending Sync' }
         });
      } else if (approval.eventId && approval.eventId !== 'GLOBAL') {
         await prisma.event.update({
           where: { id: approval.eventId },
           data: { status: 'Active' }
         });
      }
      
      return NextResponse.json({ success: true, status: 'Approved' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
