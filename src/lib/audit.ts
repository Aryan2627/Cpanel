import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit({
  actorEmail,
  actorName,
  action,
  entityType,
  entityRef,
  details,
  organizationId,
  ipAddress,
  userAgent,
  severity,
  status,
}: {
  actorEmail: string;
  actorName?: string;
  action: string;
  entityType?: string;
  entityRef?: string;
  details?: object;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: string;
  status?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorEmail,
        actorName,
        action,
        entityType,
        entityRef,
        details: details ? JSON.stringify(details) : null,
        organizationId,
        ipAddress,
        userAgent,
        severity,
        status,
      },
    });
  } catch (err) {
    // Audit logging should never crash the main request
    console.error('[audit] Failed to write audit log:', err);
  }
}

export async function logLoginActivity({
  identifier,
  ip,
  userAgent,
  success,
}: {
  identifier: string;
  ip?: string;
  userAgent?: string;
  success?: boolean;
}) {
  try {
    await prisma.loginActivity.create({
      data: {
        identifier,
        ip,
        userAgent,
        success: success ?? true,
      },
    });
  } catch (err) {
    console.error('[audit] Failed to write login activity:', err);
  }
}
