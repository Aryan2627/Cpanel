import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendVendorInvitation } from '../../../lib/email-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const event = await prisma.event.create({
      data: {
        refId: data.refId || `EVT-${Math.floor(Math.random() * 100000)}`,
        title: data.title,
        type: data.type,
        account: data.account,
        itemsCount: data.itemsCount || 1,
        stages: data.stages ? JSON.stringify(data.stages) : null,
        participants: data.participants ? JSON.stringify(data.participants) : null,
        baseCurrency: data.baseCurrency || 'USD',
        feedbackMode: data.feedbackMode || 'Sealed',
        endTime: data.endTime ? new Date(data.endTime) : null,
      }
    });

    // Add to Jarvis Memory (20 days expiration)
    const twentyDaysFromNow = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    await prisma.jarvisMemory.create({
      data: {
        entityType: 'Event',
        entityRef: data.refId,
        context: `Created new sourcing event: ${data.title}`,
        expiresAt: twentyDaysFromNow,
      }
    }).catch(err => console.error('Failed to create Jarvis memory', err));

    // Send email invitations if participants exist
    if (data.participants && Array.isArray(data.participants)) {
      // Execute asynchronously so we don't block the API response
      Promise.allSettled(data.participants.map((vendor: any) => {
        if (vendor.email) {
          return sendVendorInvitation(
            vendor.email, 
            data.title || 'New Bidding Event', 
            'http://localhost:5174/login' // TODO: Change to production URL
          );
        }
      })).catch(console.error);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
