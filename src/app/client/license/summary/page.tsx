"use client";
import { useState, useEffect } from 'react';
import { useSession } from '../../../../context/SessionContext';
import { Calendar, ShieldCheck, Clock, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function LicenseSummaryPage() {
  const { session, loading } = useSession();
  const [tokenStatus, setTokenStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tokens')
      .then(r => r.json())
      .then(d => setTokenStatus(d.status))
      .catch(() => {});
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>Loading license data...</div>;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const isExpired = session?.licenseStatus === "Expired";
  const statusColor = isExpired ? '#ef4444' : (session?.licenseStatus === 'Suspended' ? '#f59e0b' : '#10b981');

  const pct = tokenStatus?.percentUsed ?? 0;
  const meterColor = pct >= 95 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
  const meterGradient = pct >= 95
    ? 'linear-gradient(90deg,#ef4444,#f87171)'
    : pct >= 80
    ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
    : 'linear-gradient(90deg,#10b981,#34d399)';

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8faff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>ProcGen License Summary</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isExpired ? '#fef2f2' : '#ecfdf5', padding: '8px 16px', borderRadius: '20px', border: '1px solid ' + statusColor + '40' }}>
            {isExpired ? <AlertCircle size={18} color={statusColor} /> : <CheckCircle2 size={18} color={statusColor} />}
            <span style={{ color: statusColor, fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' }}>{session?.licenseStatus || 'Active'}</span>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>
          Overview of your organization&apos;s subscription and active provisioning on the ProcGen platform.
        </p>

        {/* License Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#475569' }}>
              <ShieldCheck size={20} color="#3b82f6" />
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Current Plan</div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{session?.licensePlan || 'Enterprise'}</div>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>Provisioned for {session?.companyName}</div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#475569' }}>
              <Calendar size={20} color="#10b981" />
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>License Start Date</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600, color: '#0f172a' }}>{formatDate(session?.licenseStart)}</div>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>Beginning of current billing cycle</div>
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: isExpired ? '2px solid #ef4444' : '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#475569' }}>
              <Clock size={20} color={isExpired ? '#ef4444' : "#f59e0b"} />
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>License Expiry Date</div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 600, color: isExpired ? '#ef4444' : '#0f172a' }}>{formatDate(session?.licenseEnd)}</div>
            <div style={{ marginTop: '8px', fontSize: '0.85rem', color: isExpired ? '#ef4444' : '#64748b' }}>
              {isExpired ? 'Your license has expired.' : 'End of current billing cycle'}
            </div>
          </div>

        </div>

        {/* ── TOKEN USAGE WIDGET ── */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px 28px', marginBottom: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={20} color="#f59e0b" />
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: '#475569' }}>Monthly Token Usage</span>
            </div>
            <a href="/client/manage/tokens" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6', textDecoration: 'none' }}>
              Manage →
            </a>
          </div>

          {tokenStatus ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: meterColor, lineHeight: 1 }}>
                    {(tokenStatus.tokensUsed ?? 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>
                    {' '}/ {(tokenStatus.tokensTotal ?? 500).toLocaleString()} tokens used
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{pct}%</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Resets {tokenStatus.nextResetDate
                      ? new Date(tokenStatus.nextResetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : 'monthly'}
                  </div>
                </div>
              </div>

              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: meterGradient, borderRadius: '6px', transition: 'width 0.6s ease' }} />
              </div>

              {pct >= 80 && (
                <div style={{ marginTop: '12px', padding: '10px 14px', background: pct >= 95 ? '#fef2f2' : '#fffbeb', border: `1px solid ${pct >= 95 ? '#fecaca' : '#fde68a'}`, borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, color: pct >= 95 ? '#dc2626' : '#92400e' }}>
                  {pct >= 95
                    ? '⚠️ Critical: Almost out of tokens. Upgrade your plan to avoid disruption.'
                    : '⚡ Running low on tokens. Consider upgrading your plan.'}
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading usage data...</div>
          )}
        </div>

        {/* Recent Entitlement Activity */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Recent Entitlement Activity</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: '0', margin: 0, fontSize: '0.95rem', color: '#334155' }}>
            <li style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Global configuration sync completed.</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Your organization&apos;s license data was securely synchronized with the master Configuration portal.</div>
              </div>
            </li>
            <li style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginTop: '6px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>AI Negotiator module provisioned.</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Added to the European Procurement Team automatically based on new licensing tier.</div>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
