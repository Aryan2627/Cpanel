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
import { getTenantId } from '../../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming DELETE requests for this route.
 * Safely removes the specified resource or marks it as inactive.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const orgId = await getTenantId();
    
    // Verify ownership
    const item = await prisma.dataDictionary.findUnique({ where: { id: params.id } });
    if (!item || item.organizationId !== orgId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.dataDictionary.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
