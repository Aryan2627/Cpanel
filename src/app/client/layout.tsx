'use client';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import { SessionContext } from '../../context/SessionContext';
import TourButton from './TourButton';
const SpotlightSearch = dynamic(() => import('./SpotlightSearch'), { ssr: false });
const CartOverlay = dynamic(() => import('./CartOverlay'), { ssr: false });
const DorcWidget = dynamic(() => import('./DorcWidget'), { ssr: false });
import { Settings, Link2, LayoutDashboard, ShoppingCart, Users, Database, Shield, Bot, Bell, Search, ChevronDown, LogOut, Menu, X, Sparkles, Command } from 'lucide-react';

const TOP_MENUS = [
  { name: 'Dashboard', path: '/client', icon: LayoutDashboard },
  {
    name: 'Procurement',
    icon: ShoppingCart,
    sub: [
      { name: 'Intake Desk', path: '/client/intake' },
      { name: 'Requisitions (PR)', path: '/client/pr' },
      { name: 'Sourcing Events (RFx)', path: '/client/events' },
      { name: 'Purchase Orders (PO)', path: '/client/po' },
      { name: 'My Approvals', path: '/client/approvals' },
        { name: 'Hire', path: '/client/hire' },
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
        { name: 'Data Dictionaries', path: '/client/settings/data-dictionary' },
      { name: 'Users', path: '/client/manage/users' },
      { name: 'Products', path: '/client/manage/products' },
      { name: 'Templates', path: '/client/manage/templates' },
      { name: 'Approval Rules', path: '/client/manage/approvals' },
      
    ]
  },
  {
    name: 'Master Center',
      icon: Settings,
      sub: [
        { name: 'Context Studio (AI)', path: '/client/manage/context-studio' },
        { name: 'Routing Engine (New)', path: '/client/settings/approval-rules' },
        { name: '? Tokens and Usage', path: '/client/manage/tokens' },
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
  {
    name: 'Integrations',
    icon: Link2,
    sub: [
      { name: 'Slack Integration', path: '/client/settings/integrations' },
    ]
  },
  {
    name: 'AI Agents',
    icon: Sparkles,
    sub: [
      { name: 'Procurement Agent', path: '/client/ai-agents/procurement' },
      { name: 'Sourcing Agent', path: '/client/ai-agents/sourcing' },
      { name: 'Negotiation Agent', path: '/client/ai-agents/negotiation' },
      { name: 'Operations Agent', path: '/client/ai-agents/operations' },
    ]
  },
];


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string; features?: string | null; isImpersonating?: boolean } | null>(null);

  // Track which dropdown is open
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(async r => { if (!r.ok) { const txt = await r.text(); alert('Server Error ' + r.status + ': ' + txt); window.location.href='/login'; return null; } return r.json(); }).then(d => { if (!d) return; if (d?.name) { setCurrentUser(d); } else { alert('Missing Name: ' + JSON.stringify(d)); window.location.href='/login'; } }).catch(e => { alert('Network Error: ' + e.message); window.location.href='/login'; });
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

  

  

  const handleLogout = async () => {
    try { 
      await fetch('/api/auth/logout', { method: 'POST' }); 
      const { signOut } = await import('next-auth/react'); 
      await signOut({ redirect: false }); 
      localStorage.removeItem('auth_me_cache');
      window.location.href = '/login'; 
    } catch(e) { 
      window.location.href = '/login'; 
    }
  };

  
  const orgFeatures = currentUser?.features ? (() => { try { return JSON.parse(currentUser.features); } catch { return {}; } })() : {};
  const isMainPortal = orgFeatures.main_portal !== false; 
  const isAgenticPortal = orgFeatures.agentic_portal === true;
  // If Agentic Portal is turned ON, it takes full priority and hides classic menus
  const isAgenticOnly = isAgenticPortal === true || (typeof window !== 'undefined' && window.location.search.includes('agentic=true'));
    // Global Agentic Mode Redirect
    useEffect(() => {
      if (isAgenticOnly && pathname && !pathname.startsWith('/client/ai-agents') && !pathname.startsWith('/client/cortex')) {
        router.push('/client/ai-agents/procurement');
      }
    }, [isAgenticOnly, pathname, router]);

    
    // Debug log for the user to inspect in browser console
    useEffect(() => {
      if (currentUser) {
        console.log("ProcGen Organization Features (Decrypted Payload):", currentUser.features);
        if (currentUser.features === "") {
          // console.warn("removed");
        }
      }
    }, [currentUser]);

  const displayMenus = TOP_MENUS.filter(menu => {
    if (isAgenticOnly) return menu.name === 'AI Agents';
    if (!isMainPortal) return menu.name === 'AI Agents';
    return true; 
  });

  
    // STRICT UI LEAK PREVENTION: Wait for user profile to load before rendering the layout
  if (currentUser === null) {
    return (
      <div style={{ height: '100vh', width: '100vw', backgroundColor: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '32px' }}>
         <style>{`
           @keyframes splitLeft { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-25px); filter: drop-shadow(-10px 0 15px rgba(56, 189, 248, 0.6)); } }
           @keyframes splitRight { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(25px); filter: drop-shadow(10px 0 15px rgba(56, 189, 248, 0.6)); } }
           @keyframes glowJoin { 0%, 5%, 95%, 100% { filter: drop-shadow(0 0 30px rgba(56, 189, 248, 1)); } 50% { filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.2)); } }
         `}</style>
         
         <div style={{ position: 'relative', width: '250px', height: '80px', animation: 'glowJoin 2.5s infinite ease-in-out' }}>
           {/* Left Half */}
           <img 
             src="/logo.png" 
             alt="ProcGen" 
             style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', objectFit: 'contain', clipPath: 'inset(0 50% 0 0)', animation: 'splitLeft 2.5s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55)' }} 
           />
           {/* Right Half */}
           <img 
             src="/logo.png" 
             alt="ProcGen" 
             style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', objectFit: 'contain', clipPath: 'inset(0 0 0 50%)', animation: 'splitRight 2.5s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55)' }} 
           />
         </div>
         
         <div className="animate-pulse" style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '6px', textTransform: 'uppercase' }}>
           Initializing
         </div>
      </div>
    );
  }

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

  return (
    <SessionContext.Provider value={{ session: currentUser, loading: currentUser === null }}>
            <IntakeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: isAgenticOnly ? '#030712' : '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
        {isAgenticOnly && (
          <style dangerouslySetInnerHTML={{__html: `
            body { 
              background-color: #030712 !important; 
              background-image: 
                radial-gradient(circle at 15% 50%, rgba(56, 189, 248, 0.04), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(167, 139, 250, 0.04), transparent 25%) !important;
              background-attachment: fixed !important;
              color: #f8fafc !important;
            }
          `}} />
        )}
        
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

        <div className="mobile-p-16" style={{ 
          height: '64px', 
          backgroundColor: isAgenticOnly ? 'rgba(9, 9, 11, 0.6)' : '#0f172a', 
          backdropFilter: isAgenticOnly ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isAgenticOnly ? 'blur(16px)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 24px', 
          borderBottom: isAgenticOnly ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)', 
          position: 'sticky', top: 0, zIndex: 100 
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link prefetch={false} href="/client" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="ProcGen Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: isAgenticOnly ? '12px' : '4px' }}>
              {isAgenticOnly ? (
                <>
                  <Link prefetch={false} href="/client/ai-agents/procurement" style={{ padding: '8px 16px', borderRadius: '24px', background: pathname.includes('procurement') ? 'rgba(56, 189, 248, 0.15)' : 'transparent', border: pathname.includes('procurement') ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent', color: pathname.includes('procurement') ? '#38bdf8' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    Anveshan AI (Sourcing)
                  </Link>
                  <Link prefetch={false} href="/client/ai-agents/risk" style={{ padding: '8px 16px', borderRadius: '24px', background: pathname.includes('risk') ? 'rgba(248, 113, 113, 0.15)' : 'transparent', border: pathname.includes('risk') ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid transparent', color: pathname.includes('risk') ? '#f87171' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    Tark AI (Risk)
                  </Link>
                  <Link prefetch={false} href="/client/ai-agents/contracts" style={{ padding: '8px 16px', borderRadius: '24px', background: pathname.includes('contracts') ? 'rgba(167, 139, 250, 0.15)' : 'transparent', border: pathname.includes('contracts') ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid transparent', color: pathname.includes('contracts') ? '#a78bfa' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    Niti AI (Contracts)
                  </Link>
                  <Link prefetch={false} href="/client/ai-agents/operations" style={{ padding: '8px 16px', borderRadius: '24px', background: pathname.includes('operations') ? 'rgba(52, 211, 153, 0.15)' : 'transparent', border: pathname.includes('operations') ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid transparent', color: pathname.includes('operations') ? '#34d399' : 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}>
                    Garuda AI (Delivery)
                  </Link>
                </>
              ) : (
                displayMenus.map((menu) => (
                <div 
                  key={menu.name}
                  onMouseEnter={() => setHoveredMenu(menu.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                  style={{ position: 'relative' }}
                >
                  <Link prefetch={false} href={menu.path || '#'}
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
                            onClick={() => setHoveredMenu(null)}
                            style={{ 
                              padding: '10px 12px', borderRadius: '8px', color: '#334155', 
                              textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500,
                              display: 'flex', alignItems: 'center', gap: '8px',
                              backgroundColor: pathname === sub.path ? '#f1f5f9' : 'transparent',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: pathname === sub.path ? '#2563eb' : '#cbd5e1' }} />
                            {sub.name}
                          </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
              )}
            </nav>
          </div>

          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', marginLeft: 'auto', marginRight: '16px' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Atlan-style Search Button to trigger Cmd+K */}
                <button 
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s ease', marginRight: '8px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                >
                  <Search size={14} />
                  <span>Search...</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', marginLeft: '12px', fontWeight: 600 }}>
                    <Command size={10} />K
                  </div>
                </button>

              
              {(currentUser?.features ? (() => { try { return JSON.parse(currentUser.features).cortex_ai; } catch { return false; } })() : false) && (
<Link prefetch={false} href="/client/cortex"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
                  textDecoration: 'none',
                  border: 'none', borderRadius: '24px',
                  padding: '6px 14px', color: '#fff', fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                  transition: 'transform 0.2s',
                }}
              >
                <img src="/dorc-logo.png" style={{ width: 16, height: 16, objectFit: "contain", filter: "brightness(0) invert(1)" }} /> Dorc AI
              </Link>
              )}

              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={20} color="rgba(255,255,255,0.7)" />
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #071330' }} />
              </div>
              
              
              <Link prefetch={false} href="/client/admin/logs" style={{ textDecoration: 'none', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: pathname.includes('logs') ? '2px solid #3b82f6' : '2px solid transparent' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: pathname.includes('logs') ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pathname.includes('logs') ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                    <Shield size={16} />
                  </div>
                  <span style={{ color: pathname.includes('logs') ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: pathname.includes('logs') ? 600 : 400 }}>Audit Logs</span>
                </div>
              </Link>
              <Link prefetch={false} href="/client/settings" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                    {(currentUser?.name || 'A')[0]}
                  </div>
                  <div className="profile-text" style={{ display: 'flex', flexDirection: 'column' }}>
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

        
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '64px', left: 0, width: '100%', background: '#0f172a', zIndex: 9999, borderBottom: '1px solid rgba(255,255,255,0.1)', maxHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
              {isAgenticOnly ? (
                <>
                  <Link prefetch={false} href="/client/ai-agents/procurement" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', color: pathname.includes('procurement') ? '#38bdf8' : '#fff', textDecoration: 'none', fontWeight: 600, background: pathname.includes('procurement') ? 'rgba(56, 189, 248, 0.1)' : 'transparent', borderRadius: '8px', marginBottom: '8px' }}>Anveshan AI (Sourcing)</Link>
                  <Link prefetch={false} href="/client/ai-agents/risk" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', color: pathname.includes('risk') ? '#f87171' : '#fff', textDecoration: 'none', fontWeight: 600, background: pathname.includes('risk') ? 'rgba(248, 113, 113, 0.1)' : 'transparent', borderRadius: '8px', marginBottom: '8px' }}>Tark AI (Risk)</Link>
                  <Link prefetch={false} href="/client/ai-agents/contracts" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', color: pathname.includes('contracts') ? '#a78bfa' : '#fff', textDecoration: 'none', fontWeight: 600, background: pathname.includes('contracts') ? 'rgba(167, 139, 250, 0.1)' : 'transparent', borderRadius: '8px', marginBottom: '8px' }}>Niti AI (Contracts)</Link>
                  <Link prefetch={false} href="/client/ai-agents/operations" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px', color: pathname.includes('operations') ? '#34d399' : '#fff', textDecoration: 'none', fontWeight: 600, background: pathname.includes('operations') ? 'rgba(52, 211, 153, 0.1)' : 'transparent', borderRadius: '8px', marginBottom: '8px' }}>Garuda AI (Delivery)</Link>
                </>
              ) : (
                displayMenus.map(menu => (
                  <div key={menu.name} style={{ marginBottom: '8px' }}>
                    <Link prefetch={false} href={menu.path || '#'} onClick={() => { if(!menu.sub) setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                      <menu.icon size={20} />
                      {menu.name}
                    </Link>
                    {menu.sub && (
                      <div style={{ paddingLeft: '44px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        {menu.sub.map(sub => (
                          <Link key={sub.name} href={sub.path} onClick={() => setMobileMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem' }}>
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              </div>
            </div>
        )}

        {/* The Absolute Backdrop Blur for Cinematic Nav effect */}
        {hoveredMenu && (
          <div style={{
            position: 'absolute', top: '64px', left: 0, width: '100vw', height: 'calc(100vh - 64px)',
            backgroundColor: 'rgba(15, 23, 42, 0.2)', backdropFilter: 'blur(6px)', zIndex: 90
          }} />
        )}

        <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
      
      
      <DorcWidget />

      <CartOverlay />

      
      <SpotlightSearch />
      
    </IntakeProvider>
            </SessionContext.Provider>
  );
}









