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

    let whereClause: any = {};

    if (eventId) {
      // Find the event by its refId (e.g. EVT-1004)
      const event = await prisma.event.findUnique({
        where: { refId: eventId }
      });

      if (event && event.participants) {
        try {
          const participants = JSON.parse(event.participants);
          // participants might be an array of vendor objects { id, name } or strings
          const participantNames = participants.map((p: any) => typeof p === 'string' ? p : p.name);
          
          if (participantNames.length > 0) {
            whereClause = {
              name: { in: participantNames }
            };
          } else {
             // Event has no participants, return empty list
             whereClause = { id: 'no-match' };
          }
        } catch (e) {
          console.error("Failed to parse participants", e);
        }
      } else {
        // Event not found or no participants
        whereClause = { id: 'no-match' };
      }
    }

    const vendors = await prisma.vendor.findMany({
      where: { organizationId: orgId },
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(vendors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        vendorCode: data.vendorCode,
        companyCode: data.companyCode,
        dealsIn: data.dealsIn,
        tradeLicense: data.tradeLicense,
        taxId: data.taxId,
        city: data.city,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        status: data.status || 'Invited',
      }
    });
    return NextResponse.json(vendor, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
