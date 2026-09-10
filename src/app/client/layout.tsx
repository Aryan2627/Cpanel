'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';
import { LayoutDashboard, ShoppingCart, Users, Database, Shield, Bot, Bell, Search, ChevronDown, LogOut } from 'lucide-react';

const TOP_MENUS = [
  { name: 'Dashboard', path: '/client', icon: LayoutDashboard },
  {
    name: 'Procurement',
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
    icon: Users,
    sub: [
      { name: 'Supplier List', path: '/client/vendors' },
      { name: 'Chat / Messages', path: '/client/vendors/messages' },
    ]
  },
  {
    name: 'Master Data',
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

  // Track which dropdown is open
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

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

  const isActive = (path: string) => path === '/client' ? pathname === '/client' : pathname.startsWith(path);

  return (
    <IntakeProvider>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>

        {/* FULL SCREEN BLUR OVERLAY */}
        {/* Fades in when a dropdown is hovered, blurring the main content */}
        <div 
          style={{ 
            position: 'absolute', top: '100px', left: 0, right: 0, bottom: 0, 
            background: hoveredMenu ? 'rgba(15,23,42,0.3)' : 'transparent', 
            backdropFilter: hoveredMenu ? 'blur(6px)' : 'none', 
            WebkitBackdropFilter: hoveredMenu ? 'blur(6px)' : 'none',
            zIndex: 40, pointerEvents: hoveredMenu ? 'auto' : 'none',
            opacity: hoveredMenu ? 1 : 0, transition: 'all 0.3s ease' 
          }} 
          onMouseEnter={() => setHoveredMenu(null)}
        />

        {/* TOP NAVIGATION HEADER */}
        <header style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', zIndex: 50, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'relative' }}>
          
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

          {/* Bottom Row: Hover Dropdown Navigation */}
          <div style={{ height: '44px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            <nav style={{ display: 'flex', gap: '8px', height: '100%' }}>
              {TOP_MENUS.map(menu => (
                <div 
                  key={menu.name} 
                  onMouseEnter={() => setHoveredMenu(menu.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
                >
                  {menu.path ? (
                    <Link href={menu.path} onClick={() => setHoveredMenu(null)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', height: '100%', color: isActive(menu.path) ? '#38bdf8' : '#cbd5e1', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, background: hoveredMenu === menu.name ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'all 0.15s' }}>
                      {menu.name}
                    </Link>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px', height: '100%', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, background: hoveredMenu === menu.name ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'all 0.15s' }}>
                      {menu.name}
                      
                    </div>
                  )}

                  {/* Dropdown Panel */}
                  {menu.sub && hoveredMenu === menu.name && (
                    <div style={{ position: 'absolute', top: '44px', left: 0, minWidth: '220px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0 0 8px 8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)', padding: '8px', zIndex: 100 }}>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {menu.sub.map(subItem => (
                          <li key={subItem.name}>
                            <Link href={subItem.path} onClick={() => setHoveredMenu(null)} style={{ display: 'block', padding: '10px 14px', borderRadius: '6px', fontSize: '0.875rem', color: pathname === subItem.path ? '#0284c7' : '#334155', background: pathname === subItem.path ? '#f0f9ff' : 'transparent', fontWeight: pathname === subItem.path ? 600 : 500, textDecoration: 'none', transition: 'background 0.15s' }} onMouseEnter={e => { if (pathname !== subItem.path) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (pathname !== subItem.path) e.currentTarget.style.background = 'transparent'; }}>
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
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