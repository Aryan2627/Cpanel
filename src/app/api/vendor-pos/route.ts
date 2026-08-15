import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorName = searchParams.get('vendorName');

    if (!vendorName) {
      return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
    }

    const pos = await prisma.purchaseOrder.findMany({
      where: { vendorId: vendorName },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
