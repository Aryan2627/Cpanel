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

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing PO ID or status' }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404 });

    const updatedPo = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });

    // If Vendor approves, deduct quantities from associated Intakes (PRs)
    if (status === 'Approved' && po.details) {
      try {
        const details = JSON.parse(po.details);
        if (details.awardedPrs) {
          const awardedPrs = details.awardedPrs;
          // awardedPrs is a map of refId -> quantity
          for (const refId of Object.keys(awardedPrs)) {
            const qtyToDeduct = Number(awardedPrs[refId]);
            if (qtyToDeduct > 0) {
              const intake = await prisma.intake.findFirst({ where: { refId } });
              if (intake) {
                const remaining = (intake.quantity || 0) - qtyToDeduct;
                const newStatus = remaining <= 0 ? 'Approved' : intake.status; // 'Approved' implies completed in UI
                await prisma.intake.update({
                  where: { id: intake.id },
                  data: { 
                    quantity: Math.max(0, remaining),
                    status: newStatus
                  }
                });
              }
            }
          }
        }
      } catch (e) {
        console.error('Error deducting PR quantities upon PO approval:', e);
      }
    }

    return NextResponse.json(updatedPo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
