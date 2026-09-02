'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Users, ShoppingBag, TrendingUp, ArrowRight, Gavel, ClipboardCheck, Clock, Activity, BarChart3, Package } from 'lucide-react';

export default function ClientDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ users: 0, vendors: 0, pos: 0, intakes: 0, totalSpend: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d) setUser(d); });
    fetch('/api/dashboard/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const kpis = [
    { title: 'Purchase Requests', value: stats.intakes, icon: FileText, color: '#2563eb', bg: '#eff6ff', link: '/client/intake' },
    { title: 'Active Vendors', value: stats.vendors, icon: Users, color: '#16a34a', bg: '#dcfce7', link: '/client/vendors' },
    { title: 'Purchase Orders', value: stats.pos, icon: ShoppingBag, color: '#7c3aed', bg: '#faf5ff', link: '/client/po' },
    { title: 'Total PO Spend', value: '\u20b9' + (stats.totalSpend || 0).toLocaleString('en-IN'), icon: TrendingUp, color: '#d97706', bg: '#fef3c7', link: '/client/po' },
  ];

  const quickLinks = [
    { label: 'Create RFQ Event', icon: Gavel, path: '/client/events/create/single-stage', color: '#2563eb' },
    { label: 'New Purchase Request', icon: FileText, path: '/client/intake', color: '#16a34a' },
    { label: 'View Approvals', icon: ClipboardCheck, path: '/client/approvals', color: '#7c3aed' },
    { label: 'Manage Products', icon: Package, path: '/client/manage/products', color: '#d97706' },
  ];

  const recentAlerts = [
    { dot: '#f59e0b', title: 'PR-2026-000001 awaiting approval', time: '2 hours ago' },
    { dot: '#10b981', title: 'RFQ Event #450 has ended', time: 'Yesterday' },
    { dot: '#3b82f6', title: 'New vendor onboarded successfully', time: 'Jun 24, 2026' },
    { dot: '#8b5cf6', title: 'PO-2026-0012 delivered & confirmed', time: 'Jun 22, 2026' },
  ];

  const trendBars = [40, 65, 30, 85, 50, 95, 75];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f2460 0%, #1e3a8a 55%, #1e40af 100%)', padding: '32px 32px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.15), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Command Center</p>
          <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Welcome back{user?.name ? ', ' + user.name.split(' ')[0] : ''}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', margin: '8px 0 0', fontSize: '0.95rem' }}>Here's your procurement overview for today.</p>
        </div>
      </div>

      <div style={{ padding: '0 32px 40px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>
        {/* KPI Cards */}
        <div id="tour-kpi-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} onClick={() => router.push(k.link)} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{k.title}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.05em', lineHeight: 1 }}>
                      {loading ? <span style={{ color: '#cbd5e1' }}>—</span> : k.value}
                    </div>
                  </div>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={k.color} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: k.color, fontSize: '0.78rem', fontWeight: 600 }}>
                  View all <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px' }}>
          {/* Volume Trends */}
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Volume Trends</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Monthly procurement activity</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#eff6ff', borderRadius: '8px' }}>
                <BarChart3 size={14} color="#2563eb" />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb' }}>2026</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px', paddingBottom: '8px' }}>
              {trendBars.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', height: h + '%', background: i === 5 ? 'linear-gradient(to top, #1e3a8a, #3b82f6)' : 'linear-gradient(to top, #bfdbfe, #93c5fd)', borderRadius: '6px 6px 0 0', transition: 'height 0.8s ease', position: 'relative' }}>
                    {i === 5 && <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', background: '#1e3a8a', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Peak</div>}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>{months[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div id="tour-recent-events" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Recent Alerts</h2>
              <Activity size={16} color="#64748b" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentAlerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: i < recentAlerts.length - 1 ? '16px' : 0, borderBottom: i < recentAlerts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: a.dot, marginTop: '6px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem', lineHeight: 1.4 }}>{a.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      <Clock size={11} />{a.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Quick Actions</h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>Common tasks to get you started</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {quickLinks.map((q, i) => {
              const Icon = q.icon;
              return (
                <button key={i} onClick={() => router.push(q.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.borderColor = '#bfdbfe'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: q.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={q.color} />
                  </div>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
