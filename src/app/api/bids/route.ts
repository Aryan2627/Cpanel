import { NextResponse } from 'next/server';
import { getTenantId } from '../../../lib/tenant';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let bids;
    if (eventId) {
      bids = await prisma.bid.findMany({
        where: { 
          organizationId: orgId,
          eventId: eventId
        },
        orderBy: { amount: 'asc' }
      });
    } else {
      bids = await prisma.bid.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    // Enhance bids with Event Title dynamically without altering schema
    const eventIds = [...new Set(bids.map(b => b.eventId))];
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, title: true }
    });
    
    const eventMap = events.reduce((acc, ev) => ({ ...acc, [ev.id]: ev.title }), {});
    
    const enrichedBids = bids.map(bid => ({
      ...bid,
      eventTitle: eventMap[bid.eventId] || `Event #${bid.eventId.substring(0, 6)}`
    }));

    return NextResponse.json(enrichedBids);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
