import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit({
  actorEmail,
  action,
  entityType,
  entityRef,
  details,
  organizationId,
}: {
  actorEmail: string;
  action: string;
  entityType?: string;
  entityRef?: string;
  details?: object;
  organizationId?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorEmail,
        action,
        entityType,
        entityRef,
        details: details ? JSON.stringify(details) : null,
        organizationId,
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
