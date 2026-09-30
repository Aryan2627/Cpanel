'use client';
import { useState, useEffect } from 'react';
import { Zap, TrendingUp, ArrowUpRight, CheckCircle2, Clock, RotateCcw, ShoppingCart } from 'lucide-react';
import Script from 'next/script';

declare global {
  interface Window { Razorpay: any; }
}

const PLAN_CONFIG: Record<string, { color: string; bg: string; border: string; badge: string }> = {
  starter:    { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', badge: '🌱' },
  growth:     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', badge: '🚀' },
  enterprise: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', badge: '⚡' },
  unlimited:  { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', badge: '♾️' },
};

const ACTION_ICONS: Record<string, string> = {
  CREATE_EVENT: '📋', CREATE_PR: '📝', CREATE_PO: '📦',
  INVITE_VENDOR: '🤝', ADD_USER: '👤', AI_ANALYSIS: '🤖',
  RUN_WORKFLOW: '⚙️', EXPORT_GDPR: '📤', SEND_EMAIL: '📧',
  CREATE_CONTRACT: '📜', CREATE_TEMPLATE: '🗂️',
};

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise', unlimited: 'Unlimited',
};

const TOKEN_PACKAGES = [
  { id: 'tokens_500',  label: '500 Tokens',   price: '₹499',   popular: false, desc: 'Light top-up' },
  { id: 'tokens_1500', label: '1,500 Tokens', price: '₹1,299', popular: true,  desc: 'Best value' },
  { id: 'tokens_5000', label: '5,000 Tokens', price: '₹3,999', popular: false, desc: 'High volume' },
];

export default function TokensPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tokens');
      const json = await res.json();
      setData(json);
    } catch { setData(null); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Core: open Razorpay popup ──────────────────────────────────────────────
  const openRazorpay = async (payload: object, successMsg: string, onSuccess?: () => void) => {
    setPaying(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const order = await res.json();
      if (order.error) throw new Error(order.error);

      const rzp = new window.Razorpay({
        key:          order.keyId,
        amount:       order.amount,
        currency:     order.currency,
        name:         order.name,
        description:  order.description,
        order_id:     order.orderId,
        theme:        { color: '#0f172a' },
        prefill:      { name: order.orgName },
        modal:        { ondismiss: () => setPaying(false) },
        handler: async (response: any) => {
          try {
            const verify = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, notes: order.notes }),
            });
            const result = await verify.json();
            if (result.success) {
              showToast('✅ ' + result.message);
              await fetchData();
              setShowTopupModal(false);
              setShowUpgradeModal(false);
              setSelectedPlan(null);
              if (onSuccess) onSuccess();
            } else {
              showToast('❌ Payment verification failed: ' + result.error, false);
            }
          } catch {
            showToast('❌ Verification error. Contact support.', false);
          }
          setPaying(false);
        },
      });
      rzp.open();
    } catch (e: any) {
      showToast('❌ ' + e.message, false);
      setPaying(false);
    }
  };

  const handleTopup    = (packageId: string) => openRazorpay({ type: 'topup', packageId }, 'Tokens added!');
  const handleUpgrade  = (plan: string)       => openRazorpay({ type: 'plan', plan }, `Upgraded to ${PLAN_NAMES[plan]}!`);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: '#64748b', fontWeight: 600 }}>Loading...</div>
        </div>
      </div>
    );
  }

  const status = data?.status;
  const plans  = data?.plans || {};
  const ledger = data?.ledger || [];
  const pagination = data?.pagination || {};
  const plan   = status?.plan || 'starter';
  const pc     = PLAN_CONFIG[plan] || PLAN_CONFIG.starter;
  const pct    = status?.percentUsed || 0;
  const meterColor = pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';

  return (
    <>
      {/* Razorpay checkout.js */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, padding: '14px 20px', background: toast.ok ? '#0f172a' : '#ef4444', color: '#fff', borderRadius: '12px', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', maxWidth: '360px' }}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Usage & Tokens</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Monitor your plan usage and manage your subscription.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowTopupModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <ShoppingCart size={16} /> Buy Tokens
            </button>
            <button onClick={() => setShowUpgradeModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(59,130,246,0.4)' }}>
              <ArrowUpRight size={18} /> Upgrade Plan
            </button>
          </div>
        </div>

        {/* Plan Card */}
        <div style={{ background: '#fff', borderRadius: '20px', border: `2px solid ${pc.border}`, padding: '28px 32px', marginBottom: '24px', boxShadow: '0 8px 30px -8px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${pc.color}, ${pc.color}88)` }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: pc.bg, color: pc.color, borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', border: `1px solid ${pc.border}`, marginBottom: '12px' }}>
                {pc.badge} {PLAN_NAMES[plan]} Plan — Active
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Resets on <strong>{status?.nextResetDate ? new Date(status.nextResetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#0f172a', lineHeight: 1 }}>
                {(status?.tokensRemaining ?? 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>tokens remaining</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: meterColor }}>
                {(status?.tokensUsed ?? 0).toLocaleString()} / {(status?.tokensTotal ?? 500).toLocaleString()} ({pct}%)
              </span>
            </div>
            <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 95 ? 'linear-gradient(90deg,#ef4444,#f87171)' : pct >= 80 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: '8px', transition: 'width 0.6s ease' }}></div>
            </div>
            {pct >= 80 && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: pct >= 95 ? '#fef2f2' : '#fffbeb', border: `1px solid ${pct >= 95 ? '#fecaca' : '#fde68a'}`, borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: pct >= 95 ? '#dc2626' : '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>⚠️ {pct >= 95 ? 'Critical: Almost out of tokens!' : 'Running low on tokens.'}</span>
                <button onClick={() => setShowTopupModal(true)} style={{ background: pct >= 95 ? '#dc2626' : '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Buy Tokens</button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Tokens Used This Month', value: (status?.tokensUsed ?? 0).toLocaleString(), icon: <Zap size={20} />, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Tokens Allocated',        value: (status?.tokensTotal ?? 500).toLocaleString(), icon: <TrendingUp size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
            { label: 'Total Actions Logged',    value: (pagination.total ?? 0).toLocaleString(), icon: <CheckCircle2 size={20} />, color: '#10b981', bg: '#ecfdf5' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Recent Activity</h3>
          {ledger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
              <Zap size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              <div style={{ fontWeight: 600 }}>No activity yet</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {ledger.map((entry: any) => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{ACTION_ICONS[entry.action] || '⚡'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Clock size={10} />
                      {new Date(entry.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── BUY TOKENS MODAL ───────────────────────────────────────────────── */}
        {showTopupModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '540px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', position: 'relative' }}>
              <button onClick={() => setShowTopupModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>×</button>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Buy Token Credits</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Pay via UPI, Net Banking, Card or Wallet. Tokens never expire.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {TOKEN_PACKAGES.map(pkg => (
                  <button key={pkg.id} onClick={() => !paying && handleTopup(pkg.id)} disabled={paying} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: pkg.popular ? 'linear-gradient(135deg, #eff6ff, #f5f3ff)' : '#f8fafc', border: pkg.popular ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '14px', cursor: paying ? 'not-allowed' : 'pointer', width: '100%', position: 'relative', opacity: paying ? 0.6 : 1 }}>
                    {pkg.popular && <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Most Popular</span>}
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{pkg.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{pkg.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{pkg.price}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>one-time</div>
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
                🔒 Secured by Razorpay · UPI / Cards / Net Banking / Wallets
              </p>
            </div>
          </div>
        )}

        {/* ── UPGRADE PLAN MODAL ─────────────────────────────────────────────── */}
        {showUpgradeModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '720px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', position: 'relative' }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>×</button>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🚀</div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Choose Your Plan</h2>
                <p style={{ margin: 0, color: '#64748b' }}>Pay securely via Razorpay — UPI, Cards, Net Banking</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {Object.entries(plans).filter(([key]) => key !== 'unlimited').map(([key, planInfo]: [string, any]) => {
                  const isCurrentPlan = key === plan;
                  const pc2 = PLAN_CONFIG[key] || PLAN_CONFIG.starter;
                  const isSelected = selectedPlan === key;
                  return (
                    <div key={key} onClick={() => !isCurrentPlan && setSelectedPlan(key)} style={{ border: `2px solid ${isSelected ? pc2.color : '#e2e8f0'}`, borderRadius: '16px', padding: '20px', cursor: isCurrentPlan ? 'default' : 'pointer', background: isSelected ? pc2.bg : '#fff', transition: 'all 0.2s', position: 'relative', opacity: isCurrentPlan ? 0.6 : 1 }}>
                      {isCurrentPlan && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Current</div>}
                      <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{pc2.badge}</div>
                      <div style={{ fontWeight: 800, color: pc2.color, fontSize: '1rem', marginBottom: '4px' }}>{planInfo.name}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '2px' }}>
                        {planInfo.price === 0 ? 'Free' : `₹${planInfo.price?.toLocaleString('en-IN')}`}
                      </div>
                      {planInfo.price > 0 && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px' }}>/month</div>}
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: pc2.color, background: pc2.bg, padding: '4px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px', border: `1px solid ${pc2.border}` }}>
                        {planInfo.tokensPerMonth?.toLocaleString()} tokens/mo
                      </div>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                        {planInfo.features?.map((f: string) => <li key={f}>{f}</li>)}
                      </ul>
                      {isSelected && <div style={{ marginTop: '12px', fontSize: '0.8rem', fontWeight: 700, color: pc2.color, display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Selected</div>}
                    </div>
                  );
                })}
              </div>
              <button
                disabled={!selectedPlan || paying}
                onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
                style={{ width: '100%', padding: '16px', background: selectedPlan ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0', color: selectedPlan ? '#fff' : '#94a3b8', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: selectedPlan && !paying ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                {paying ? <><RotateCcw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : selectedPlan ? `Pay & Upgrade to ${PLAN_NAMES[selectedPlan]}` : 'Select a Plan'}
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </button>
              <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
                🔒 Secured by Razorpay · UPI / Cards / Net Banking / Wallets
              </p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
