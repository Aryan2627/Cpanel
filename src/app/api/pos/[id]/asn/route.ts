import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const asns = await prisma.aSN.findMany({ where: { purchaseOrderId: (await context.params).id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(asns);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    const asn = await prisma.aSN.create({
      data: {
        purchaseOrderId: (await context.params).id,
        asnNumber: data.asnNumber || 'ASN-' + Date.now(),
        trackingId: data.trackingId,
        carrier: data.carrier,
        status: data.status || 'In Transit',
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
      }
    });
    return NextResponse.json(asn);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}