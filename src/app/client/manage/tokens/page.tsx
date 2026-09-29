'use client';
import { useState, useEffect } from 'react';
import { Zap, TrendingUp, ArrowUpRight, CheckCircle2, ChevronRight, Clock, RotateCcw, ShoppingCart, Star } from 'lucide-react';

const PLAN_CONFIG: Record<string, { color: string; bg: string; border: string; badge: string }> = {
  starter:    { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', badge: '🌱' },
  growth:     { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', badge: '🚀' },
  enterprise: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', badge: '⚡' },
  unlimited:  { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', badge: '♾️' },
};

const ACTION_ICONS: Record<string, string> = {
  CREATE_EVENT: '📋',
  CREATE_PR: '📝',
  CREATE_PO: '📦',
  INVITE_VENDOR: '🤝',
  ADD_USER: '👤',
  AI_ANALYSIS: '🤖',
  RUN_WORKFLOW: '⚙️',
  EXPORT_GDPR: '📤',
  SEND_EMAIL: '📧',
  CREATE_CONTRACT: '📜',
  CREATE_TEMPLATE: '🗂️',
};

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
  unlimited: 'Unlimited',
};

export default function TokensPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tokens');
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade', plan }),
      });
      if (res.ok) {
        await fetchData();
        setShowUpgradeModal(false);
        setSelectedPlan(null);
      }
    } catch {
      alert('Upgrade failed. Please try again.');
    }
    setUpgrading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: '#64748b', fontWeight: 600 }}>Loading token dashboard...</div>
        </div>
      </div>
    );
  }

  const status = data?.status;
  const plans = data?.plans || {};
  const ledger = data?.ledger || [];
  const pagination = data?.pagination || {};
  const plan = status?.plan || 'starter';
  const pc = PLAN_CONFIG[plan] || PLAN_CONFIG.starter;
  const pct = status?.percentUsed || 0;
  const meterColor = pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Usage & Tokens
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Monitor your plan usage and manage your subscription.
          </p>
        </div>
        <button
          onClick={() => setShowUpgradeModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(59,130,246,0.4)' }}
        >
          <ArrowUpRight size={18} /> Upgrade Plan
        </button>
      </div>

      {/* Current Plan Card */}
      <div style={{ background: '#fff', borderRadius: '20px', border: `2px solid ${pc.border}`, padding: '28px 32px', marginBottom: '24px', boxShadow: '0 8px 30px -8px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${pc.color}, ${pc.color}88)` }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: pc.bg, color: pc.color, borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', border: `1px solid ${pc.border}`, marginBottom: '12px' }}>
              <span>{pc.badge}</span> {PLAN_NAMES[plan]} Plan — Active
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Resets on <strong>{status?.nextResetDate ? new Date(status.nextResetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#0f172a', lineHeight: 1 }}>
              {(status?.tokensRemaining ?? 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
              tokens remaining
            </div>
          </div>
        </div>

        {/* Usage Meter */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: meterColor }}>
              {(status?.tokensUsed ?? 0).toLocaleString()} / {(status?.tokensTotal ?? 500).toLocaleString()} tokens ({pct}%)
            </span>
          </div>
          <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 95 ? 'linear-gradient(90deg, #ef4444, #f87171)' : pct >= 80 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '8px', transition: 'width 0.6s ease' }}></div>
          </div>
          {pct >= 80 && (
            <div style={{ marginTop: '10px', padding: '10px 14px', background: pct >= 95 ? '#fef2f2' : '#fffbeb', border: `1px solid ${pct >= 95 ? '#fecaca' : '#fde68a'}`, borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: pct >= 95 ? '#dc2626' : '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ {pct >= 95 ? 'Critical: Almost out of tokens! Upgrade now to avoid disruption.' : 'Running low on tokens. Consider upgrading your plan.'}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Tokens Used This Month', value: (status?.tokensUsed ?? 0).toLocaleString(), icon: <Zap size={20} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Tokens Allocated', value: (status?.tokensTotal ?? 500).toLocaleString(), icon: <TrendingUp size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Total Actions Logged', value: (pagination.total ?? 0).toLocaleString(), icon: <CheckCircle2 size={20} />, color: '#10b981', bg: '#ecfdf5' },
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

      {/* Token Action Cost Reference */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Token Cost Per Action</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries({
              CREATE_EVENT: 10,
              CREATE_PR: 5,
              CREATE_PO: 5,
              AI_ANALYSIS: 25,
              INVITE_VENDOR: 2,
              ADD_USER: 5,
              RUN_WORKFLOW: 10,
              EXPORT_GDPR: 15,
            }).map(([action, cost]) => (
              <div key={action} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{ACTION_ICONS[action] || '⚡'}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', background: '#fff', padding: '3px 10px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  {cost} tokens
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Token Ledger */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Recent Usage Ledger</h3>
          {ledger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
              <Zap size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              <div style={{ fontWeight: 600 }}>No usage recorded yet</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Token usage will appear here as your team uses the platform</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {ledger.map((entry: any) => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{ACTION_ICONS[entry.action] || '⚡'}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                        {entry.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={10} />
                        {new Date(entry.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>
                    -{entry.tokensConsumed}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '720px', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setShowUpgradeModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>

            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🚀</div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Choose Your Plan</h2>
              <p style={{ margin: 0, color: '#64748b' }}>Upgrade to unlock more tokens and premium features</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {Object.entries(plans).filter(([key]) => key !== 'unlimited').map(([key, planInfo]: [string, any]) => {
                const isCurrentPlan = key === plan;
                const pc2 = PLAN_CONFIG[key] || PLAN_CONFIG.starter;
                const isSelected = selectedPlan === key;
                return (
                  <div
                    key={key}
                    onClick={() => !isCurrentPlan && setSelectedPlan(key)}
                    style={{ border: `2px solid ${isSelected ? pc2.color : isCurrentPlan ? '#e2e8f0' : '#e2e8f0'}`, borderRadius: '16px', padding: '20px', cursor: isCurrentPlan ? 'default' : 'pointer', background: isSelected ? pc2.bg : '#fff', transition: 'all 0.2s', position: 'relative', opacity: isCurrentPlan ? 0.7 : 1 }}
                  >
                    {isCurrentPlan && (
                      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>Current</div>
                    )}
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
              disabled={!selectedPlan || upgrading}
              onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
              style={{ width: '100%', padding: '16px', background: selectedPlan ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0', color: selectedPlan ? '#fff' : '#94a3b8', border: 'none', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', cursor: selectedPlan && !upgrading ? 'pointer' : 'not-allowed', boxShadow: selectedPlan ? '0 8px 20px -4px rgba(59,130,246,0.4)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {upgrading ? <><RotateCcw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Upgrading...</> : selectedPlan ? `Upgrade to ${PLAN_NAMES[selectedPlan]}` : 'Select a Plan to Upgrade'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>
              Contact sales@procgen.in for custom Enterprise pricing
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
