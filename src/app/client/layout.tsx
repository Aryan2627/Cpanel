'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';
import { LayoutDashboard, ShoppingCart, Users, Database, Shield, Bot, Settings, Bell, Search, LogOut } from 'lucide-react';

const TOP_MENUS = [
  { name: 'Dashboard', path: '/client', icon: LayoutDashboard },
  {
    name: 'Procurement',
    path: '/client/intake', // default click
    icon: ShoppingCart,
    sub: [
      { name: 'Purchase Requests', path: '/client/intake' },
      { name: 'Requisitions', path: '/client/pr' },
      { name: 'Tenders & Auctions', path: '/client/events' },
      { name: 'Purchase Orders', path: '/client/po' },
      { name: 'Approvals', path: '/client/approvals' },
    ]
  },
  {
    name: 'Vendors',
    path: '/client/vendors',
    icon: Users,
    sub: [
      { name: 'Supplier List', path: '/client/vendors' },
      { name: 'Chat / Messages', path: '/client/vendors/messages' },
    ]
  },
  {
    name: 'Master Data',
    path: '/client/manage/users',
    icon: Database,
    sub: [
      { name: 'Users', path: '/client/manage/users' },
      { name: 'Products', path: '/client/manage/products' },
      { name: 'Templates', path: '/client/manage/templates' },
      { name: 'Approval Rules', path: '/client/manage/approvals' },
    ]
  },
  {
    name: 'Licensing',
    path: '/client/license/summary',
    icon: Shield,
    sub: [
      { name: 'License Summary', path: '/client/license/summary' },
      { name: 'Product Summary', path: '/client/license/products' },
      { name: 'All Licenses', path: '/client/license/all' },
      { name: 'Allocations', path: '/client/license/allocations' },
      { name: 'Recommendations', path: '/client/license/recommendations' },
      { name: 'Maintenance Expiry', path: '/client/license/expiry/maintenance' },
      { name: 'Contract Expiry', path: '/client/license/expiry/contracts' },
      { name: 'Payments Due', path: '/client/license/expiry/payments' },
    ]
  },
  { name: 'AI Agents', path: '/client/ai-agents', icon: Bot },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    try { 
      await fetch('/api/auth/logout', { method: 'POST' }); 
      const { signOut } = await import('next-auth/react'); 
      await signOut({ redirect: true, callbackUrl: '/login' }); 
    } catch(e) { 
      window.location.href = '/login'; 
    }
  };

  // Determine the active category based on pathname
  const activeCategory = TOP_MENUS.find(menu => {
    if (menu.path === '/client' && pathname === '/client') return true;
    if (menu.sub && menu.sub.some(s => pathname.startsWith(s.path))) return true;
    if (menu.path !== '/client' && pathname.startsWith(menu.path)) return true;
    return false;
  });

  return (
    <IntakeProvider>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f1f5f9', overflow: 'hidden' }}>

        {/* TOP NAVIGATION HEADER */}
        <header style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', zIndex: 50, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          {/* Top Row: Logo, Search, Profile */}
          <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => router.push('/client')}>
              <img src="/logo.png" alt="ProcGen" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ProcGen</span>
            </div>

            <div style={{ flex: 1, maxWidth: '600px', margin: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '8px 16px', gap: '10px', transition: 'all 0.2s' }}>
                <Search size={16} color="#94a3b8" />
                <input type="text" placeholder="Search POs, Requests, Vendors..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.875rem' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', position: 'relative' }}>
                <Bell size={18} />
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #0d1f4f' }}></span>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '20px', borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{currentUser?.name || 'Loading...'}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{currentUser?.companyName || ''}</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }} onClick={() => router.push('/client/profile')}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Sign Out">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Main Categories */}
          <div style={{ height: '44px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            <nav style={{ display: 'flex', gap: '8px', height: '100%' }}>
              {TOP_MENUS.map(menu => {
                const isCatActive = activeCategory?.name === menu.name;
                return (
                  <Link 
                    key={menu.name} 
                    href={menu.path} 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', height: '100%', 
                      color: isCatActive ? '#38bdf8' : '#cbd5e1', 
                      textDecoration: 'none', fontSize: '0.875rem', fontWeight: isCatActive ? 600 : 500, 
                      background: isCatActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      borderBottom: isCatActive ? '3px solid #38bdf8' : '3px solid transparent',
                      transition: 'all 0.15s' 
                    }}
                  >
                    {menu.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {/* SECONDARY HORIZONTAL NAVIGATION BAR (replaces dropdown) */}
        {activeCategory && activeCategory.sub && (
          <div style={{ height: '48px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0, overflowX: 'auto', zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <nav style={{ display: 'flex', gap: '24px', height: '100%' }}>
              {activeCategory.sub.map(subItem => {
                const isSubActive = pathname === subItem.path || pathname.startsWith(subItem.path + '/');
                return (
                  <Link 
                    key={subItem.name} 
                    href={subItem.path} 
                    style={{ 
                      display: 'flex', alignItems: 'center', height: '100%',
                      color: isSubActive ? '#0284c7' : '#64748b', 
                      textDecoration: 'none', fontSize: '0.85rem', fontWeight: isSubActive ? 700 : 500,
                      borderBottom: isSubActive ? '2px solid #0284c7' : '2px solid transparent',
                      whiteSpace: 'nowrap', transition: 'all 0.15s'
                    }}
                  >
                    {subItem.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>{children}</div>
        </main>

        <TourButton />
        <SpotlightSearch />
        <CartOverlay />
        <JarvisAssistant />
      </div>
    </IntakeProvider>
  );
}