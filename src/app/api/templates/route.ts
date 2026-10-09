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
import { getTenantId } from '../../../lib/tenant';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET() {
  try {
    const orgId = await getTenantId();
    
    // Auto-seed Basic Buy RFQ Template for the tenant if it doesn't exist
    if (orgId && orgId !== '__unauthenticated__') {
       const existing = await prisma.template.findFirst({
         where: { organizationId: orgId, name: "Basic Buy RFQ Template" }
       });
       if (!existing) {
         const basicFields = [
           { id: "f1", key: "product_name", originalKey: "product_name", name: "Product/Service Description", type: "text", role: "Creator", required: true },
           { id: "f2", key: "qty", originalKey: "qty", name: "Required Quantity", type: "number", role: "Creator", required: true, defaultValue: "1" },
           { id: "f3", key: "uom", originalKey: "uom", name: "Unit of Measure (UOM)", type: "text", role: "Creator", required: false, defaultValue: "EA" },
           { id: "f4", key: "unit_price", originalKey: "unit_price", name: "Unit Price", type: "number", role: "Participant", required: true },
           { id: "f5", key: "tax", originalKey: "tax", name: "Tax (%)", type: "number", role: "Participant", required: true, defaultValue: "0" },
           { id: "f6", key: "total_price", originalKey: "total_price", name: "Total Line Price", type: "number", role: "Calculation", required: false, formula: "qty * unit_price * (1 + (tax / 100))" }
         ];
         await prisma.template.create({
           data: {
             organizationId: orgId,
             name: "Basic Buy RFQ Template",
             type: "RFQ",
             fields: JSON.stringify(basicFields)
           }
         });
       }
    }

    const templates = await prisma.template.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
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
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    const data = await request.json();

    const existing = await prisma.template.findFirst({
      where: { name: data.name, organizationId: orgId }
    });
    
    if (existing) {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 400 });
    }

    const newTemplate = await prisma.template.create({
      data: {
        organizationId: orgId,
        name: data.name,
        type: data.type || 'RFQ',
        fields: JSON.stringify(data.fields),
      }
    });
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
