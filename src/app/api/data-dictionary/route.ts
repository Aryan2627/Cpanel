import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { organizationId: orgId };
    if (category) where.category = category;

    const data = await prisma.dataDictionary.findMany({
      where,
      orderBy: [{ category: 'asc' }, { value: 'asc' }],
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const body = await request.json();
    const { category, value } = body;

    if (!category || !value) {
      return NextResponse.json({ error: 'Category and value are required' }, { status: 400 });
    }

    const created = await prisma.dataDictionary.create({
      data: {
        organizationId: orgId,
        category: category.trim(),
        value: value.trim(),
      }
    });

    return NextResponse.json(created);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This value already exists in the category' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
