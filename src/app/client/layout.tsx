'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';
import TourButton from './TourButton';
import SpotlightSearch from './SpotlightSearch';
import CartOverlay from './CartOverlay';
import JarvisAssistant from './JarvisAssistant';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(
    pathname.includes('/client/manage') ? 'Manage' : pathname.includes('/client/settings') ? 'Settings' : null
  );

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const [showWorkflows, setShowWorkflows] = useState(false);

  useEffect(() => {
    // Check initial state
    setShowWorkflows(localStorage.getItem('enableWorkflows') === 'true');
    
    // Listen for changes from settings page
    const handleSettingsChange = () => {
      setShowWorkflows(localStorage.getItem('enableWorkflows') === 'true');
    };
    window.addEventListener('settings_updated', handleSettingsChange);
    return () => window.removeEventListener('settings_updated', handleSettingsChange);
  }, []);

  const manageSubItems = [
    { name: 'User Directory', path: '/client/manage/users' },
    { name: 'Product Catalog', path: '/client/manage/products' },
    { name: 'Form Templates', path: '/client/manage/templates' }
  ];
  if (showWorkflows) {
    manageSubItems.push(
      { name: 'Data Field Mapping', path: '/client/manage/workflows' },
      { name: 'Approval Chains', path: '/client/manage/approvals' }
    );
  }

  const navItems = [
    { name: 'Command Center', path: '/client' },
    { name: 'Approval Queue', path: '/client/approvals' },
    { name: 'Intake Requests', path: '/client/intake' },
    { name: 'Requisitions Hub', path: '/client/pr' },
    { name: 'Sourcing Events', path: '/client/events' },
    { 
      name: 'Supplier Network', 
      path: '#',
      subItems: [
        { name: 'Global Directory', path: '/client/vendors' },
        { name: 'Secure Messaging', path: '/client/vendors/messages' }
      ]
    },
    { name: 'PO Ledger', path: '/client/po' },

    { 
      name: 'System Config', 
      path: '#',
      subItems: manageSubItems
    },
    { 
      name: 'Settings', 
      path: '#',
      subItems: [
        { name: 'General Settings', path: '/client/settings' },
        { name: 'ERP Integrations', path: '/client/settings/erp' }
      ]
    },
  ];

  return (
    <IntakeProvider>
      <div className="app-container">
        
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            {/* ProcGen Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 35 25 C 50 10, 80 15, 80 40" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 65 75 C 50 90, 20 85, 20 60" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 25 35 L 35 45 L 75 45 M 35 55 L 70 55 M 40 65 L 65 65" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="55" cy="75" r="5" fill="#0f172a" />
                </svg>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.05em' }}>PROCGEN</h2>
            </div>
          </div>

          <ul className="sidebar-nav">
            {navItems.map((item) => (
              <li key={item.name}>
                {item.subItems ? (
                  <div>
                    <div 
                      onClick={() => toggleMenu(item.name)}
                      className={openMenu === item.name ? 'active' : ''}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', color: '#94a3b8', fontWeight: 500, borderRadius: '12px', marginBottom: '8px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                      {item.name}
                      <span style={{ fontSize: '0.8rem', transform: openMenu === item.name ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {openMenu === item.name && (
                      <ul style={{ listStyle: 'none', padding: '4px 0 4px 16px', margin: 0 }}>
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
              <div style={{ width: '40px', height: '40px', background: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>JD</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>John Doe</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Procurement Team</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          {children}
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
