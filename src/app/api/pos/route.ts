import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pos = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(pos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: data.poNumber,
        title: data.title,
        status: data.status || 'Draft',
        vendorId: data.vendorId,
        eventId: data.eventId,
        total: data.total || 0,
      }
    });

    // Asynchronously push to ERP Sync Service (Microservice)
    fetch('http://localhost:3001/pos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(po)
    })
      .then(async (res) => {
        if (res.ok) {
          const syncData = await res.json();
          await prisma.purchaseOrder.update({
            where: { id: po.id },
            data: { erpStatus: 'Synced', erpId: syncData.erpPoId || po.poNumber, source: 'ERP Sync Service' }
          });
        }
      })
      .catch(err => {
        console.error('Failed to push PO to ERP Microservice:', err.message);
      });

    return NextResponse.json(po, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
