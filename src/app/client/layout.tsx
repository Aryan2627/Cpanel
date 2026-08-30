'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(
    pathname.includes('/client/manage') ? 'Manage' : pathname.includes('/client/settings') ? 'Settings' : null
  );

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const [showWorkflows, setShowWorkflows] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('enableWorkflows') === 'true';
    }
    return false;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.name) setCurrentUser(data); })
      .catch(() => null);
  }, []);

  useEffect(() => {
    // Listen for changes from settings page
    const handleSettingsChange = () => {
      setShowWorkflows(localStorage.getItem('enableWorkflows') === 'true');
    };
    window.addEventListener('settings_updated', handleSettingsChange);
    
  const handleGeneratePO = async () => {
    try {
      const res = await fetch('/api/license/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: currentUser?.organizationId })
      });
      if (res.ok) {
        alert("Renewal PO Generated Successfully! Your license is now in a 14-day grace period. You may now continue using the platform.");
        window.location.reload();
      } else {
        alert("Failed to generate PO");
      }
    } catch(e) {
      console.error(e);
    }
  };

  if (currentUser && currentUser.licenseStatus === 'Expired') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', flexDirection: 'column', fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 'bold' }}>License Expired</h1>
        <p style={{ marginBottom: '32px', color: '#94a3b8', fontSize: '1.2rem', maxWidth: '500px', textAlign: 'center' }}>
          Your ProcGen {currentUser.licensePlan} license has expired. Your platform access has been locked.
        </p>
        <button 
          onClick={handleGeneratePO}
          style={{ background: '#3b82f6', color: '#fff', padding: '16px 32px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}
        >
          Generate Renewal Purchase Order (PO)
        </button>
      </div>
    );
  }

  return () => window.removeEventListener('settings_updated', handleSettingsChange);
  }, []);

  const manageSubItems = [
    { name: 'Users', path: '/client/manage/users' },
    { name: 'Products', path: '/client/manage/products' },
    { name: 'Templates', path: '/client/manage/templates' }
  ];

  if (showWorkflows) {
    manageSubItems.push(
      { name: 'Dropdowns & Fields', path: '/client/manage/workflows' },
      { name: 'Approval Rules', path: '/client/manage/approvals' }
    );
  }

  
  const licenseSubItems = [
    { name: 'License Summary', path: '/client/license/summary' },
    { name: 'Product Summary', path: '/client/license/products' },
    { name: 'Publisher Summary', path: '/client/license/publishers' },
    { name: 'All Licenses', path: '/client/license/all' },
    { name: 'Apply Allocations and Exemptions', path: '/client/license/allocations' },
    { name: 'Recommended License Changes', path: '/client/license/recommendations' },
    { name: 'Points Rule Sets', path: '/client/license/points' },
    { name: 'LICENSE EXPIRY', path: '#', isHeader: true },
    { name: 'License and Maintenance Expiry', path: '/client/license/expiry/maintenance' },
    { name: 'License Contract Expiry', path: '/client/license/expiry/contracts' },
    { name: 'Licenses with Payments Due', path: '/client/license/expiry/payments' }
  ];

  const navItems = [
    { name: 'Dashboard', path: '/client' },
    { name: 'Approvals', path: '/client/approvals' },
    { name: 'Purchase Requests', path: '/client/intake' },
    { name: 'Requisitions', path: '/client/pr' },
    { name: 'Tenders & Auctions', path: '/client/events' },
    { name: 'AI Negotiators', path: '/client/ai-agents' },
    { 
      name: 'Vendors', 
      path: '#',
      subItems: [
        { name: 'Supplier List', path: '/client/vendors' },
        { name: 'Chat / Messages', path: '/client/vendors/messages' }
      ]
    },
    { name: 'Purchase Orders', path: '/client/po' },
    { 
      name: 'Master Data', 
      path: '#',
      subItems: manageSubItems
    },
    { 
        name: 'License Management', 
        path: '#',
        subItems: licenseSubItems
      },
      { 
        name: 'Settings', 
      path: '#',
      subItems: [
        { name: 'General', path: '/client/settings' }
      ]
    },
    
  ];

  return (
    <IntakeProvider>
      <div className="app-container">
        
        {/* Sidebar Navigation */}
        <nav className="sidebar" style={{ width: isSidebarOpen ? "270px" : "0px", minWidth: isSidebarOpen ? "270px" : "0px", overflow: isSidebarOpen ? "visible" : "hidden", transition: "all 0.3s ease", padding: isSidebarOpen ? undefined : "0", borderRight: isSidebarOpen ? undefined : "none", opacity: isSidebarOpen ? 1 : 0 }}>
          <div className="sidebar-logo">
            {/* ProcGen Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="ProcGen Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'contrast(1.2) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))' }} />
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.05em' }}>ProcGen</h2>
            </div>
          </div>

          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.name} onMouseEnter={() => setHoverMenu(item.name)} onMouseLeave={() => setHoverMenu(null)} style={{ position: "relative" }}>
                {item.subItems ? (
                  <div>
                    <div 
                      onClick={() => toggleMenu(item.name)}
                      className={(openMenu === item.name || hoverMenu === item.name) ? 'active' : ''}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', color: '#94a3b8', fontWeight: 500, borderRadius: '12px', marginBottom: '8px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      {item.name}
                      <span style={{ fontSize: '0.8rem', transform: (openMenu === item.name || hoverMenu === item.name) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {(openMenu === item.name || hoverMenu === item.name) && (
                      <ul style={{ position: 'absolute', top: 0, left: '100%', minWidth: '280px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', padding: '12px', zIndex: 9999, listStyle: 'none', margin: '0 0 0 10px', maxHeight: '80vh', overflowY: 'auto' }}>
                        {item.subItems.map(subItem => (
                          <li key={subItem.name}>
                            <Link 
                              href={subItem.path}
                              className={pathname === subItem.path ? 'active' : ''}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link 
                    href={item.path}
                    className={pathname === item.path ? 'active' : ''}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #1e293b', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{currentUser?.name || 'Loading...'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{currentUser?.email || ''}</div>
              </div>
            </div>
          </div>
        
            <div style={{ padding: '0 12px 12px 12px' }}>
              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    // Also trigger next-auth signout just in case to clear client state
                    const { signOut } = await import('next-auth/react');
                    await signOut({ redirect: true, callbackUrl: '/login' });
                  } catch(e) {
                    window.location.href = '/login';
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                Sign Out
              </button>
            </div>
          </nav>

        {/* Main Content Area */}
        <main className="main-content" style={{ position: 'relative', width: isSidebarOpen ? 'calc(100vw - 270px)' : '100vw', transition: 'width 0.3s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

          {/* Global Top Header */}
          <header style={{ 
            height: '64px', 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '6px 16px 6px 6px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '50px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onClick={() => router.push('/client/profile')}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff', 
                fontWeight: '800',
                fontSize: '0.8rem',
                boxShadow: '0 2px 5px rgba(37, 99, 235, 0.3)'
              }}>
                {currentUser?.companyName ? currentUser.companyName.substring(0,2).toUpperCase() : 'B2'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '-1px' }}>Workspace</span>
                <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.01em' }}>{currentUser?.companyName || 'Loading...'}</span>
              </div>
            </div>
          </header>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                position: 'fixed',
                bottom: '24px',
                left: isSidebarOpen ? '280px' : '24px',
                zIndex: 50,
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</div>
        </main>
        
        {/* Global Tour Button */}
        <TourButton />
        
        {/* Global Spotlight Search */}
        <SpotlightSearch />

        {/* Global RFQ Cart */}
        <CartOverlay />

        {/* Global Jarvis Voice Assistant */}
        <JarvisAssistant />
      </div>
    </IntakeProvider>
  );
}
