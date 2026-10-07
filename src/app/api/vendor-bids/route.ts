import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token signature' }, { status: 401, headers: corsHeaders });
    }

    if (!decoded.email || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400, headers: corsHeaders });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400, headers: corsHeaders });
    }

    const event = await prisma.event.findUnique({ where: { refId: eventId } });
    if (!event) return NextResponse.json({}, { status: 200, headers: corsHeaders });

    const vendorRecord = await prisma.vendor.findFirst({
      where: {
        organizationId: event.organizationId,
        email: { equals: decoded.email, mode: 'insensitive' },
        status: 'Onboarded'
      }
    });

    if (!vendorRecord) return NextResponse.json({}, { status: 200, headers: corsHeaders });

    const bid = await prisma.bid.findFirst({
      where: {
        eventId: eventId,
        vendorId: vendorRecord.id
      }
    });

    return NextResponse.json(bid || {}, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error(`[vendor-bids-get] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token signature' }, { status: 401, headers: corsHeaders });
    }

    if (!decoded.email || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400, headers: corsHeaders });
    }

    const body = await request.json();
    const { eventId, vendorName, amount, currency, templateData } = body;

    if (!eventId || amount === undefined) {
      return NextResponse.json({ error: 'eventId and amount are required' }, { status: 400, headers: corsHeaders });
    }

    const event = await prisma.event.findUnique({ where: { refId: eventId } });
    if (!event) {
        return NextResponse.json({ error: 'event not found' }, { status: 404, headers: corsHeaders });
    }

    if (event.endTime && new Date() > new Date(event.endTime)) {
        return NextResponse.json({ error: 'Event has closed. Bidding is no longer allowed.' }, { status: 403, headers: corsHeaders });
    }

    const vendorRecord = await prisma.vendor.findFirst({
        where: {
            organizationId: event.organizationId,
            email: { equals: decoded.email, mode: 'insensitive' },
            status: 'Onboarded'
        }
    });

    if (!vendorRecord) {
        return NextResponse.json({ error: 'Vendor not approved for this client' }, { status: 403, headers: corsHeaders });
    }

    const actualVendorId = vendorRecord.id;

    // Check if bid exists
    const existingBid = await prisma.bid.findFirst({
      where: {
        eventId: eventId,
        vendorId: actualVendorId
      }
    });

    let bid;
    if (existingBid) {
      bid = await prisma.bid.update({
        where: { id: existingBid.id },
        data: {
          amount: parseFloat(amount),
          initialAmount: existingBid.initialAmount || existingBid.amount,
          templateData: templateData ? JSON.stringify(templateData) : null,
          vendorName: vendorName || vendorRecord.name || 'Vendor',
          status: 'Submitted'
        }
      });
    } else {
      bid = await prisma.bid.create({
        data: {
          eventId,
          vendorId: actualVendorId,
          vendorName: vendorName || vendorRecord.name || 'Vendor',
          amount: parseFloat(amount),
          initialAmount: parseFloat(amount),
          templateData: templateData ? JSON.stringify(templateData) : null,
          status: 'Submitted'
        }
      });
    }

    try {
      const { broadcastRealtimeEvent } = await import('../../../lib/realtime');
      broadcastRealtimeEvent('bids', existingBid ? 'UPDATE' : 'INSERT', bid);
    } catch {}

    return NextResponse.json(bid, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error(`[vendor-bids-post] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const bid = await prisma.bid.update({
      where: { id: data.id },
      data: {
        chatHistory: data.chatHistory ? JSON.stringify(data.chatHistory) : undefined,
      }
    });
    return NextResponse.json(bid, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
