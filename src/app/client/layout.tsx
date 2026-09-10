'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';
import { LayoutDashboard, ShoppingCart, Users, Database, Shield, Bot, Settings, Bell, Search, LogOut, Grid3X3, ChevronRight } from 'lucide-react';

const APPS = [
  { name: 'Dashboard', path: '/client', icon: LayoutDashboard, color: '#3b82f6', desc: 'Main overview' },
  {
    name: 'Procurement', path: '/client/intake', icon: ShoppingCart, color: '#10b981', desc: 'Purchasing & PRs',
    sub: [
      { name: 'Purchase Requests', path: '/client/intake' },
      { name: 'Requisitions', path: '/client/pr' },
      { name: 'Tenders & Auctions', path: '/client/events' },
      { name: 'Purchase Orders', path: '/client/po' },
      { name: 'Approvals', path: '/client/approvals' },
    ]
  },
  {
    name: 'Vendors', path: '/client/vendors', icon: Users, color: '#f59e0b', desc: 'Supplier management',
    sub: [
      { name: 'Supplier List', path: '/client/vendors' },
      { name: 'Chat / Messages', path: '/client/vendors/messages' },
    ]
  },
  {
    name: 'Master Data', path: '/client/manage/users', icon: Database, color: '#8b5cf6', desc: 'Core system records',
    sub: [
      { name: 'Users', path: '/client/manage/users' },
      { name: 'Products', path: '/client/manage/products' },
      { name: 'Templates', path: '/client/manage/templates' },
      { name: 'Approval Rules', path: '/client/manage/approvals' },
    ]
  },
  {
    name: 'Licensing', path: '/client/license/summary', icon: Shield, color: '#ef4444', desc: 'Software & assets',
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
  { name: 'AI Agents', path: '/client/ai-agents', icon: Bot, color: '#06b6d4', desc: 'Autonomous bots' },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string } | null>(null);

  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => { if (d?.name) setCurrentUser(d); }).catch(() => null);
  }, []);

  // Close launcher when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (launcherRef.current && !launcherRef.current.contains(event.target as Node)) {
        setIsLauncherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [launcherRef]);

  // Determine the active app based on pathname
  const activeApp = APPS.find(app => {
    if (app.path === '/client' && pathname === '/client') return true;
    if (app.sub && app.sub.some(s => pathname.startsWith(s.path))) return true;
    if (app.path !== '/client' && pathname.startsWith(app.path)) return true;
    return false;
  });

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
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f8fafc', overflow: 'hidden' }}>

        {/* TOP HEADER */}
        <header style={{ height: '60px', background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
          
          {/* Left: App Launcher & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div ref={launcherRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsLauncherOpen(!isLauncherOpen)}
                style={{ background: isLauncherOpen ? 'rgba(255,255,255,0.15)' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <Grid3X3 size={22} />
              </button>

              {/* APP LAUNCHER POP-OVER */}
              {isLauncherOpen && (
                <div style={{ position: 'absolute', top: '50px', left: '0', width: '320px', background: '#ffffff', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0', padding: '16px', zIndex: 100, animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '8px' }}>Your Apps</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {APPS.map(app => {
                      const Icon = app.icon;
                      return (
                        <Link 
                          key={app.name} 
                          href={app.path} 
                          onClick={() => setIsLauncherOpen(false)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: \\15\, color: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            <Icon size={20} />
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>{app.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{app.desc}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '20px' }} onClick={() => router.push('/client')}>
              <img src="/logo.png" alt="ProcGen" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>ProcGen</span>
            </div>
            
            {/* Show the current Active App name next to the logo! */}
            {activeApp && activeApp.name !== 'Dashboard' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)' }}>
                <ChevronRight size={16} />
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{activeApp.name}</span>
              </div>
            )}
          </div>

          {/* Center: Search */}
          <div style={{ flex: 1, maxWidth: '500px', margin: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '8px 16px', gap: '10px', transition: 'all 0.2s' }}>
              <Search size={16} color="#94a3b8" />
              <input type="text" placeholder="Search POs, Requests, Vendors..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.875rem' }} />
            </div>
          </div>

          {/* Right: Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #0d1f4f' }}></span>
            </button>
            <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>
              <Settings size={18} />
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
        </header>

        {/* LOWER CONTENT AREA */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* LOCALIZED SIDEBAR (Only shows if the active app has sub-links) */}
          {activeApp && activeApp.sub && (
            <nav style={{ width: '240px', background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, padding: '20px 12px', zIndex: 10 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', paddingLeft: '12px' }}>
                {activeApp.name} Menu
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {activeApp.sub.map(subItem => {
                  const isSubActive = pathname === subItem.path || pathname.startsWith(subItem.path + '/');
                  return (
                    <li key={subItem.name}>
                      <Link 
                        href={subItem.path} 
                        style={{ 
                          display: 'block', padding: '10px 12px', borderRadius: '8px', 
                          fontSize: '0.875rem', fontWeight: isSubActive ? 600 : 500,
                          color: isSubActive ? '#0284c7' : '#475569', 
                          background: isSubActive ? '#f0f9ff' : 'transparent',
                          textDecoration: 'none', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}

          {/* MAIN PAGE CONTENT */}
          <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ flex: 1 }}>{children}</div>
          </main>

        </div>

        <TourButton />
        <SpotlightSearch />
        <CartOverlay />
        <JarvisAssistant />

      </div>

      <style dangerouslySetInnerHTML={{ __html: 
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      }} />
    </IntakeProvider>
  );
}