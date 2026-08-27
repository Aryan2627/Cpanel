import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
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

function verifyVendorToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  return jwt.verify(token, JWT_SECRET) as any;
}

export async function GET(request: Request) {
  try {
    let vendorPayload;
    try {
      vendorPayload = verifyVendorToken(request);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const vendorName = vendorPayload.name;
    const vendorEmail = vendorPayload.email;

    if (!vendorName && !vendorEmail) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 400, headers: corsHeaders });
    }

    // A PurchaseOrder belongs to a vendor if vendorId matches name (legacy) or email.
    // In our system, vendorId column usually holds the vendor's name.
    const pos = await prisma.purchaseOrder.findMany({
      where: { vendorId: vendorName },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pos, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: Request) {
  try {
    let vendorPayload;
    try {
      vendorPayload = verifyVendorToken(request);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const data = await request.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing PO ID or status' }, { status: 400, headers: corsHeaders });
    }

    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404, headers: corsHeaders });

    // Verify ownership
    if (po.vendorId !== vendorPayload.name) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: corsHeaders });
    }

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
          for (const refId of Object.keys(awardedPrs)) {
            const qtyToDeduct = Number(awardedPrs[refId]);
            if (qtyToDeduct > 0) {
              const intake = await prisma.intake.findFirst({ where: { refId } });
              if (intake) {
                const remaining = (intake.quantity || 0) - qtyToDeduct;
                const newStatus = remaining <= 0 ? 'Approved' : intake.status; 
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

    return NextResponse.json(updatedPo, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
