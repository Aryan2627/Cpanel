import { NextResponse } from 'next/server';
import { razorpay, TOKEN_PACKAGES, PLAN_PRICES, LICENSE_RENEWAL } from '../../../../lib/razorpay';
import { getTenantId } from '../../../../lib/tenant';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/razorpay/order
// body: { type: 'topup', packageId } | { type: 'plan', plan } | { type: 'license' }
// Returns: { orderId, amount, currency, keyId, name, description, prefill }
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const body  = await request.json();

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    });

    let amount = 0;
    let description = '';
    let receipt = '';
    let notes: Record<string, string> = { orgId, type: body.type };

    if (body.type === 'topup') {
      const pkg = TOKEN_PACKAGES.find(p => p.id === body.packageId);
      if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
      amount      = pkg.amount;
      description = `Token Top-up — ${pkg.label}`;
      receipt     = `topup_${pkg.id}_${Date.now()}`;
      notes       = { ...notes, packageId: pkg.id, tokens: pkg.tokens.toString() };
    }

    else if (body.type === 'plan') {
      const plan = PLAN_PRICES[body.plan];
      if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      amount      = plan.amount;
      description = plan.label;
      receipt     = `plan_${body.plan}_${Date.now()}`;
      notes       = { ...notes, plan: body.plan };
    }

    else if (body.type === 'license') {
      amount      = LICENSE_RENEWAL.amount;
      description = LICENSE_RENEWAL.label;
      receipt     = `license_renewal_${Date.now()}`;
    }

    else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes,
    });

    return NextResponse.json({
      orderId:     order.id,
      amount:      order.amount,
      currency:    order.currency,
      keyId:       process.env.RAZORPAY_KEY_ID,
      name:        'ProcGen',
      description,
      orgName:     org?.name || 'Your Organization',
      notes,
    });
  } catch (error: any) {
    console.error('[razorpay/order]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
