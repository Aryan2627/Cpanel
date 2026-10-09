'use client';
import { useState, useEffect } from 'react';
import { Zap, TrendingUp, ArrowUpRight, CheckCircle2, Clock, RotateCcw, ShoppingCart, Shield, Cpu, Package, Server, AlertCircle } from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window { Razorpay: any; }
}

const PLAN_ICONS: Record<string, any> = {
  starter: Cpu,
  growth: TrendingUp,
  enterprise: Server,
  unlimited: Zap,
};

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise', unlimited: 'Unlimited',
};

const TOKEN_PACKAGES = [
  { id: 'tokens_500',  label: '500 Tokens',   price: '₹499',   popular: false, desc: 'Light top-up' },
  { id: 'tokens_1500', label: '1,500 Tokens', price: '₹1,299', popular: true,  desc: 'Best value' },
  { id: 'tokens_5000', label: '5,000 Tokens', price: '₹3,999', popular: false, desc: 'High volume' },
];

export default function TokensAndUsagePage() {
  const [status, setStatus] = useState<any>(null);
  const [plans, setPlans] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState<{ msg: string, ok: boolean } | null>(null);

  const showMsg = (msg: string, ok: boolean = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tokens/usage');
      const data = await res.json();
      setStatus(data.status);
      setPlans(data.plans);
    } catch (e) {
      console.error(e);
      showMsg('Failed to load usage data.', false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRazorpay = async (amount: number, description: string, notes: any, onSuccess: () => void) => {
    if (typeof window.Razorpay === 'undefined') {
      showMsg('Payment gateway is loading. Please try again.', false);
      return;
    }
    setPaying(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, notes }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourKeyId',
        amount: order.amount,
        currency: order.currency,
        name: 'Procurement AI',
        description,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                notes
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              showMsg('Payment successful! Your account is updated.');
              onSuccess();
              fetchData();
            } else {
              showMsg('Payment verification failed.', false);
            }
          } catch (e) {
            showMsg('Error verifying payment.', false);
          }
          setPaying(false);
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          }
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (e: any) {
      showMsg(e.message || 'Payment error', false);
      setPaying(false);
    }
  };

  const handleTopup = (packageId: string) => {
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    const amountStr = pkg.price.replace(/[^0-9]/g, '');
    const amount = parseInt(amountStr, 10);
    const tokens = parseInt(pkg.label.replace(/[^0-9]/g, ''), 10);
    openRazorpay(amount, `${pkg.label} Top-up`, { type: 'topup', tokens }, () => {
      setShowTopupModal(false);
    });
  };

  const handleUpgrade = (planKey: string) => {
    const planInfo = plans[planKey];
    if (!planInfo) return;
    if (planInfo.price === 0) {
      showMsg('Cannot downgrade to free plan online. Contact support.', false);
      return;
    }
    openRazorpay(planInfo.price, `Upgrade to ${planInfo.name} Plan`, { type: 'upgrade', plan: planKey }, () => {
      setShowUpgradeModal(false);
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading usage data...</div>
      </div>
    );
  }

  const plan = status?.currentPlan || 'starter';
  const pct = Math.round(((status?.tokensUsed ?? 0) / (status?.tokensTotal ?? 500)) * 100);
  const PlanIcon = PLAN_ICONS[plan] || Cpu;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', minHeight: '100%', fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc' }}>
        
        {toast && (
          <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, padding: '12px 20px', background: toast.ok ? '#0f172a' : '#ef4444', color: '#fff', borderRadius: '8px', fontWeight: 500, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Full Bleed Header */}
          <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>Usage & Tokens</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Monitor plan limits and purchase additional AI credits.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowTopupModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
              <ShoppingCart size={16} /> Buy Tokens
            </button>
            <button onClick={() => setShowUpgradeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              <ArrowUpRight size={16} /> Upgrade Plan
              </button>
            </div>
          </div>

          <div style={{ padding: '40px 48px', flex: 1, maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
          {/* Main Usage Card - Platform Standard UI */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <PlanIcon size={20} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>{PLAN_NAMES[plan]} Plan Active</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Cycle resets on: <strong>{status?.nextResetDate ? new Date(status.nextResetDate).toLocaleDateString() : 'N/A'}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                {(status?.tokensRemaining ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>tokens remaining</div>
            </div>
          </div>

          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Usage Limit</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: pct >= 95 ? '#ef4444' : '#0f172a' }}>
              {(status?.tokensUsed ?? 0).toLocaleString()} / {(status?.tokensTotal ?? 500).toLocaleString()} ({pct}%)
            </span>
          </div>
          
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 95 ? '#ef4444' : '#2563eb', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
          </div>

          {pct >= 80 && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.9rem', fontWeight: 500 }}>
                <AlertCircle size={18} />
                You are running low on tokens for this billing cycle.
              </div>
              <button onClick={() => setShowTopupModal(true)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                Buy Top-up
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Used This Month', value: (status?.tokensUsed ?? 0).toLocaleString(), icon: Zap },
            { label: 'Top-ups Active', value: '0', icon: Package },
            { label: 'Days in Cycle', value: '14', icon: Clock }
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Table */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>Recent Token Activity</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Cost</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {(status?.usageLog || []).length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No usage recorded yet this month.</td>
                </tr>
              ) : (
                (status?.usageLog || []).map((log: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 24px', fontSize: '0.9rem', color: '#0f172a' }}>{log.action}</td>
                    <td style={{ padding: '12px 24px', fontSize: '0.9rem', color: '#ef4444', fontWeight: 500 }}>-{log.tokens}</td>
                    <td style={{ padding: '12px 24px', fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        </div>
        {/* Buy Topup Modal */}
        {showTopupModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '480px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <button onClick={() => setShowTopupModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700 }}>Buy Token Credits</h2>
              <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.9rem' }}>Top up your account instantly. Tokens never expire.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TOKEN_PACKAGES.map(pkg => (
                  <button key={pkg.id} onClick={() => !paying && handleTopup(pkg.id)} disabled={paying} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: pkg.popular ? '2px solid #2563eb' : '1px solid #cbd5e1', borderRadius: '8px', background: pkg.popular ? '#eff6ff' : '#fff', cursor: paying ? 'not-allowed' : 'pointer' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{pkg.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{pkg.desc}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{pkg.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '700px', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: 700 }}>Upgrade Subscription</h2>
              <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.9rem' }}>Select a plan that scales with your team's needs.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {Object.entries(plans).filter(([k]) => k !== 'unlimited').map(([key, planInfo]: [string, any]) => {
                  const isSelected = selectedPlan === key;
                  return (
                    <div key={key} onClick={() => setSelectedPlan(key)} style={{ border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', background: isSelected ? '#eff6ff' : '#fff' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{planInfo.name}</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                        {planInfo.price === 0 ? 'Free' : `₹${planInfo.price?.toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px' }}>{planInfo.tokensPerMonth?.toLocaleString()} tokens/mo</div>
                      <ul style={{ padding: '0 0 0 16px', margin: 0, fontSize: '0.8rem', color: '#475569' }}>
                        {planInfo.features?.slice(0, 3).map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <button disabled={!selectedPlan || paying} onClick={() => selectedPlan && handleUpgrade(selectedPlan)} style={{ width: '100%', padding: '14px', background: selectedPlan ? '#2563eb' : '#e2e8f0', color: selectedPlan ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: selectedPlan ? 'pointer' : 'not-allowed' }}>
                {paying ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
