import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

// Token top-up packages (one-time payment)
export const TOKEN_PACKAGES = [
  {
    id: 'tokens_500',
    label: '500 Tokens',
    tokens: 500,
    price: 49900,       // ₹499 in paise
    currency: 'inr',
    popular: false,
    description: 'Ideal for light usage top-up',
  },
  {
    id: 'tokens_1500',
    label: '1,500 Tokens',
    tokens: 1500,
    price: 129900,      // ₹1,299 in paise
    currency: 'inr',
    popular: true,
    description: 'Best value for growing teams',
  },
  {
    id: 'tokens_5000',
    label: '5,000 Tokens',
    tokens: 5000,
    price: 399900,      // ₹3,999 in paise
    currency: 'inr',
    popular: false,
    description: 'For high-volume procurement',
  },
] as const;

export type TokenPackageId = (typeof TOKEN_PACKAGES)[number]['id'];

// Plan subscription prices (monthly)
export const PLAN_PRICES: Record<string, { priceId?: string; amount: number; label: string }> = {
  growth: {
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    amount: 499900,     // ₹4,999 in paise
    label: 'Growth Plan — ₹4,999/month',
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    amount: 1499900,    // ₹14,999 in paise
    label: 'Enterprise Plan — ₹14,999/month',
  },
};

// License renewal (one-time, 1 year)
export const LICENSE_RENEWAL_PRICE = 9999900; // ₹99,999 in paise

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function formatINR(paise: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
