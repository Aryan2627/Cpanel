import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const invoices = await prisma.invoice.findMany({ where: { purchaseOrderId: (await context.params).id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(invoices);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    
    const po = await prisma.purchaseOrder.findUnique({ where: { id: (await context.params).id } });
    let matchStatus = 'Unmatched';
    if (po && po.total === parseFloat(data.totalAmount)) {
      const grns = await prisma.gRN.findMany({ where: { purchaseOrderId: (await context.params).id } });
      if (grns.length > 0) {
        matchStatus = 'Matched';
      } else {
        matchStatus = 'Failed: No GRN';
      }
    } else {
      matchStatus = 'Failed: Price Mismatch';
    }

    const inv = await prisma.invoice.create({
      data: {
        purchaseOrderId: (await context.params).id,
        invoiceNumber: data.invoiceNumber || 'INV-' + Date.now(),
        vendorId: data.vendorId,
        totalAmount: parseFloat(data.totalAmount) || 0,
        taxAmount: parseFloat(data.taxAmount) || 0,
        status: data.status || 'Pending',
        matchStatus: matchStatus,
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
      }
    });
    return NextResponse.json(inv);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}