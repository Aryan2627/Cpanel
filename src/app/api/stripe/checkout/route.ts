import { NextResponse } from 'next/server';
import { stripe, TOKEN_PACKAGES, PLAN_PRICES, LICENSE_RENEWAL_PRICE } from '../../../../lib/stripe';
import { getTenantId } from '../../../../lib/tenant';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/stripe/checkout
// body: { type: 'topup', packageId: 'tokens_500' }
//    or { type: 'plan',   plan: 'growth' }
//    or { type: 'license' }
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const body = await request.json();
    const origin = request.headers.get('origin') || 'https://purchase.procgen.in';

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, id: true },
    });

    // ── TOKEN TOP-UP (one-time) ────────────────────────────────────────────
    if (body.type === 'topup') {
      const pkg = TOKEN_PACKAGES.find(p => p.id === body.packageId);
      if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        currency: 'inr',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'inr',
              unit_amount: pkg.price,
              product_data: {
                name: `ProcGen Token Top-up — ${pkg.label}`,
                description: pkg.description,
                images: [],
              },
            },
          },
        ],
        metadata: {
          type: 'topup',
          orgId,
          tokens: pkg.tokens.toString(),
          packageId: pkg.id,
        },
        success_url: `${origin}/client/manage/tokens?payment=success&tokens=${pkg.tokens}`,
        cancel_url:  `${origin}/client/manage/tokens?payment=cancelled`,
        customer_email: undefined,
        custom_text: {
          submit: { message: `Adding ${pkg.tokens.toLocaleString()} tokens to ${org?.name || 'your account'}` },
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // ── PLAN UPGRADE (subscription) ─────────────────────────────────────────
    if (body.type === 'plan') {
      const planPrice = PLAN_PRICES[body.plan];
      if (!planPrice) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',          // one-time for now; swap to 'subscription' when ready
        currency: 'inr',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'inr',
              unit_amount: planPrice.amount,
              product_data: {
                name: planPrice.label,
                description: `Monthly plan for ${org?.name || 'your organization'}`,
              },
            },
          },
        ],
        metadata: {
          type: 'plan_upgrade',
          orgId,
          plan: body.plan,
        },
        success_url: `${origin}/client/manage/tokens?payment=success&plan=${body.plan}`,
        cancel_url:  `${origin}/client/manage/tokens?payment=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    // ── LICENSE RENEWAL (one-time annual) ───────────────────────────────────
    if (body.type === 'license') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        currency: 'inr',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'inr',
              unit_amount: LICENSE_RENEWAL_PRICE,
              product_data: {
                name: 'ProcGen License Renewal — 1 Year',
                description: `Annual license for ${org?.name || 'your organization'}`,
              },
            },
          },
        ],
        metadata: {
          type: 'license_renewal',
          orgId,
        },
        success_url: `${origin}/client/license/summary?payment=success`,
        cancel_url:  `${origin}/client/license/summary?payment=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 });
  } catch (error: any) {
    console.error('[stripe/checkout]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
