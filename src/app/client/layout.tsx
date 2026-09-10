'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';
import { LayoutDashboard, ClipboardList, FileText, Gavel, Bot, Users, ShoppingBag, Database, Shield, Settings, ChevronRight, Bell, LogOut, Menu, X, Building2, Briefcase, Search } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/client', icon: LayoutDashboard },
  { name: 'Approvals', path: '/client/approvals', icon: ClipboardList },
  { name: 'Purchase Requests', path: '/client/intake', icon: FileText },
  { name: 'Requisitions', path: '/client/pr', icon: Briefcase },
  { name: 'Tenders & Auctions', path: '/client/events', icon: Gavel },
  { name: 'AI Negotiators', path: '/client/ai-agents', icon: Bot },
  {
    name: 'Vendors', path: '#vendors', icon: Users,
    sub: [
      { name: 'Supplier List', path: '/client/vendors' },
      { name: 'Chat / Messages', path: '/client/vendors/messages' },
    ]
  },
  { name: 'Purchase Orders', path: '/client/po', icon: ShoppingBag },
  {
    name: 'Master Data', path: '#master', icon: Database,
    sub: [
      { name: 'Users', path: '/client/manage/users' },
      { name: 'Products', path: '/client/manage/products' },
      { name: 'Templates', path: '/client/manage/templates' },
      { name: 'Approval Rules', path: '/client/manage/approvals' },
    ]
  },
  {
    name: 'License Mgmt', path: '#license', icon: Shield,
    sub: [
      { name: 'License Summary', path: '/client/license/summary' },
      { name: 'Product Summary', path: '/client/license/products' },
      { name: 'All Licenses', path: '/client/license/all' },
      { name: 'Allocations', path: '/client/license/allocations' },
      { name: 'Recommendations', path: '/client/license/recommendations' },
      { name: '— EXPIRY —', isHeader: true },
      { name: 'Maintenance Expiry', path: '/client/license/expiry/maintenance' },
      { name: 'Contract Expiry', path: '/client/license/expiry/contracts' },
      { name: 'Payments Due', path: '/client/license/expiry/payments' },
    ]
  },
  {
    name: 'Settings', path: '#settings', icon: Settings,
    sub: [{ name: 'General', path: '/client/settings' }]
  },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string } | null>(null);

  const [flyout, setFlyout] = useState<{ name: string; top: number } | null>(null);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.name) setCurrentUser(d); }).catch(() => null);
  }, []);

  const handleGeneratePO = async () => {
    const res = await fetch('/api/license/renew', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ organizationId: currentUser?.organizationId }) });
    if (res.ok) { alert('Renewal PO Generated! Your license is now in a 14-day grace period.'); window.location.reload(); }
    else alert('Failed to generate PO');
  };

  if (currentUser && currentUser.licenseStatus === 'Expired') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #071330, #0d1f4f)', color: '#fff', flexDirection: 'column', fontFamily: 'system-ui', textAlign: 'center', padding: '24px' }}>
        <Shield size={64} color="#fca5a5" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '12px', fontWeight: 700 }}>License Expired</h1>
        <p style={{ marginBottom: '32px', color: '#bfdbfe', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.6 }}>Your ProcGen {currentUser.licensePlan} license has expired. Platform access has been locked.</p>
        <button onClick={handleGeneratePO} style={{ background: '#2563eb', color: '#fff', padding: '14px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
          Generate Renewal Purchase Order
        </button>
      </div>
    );
  }

  const isActive = (path: string) => path === '/client' ? pathname === '/client' : pathname.startsWith(path);

  const pageName = (() => {
    const flat = NAV_ITEMS.flatMap(n => n.sub ? n.sub : [n]);
    const match = [...flat].sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0)).find(n => n.path && n.path !== '#' && !n.path.startsWith('#') && pathname.startsWith(n.path));
    return match?.name || 'Procurement Portal';
  })();

  const openFlyout = (name: string, el: HTMLElement) => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    const rect = el.getBoundingClientRect();
    setFlyout({ name, top: rect.top });
  };

  const closeFlyout = () => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 120);
  };

  const keepFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
  };

  const currentFlyoutItem = NAV_ITEMS.find(n => n.name === flyout?.name && n.sub);

  return (
    <IntakeProvider>
      {/* Wrapper is now flex column */}
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f1f5f9', overflow: 'hidden' }}>

        {/* SERVICENOW POLARIS HEADER */}
        <header style={{ height: '56px', background: '#1c252a', borderBottom: '1px solid #11181c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, color: '#fff', zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Logo Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => router.push('/client')}>
              <div style={{ width: '28px', height: '28px', background: '#0fa87a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>P</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>ProcGen</span>
            </div>

            {/* Menus */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '24px' }}>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: isSidebarOpen ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <span>All</span>
              </button>
              <button style={{ background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <span>Favorites</span>
              </button>
              <button style={{ background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <span>History</span>
              </button>
              <button style={{ background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <span>Workspaces</span>
              </button>
            </div>
          </div>

          {/* Global Search */}
          <div style={{ flex: 1, maxWidth: '500px', margin: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', gap: '8px' }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.875rem' }} />
            </div>
          </div>

          {/* Right Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '0', right: '0', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', border: '1px solid #1c252a' }}></span>
            </button>
            <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>
              <Settings size={18} />
            </button>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0fa87a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => router.push('/client/profile')}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Lower container for nav and main content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* SIDEBAR (Now styled like ServiceNow Polaris pane) */}
          <nav style={{
            width: isSidebarOpen ? '260px' : '0px',
            minWidth: isSidebarOpen ? '260px' : '0px',
            background: '#1c252a',
            borderRight: '1px solid #11181c',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            zIndex: 30,
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isSidebarOpen ? 1 : 0,
            overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Nav Menu */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'visible', padding: '14px 10px' }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = !item.sub && item.path !== '#' && !item.path.startsWith('#') && isActive(item.path);
                  const subActive = item.sub && item.sub.some((s: any) => s.path && pathname.startsWith(s.path));

                  const baseStyle: React.CSSProperties = {
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                    color: (active || subActive) ? '#ffffff' : 'rgba(255,255,255,0.65)',
                    background: (active || subActive) ? 'rgba(255,255,255,0.1)' : 'transparent',
                    textDecoration: 'none', transition: 'all 0.15s',
                    justifyContent: item.sub ? 'space-between' : 'flex-start',
                    width: '100%', border: 'none',
                  };

                  return (
                    <li key={item.name} style={{ position: 'relative' }}>
                      {item.sub ? (
                        <div
                          style={baseStyle}
                          onMouseEnter={(e) => openFlyout(item.name, e.currentTarget as HTMLElement)}
                          onMouseLeave={closeFlyout}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Icon size={17} />{item.name}
                          </div>
                          <ChevronRight size={14} style={{ opacity: 0.5 }} />
                        </div>
                      ) : (
                        <Link
                          href={item.path}
                          style={baseStyle}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                          onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; } }}
                        >
                          <Icon size={17} />{item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* User Footer */}
            <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <button
                onClick={async () => { try { await fetch('/api/auth/logout', { method: 'POST' }); const { signOut } = await import('next-auth/react'); await signOut({ redirect: true, callbackUrl: '/login' }); } catch(e) { window.location.href = '/login'; } }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '9px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </nav>

          {/* FLYOUT SUBMENU */}
          {flyout && currentFlyoutItem && (
            <ul
              onMouseEnter={keepFlyout}
              onMouseLeave={closeFlyout}
              style={{
                position: 'fixed',
                left: isSidebarOpen ? '268px' : '8px',
                top: Math.min(flyout.top, window.innerHeight - 400),
                minWidth: '240px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 20px 48px rgba(0,0,0,0.15)',
                padding: '8px',
                zIndex: 9999,
                listStyle: 'none',
                maxHeight: '80vh',
                overflowY: 'auto',
                animation: 'flyoutIn 0.15s ease',
              }}
            >
              <li style={{ padding: '8px 14px 6px', fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {currentFlyoutItem.name}
              </li>
              {currentFlyoutItem.sub!.map((sub: any) =>
                sub.isHeader ? (
                  <li key={sub.name} style={{ padding: '8px 14px 4px', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                    {sub.name}
                  </li>
                ) : (
                  <li key={sub.name}>
                    <Link
                      href={sub.path}
                      onClick={() => setFlyout(null)}
                      style={{
                        display: 'block', padding: '9px 14px', borderRadius: '8px', fontSize: '0.875rem',
                        color: pathname === sub.path ? '#2563eb' : '#334155',
                        background: pathname === sub.path ? '#eff6ff' : 'transparent',
                        fontWeight: pathname === sub.path ? 700 : 500,
                        textDecoration: 'none', transition: 'all 0.12s',
                      }}
                      onMouseEnter={e => { if (pathname !== sub.path) { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#1e3a8a'; } }}
                      onMouseLeave={e => { if (pathname !== sub.path) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#334155'; } }}
                    >
                      {sub.name}
                    </Link>
                  </li>
                )
              )}
            </ul>
          )}

          {/* MAIN */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
          </main>

        </div> {/* Close lower container */}

        <TourButton />
        <SpotlightSearch />
        <CartOverlay />
        <JarvisAssistant />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flyoutIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </IntakeProvider>
  );
}