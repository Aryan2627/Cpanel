import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ─── PRODUCT CATALOG ─────────────────────────────────────────────────────────

// Token top-up packages (one-time)
export const TOKEN_PACKAGES = [
  { id: 'tokens_500',  label: '500 Tokens',   tokens: 500,  amount: 49900,   popular: false, desc: 'Light top-up' },
  { id: 'tokens_1500', label: '1,500 Tokens', tokens: 1500, amount: 129900,  popular: true,  desc: 'Best value' },
  { id: 'tokens_5000', label: '5,000 Tokens', tokens: 5000, amount: 399900,  popular: false, desc: 'High volume' },
] as const;

export type TokenPackageId = (typeof TOKEN_PACKAGES)[number]['id'];

// Plan upgrade prices (one-time monthly payment)
export const PLAN_PRICES: Record<string, { amount: number; label: string }> = {
  growth:     { amount: 499900,  label: 'Growth Plan — ₹4,999/month' },
  enterprise: { amount: 1499900, label: 'Enterprise Plan — ₹14,999/month' },
};

// License renewal (annual)
export const LICENSE_RENEWAL = { amount: 9999900, label: 'ProcGen License Renewal — 1 Year (₹99,999)' };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function formatINR(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN');
}

// Razorpay uses paise (1 INR = 100 paise)
export function toPaise(rupees: number) {
  return Math.round(rupees * 100);
}
