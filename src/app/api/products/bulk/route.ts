import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    // Prepare data
    const data = products.map((p: any) => ({
      name: p.name || '',
      uom: p.uom || '',
      category: p.category || '',
      subCategory: p.subcategory || '', // Map lowercase subcategory to subCategory
      code: p.code || `PRD-${Math.floor(Math.random() * 1000000)}`,
      createdBy: 'Bulk Upload',
      status: 'Active'
    }));

    const result = await prisma.product.createMany({
      data,
      skipDuplicates: true // Just in case
    });

    return NextResponse.json({ success: true, count: result.count }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
