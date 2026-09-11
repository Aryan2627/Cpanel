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
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string; isImpersonating?: boolean } | null>(null);

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

  const endImpersonation = async () => {
    try {
      const res = await fetch('/api/auth/unimpersonate', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/client/manage/users';
      } else {
        alert('Failed to end impersonation');
      }
    } catch (e) {
      alert('Error ending impersonation');
    }
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

  return (
    <IntakeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        
        {currentUser?.isImpersonating && (
          <div style={{ background: '#f97316', color: '#fff', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700, zIndex: 999999, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>👁️</span> 
              <span>IMPERSONATION ACTIVE: You are viewing the platform with {currentUser.name}'s permissions. Actions taken will be logged under their identity.</span>
            </div>
            <button onClick={endImpersonation} style={{ background: '#fff', color: '#f97316', border: 'none', borderRadius: '4px', padding: '4px 12px', fontWeight: 800, cursor: 'pointer' }}>
              End Impersonation
            </button>
          </div>
        )}

        <div style={{ height: '64px', backgroundColor: '#071330', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 100 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link href="/client" style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '14px' }}>P</span>
              </div>
              ProcGen
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {TOP_MENUS.map((menu) => (
                <div 
                  key={menu.name}
                  onMouseEnter={() => setHoveredMenu(menu.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{ position: 'relative' }}
                >
                  <Link 
                    href={menu.path || '#'}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '8px',
                      color: (pathname === menu.path || (menu.sub && menu.sub.some(s => pathname.startsWith(s.path)))) ? '#fff' : 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      backgroundColor: hoveredMenu === menu.name ? 'rgba(255,255,255,0.1)' : 'transparent'
                    }}
                  >
                    <menu.icon size={16} />
                    {menu.name}
                  </Link>

                  {menu.sub && hoveredMenu === menu.name && (
                    <div style={{ 
                      position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                      backgroundColor: '#fff', borderRadius: '12px', padding: '8px',
                      minWidth: '220px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                      border: '1px solid #e2e8f0',
                      display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                      {menu.sub.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.path}
                          style={{
                            padding: '10px 16px', borderRadius: '8px',
                            color: pathname.startsWith(sub.path) ? '#2563eb' : '#475569',
                            backgroundColor: pathname.startsWith(sub.path) ? '#eff6ff' : 'transparent',
                            textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            transition: 'all 0.1s'
                          }}
                          onMouseEnter={(e) => {
                            if (!pathname.startsWith(sub.path)) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                              (e.currentTarget as HTMLElement).style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!pathname.startsWith(sub.path)) {
                              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                              (e.currentTarget as HTMLElement).style.color = '#475569';
                            }
                          }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Global Spotlight Search Trigger */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', cursor: 'text', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            >
              <Search size={14} color="rgba(255,255,255,0.5)" />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, width: '150px' }}>Search...</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 700 }}>
                <span>⌘K</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={20} color="rgba(255,255,255,0.7)" />
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #071330' }} />
              </div>
              
              <Link href="/client/settings" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                    {(currentUser?.name || 'A')[0]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>{currentUser?.name || 'Admin'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{currentUser?.companyName || 'My Organization'}</span>
                  </div>
                </div>
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* The Absolute Backdrop Blur for Cinematic Nav effect */}
        {hoveredMenu && (
          <div style={{
            position: 'absolute', top: '64px', left: 0, width: '100vw', height: 'calc(100vh - 64px)',
            backgroundColor: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(6px)', zIndex: 90
          }} />
        )}

        <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 10 }}>
          {children}
        </div>
      </div>
      
      <CartOverlay />
      <TourButton />
      <SpotlightSearch />
      <JarvisAssistant />
    </IntakeProvider>
  );
}