import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getTenantId } from '../../../../../lib/tenant';
import { logAudit } from '../../../../../lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();

    await logAudit({
      actorEmail: 'system',
      action: 'GDPR_DATA_EXPORT',
      entityType: 'Organization',
      entityRef: orgId,
      details: { timestamp: new Date().toISOString(), type: 'full_export' },
      organizationId: orgId,
    });

    const [org, users, vendors, events, prs, pos, bids, auditLogs] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId } }),
      prisma.user.findMany({
        where: { organizationId: orgId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.vendor.findMany({ where: { organizationId: orgId } }),
      prisma.event.findMany({ where: { organizationId: orgId } }),
      prisma.intake.findMany({ where: { organizationId: orgId } }),
      prisma.purchaseOrder.findMany({ where: { organizationId: orgId } }),
      prisma.bid.findMany({ where: { organizationId: orgId } }),
      prisma.auditLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 10000,
      }),
    ]);

    const exportData = {
      _meta: {
        exportedAt: new Date().toISOString(),
        standard: 'GDPR Article 20 - Right to Data Portability',
        organizationId: orgId,
        platform: 'ProcGen Procurement Portal',
      },
      organization: org,
      users,
      vendors,
      events,
      purchaseRequisitions: prs,
      purchaseOrders: pos,
      bids,
      auditLogs,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="procgen-gdpr-export-${Date.now()}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
