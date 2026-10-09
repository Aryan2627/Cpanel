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
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
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

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
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
