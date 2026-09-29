// ============================================================
// TOKEN-BASED METERING SYSTEM — ProcGen Cpanel
// SOC 2 compliant usage tracking with plan-based limits
// ============================================================

import { prisma } from './prisma';
import { logAudit } from './audit';

// ----------------------------------------------------------
// PLAN DEFINITIONS
// ----------------------------------------------------------
export const PLANS = {
  starter: {
    name: 'Starter',
    tokensPerMonth: 500,
    price: 0,
    color: '#64748b',
    features: ['Up to 500 tokens/month', '5 users', 'Basic workflows'],
  },
  growth: {
    name: 'Growth',
    tokensPerMonth: 2500,
    price: 4999,
    color: '#3b82f6',
    features: ['Up to 2,500 tokens/month', '25 users', 'Advanced workflows', 'AI Analysis'],
  },
  enterprise: {
    name: 'Enterprise',
    tokensPerMonth: 10000,
    price: 14999,
    color: '#8b5cf6',
    features: ['Up to 10,000 tokens/month', 'Unlimited users', 'All features', 'Priority support'],
  },
  unlimited: {
    name: 'Unlimited',
    tokensPerMonth: 999999,
    price: 0,
    color: '#10b981',
    features: ['Unlimited tokens', 'All features', 'Custom SLA'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ----------------------------------------------------------
// TOKEN COSTS PER ACTION
// ----------------------------------------------------------
export const TOKEN_COSTS: Record<string, number> = {
  CREATE_EVENT: 10,
  CREATE_PR: 5,
  CREATE_PO: 5,
  INVITE_VENDOR: 2,
  ADD_USER: 5,
  AI_ANALYSIS: 25,
  RUN_WORKFLOW: 10,
  EXPORT_GDPR: 15,
  SEND_EMAIL: 1,
  CREATE_CONTRACT: 8,
  CREATE_TEMPLATE: 3,
};

export const TOKEN_ACTION_LABELS: Record<string, string> = {
  CREATE_EVENT: 'RFQ / Event Created',
  CREATE_PR: 'Purchase Requisition Created',
  CREATE_PO: 'Purchase Order Generated',
  INVITE_VENDOR: 'Vendor Invited',
  ADD_USER: 'User Added',
  AI_ANALYSIS: 'DORC AI Analysis',
  RUN_WORKFLOW: 'Workflow Executed',
  EXPORT_GDPR: 'GDPR Data Export',
  SEND_EMAIL: 'Email Notification',
  CREATE_CONTRACT: 'Contract Created',
  CREATE_TEMPLATE: 'Template Created',
};

// ----------------------------------------------------------
// CORE: consumeTokens
// Call this at the start of any token-gated API route
// Throws 'INSUFFICIENT_TOKENS' if org is over limit
// ----------------------------------------------------------
export async function consumeTokens(
  orgId: string,
  action: string,
  actorEmail?: string,
  entityRef?: string
): Promise<{ tokensUsed: number; tokensTotal: number; remaining: number }> {
  const cost = TOKEN_COSTS[action] ?? 1;

  // Fetch org token state
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      tokensUsed: true,
      tokensTotal: true,
      tokensResetAt: true,
      plan: true,
    },
  });

  if (!org) throw new Error('Organization not found');

  // Auto-reset tokens monthly
  const now = new Date();
  const resetAt = org.tokensResetAt ? new Date(org.tokensResetAt) : new Date(0);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { tokensUsed: 0, tokensResetAt: now },
    });
    org.tokensUsed = 0;
  }

  const used = org.tokensUsed ?? 0;
  const total = org.tokensTotal ?? 500;
  const remaining = total - used;

  if (remaining < cost) {
    throw new Error(`INSUFFICIENT_TOKENS:${remaining}:${cost}`);
  }

  // Deduct tokens atomically
  await prisma.$transaction([
    prisma.organization.update({
      where: { id: orgId },
      data: { tokensUsed: { increment: cost } },
    }),
    prisma.tokenLedger.create({
      data: {
        organizationId: orgId,
        action,
        tokensConsumed: cost,
        entityRef: entityRef ?? null,
        actorEmail: actorEmail ?? 'system',
      },
    }),
  ]);

  // Audit log
  await logAudit({
    actorEmail: actorEmail ?? 'system',
    action: `TOKEN_CONSUMED:${action}`,
    entityType: 'TokenLedger',
    entityRef: orgId,
    details: { tokensConsumed: cost, remaining: remaining - cost },
    organizationId: orgId,
  });

  return { tokensUsed: used + cost, tokensTotal: total, remaining: remaining - cost };
}

// ----------------------------------------------------------
// getTokenStatus — lightweight read, no deduction
// ----------------------------------------------------------
export async function getTokenStatus(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { tokensUsed: true, tokensTotal: true, tokensResetAt: true, plan: true },
  });
  if (!org) return null;

  const used = org.tokensUsed ?? 0;
  const total = org.tokensTotal ?? 500;
  const pct = Math.round((used / total) * 100);
  const plan = (org.plan ?? 'starter') as PlanKey;

  // Next reset = 1st of next month
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    plan,
    planInfo: PLANS[plan] ?? PLANS.starter,
    tokensUsed: used,
    tokensTotal: total,
    tokensRemaining: total - used,
    percentUsed: pct,
    isLow: pct >= 80,
    isCritical: pct >= 95,
    nextResetDate: nextReset.toISOString(),
  };
}

// ----------------------------------------------------------
// Upgrade plan (called from settings/payment)
// ----------------------------------------------------------
export async function upgradePlan(orgId: string, newPlan: PlanKey) {
  const planDef = PLANS[newPlan];
  await prisma.organization.update({
    where: { id: orgId },
    data: {
      plan: newPlan,
      tokensTotal: planDef.tokensPerMonth,
      tokensUsed: 0,
      tokensResetAt: new Date(),
    },
  });
}

// ----------------------------------------------------------
// Helper: standard 402 response for insufficient tokens
// ----------------------------------------------------------
export function insufficientTokensResponse(remaining: number, cost: number) {
  return new Response(
    JSON.stringify({
      error: 'INSUFFICIENT_TOKENS',
      message: `This action costs ${cost} tokens. You have ${remaining} tokens remaining. Please upgrade your plan.`,
      remaining,
      cost,
      upgradeUrl: '/client/manage/tokens',
    }),
    { status: 402, headers: { 'Content-Type': 'application/json' } }
  );
}
