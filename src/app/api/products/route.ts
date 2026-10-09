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
import { evaluateApprovalMatrix, createPendingApproval } from '../../../lib/approvalEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
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

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }
    const data = await request.json();

    // Generate unique sequential PRD-XXXX code globally
    let nextNum = 1000;
    const lastProduct = await prisma.product.findFirst({
      where: { code: { startsWith: 'PRD-' } },
      orderBy: { code: 'desc' }
    });
    if (lastProduct && lastProduct.code) {
      const match = lastProduct.code.match(/PRD-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const productCode = data.code || ('PRD-' + String(nextNum).padStart(4, '0'));

    // --- DYNAMIC APPROVAL RULES ENGINE ---
    const { requiresApproval, approvers, workflowName } = await evaluateApprovalMatrix(
      orgId, 
      'Create Product', 
      data
    );

    const initialStatus = requiresApproval ? 'Pending Approval' : (data.status || 'Active');

    const product = await prisma.product.create({
      data: {
        code: productCode,
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
        status: initialStatus,
      }
    });

    if (requiresApproval) {
      await createPendingApproval(
        orgId,
        null, // No event ID
        `${workflowName} - ${productCode}`,
        approvers,
        product.id, // Using poId as a generic reference ID in approvalRequest
        'PRODUCT_APPROVAL'
      );
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
