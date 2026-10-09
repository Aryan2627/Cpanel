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
﻿import { NextResponse } from 'next/server';
import { getTenantId } from '../../../../lib/tenant';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
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
