'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, FileText, CheckCircle, TrendingUp, AlertCircle, MessageSquare, Bell, LogOut, LayoutDashboard, ShoppingBag, ClipboardList, Settings, ChevronRight, ArrowRight } from 'lucide-react';

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState<{ name: string; email: string; vendorCode?: string } | null>(null);

  useEffect(() => {
    fetch('/api/vendor-auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.name) setVendor(d); }).catch(() => null);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/vendor-auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/vendor';
  };

  const kpis = [
    { label: 'Active RFQs', value: '12', icon: FileText, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Pending POs', value: '4', icon: Package, color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' },
    { label: 'YTD Revenue', value: '$1.4M', icon: TrendingUp, color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
    { label: 'Win Rate', value: '68%', icon: CheckCircle, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  ];

  const recentActivity = [
    { id: 'RFQ-2024-882', type: 'Enterprise Servers', buyer: 'TechCorp Inc.', status: 'NEEDS REVIEW', statusColor: '#b45309', statusBg: '#fef3c7', statusBorder: '#fde68a', href: '/vendor/events' },
    { id: 'PO-9928', type: 'Office Supplies Q3', buyer: 'TechCorp Inc.', status: 'AWARDED', statusColor: '#15803d', statusBg: '#dcfce7', statusBorder: '#86efac', href: '/client/vendor/celebrate/PO-9928' },
    { id: 'RFQ-2024-791', type: 'IT Hardware Refresh', buyer: 'GlobalCorp', status: 'SUBMITTED', statusColor: '#1d4ed8', statusBg: '#eff6ff', statusBorder: '#bfdbfe', href: '/vendor/events' },
  ];

  const initials = vendor?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SP';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top Nav */}
      <header style={{ height: '64px', backgroundColor: '#071330', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Company Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px' }}>Supplier Portal</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { name: 'Dashboard', path: '/vendor', icon: LayoutDashboard, active: true },
              { name: 'Bidding Events', path: '/vendor/events', icon: ShoppingBag, active: false },
              { name: 'My Bids', path: '/vendor/events', icon: ClipboardList, active: false },
            ].map((item) => (
              <Link key={item.name} href={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px',
                color: item.active ? '#fff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                backgroundColor: item.active ? 'rgba(255,255,255,0.1)' : 'transparent',
                transition: 'all 0.15s'
              }}>
                <item.icon size={15} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={18} color="rgba(255,255,255,0.7)" />
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #071330' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
              {initials}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>{vendor?.name || 'Supplier'}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem' }}>{vendor?.vendorCode || 'Verified Supplier'}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }} title="Logout">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Page Body */}
      <main style={{ padding: '0 32px 40px' }}>

        {/* Hero Header */}
        <div style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #0e3d2e 100%)', padding: '28px 32px 40px', marginLeft: '-32px', marginRight: '-32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(16,185,129,0.1), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <LayoutDashboard size={14} color="rgba(255,255,255,0.45)" />
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Supplier Portal</p>
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Welcome back, {vendor?.name?.split(' ')[0] || 'Supplier'}</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.875rem' }}>Here is your current performance overview and active opportunities.</p>
          </div>
        </div>

        {/* Alert */}
        <div style={{ marginTop: '-16px', marginBottom: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #fde68a', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={18} color="#d97706" />
          <div style={{ flex: 1, fontSize: '0.85rem', color: '#92400e' }}>
            <span style={{ fontWeight: 700 }}>Action Required:</span> You have a new counter-offer from TechCorp Inc. on RFQ-2024-882.
          </div>
          <Link href="/vendor/events" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#d97706', color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Review Offer <ArrowRight size={12} />
          </Link>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{k.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.05em', lineHeight: 1 }}>{k.value}</div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: k.bg, border: `1px solid ${k.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={k.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Table */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Recent Activity</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>Your latest bids, RFQs, and awarded orders</p>
            </div>
            <Link href="/vendor/events" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0d1f4f, #1a2f6b)' }}>
                {['Reference ID', 'Description', 'Buyer', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbfc', transition: 'background 0.1s' }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#f0f9ff'}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', fontFamily: 'monospace' }}>{row.id}</td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.85rem' }}>{row.type}</td>
                  <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.85rem' }}>{row.buyer}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, color: row.statusColor, backgroundColor: row.statusBg, border: `1px solid ${row.statusBorder}` }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <Link href={row.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: '#0f172a', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      View <ArrowRight size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}