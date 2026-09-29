import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { prisma } from '../../../../lib/prisma';
import { PLANS, PlanKey } from '../../../../lib/tokens';
import { logAudit } from '../../../../lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe sends POST to this endpoint after every payment event
// Set this URL in Stripe Dashboard → Webhooks
export async function POST(request: Request) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature') ?? '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const meta    = session.metadata || {};
    const orgId   = meta.orgId;

    if (!orgId) {
      console.error('[stripe/webhook] No orgId in metadata');
      return NextResponse.json({ received: true });
    }

    // ── TOKEN TOP-UP ──────────────────────────────────────────────────────
    if (meta.type === 'topup') {
      const tokens = parseInt(meta.tokens || '0');
      await prisma.organization.update({
        where: { id: orgId },
        data: { tokensTotal: { increment: tokens } },
      });
      await logAudit({
        actorEmail: 'stripe-webhook',
        action: 'TOKEN_TOPUP_PAID',
        entityType: 'Organization',
        entityRef: orgId,
        details: {
          tokens,
          packageId: meta.packageId,
          stripeSessionId: session.id,
          amountPaid: session.amount_total,
        },
        organizationId: orgId,
      });
      console.log(`[stripe/webhook] ✅ Added ${tokens} tokens to org ${orgId}`);
    }

    // ── PLAN UPGRADE ──────────────────────────────────────────────────────
    if (meta.type === 'plan_upgrade') {
      const newPlan = meta.plan as PlanKey;
      const planDef = PLANS[newPlan] ?? PLANS.starter;
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          plan: newPlan,
          tokensTotal: planDef.tokensPerMonth,
          tokensUsed: 0,
          tokensResetAt: new Date(),
        },
      });
      await logAudit({
        actorEmail: 'stripe-webhook',
        action: 'PLAN_UPGRADED_PAID',
        entityType: 'Organization',
        entityRef: orgId,
        details: { plan: newPlan, stripeSessionId: session.id, amountPaid: session.amount_total },
        organizationId: orgId,
      });
      console.log(`[stripe/webhook] ✅ Upgraded org ${orgId} to plan ${newPlan}`);
    }

    // ── LICENSE RENEWAL ───────────────────────────────────────────────────
    if (meta.type === 'license_renewal') {
      const now = new Date();
      const newEnd = new Date(now.setFullYear(now.getFullYear() + 1));
      await prisma.organization.update({
        where: { id: orgId },
        data: {
          licenseStatus: 'Active',
          licenseStart: new Date(),
          licenseEnd: newEnd,
        },
      });
      await logAudit({
        actorEmail: 'stripe-webhook',
        action: 'LICENSE_RENEWED_PAID',
        entityType: 'Organization',
        entityRef: orgId,
        details: { newEnd: newEnd.toISOString(), stripeSessionId: session.id, amountPaid: session.amount_total },
        organizationId: orgId,
      });
      console.log(`[stripe/webhook] ✅ Renewed license for org ${orgId} until ${newEnd}`);
    }
  }

  return NextResponse.json({ received: true });
}
