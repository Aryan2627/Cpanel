'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VendorEventsPage() {
  const [activeTab, setActiveTab] = useState('Live');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [bidPrice, setBidPrice] = useState('');
  
  // Mock data + dynamic state for events
  const [events, setEvents] = useState<any[]>([
    {
      id: 'EVT-2026-001',
      title: 'IT Equipment Procurement',
      type: 'Rank based',
      status: 'Live',
      targetPrice: 5000,
      bestPrice: 4200, 
      endDate: '2026-07-05T12:00:00Z',
      competitorBids: [4200, 4350, 4500, 4800] 
    },
    {
      id: 'EVT-2026-002',
      title: 'Office Supplies Bulk Order',
      type: 'Price based',
      status: 'Live',
      targetPrice: 1500,
      bestPrice: 1350,
      endDate: '2026-07-10T15:00:00Z'
    },
    {
      id: 'EVT-2026-003',
      title: 'Logistics Partnership 2026',
      type: 'Rank based',
      status: 'Open',
      targetPrice: 12000,
      bestPrice: null, 
      endDate: '2026-08-01T10:00:00Z',
      competitorBids: [] 
    },
    {
      id: 'EVT-2025-099',
      title: 'Furniture Renewal',
      type: 'Price based',
      status: 'History',
      targetPrice: 8000,
      bestPrice: 7500,
      endDate: '2025-12-01T10:00:00Z'
    }
  ]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const liveEvents = data.map(dbEvent => ({
            id: dbEvent.refId,
            title: dbEvent.title || 'Untitled Event',
            type: dbEvent.type || 'Price based',
            status: 'Live', // Assume newly created events are Live for now
            targetPrice: 10000, // Default mock target price
            bestPrice: 9500, // Default mock best price
            endDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 48 hours from now
            competitorBids: dbEvent.type === 'Rank based' ? [9500, 9800, 10500] : []
          }));
          
          setEvents(prev => {
            // Merge to prevent duplicates if refId already exists
            const existingIds = new Set(prev.map(p => p.id));
            const newEvents = liveEvents.filter(e => !existingIds.has(e.id));
            return [...newEvents, ...prev];
          });
        }
      })
      .catch(err => console.error("Error fetching live events:", err));
  }, []);

  const filteredEvents = events.filter(e => e.status === activeTab);

  const calculateRank = (price: number, competitors: number[]) => {
    if (!price || isNaN(price)) return '-';
    const allBids = [...competitors, price].sort((a, b) => a - b);
    return allBids.indexOf(price) + 1;
  };

  const getPriceColor = (price: number, bestPrice: number | null, targetPrice: number) => {
    if (!price || isNaN(price)) return '#f8fafc'; 
    if (bestPrice && price <= bestPrice) return '#10b981'; // Neon Green
    if (!bestPrice && price <= targetPrice) return '#10b981'; 
    if (price <= targetPrice) return '#a3e635'; // Lime Green
    if (price <= targetPrice * 1.1) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const currentPrice = parseFloat(bidPrice);

  const submitBid = async () => {
    if (!bidPrice) return;
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          vendorId: 'vendor-mock-id', // In a real app, from session
          vendorName: 'Demo Vendor',
          amount: parseFloat(bidPrice)
        })
      });
      if (res.ok) {
        alert(`Successfully locked in bid of $${bidPrice}`);
        setSelectedEvent(null);
        setBidPrice('');
      } else {
        alert('Error submitting bid');
      }
    } catch(err) {
      alert('Error submitting bid');
    }
  };

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
                        onClick={() => { setSelectedEvent(event); setBidPrice(''); }}
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

      {/* Premium Glassmorphism E-Bidding Modal */}
      {selectedEvent && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(16px)', 
          background: 'rgba(2, 6, 23, 0.5)', backdropFilter: 'blur(8px)', 
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', background: 'var(--bg-color)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ background: 'var(--surface-color)', borderBottom: '1px solid var(--surface-border)', padding: '32px 40px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>{selectedEvent.id}</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{selectedEvent.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', padding: '4px' }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '40px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Target Price</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>${selectedEvent.targetPrice.toLocaleString()}</div>
                </div>
                <div style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Event Mode</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-pending" style={{ fontSize: '1rem', padding: '6px 16px' }}>
                      {selectedEvent.type}
                    </span>
                  </div>
                </div>
              </div>

                {/* Bidding Engine Area */}
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Submit Your Quote</label>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: selectedEvent.type === 'Price based' ? getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice) : 'var(--text-secondary)', fontSize: '1.5rem', transition: 'color 0.3s' }}>$</span>
                      <input 
                        type="number"
                        value={bidPrice}
                        onChange={(e) => setBidPrice(e.target.value)}
                        placeholder="0.00"
                        style={{ 
                          width: '100%', padding: '20px 20px 20px 50px', fontSize: '1.75rem', fontWeight: '800', 
                          borderRadius: '16px', background: 'var(--surface-color)', border: '2px solid var(--surface-border)',
                          color: 'var(--text-primary)',
                          outline: 'none', transition: 'all 0.3s ease',
                          boxShadow: currentPrice > 0 && selectedEvent.type === 'Price based' 
                            ? `0 0 0 2px ${getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice)}` 
                            : '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      />
                    </div>
                    
                    {/* Dynamic Rank Widget */}
                    {selectedEvent.type === 'Rank based' && (
                      <div style={{ 
                        width: '140px', height: '80px', borderRadius: '16px', 
                        background: 'var(--surface-color)', 
                        border: '1px solid var(--surface-border)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s'
                      }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>Your Rank</div>
                        <div style={{ fontSize: '2rem', fontWeight: '900', color: currentPrice > 0 ? 'var(--warning-color)' : 'var(--text-primary)' }}>
                          {currentPrice > 0 ? `#${calculateRank(currentPrice, selectedEvent.competitorBids)}` : '-'}
                        </div>
                      </div>
                    )}
                  </div>
                
                {/* Dynamic Price Feedback */}
                {selectedEvent.type === 'Price based' && currentPrice > 0 && (
                  <div style={{ 
                    marginTop: '20px', padding: '16px', borderRadius: '12px',
                    background: `${getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice)}15`,
                    borderLeft: `4px solid ${getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice)}`,
                    color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: '500' 
                  }}>
                    {currentPrice <= (selectedEvent.bestPrice || selectedEvent.targetPrice) ? 
                      "✨ Excellent! Your price is highly competitive in the current market." : 
                      "⚠️ Your price is higher than the current best offer. Consider optimizing to win."}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '24px 40px', background: 'var(--surface-color)', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={submitBid}
                disabled={!bidPrice}
                className="btn btn-primary"
                style={{ 
                  padding: '14px 36px', 
                  fontSize: '1rem',
                  opacity: bidPrice ? 1 : 0.5,
                  cursor: bidPrice ? 'pointer' : 'not-allowed',
                }}
              >
                Lock In Bid
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
