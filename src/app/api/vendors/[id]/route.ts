import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const data = await request.json();

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { status: data.status }
    });

    return NextResponse.json({ success: true, vendor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
