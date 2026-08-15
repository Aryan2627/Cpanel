'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, TrendingDown, ShieldAlert, ArrowRight, Activity, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorEventsPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState('00:14:59');

  useEffect(() => {
    // Simulate live countdown for active event
    let minutes = 14;
    let seconds = 59;
    
    const interval = setInterval(() => {
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
      }
      setTimeLeft(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Vendor Header */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>AC</div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Acme Corporation <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>| Supplier</span></h1>
          </div>
          
          <nav style={{ display: 'flex', gap: '20px', marginLeft: '20px' }}>
            <Link href="/vendor" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Dashboard</Link>
            <Link href="/vendor/events" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, borderBottom: '2px solid #38bdf8', paddingBottom: '4px' }}>Active Events</Link>
            <Link href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Contracts</Link>
          </nav>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <MessageSquare color="#94a3b8" />
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: '#1e293b', borderRadius: '6px', fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>
            Logout
          </div>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Active Bidding Events</h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Events where you are invited to submit a competitive quote.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Active Live Event */}
          <div 
            onClick={() => router.push('/vendor/events/EVT-1029')}
            style={{ 
              backgroundColor: '#1e293b', border: '1px solid #3b82f6', borderRadius: '12px', padding: '24px', 
              cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative', overflow: 'hidden'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', backgroundColor: '#3b82f6', boxShadow: '0 0 15px #3b82f6' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                    LIVE REVERSE AUCTION
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>EVT-1029</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 8px 0' }}>Q3 Enterprise Server Procurement</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 16px 0' }}>Buyer: TechCorp Inc. • 3 Line Items • Delivery by Sept 1st</p>
                
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Your Rank</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>#2 <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>of 5</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Current Best Bid</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>$248,500 <TrendingDown size={14} color="#10b981" /></div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock color="#ef4444" className="animate-pulse" />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Time Remaining</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</div>
                  </div>
                </div>
                <button style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Enter Live Floor <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Pending Event */}
          <div 
            style={{ 
              backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', 
              opacity: 0.7
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ backgroundColor: '#334155', color: '#cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>
                    SEALED BID (PENDING)
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>RFQ-2024-882</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 8px 0' }}>Office Supplies Q4 Replenishment</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Buyer: TechCorp Inc. • 12 Line Items</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px' }}>Opens in: 2 days, 4 hrs</div>
                <button disabled style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#94a3b8', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'not-allowed' }}>
                  Event Locked
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <style>
        {`
          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
      </style>
    </div>
  );
}
