'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, TrendingDown, ArrowLeft, Send, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VendorLiveBidding() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState('00:14:59');
  
  // Bidding State
  const [prices, setPrices] = useState({
    server: 12000,
    storage: 45000,
    switch: 8000
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);

  const calculateTotal = () => {
    return (prices.server * 10) + (prices.storage * 2) + (prices.switch * 4);
  };

  useEffect(() => {
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

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setLastSubmitted(calculateTotal());
      setIsSubmitting(false);
    }, 800);
  };

  const handlePriceChange = (item: string, val: string) => {
    const num = parseInt(val.replace(/,/g, '')) || 0;
    setPrices(prev => ({ ...prev, [item]: num }));
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Live Header */}
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => router.push('/vendor/events')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Events
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#1e293b' }}></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>LIVE AUCTION</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>EVT-1029: Q3 Enterprise Server Procurement</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px', textAlign: 'right' }}>Current Best Bid</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              $248,500 <TrendingDown size={16} color="#10b981" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px', textAlign: 'right' }}>Your Rank</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: lastSubmitted !== null && calculateTotal() <= 248500 ? '#10b981' : '#f59e0b', textAlign: 'right' }}>
              {lastSubmitted !== null && calculateTotal() <= 248500 ? '#1' : '#2'}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
            <Clock color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Time Remaining</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Trading Floor */}
      <main style={{ display: 'flex', height: 'calc(100vh - 85px)' }}>
        
        {/* Left Side: Bidding Grid */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>Quote Submission</h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Enter your most competitive unit prices. Totals calculate automatically.</p>
            </div>
            {lastSubmitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
                <ShieldCheck size={16} /> Last bid submitted at ${lastSubmitted.toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#020617', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Item Name</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Qty</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '200px' }}>Unit Price (USD)</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Ext. Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>Enterprise DB Server (128 Core)</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Specs: 2TB RAM, NVMe Array</div>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: '#94a3b8' }}>10</td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 600 }}>$</span>
                      <input 
                        type="text"
                        value={prices.server.toLocaleString()}
                        onChange={(e) => handlePriceChange('server', e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 28px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#334155'}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>
                    ${(prices.server * 10).toLocaleString()}
                  </td>
                </tr>
                
                <tr style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>SAN Storage Array</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Specs: 1PB Usable, All-Flash</div>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: '#94a3b8' }}>2</td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 600 }}>$</span>
                      <input 
                        type="text"
                        value={prices.storage.toLocaleString()}
                        onChange={(e) => handlePriceChange('storage', e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 28px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#334155'}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>
                    ${(prices.storage * 2).toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>Top-of-Rack Switch</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Specs: 100GbE, 48 Port</div>
                  </td>
                  <td style={{ padding: '20px 24px', fontWeight: 600, color: '#94a3b8' }}>4</td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 600 }}>$</span>
                      <input 
                        type="text"
                        value={prices.switch.toLocaleString()}
                        onChange={(e) => handlePriceChange('switch', e.target.value)}
                        style={{ width: '100%', padding: '12px 12px 12px 28px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#334155'}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0' }}>
                    ${(prices.switch * 4).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Total Footer */}
            <div style={{ padding: '24px', backgroundColor: '#020617', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                Prices exclude taxes & shipping.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Total Quote Value</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>${calculateTotal().toLocaleString()}</div>
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ 
                    padding: '16px 32px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', 
                    fontSize: '1.1rem', fontWeight: 700, cursor: isSubmitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)', transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  {isSubmitting ? 'PROCESSING...' : <><Zap size={20} /> SUBMIT LIVE BID</>}
                </button>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', color: '#fbbf24', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Binding Offer Notice</strong>
              By clicking "Submit Live Bid", you are extending a legally binding offer to TechCorp Inc. under the terms and conditions set forth in the RFQ document. Retractions are not permitted during a live auction.
            </div>
          </div>

        </div>

        {/* Right Side: Buyer Comms (Live Chat) */}
        <div style={{ width: '350px', backgroundColor: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span> Live Buyer Comms
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>TechCorp Buyer • 10:41 AM</div>
              <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px 8px 8px 0', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                Welcome to the live floor. We're looking to close this today.
              </div>
            </div>
            
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>TechCorp Buyer • 10:45 AM</div>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '8px 8px 8px 0', fontSize: '0.9rem', color: '#fcd34d', lineHeight: '1.4' }}>
                <strong>COUNTER-OFFER RECEIVED</strong><br />
                Acme Corp, if you can drop the storage array to $40k flat, we will award you the contract right now.
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Message buyer..."
                style={{ width: '100%', padding: '12px 40px 12px 16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '24px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
              <button style={{ position: 'absolute', right: '4px', top: '4px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

      </main>

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>
    </div>
  );
}
