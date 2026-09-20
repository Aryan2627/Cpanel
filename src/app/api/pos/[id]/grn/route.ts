import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const grns = await prisma.gRN.findMany({ where: { purchaseOrderId: (await context.params).id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(grns);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    const grn = await prisma.gRN.create({
      data: {
        purchaseOrderId: (await context.params).id,
        grnNumber: data.grnNumber || 'GRN-' + Date.now(),
        receivedBy: data.receivedBy,
        location: data.location,
        status: data.status || 'Received',
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
      }
    });
    return NextResponse.json(grn);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}