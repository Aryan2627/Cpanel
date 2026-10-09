/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It serves as a backend API endpoint, handling data transactions securely.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendVendorInvitation } from '../../../lib/email-service';
import { getTenantId } from '../../../lib/tenant';
import { evaluateApprovalMatrix, createPendingApproval } from '../../../lib/approvalEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET(request: Request) { // PAGINATION_ADDED

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;

    const orgId = await getTenantId();
    const events = await prisma.event.findMany({
      take: limit,
      skip,
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

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const data = await request.json();

    // TOKEN GATE
    try {
      const { consumeTokens, insufficientTokensResponse } = await import('../../../lib/tokens');
      await consumeTokens(orgId, 'CREATE_EVENT');
    } catch (tokenErr: any) {
      if (tokenErr.message?.startsWith('INSUFFICIENT_TOKENS')) {
        const [, remaining, cost] = tokenErr.message.split(':');
        const { insufficientTokensResponse } = await import('../../../lib/tokens');
        return insufficientTokensResponse(parseInt(remaining), parseInt(cost));
      }
      throw tokenErr;
    }

    // Generate IDs instantly for the frontend response
    const crypto = require('crypto');
    const eventId = crypto.randomUUID();
    const generatedRefId = data.refId || `EVT-${Math.floor(Math.random() * 100000)}`;

    // Process all heavy database logic in the background!
    after(async () => {
      try {
        let eventStatus = 'Active';
        
        // --- DYNAMIC APPROVAL RULES ENGINE ---
        const { requiresApproval, approvers, workflowName } = await evaluateApprovalMatrix(
          orgId,
          'Event Creation',
          data
        );

        if (requiresApproval) {
          eventStatus = 'Pending Approval';
        }

        const event = await prisma.event.create({
          data: {
            id: eventId,
            organizationId: orgId,
            refId: generatedRefId,
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

        if (requiresApproval) {
           await createPendingApproval(
             orgId,
             event.id,
             `${workflowName} - ${event.refId}`,
             approvers,
             undefined,
             'EVENT_APPROVAL'
           );
        }

        // Add to Jarvis Memory (20 days expiration)
        const twentyDaysFromNow = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
        await prisma.jarvisMemory.create({
          data: {
            organizationId: orgId,
            entityType: 'Event',
            entityRef: generatedRefId,
            context: `Created new sourcing event: ${data.title}`,
            expiresAt: twentyDaysFromNow,
          }
        }).catch(err => console.error('Failed to create Jarvis memory', err));

        // Send email invitations if participants exist
        if (data.participants && Array.isArray(data.participants)) {
          Promise.allSettled(data.participants.map((vendor: any) => {
            if (vendor.email) {
              return sendVendorInvitation(
                vendor.email, 
                data.title || 'New Bidding Event', 
                (process.env.VENDOR_PORTAL_URL || 'https://supply.procgen.in') + '/login'
              );
            }
          })).catch(console.error);
        }
      } catch (err) {
        console.error("Background event creation failed", err);
      }
    });

    // Send immediate response so the UI is extremely fast
    return NextResponse.json({ id: eventId, refId: generatedRefId, status: 'Active' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
