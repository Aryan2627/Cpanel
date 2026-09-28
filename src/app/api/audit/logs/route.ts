import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getTenantId } from '../../../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, parseInt(searchParams.get('limit') || '50'));
    const action = searchParams.get('action');
    const actor = searchParams.get('actor');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const skip = (page - 1) * limit;

    const where: any = { organizationId: orgId };
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (actor) where.actorEmail = { contains: actor, mode: 'insensitive' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
