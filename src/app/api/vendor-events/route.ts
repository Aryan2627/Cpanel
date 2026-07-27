import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
    }

    const allEvents = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Filter events where participants JSON contains the vendor's email
    const vendorEvents = allEvents.filter(event => {
      if (!event.participants) return false;
      try {
        const participants = JSON.parse(event.participants);
        if (Array.isArray(participants)) {
          return participants.some((p: any) => p.email && p.email.toLowerCase() === email.toLowerCase());
        }
      } catch(e) {
        return false;
      }
      return false;
    });

    return NextResponse.json(vendorEvents, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
