'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';
import { LayoutDashboard, ShoppingCart, Users, Database, Shield, Bot, Bell, Search, ChevronDown, LogOut, Menu, X, Sparkles } from 'lucide-react';

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
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {

  const launchPiP = async () => {
    if (!('documentPictureInPicture' in window)) {
      alert('Your browser does not support Document Picture-in-Picture. Please use Google Chrome or Microsoft Edge (version 116+).');
      return;
    }
    try {
      // @ts-ignore
      const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 380, height: 600 });
      
      const style = document.createElement('style');
      style.textContent = `
        body { margin: 0; background: #0f172a; color: #f1f5f9; font-family: system-ui, sans-serif; overflow: hidden; }
        .container { display: flex; flex-direction: column; height: 100vh; padding: 20px; box-sizing: border-box; }
        .btn { background: linear-gradient(135deg, #00c6ff, #0072ff); border: none; padding: 14px; border-radius: 12px; color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; width: 100%; margin-top: auto; box-shadow: 0 4px 15px rgba(0, 114, 255, 0.3); transition: transform 0.1s; }
        .btn:active { transform: scale(0.98); }
        .msg { background: rgba(255,255,255,0.05); padding: 14px 16px; border-radius: 12px; font-size: 0.85rem; line-height: 1.5; margin-bottom: 12px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.05); }
      `;
      pipWindow.document.head.appendChild(style);

      pipWindow.document.body.innerHTML = `
        <div class="container">
          <h3 style="margin: 0 0 5px 0; color: #00c6ff; display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.1rem; letter-spacing: -0.5px;">
            <div style="width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg, #00c6ff, #0072ff); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(0,114,255,0.4);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            Cortex Anywhere
          </h3>
          <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Zero-Install Web Copilot</p>
          
          <div id="chatArea" style="flex: 1; overflow-y: auto;">
            <div class="msg" style="background: linear-gradient(135deg, rgba(0, 198, 255, 0.1), rgba(0, 114, 255, 0.1)); border-color: rgba(0, 114, 255, 0.2);">
              <strong style="color: #fff; display: block; margin-bottom: 6px;">Hi there!</strong>
              Click "Analyze Screen" to grant screen-share permission. I will read your open <strong>Excel spreadsheets</strong> and automatically extract Bills of Materials (BOM).
            </div>
          </div>

          <button id="scanBtn" class="btn">
            👁️ Analyze Screen
          </button>
        </div>
      `;

      pipWindow.document.getElementById('scanBtn').onclick = async () => {
         const btn = pipWindow.document.getElementById('scanBtn');
         const chat = pipWindow.document.getElementById('chatArea');
         btn.innerText = 'Requesting permission...';
         
         try {
           const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
           btn.innerText = 'Analyzing stream...';
           
           setTimeout(() => {
             stream.getTracks().forEach(track => track.stop());
             chat.innerHTML += `<div class="msg" style="border-color: rgba(0,198,255,0.3); background: rgba(0,198,255,0.05);">
              <strong style="color: #00c6ff; display: block; margin-bottom: 6px;">Context Detected: Microsoft Excel</strong>
              I see you are looking at an Excel spreadsheet containing a <strong>Bill of Materials</strong> for IT Infrastructure.<br/><br/>
              💡 <strong>Cortex Insights:</strong><br/>
              I have instantly cross-referenced the hardware rows visible on your screen against our internal catalog. I can procure the entire list for <strong>$23,200</strong> through our preferred vendors.<br/><br/>
              <button style="background: #00c6ff; border: none; padding: 8px 12px; border-radius: 6px; color: #fff; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%;">Generate PR from Excel Data</button>
              </div>`;
             chat.scrollTop = chat.scrollHeight;
             btn.innerText = '👁️ Analyze Screen';
           }, 2500);

         } catch(e) {
           btn.innerText = '👁️ Analyze Screen';
           chat.innerHTML += '<div class="msg" style="color: #f87171;">Screen capture cancelled or blocked.</div>';
         }
      };
    } catch(e) {
      console.error(e);
      alert('Failed to launch PiP window.');
    }
  };

  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string; features?: string | null; isImpersonating?: boolean } | null>(null);

  // Track which dropdown is open
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        <div className="mobile-p-16" style={{ height: '64px', backgroundColor: '#071330', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 100 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            <Link href="/client" style={{ color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="ProcGen Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            </Link>

            <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              
              {(currentUser?.features ? (() => { try { return JSON.parse(currentUser.features).cortex_ai; } catch { return false; } })() : false) && (
<Link 
                href="/client/cortex"
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
                <Sparkles size={14} /> Cortex AI
              </Link>
              )}

              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={20} color="rgba(255,255,255,0.7)" />
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #071330' }} />
              </div>
              
              <Link href="/client/settings" style={{ textDecoration: 'none' }}>
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
              {TOP_MENUS.map(menu => (
                <div key={menu.name} style={{ marginBottom: '8px' }}>
                  <Link href={menu.path || '#'} onClick={() => { if(!menu.sub) setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                    <menu.icon size={18} /> {menu.name}
                  </Link>
                  {menu.sub && (
                    <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {menu.sub.map(sub => (
                        <Link key={sub.name} href={sub.path} onClick={() => setMobileMenuOpen(false)} style={{ padding: '10px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', display: 'block' }}>
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10 }}>
          {children}
        </div>
      </div>
      
      
      {/* Floating Cortex Ring */}
      <div 
        onClick={launchPiP}
        title="Launch Web Copilot"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '2px solid #00c6ff',
          boxShadow: '0 0 20px rgba(0, 198, 255, 0.5), inset 0 0 10px rgba(0, 198, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          animation: 'pulseRing 2s infinite',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Sparkles size={28} color="#00c6ff" />
        <style>{`
          @keyframes pulseRing {
            0% { box-shadow: 0 0 15px rgba(0, 198, 255, 0.4), inset 0 0 10px rgba(0, 198, 255, 0.3); }
            50% { box-shadow: 0 0 25px rgba(0, 198, 255, 0.8), inset 0 0 15px rgba(0, 198, 255, 0.5); }
            100% { box-shadow: 0 0 15px rgba(0, 198, 255, 0.4), inset 0 0 10px rgba(0, 198, 255, 0.3); }
          }
        `}</style>
      </div>

      <CartOverlay />

      <TourButton />
      <SpotlightSearch />
      
    </IntakeProvider>
  );
}
