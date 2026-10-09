/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It serves as a backend API endpoint, handling data transactions securely.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
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
