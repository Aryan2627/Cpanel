import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let bids;
    if (eventId) {
      bids = await prisma.bid.findMany({
        where: { eventId },
        orderBy: { amount: 'asc' }
      });
    } else {
      bids = await prisma.bid.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }
    return NextResponse.json(bids);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const bid = await prisma.bid.create({
      data: {
        eventId: data.eventId,
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        amount: parseFloat(data.amount),
        status: data.status || 'Submitted',
      }
    });
    return NextResponse.json(bid, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
