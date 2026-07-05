'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { IntakeProvider } from '../../context/IntakeContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isManageOpen, setIsManageOpen] = useState(pathname.includes('/client/manage'));

  const navItems = [
    { name: 'Dashboard', path: '/client' },
    { name: 'Purchase Intake', path: '/client/intake' },
    { name: 'Purchase Requisition', path: '/client/pr' },
    { name: 'Events / RFQs', path: '/client/events' },
    { name: 'Vendor Management', path: '/client/vendors' },
    { name: 'Purchase Orders', path: '/client/po' },
    { name: 'Reports', path: '/client/reports' },
    { 
      name: 'Manage', 
      path: '#',
      subItems: [
        { name: 'Users', path: '/client/manage/users' },
        { name: 'Products', path: '/client/manage/products' },
        { name: 'Category', path: '/client/manage/category' },
        { name: 'Location', path: '/client/manage/location' },
        { name: 'Teams', path: '/client/manage/teams' },
        { name: 'Template', path: '/client/manage/template' }
      ]
    },
    { name: 'Settings', path: '/client/settings' },
  ];

  return (
    <IntakeProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
        
        {/* Sidebar Navigation */}
        <nav style={{ width: '260px', backgroundColor: '#0f172a', color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '32px', padding: '0 16px' }}>
            {/* ProcGen Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 35 25 C 50 10, 80 15, 80 40" stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 65 75 C 50 90, 20 85, 20 60" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 25 35 L 35 45 L 75 45 M 35 55 L 70 55 M 40 65 L 65 65" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="55" cy="75" r="5" fill="#ffffff" />
                </svg>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', letterSpacing: '1px' }}>PROCGEN</h2>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, overflowY: 'auto' }}>
            {navItems.map((item) => (
              <li key={item.name} style={{ marginBottom: '4px' }}>
                {item.subItems ? (
                  <div>
                    <div 
                      onClick={() => setIsManageOpen(!isManageOpen)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: '8px', 
                        color: pathname.includes('/client/manage') ? '#fff' : '#cbd5e1', 
                        backgroundColor: pathname.includes('/client/manage') ? 'rgba(255,255,255,0.05)' : 'transparent',
                        cursor: 'pointer', fontSize: '0.95rem',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {item.name}
                      <span style={{ fontSize: '0.8rem', transform: isManageOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {isManageOpen && (
                      <ul style={{ listStyle: 'none', padding: '4px 0 4px 16px', margin: 0 }}>
                        {item.subItems.map(subItem => (
                          <li key={subItem.name}>
                            <Link 
                              href={subItem.path}
                              style={{
                                display: 'block', padding: '10px 16px', borderRadius: '8px', 
                                color: pathname === subItem.path ? '#fff' : '#94a3b8', 
                                backgroundColor: pathname === subItem.path ? '#2563eb' : 'transparent',
                                textDecoration: 'none', fontSize: '0.85rem',
                                transition: 'all 0.2s ease-in-out'
                              }}
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
                    style={{
                      display: 'block', padding: '12px 16px', borderRadius: '8px', 
                      color: pathname === item.path ? '#fff' : '#cbd5e1', 
                      backgroundColor: pathname === item.path ? '#2563eb' : 'transparent',
                      textDecoration: 'none', fontSize: '0.95rem',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>JD</div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#fff' }}>John Doe</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Procurement Team</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>
    </IntakeProvider>
  );
}
