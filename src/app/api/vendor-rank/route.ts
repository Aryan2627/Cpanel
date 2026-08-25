import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const vendorName = searchParams.get('vendorName');

    if (!eventId || !vendorName) {
      return NextResponse.json({ error: 'Missing eventId or vendorName' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    if (event.feedbackMode !== 'Rank Based' && event.type !== 'Rank based') {
      return NextResponse.json({ rank: null, message: 'Event is not rank based' });
    }

    // Fetch all bids for this event
    const bids = await prisma.bid.findMany({
      where: { eventId }
    });

    if (bids.length === 0) return NextResponse.json({ rank: null, message: 'No bids yet' });

    // Assuming we rank based on lowest base currency amount
    // In a real scenario we'd use composite scoring, but price ranking is asked
    bids.sort((a, b) => a.amount - b.amount);

    const vendorBidIndex = bids.findIndex(b => b.vendorName === vendorName);

    if (vendorBidIndex === -1) {
      return NextResponse.json({ rank: null, message: 'Vendor has not bid yet' });
    }

    return NextResponse.json({ rank: vendorBidIndex + 1, totalBids: bids.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
