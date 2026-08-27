import { NextResponse } from 'next/server';
import { getTenantId } from '../../../lib/tenant';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const products = await prisma.product.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    const data = await request.json();
    const product = await prisma.product.create({
      data: {
        organizationId: orgId,
        name: data.name,
        uom: data.uom,
        category: data.category,
        subCategory: data.subCategory,
        description: data.description,
        terms: data.terms,
        articleCode: data.articleCode,
        hsnCode: data.hsnCode,
        imageUrl: data.imageUrl,
        phone: data.phone,
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
