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
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const grns = await prisma.gRN.findMany({ where: { purchaseOrderId: (await context.params).id }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(grns);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const orgId = await getTenantId();
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    const grn = await prisma.gRN.create({
      data: {
        purchaseOrderId: (await context.params).id,
        grnNumber: data.grnNumber || 'GRN-' + Date.now(),
        receivedBy: data.receivedBy,
        location: data.location,
        status: data.status || 'Received',
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details),
      }
    });
    return NextResponse.json(grn);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}