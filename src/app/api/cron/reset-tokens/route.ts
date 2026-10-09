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
import { PLANS, PlanKey } from '../../../../lib/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Called by Vercel Cron on 1st of each month — resets all org token usage
// vercel.json: { "crons": [{ "path": "/api/cron/reset-tokens", "schedule": "0 0 1 * *" }] }
/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    // Protect cron from external calls
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Fetch all orgs that haven't been reset this month
    const orgs = await prisma.organization.findMany({
      select: { id: true, plan: true, tokensResetAt: true },
    });

    let resetCount = 0;
    for (const org of orgs) {
      const resetAt = org.tokensResetAt ? new Date(org.tokensResetAt) : new Date(0);
      const alreadyResetThisMonth =
        resetAt.getMonth() === now.getMonth() && resetAt.getFullYear() === now.getFullYear();

      if (!alreadyResetThisMonth) {
        const plan = (org.plan ?? 'starter') as PlanKey;
        const planDef = PLANS[plan] ?? PLANS.starter;
        await prisma.organization.update({
          where: { id: org.id },
          data: {
            tokensUsed: 0,
            tokensTotal: planDef.tokensPerMonth,
            tokensResetAt: now,
          },
        });
        resetCount++;
      }
    }

    return NextResponse.json({
      success: true,
      resetCount,
      resetAt: now.toISOString(),
      message: `Monthly token reset complete. Reset ${resetCount} organizations.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
