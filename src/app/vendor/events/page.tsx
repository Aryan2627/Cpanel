'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VendorEventsPage() {
  const [activeTab, setActiveTab] = useState('Live');
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('vendor_token');
    if (!token) {
      router.push('/vendor');
      return;
    }
    fetch('/api/vendor-events', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const liveEvents = data.map(dbEvent => ({
            id: dbEvent.id, // Use actual DB id for navigation
            refId: dbEvent.refId,
            title: dbEvent.title || 'Untitled Event',
            type: dbEvent.type || 'Price based',
            status: 'Live', // Assume newly created events are Live for now
            targetPrice: 10000, // Default mock target price
            bestPrice: 9500, // Default mock best price
            endDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 48 hours from now
            competitorBids: dbEvent.type === 'Rank based' ? [9500, 9800, 10500] : []
          }));
          setEvents(liveEvents);
        }
      })
      .catch(err => console.error("Error fetching live events:", err));
  }, [router]);

  const filteredEvents = events.filter(e => e.status === activeTab);

  return (
    <div className="app-container">
      {/* Sidebar - Glassmorphism */}
      <aside className="sidebar">
        <div className="sidebar-logo">Vendor Portal</div>
        
        <ul className="sidebar-nav">
          <li><Link href="/vendor">Dashboard</Link></li>
          <li>
            <Link href="/vendor/events" className="active">
              <span>Active RFQs</span>
              <span className="badge badge-approved" style={{ marginLeft: '10px' }}>New</span>
            </Link>
          </li>
          <li><Link href="#">My Bids</Link></li>
          <li><Link href="#">Purchase Orders</Link></li>
          <li><Link href="/vendor/contracts">Contracts</Link></li>
          <li><Link href="/vendor/messages">Messages</Link></li>
        </ul>
        
        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content animate-fade-in">
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="page-header">
            <div>
              <h1 className="page-title">Bidding Arena</h1>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.05rem' }}>Discover opportunities, submit quotes, and track your performance.</p>
            </div>
            
            {/* Elegant Tabs */}
            <div style={{ display: 'flex', background: 'var(--surface-color)', border: '1px solid var(--surface-border)', padding: '6px', borderRadius: '12px' }}>
              {['Live', 'Open', 'History'].map(tab => (
                <div 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '8px 24px', cursor: 'pointer', borderRadius: '8px',
                    fontWeight: '600', fontSize: '0.95rem',
                    color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                    background: activeTab === tab ? '#f1f5f9' : 'transparent',
                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>

          {/* Event Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredEvents.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '16px', border: '1px dashed var(--surface-border)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>No {activeTab.toLowerCase()} events right now</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Check back later for new procurement opportunities.</p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="surface" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.5px' }}>{event.id}</span>
                      <span className="badge badge-approved">{event.type}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>{event.title}</h3>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Price</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>${event.targetPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ends In</div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>48 Hours</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid var(--surface-border)' }}>
                    {activeTab !== 'History' ? (
                      <button 
                        onClick={() => router.push(`/vendor/events/${event.id}`)}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        Enter Bidding Arena
                      </button>
                    ) : (
                      <div style={{ width: '100%', padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        Event Closed
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
