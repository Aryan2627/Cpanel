'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';
import { LayoutDashboard, ClipboardList, FileText, Gavel, Bot, Users, ShoppingBag, Database, Shield, Settings, ChevronRight, Bell, LogOut, Menu, X, Building2, Briefcase } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/client', icon: LayoutDashboard },
  { name: 'Approvals', path: '/client/approvals', icon: ClipboardList },
  { name: 'Purchase Requests', path: '/client/intake', icon: FileText },
  { name: 'Requisitions', path: '/client/pr', icon: Briefcase },
  { name: 'Tenders & Auctions', path: '/client/events', icon: Gavel },
  { name: 'AI Negotiators', path: '/client/ai-agents', icon: Bot },
  {
    name: 'Vendors',
    path: '#vendors',
    icon: Users,
    sub: [
      { name: 'Supplier List', path: '/client/vendors' },
      { name: 'Chat / Messages', path: '/client/vendors/messages' },
    ]
  },
  { name: 'Purchase Orders', path: '/client/po', icon: ShoppingBag },
  {
    name: 'Master Data',
    path: '#master',
    icon: Database,
    sub: [
      { name: 'Users', path: '/client/manage/users' },
      { name: 'Products', path: '/client/manage/products' },
      { name: 'Templates', path: '/client/manage/templates' },
      { name: 'Approval Rules', path: '/client/manage/approvals' },
    ]
  },
  {
    name: 'License Mgmt',
    path: '#license',
    icon: Shield,
    sub: [
      { name: 'License Summary', path: '/client/license/summary' },
      { name: 'Product Summary', path: '/client/license/products' },
      { name: 'All Licenses', path: '/client/license/all' },
      { name: 'Allocations', path: '/client/license/allocations' },
      { name: 'Recommendations', path: '/client/license/recommendations' },
      { name: '—EXPIRY—', isHeader: true },
      { name: 'Maintenance Expiry', path: '/client/license/expiry/maintenance' },
      { name: 'Contract Expiry', path: '/client/license/expiry/contracts' },
      { name: 'Payments Due', path: '/client/license/expiry/payments' },
    ]
  },
  {
    name: 'Settings',
    path: '#settings',
    icon: Settings,
    sub: [{ name: 'General', path: '/client/settings' }]
  },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string } | null>(null);

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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f2460, #1e3a8a)', color: '#fff', flexDirection: 'column', fontFamily: 'system-ui', textAlign: 'center', padding: '24px' }}>
        <Shield size={64} color="#fca5a5" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '2rem', marginBottom: '12px', fontWeight: 700 }}>License Expired</h1>
        <p style={{ marginBottom: '32px', color: '#bfdbfe', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.6 }}>
          Your ProcGen {currentUser.licensePlan} license has expired. Platform access has been locked.
        </p>
        <button onClick={handleGeneratePO} style={{ background: '#2563eb', color: '#fff', padding: '14px 32px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
          Generate Renewal Purchase Order
        </button>
      </div>
    );
  }

  const isActive = (path: string) => path === '/client' ? pathname === '/client' : pathname.startsWith(path);

  const pageName = (() => {
    const flat = NAV_ITEMS.flatMap(n => n.sub ? n.sub : [n]);
    const match = [...flat].sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0)).find(n => n.path && pathname.startsWith(n.path) && n.path !== '#');
    return match?.name || 'Procurement Portal';
  })();

  return (
    <IntakeProvider>
      <div className="app-container">
        {/* SIDEBAR */}
        <nav className="sidebar" style={{ width: isSidebarOpen ? '260px' : '0', minWidth: isSidebarOpen ? '260px' : '0', opacity: isSidebarOpen ? 1 : 0, overflow: isSidebarOpen ? 'visible' : 'hidden', transition: 'all 0.3s ease', padding: isSidebarOpen ? undefined : '0' }}>
          {/* Logo */}
          <div className="sidebar-logo">
            <img src="/logo.png" alt="ProcGen" style={{ width: '36px', height: '36px', objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px', lineHeight: 1 }}>ProcGen</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Procurement Suite</div>
            </div>
          </div>

          {/* Nav */}
          <ul className="sidebar-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.path !== '#' && item.path.startsWith('#') === false && isActive(item.path);
              const subActive = item.sub && item.sub.some(s => s.path && pathname.startsWith(s.path));
              const showSub = openSub === item.name;

              return (
                <li key={item.name} onMouseEnter={() => item.sub && setOpenSub(item.name)} onMouseLeave={() => item.sub && setOpenSub(null)}>
                  {item.sub ? (
                    <>
                      <div className={`nav-group-header ${subActive ? 'active' : ''}`} onClick={() => setOpenSub(showSub ? null : item.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', color: subActive ? '#fff' : 'rgba(255,255,255,0.65)', background: subActive ? 'rgba(255,255,255,0.15)' : 'transparent', transition: 'all 0.15s', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Icon size={17} />{item.name}</div>
                        <ChevronRight size={14} style={{ transform: showSub ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
                      </div>
                      {showSub && (
                        <ul className="sub-menu">
                          {item.sub.map(sub => (
                            'isHeader' in sub && sub.isHeader ? (
                              <li key={sub.name} className="sub-header">{sub.name}</li>
                            ) : (
                              <li key={sub.name}>
                                <Link href={sub.path || '#'} className={pathname === sub.path ? 'active' : ''}>{sub.name}</Link>
                              </li>
                            )
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.path} className={active ? 'active' : ''}>
                      <Icon size={17} />{item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* User Footer */}
          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PG'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name || 'Loading...'}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.companyName || currentUser?.email || ''}</div>
              </div>
            </div>
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

        {/* MAIN */}
        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
          {/* Topbar */}
          <header style={{ height: '60px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#64748b', display: 'flex' }} title="Toggle Sidebar">
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="#94a3b8" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{pageName}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#64748b', display: 'flex', position: 'relative' }}>
                <Bell size={20} />
                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }}></span>
              </button>
              <button onClick={() => router.push('/client/profile')} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.75rem' }}>
                  {currentUser?.companyName ? currentUser.companyName.substring(0, 2).toUpperCase() : 'PG'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Workspace</div>
                  <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700 }}>{currentUser?.companyName || 'Loading...'}</div>
                </div>
              </button>
            </div>
          </header>
          <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
        </main>

        <TourButton />
        <SpotlightSearch />
        <CartOverlay />
        <JarvisAssistant />
      </div>
    </IntakeProvider>
  );
}
