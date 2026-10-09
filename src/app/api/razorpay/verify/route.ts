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
import crypto from 'crypto';
import { prisma } from '../../../../lib/prisma';
import { PLANS, PlanKey } from '../../../../lib/tokens';
import { logAudit } from '../../../../lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/razorpay/verify
// Called by client after Razorpay popup payment success
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, notes }
/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      notes,
    } = body;

    // ── VERIFY SIGNATURE ─────────────────────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    const orgId = notes?.orgId;
    const type  = notes?.type;

    if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });

    // ── TOKEN TOP-UP ──────────────────────────────────────────────────────
    if (type === 'topup') {
      const tokens = parseInt(notes.tokens || '0');
      await prisma.organization.update({
        where: { id: orgId },
        data: { tokensTotal: { increment: tokens } },
      });
      await logAudit({
        actorEmail: 'razorpay-webhook',
        action: 'TOKEN_TOPUP_PAID',
        entityType: 'Organization',
        entityRef: orgId,
        details: { tokens, packageId: notes.packageId, paymentId: razorpay_payment_id, orderId: razorpay_order_id },
        organizationId: orgId,
      });
      return NextResponse.json({ success: true, message: `${tokens} tokens added!`, tokens });
    }

    // ── PLAN UPGRADE ──────────────────────────────────────────────────────
    if (type === 'plan') {
      const newPlan = notes.plan as PlanKey;
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
        actorEmail: 'razorpay-webhook',
        action: 'PLAN_UPGRADED_PAID',
        entityType: 'Organization',
        entityRef: orgId,
        details: { plan: newPlan, paymentId: razorpay_payment_id, orderId: razorpay_order_id },
        organizationId: orgId,
      });
      return NextResponse.json({ success: true, message: `Upgraded to ${newPlan} plan!`, plan: newPlan });
    }

    // ── LICENSE RENEWAL ───────────────────────────────────────────────────
    if (type === 'license') {
      const now    = new Date();
      const newEnd = new Date(now);
      newEnd.setFullYear(newEnd.getFullYear() + 1);
      await prisma.organization.update({
        where: { id: orgId },
        data: { licenseStatus: 'Active', licenseStart: now, licenseEnd: newEnd },
      });
      await logAudit({
        actorEmail: 'razorpay-webhook',
        action: 'LICENSE_RENEWED_PAID',
        entityType: 'Organization',
        entityRef: orgId,
        details: { newEnd: newEnd.toISOString(), paymentId: razorpay_payment_id, orderId: razorpay_order_id },
        organizationId: orgId,
      });
      return NextResponse.json({ success: true, message: 'License renewed for 1 year!', newEnd: newEnd.toISOString() });
    }

    return NextResponse.json({ error: 'Unknown payment type' }, { status: 400 });
  } catch (error: any) {
    console.error('[razorpay/verify]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
