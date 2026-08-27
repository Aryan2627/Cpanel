import { NextResponse } from 'next/server';
import { getTenantId } from '../../../../lib/tenant';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orgId = await getTenantId();
    const product = await prisma.product.findUnique({
      where: { id: params.id, organizationId: orgId }
    });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    const data = await request.json();
    
    const product = await prisma.product.update({
      where: { id: params.id, organizationId: orgId },
      data: {
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
        status: data.status,
      }
    });
    return NextResponse.json(product, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
