'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, TrendingDown, ArrowRight, Activity, Bell, LogOut, LayoutDashboard, ShoppingBag, ClipboardList, Zap, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorEventsPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState('00:14:59');
  const [vendor, setVendor] = useState<{ name: string; email: string; vendorCode?: string } | null>(null);

  useEffect(() => {
    fetch('/api/vendor-auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.name) setVendor(d); }).catch(() => null);
  }, []);

  useEffect(() => {
    let minutes = 14;
    let seconds = 59;
    const interval = setInterval(() => {
      seconds--;
      if (seconds < 0) { seconds = 59; minutes--; }
      setTimeLeft(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/vendor-auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/vendor';
  };

  const initials = vendor?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SP';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top Nav */}
      <header style={{ height: '64px', backgroundColor: '#071330', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}>S</span>
            </div>
            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.3px' }}>Supplier Portal</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { name: 'Dashboard', path: '/vendor', icon: LayoutDashboard, active: false },
              { name: 'Bidding Events', path: '/vendor/events', icon: ShoppingBag, active: true },
              { name: 'My Bids', path: '/vendor/events', icon: ClipboardList, active: false },
            ].map((item) => (
              <Link key={item.name} href={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px',
                color: item.active ? '#fff' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
                backgroundColor: item.active ? 'rgba(255,255,255,0.1)' : 'transparent',
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
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' }}>
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #0e3d2e 100%)', padding: '28px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(16,185,129,0.1), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Activity size={14} color="rgba(255,255,255,0.45)" />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Live Bidding Events</p>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>Active Bidding Events</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.875rem' }}>Events where you are invited to submit a competitive quote.</p>
        </div>
      </div>

      {/* Events List */}
      <main style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* LIVE Event */}
        <div onClick={() => router.push('/vendor/events/EVT-1029')}
          style={{ backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #2563eb', padding: '24px', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(37,99,235,0.15)', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(37,99,235,0.25)'; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,99,235,0.15)'; }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: 'linear-gradient(90deg, #2563eb, #10b981)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={10} /> LIVE REVERSE AUCTION
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>EVT-1029</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Q3 Enterprise Server Procurement</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 20px 0' }}>Buyer: TechCorp Inc. · 3 Line Items · Delivery by Sept 1st</p>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Your Rank</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706' }}>#2 <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 400 }}>of 5</span></div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Current Best Bid</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>$248,500 <TrendingDown size={14} color="#16a34a" /></div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Time Remaining</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</div>
                </div>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #0d1f4f, #2563eb)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
                Enter Live Floor <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Pending Event */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', opacity: 0.8 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: '100%', background: '#e2e8f0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Package size={10} /> SEALED BID (UPCOMING)
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600 }}>RFQ-2024-882</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Office Supplies Q4 Replenishment</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Buyer: TechCorp Inc. · 12 Line Items</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 500, marginBottom: '10px' }}>Opens in: 2 days, 4 hrs</div>
              <button disabled style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: 600, cursor: 'not-allowed', fontSize: '0.82rem' }}>
                Event Locked
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}