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
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token signature' }, { status: 401, headers: corsHeaders });
    }

    const email = decoded.email;
    
    console.log(`[vendor-events] Incoming request for email: ${email}`);

    if (!email) {
      console.log(`[vendor-events] No email in token`);
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400, headers: corsHeaders });
    }

    const allEvents = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`[vendor-events] Found ${allEvents.length} total events in DB`);

    // Filter events where participants JSON contains the vendor's email
    const vendorEvents = allEvents.filter(event => {
      if (!event.participants) return false;
      try {
        const participants = JSON.parse(event.participants);
        if (Array.isArray(participants)) {
          return participants.some((p: any) => p.email && p.email.trim().toLowerCase() === email.trim().toLowerCase());
        }
      } catch(e) {
        return false;
      }
      return false;
    });

    console.log(`[vendor-events] Returning ${vendorEvents.length} events for ${email}`);
    return NextResponse.json(vendorEvents, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error(`[vendor-events] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
