import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '../../../../lib/prisma';
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    if (!email) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400, headers: corsHeaders });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    const getCachedEvent = unstable_cache(
      async (id: string) => prisma.event.findUnique({ where: { id } }),
      ['event-cache', eventId],
      { revalidate: 30 }
    );
    const event = await getCachedEvent(eventId);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404, headers: corsHeaders });
    }

    // Verify vendor has access to this event
    let hasAccess = false;
    if (event.participants) {
      try {
        const participants = JSON.parse(event.participants);
        if (Array.isArray(participants)) {
          hasAccess = participants.some((p: any) => p.email && p.email.trim().toLowerCase() === email.trim().toLowerCase());
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden: You do not have access to this event' }, { status: 403, headers: corsHeaders });
    }

    return NextResponse.json(event, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    console.error(`[vendor-events-id] Error:`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
