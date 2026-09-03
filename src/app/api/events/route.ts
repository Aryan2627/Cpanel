import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendVendorInvitation } from '../../../lib/email-service';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    const events = await prisma.event.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        refId: true,
        account: true,
        itemsCount: true,
        title: true,
        endTime: true,
        participants: true,
        sourcePrs: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const data = await request.json();
    let eventStatus = 'Active';
    let pendingWorkflow = null;
    let workflowApprovers = [];

    // Handle explicit workflowId if provided, else fallback to category
      if (data.workflowId) {
        const selectedWf = await prisma.workflow.findUnique({
          where: { id: data.workflowId }
        });
        if (selectedWf && selectedWf.organizationId === orgId) {
          pendingWorkflow = selectedWf;
        }
      } else {
        const workflows = await prisma.workflow.findMany({ 
          where: { isActive: true, category: data.type, organizationId: orgId } 
        });
        if (workflows.length > 0) {
          pendingWorkflow = workflows[0];
        }
      }

      if (pendingWorkflow) {
        try {
          workflowApprovers = JSON.parse(pendingWorkflow.approvers);
          if (workflowApprovers.length > 0) {
            eventStatus = 'Pending Approval';
          }
        } catch(e) {}
      }

    const event = await prisma.event.create({
      data: {
        organizationId: orgId,
        refId: data.refId || `EVT-${Math.floor(Math.random() * 100000)}`,
        title: data.title,
        type: data.type,
        account: data.account,
        itemsCount: data.itemsCount || 1,
        stages: data.stages ? JSON.stringify(data.stages) : null,
        participants: data.participants ? JSON.stringify(data.participants) : null,
        baseCurrency: data.baseCurrency || 'INR',
        feedbackMode: data.feedbackMode || 'Sealed',
        endTime: data.endTime ? new Date(data.endTime) : null,
        status: eventStatus,
        sourcePrs: data.sourcePrs || null
      }
    });

    if (eventStatus === 'Pending Approval' && pendingWorkflow) {
      await prisma.approvalRequest.create({
        data: {
          organizationId: orgId,
          eventId: event.id,
          workflowId: pendingWorkflow.id,
          status: 'Pending',
          currentStep: 0,
        }
      });
    }

    // Add to Jarvis Memory (20 days expiration)
    const twentyDaysFromNow = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    await prisma.jarvisMemory.create({
      data: {
        organizationId: orgId,
        entityType: 'Event',
        entityRef: data.refId || event.refId,
        context: `Created new sourcing event: ${data.title}`,
        expiresAt: twentyDaysFromNow,
      }
    }).catch(err => console.error('Failed to create Jarvis memory', err));

    // Send email invitations if participants exist
    if (data.participants && Array.isArray(data.participants)) {
      // Execute asynchronously so we don't block the API response
      after(() => Promise.allSettled(data.participants.map((vendor: any) => {
        if (vendor.email) {
          return sendVendorInvitation(
            vendor.email, 
            data.title || 'New Bidding Event', 
            (process.env.VENDOR_PORTAL_URL || 'http://localhost:5174') + '/login' // TODO: Change to production URL
          );
        }
      })).catch(console.error));
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

