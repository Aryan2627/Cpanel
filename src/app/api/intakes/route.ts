import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const intakes = await prisma.intake.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(intakes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch intakes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Adding Intake:", data);
    const newIntake = await prisma.intake.create({
      data: {
        refId: data.refId || `INT-${Date.now()}`,
        title: data.title,
        reqName: data.reqName,
        status: data.status || 'Draft',
        type: data.type || 'Standalone NFA',
        buyer: data.buyer || '-',
        reqAt: data.reqAt || new Date().toISOString().split('T')[0],
        updAt: data.updAt || new Date().toISOString().split('T')[0],
        quantity: data.quantity || 1,
      }
    });
    return NextResponse.json(newIntake, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating intake:', error);
    return NextResponse.json({ error: error.message || 'Failed to create intake' }, { status: 500 });
  }
}
