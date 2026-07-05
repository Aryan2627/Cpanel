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
    <div style={{ 
      height: '100vh', display: 'flex', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Sidebar - Glassmorphism */}
      <aside style={{ 
        width: '280px', flexShrink: 0, 
        background: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff', display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
      }}>
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>V</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>Vendor Portal</div>
        </div>
        
        <ul style={{ listStyle: 'none', padding: '0 16px', margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><Link href="/vendor" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s' }}>Dashboard</Link></li>
          <li>
            <Link href="/vendor/events" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', color: '#fff', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', textDecoration: 'none', borderRadius: '8px' }}>
              <span style={{ fontWeight: '500' }}>Active RFQs</span>
              <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '12px', fontWeight: 'bold' }}>New</span>
            </Link>
          </li>
          <li><Link href="#" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px' }}>My Bids</Link></li>
          <li><Link href="#" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px' }}>Purchase Orders</Link></li>
        </ul>
        
        <div style={{ padding: '24px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', textDecoration: 'none', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', transition: 'background 0.2s' }}>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Bidding Arena</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem' }}>Discover opportunities, submit quotes, and track your performance.</p>
            </div>
            
            {/* Elegant Tabs */}
            <div style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {['Live', 'Open', 'History'].map(tab => (
                <div 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    padding: '8px 24px', cursor: 'pointer', borderRadius: '8px',
                    fontWeight: '600', fontSize: '0.95rem',
                    color: activeTab === tab ? '#fff' : '#64748b',
                    background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                    boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
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
              <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📭</div>
                <h3 style={{ color: '#f8fafc', margin: '0 0 8px 0' }}>No {activeTab.toLowerCase()} events right now</h3>
                <p style={{ color: '#64748b', margin: 0 }}>Check back later for new procurement opportunities.</p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} style={{ 
                  background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)',
                  borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)', transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.3)'; }}
                >
                  <div style={{ padding: '24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' }}>{event.id}</span>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                        background: event.type === 'Rank based' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                        color: event.type === 'Rank based' ? '#fbbf24' : '#a78bfa',
                        border: `1px solid ${event.type === 'Rank based' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`
                      }}>
                        {event.type}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', margin: '0 0 16px 0', lineHeight: 1.4 }}>{event.title}</h3>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Target Price</div>
                        <div style={{ color: '#f8fafc', fontWeight: '600' }}>${event.targetPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Ends In</div>
                        <div style={{ color: '#f8fafc', fontWeight: '500' }}>48 Hours</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {activeTab !== 'History' ? (
                      <button 
                        onClick={() => { setSelectedEvent(event); setBidPrice(''); }}
                        style={{ 
                          width: '100%', padding: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                        }}
                      >
                        Enter Bidding Arena
                      </button>
                    ) : (
                      <div style={{ width: '100%', padding: '12px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
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
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ 
            background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '24px', width: '100%', maxWidth: '700px', overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            
            {/* Modal Header */}
            <div style={{ padding: '32px 40px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>{selectedEvent.id}</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: 0 }}>{selectedEvent.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.5rem', cursor: 'pointer', padding: '4px' }}
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '40px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Target Price</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff' }}>${selectedEvent.targetPrice.toLocaleString()}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Event Mode</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: selectedEvent.type === 'Rank based' ? '#fbbf24' : '#a78bfa' }}>
                      {selectedEvent.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bidding Engine Area */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: '600', color: '#fff', marginBottom: '16px' }}>Submit Your Quote</label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: selectedEvent.type === 'Price based' ? getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice) : '#94a3b8', fontSize: '1.5rem', transition: 'color 0.3s' }}>$</span>
                    <input 
                      type="number"
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      placeholder="0.00"
                      style={{ 
                        width: '100%', padding: '20px 20px 20px 50px', fontSize: '1.75rem', fontWeight: '800', 
                        borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)',
                        color: selectedEvent.type === 'Price based' ? getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice) : '#fff',
                        outline: 'none', transition: 'all 0.3s ease',
                        boxShadow: currentPrice > 0 && selectedEvent.type === 'Price based' 
                          ? `0 0 20px ${getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice)}30` 
                          : 'inset 0 2px 4px rgba(0,0,0,0.5)'
                      }}
                    />
                  </div>
                  
                  {/* Dynamic Rank Widget */}
                  {selectedEvent.type === 'Rank based' && (
                    <div style={{ 
                      width: '140px', height: '80px', borderRadius: '16px', 
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      boxShadow: currentPrice > 0 ? '0 0 30px rgba(251, 191, 36, 0.15)' : 'none',
                      transition: 'all 0.3s'
                    }}>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', marginBottom: '4px' }}>Your Rank</div>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: currentPrice > 0 ? '#fbbf24' : '#334155', textShadow: currentPrice > 0 ? '0 0 20px rgba(251, 191, 36, 0.4)' : 'none' }}>
                        {currentPrice > 0 ? `#${calculateRank(currentPrice, selectedEvent.competitorBids)}` : '-'}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Dynamic Price Feedback */}
                {selectedEvent.type === 'Price based' && currentPrice > 0 && (
                  <div style={{ 
                    marginTop: '20px', padding: '16px', borderRadius: '12px',
                    background: `linear-gradient(90deg, ${getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice)}15 0%, transparent 100%)`,
                    borderLeft: `4px solid ${getPriceColor(currentPrice, selectedEvent.bestPrice, selectedEvent.targetPrice)}`,
                    color: '#f8fafc', fontSize: '0.95rem', fontWeight: '500' 
                  }}>
                    {currentPrice <= (selectedEvent.bestPrice || selectedEvent.targetPrice) ? 
                      "✨ Excellent! Your price is highly competitive in the current market." : 
                      "⚠️ Your price is higher than the current best offer. Consider optimizing to win."}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '24px 40px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{ padding: '14px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#f8fafc', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>
              <button 
                onClick={submitBid}
                disabled={!bidPrice}
                style={{ 
                  padding: '14px 36px', 
                  background: bidPrice ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.1)', 
                  color: bidPrice ? '#fff' : '#64748b', 
                  border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem',
                  cursor: bidPrice ? 'pointer' : 'not-allowed',
                  boxShadow: bidPrice ? '0 10px 25px -5px rgba(37, 99, 235, 0.4)' : 'none',
                  transition: 'all 0.2s'
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
