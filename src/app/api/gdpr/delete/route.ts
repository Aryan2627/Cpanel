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
import { logAudit } from '../../../../lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const body = await request.json();

    if (!body.confirmPhrase || body.confirmPhrase !== 'DELETE MY DATA') {
      return NextResponse.json(
        { error: 'You must confirm by sending confirmPhrase: "DELETE MY DATA"' },
        { status: 400 }
      );
    }

    // Always log GDPR deletion requests — even after deletion this stays for legal compliance
    await logAudit({
      actorEmail: body.requestedBy || 'unknown',
      action: 'GDPR_DELETION_REQUESTED',
      entityType: 'Organization',
      entityRef: orgId,
      details: {
        timestamp: new Date().toISOString(),
        requestedBy: body.requestedBy,
        scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reason: body.reason || 'User requested',
      },
      organizationId: orgId,
    });

    // Soft-delete: mark as pending deletion with 30-day grace period
    await prisma.organization.update({
      where: { id: orgId },
      data: { status: 'PENDING_DELETION' },
    });

    return NextResponse.json({
      success: true,
      message: 'Data deletion request accepted. Your organization and all associated data will be permanently deleted within 30 days per GDPR Article 17 (Right to Erasure).',
      requestId: `GDPR-DEL-${Date.now()}`,
      scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'You may cancel this request within 30 days by contacting support@procgen.in',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

