import { NextResponse } from 'next/server';
import { getTenantId } from '../../../lib/tenant';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    let whereClause: any = { organizationId: orgId }; // ALWAYS enforce tenant isolation

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { refId: eventId }
      });

      if (event && event.participants) {
        try {
          const participants = JSON.parse(event.participants);
          const participantNames = participants.map((p: any) => typeof p === 'string' ? p : p.name);
          
          if (participantNames.length > 0) {
            whereClause.name = { in: participantNames };
          } else {
             whereClause.id = 'no-match';
          }
        } catch (e) {
          console.error("Failed to parse participants", e);
        }
      } else {
        whereClause.id = 'no-match';
      }
    }

    const vendors = await prisma.vendor.findMany({
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
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const data = await request.json();
    const vendor = await prisma.vendor.create({
      data: {
        organizationId: orgId,
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
