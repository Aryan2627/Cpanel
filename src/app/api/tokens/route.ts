import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';
import { getTokenStatus, upgradePlan, PlanKey, PLANS } from '../../../lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/tokens — fetch token status + ledger
export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 30;
    const skip = (page - 1) * limit;

    const [status, ledger, total] = await Promise.all([
      getTokenStatus(orgId),
      prisma.tokenLedger.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tokenLedger.count({ where: { organizationId: orgId } }),
    ]);

    return NextResponse.json({
      status,
      ledger,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      plans: PLANS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/tokens — upgrade plan or top-up tokens
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const body = await request.json();

    if (body.action === 'upgrade' && body.plan) {
      await upgradePlan(orgId, body.plan as PlanKey);
      const newStatus = await getTokenStatus(orgId);
      return NextResponse.json({ success: true, status: newStatus });
    }

    if (body.action === 'topup' && body.amount) {
      const topupTokens = parseInt(body.amount);
      if (isNaN(topupTokens) || topupTokens <= 0) {
        return NextResponse.json({ error: 'Invalid top-up amount' }, { status: 400 });
      }
      await prisma.organization.update({
        where: { id: orgId },
        data: { tokensTotal: { increment: topupTokens } },
      });
      const newStatus = await getTokenStatus(orgId);
      return NextResponse.json({ success: true, status: newStatus });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
