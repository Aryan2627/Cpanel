'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, BarChart3, FileText, User } from 'lucide-react';

export default function BuyerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [event, setEvent] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New states for Mega Feature Sprint
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeVendorChat, setActiveVendorChat] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMsg = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { id: Date.now(), sender: 'You', msg: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatMessage('');
    
    // Mock vendor reply
    setTimeout(() => {
      setChatHistory(prev => [...prev, { id: Date.now()+1, sender: activeVendorChat?.vendorName || 'Vendor', msg: 'Understood. We will review and get back to you shortly.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, 1500);
  };

  const handleDownloadCSV = () => {
    let csv = 'Vendor Name,Total Amount,';
    csv += templateFields.map((f: any) => f.name).join(',') + '\n';
    
    bids.forEach(bid => {
      let templateData: any = {};
      try { templateData = JSON.parse(bid.templateData); } catch(e) {}
      let row = `"${bid.vendorName}",${bid.amount},`;
      const tVals = templateFields.map((f: any) => `"${templateData[f.key] || ''}"`);
      row += tVals.join(',') + '\n';
      csv += row;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title?.replace(/\s+/g, '_')}_Matrix.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchEventData = () => {
    fetch(`/api/events/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch event');
        return res.json();
      })
      .then(eventData => {
        setEvent(eventData);
        return fetch(`/api/bids?eventId=${eventData.id}`);
      })
      .then(res => res.json())
      .then(bidsData => {
        setBids(bidsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEventData();
    
    // Listen for live bid updates from vendor tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'latest_bid_sync') {
        fetchEventData(); // Refresh bids silently
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [params.id]);

  const handleAward = async (bid: any) => {
    try {
      let bidTemplateData: any = {};
      try { bidTemplateData = JSON.parse(bid.templateData); } catch(e) {}
      
      const poDetails = {
        templateFields,
        bidData: bidTemplateData,
        vendorEmail: bid.vendorId || 'vendor@example.com', // placeholder if not linked
      };

      const poRes = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `PO for Event ${event.refId}`,
          vendorId: bid.vendorName, // Temporarily using name as ID in mock environment
          total: bid.amount,
          eventId: event.id,
          status: 'Draft',
          poNumber: `PO-${Date.now()}`,
          details: JSON.stringify(poDetails)
        })
      });

      if (poRes.ok) {
        const poData = await poRes.json();
        alert(`Purchase Order successfully generated for ${bid.vendorName}! Redirecting...`);
        router.push(`/client/po/${poData.id}`);
      } else {
        alert('Failed to generate PO');
      }
    } catch(err) {
      alert('Error awarding bid');
    }
  };

  // Derived template fields for columns
  const templateFields = useMemo(() => {
    if (!event || !event.stages) return [];
    try {
      const stagesArr = JSON.parse(event.stages);
      if (stagesArr && stagesArr.length > 0 && stagesArr[0].templateFields) {
        return stagesArr[0].templateFields;
      }
    } catch(e) {}
    return [];
  }, [event]);

  const lowestBidAmount = bids.length > 0 ? Math.min(...bids.map(b => b.amount)) : null;
  const lowestTemplateValues = useMemo(() => {
    let minValues: any = {};
    templateFields.forEach((f: any) => {
      let vals = bids.map(b => {
        let data: any = {};
        try { data = JSON.parse(b.templateData) } catch(e) {}
        const val = parseFloat(data[f.key]);
        return isNaN(val) ? null : val;
      }).filter(v => v !== null) as number[];
      if (vals.length > 0) minValues[f.key] = Math.min(...vals);
    });
    return minValues;
  }, [bids, templateFields]);

  if (loading) return <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>Loading Event Details...</div>;
  if (error) return <div style={{ padding: '24px', color: '#ef4444' }}>{error}</div>;
  if (!event) return null;

  return (
    <>
      <div style={{ backgroundColor: '#f8fafc', color: '#333', minHeight: '100%', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => router.push('/client/events')}
          style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={20} color="#475569" />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{event.title}</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>{event.refId} • {event.type} • {event.account}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Left Col - Event Info */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#2563eb" /> Event Snapshot
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Total Items</div>
                <div style={{ fontWeight: 500, color: '#0f172a' }}>{event.itemsCount}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Date Created</div>
                <div style={{ fontWeight: 500, color: '#0f172a' }}>{new Date(event.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Status</div>
                {(() => {
                  if (event.endTime) {
                    const diff = new Date(event.endTime).getTime() - now.getTime();
                    if (diff <= 0) {
                      return (
                        <div style={{ fontWeight: 500, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={16} /> Event Ended
                        </div>
                      );
                    }
                    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                    const m = Math.floor((diff / 1000 / 60) % 60);
                    const s = Math.floor((diff / 1000) % 60);
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 500, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={16} /> Live & Receiving Bids
                        </div>
                        <div style={{ fontWeight: 700, color: '#b45309', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                          {d > 0 && `${d}d `}{h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div style={{ fontWeight: 500, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} /> Live
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

        </div>

        {/* Right Col - Bidding Summary Table */}
        <div style={{ flex: '2 1 600px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={18} color="#2563eb" /> Bidding Summary
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setIsCompareModalOpen(true)}
                  style={{ backgroundColor: '#10b981', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)' }}
                >
                  <BarChart3 size={16} /> Compare Matrix
                </button>
                <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 500 }}>
                  {bids.length} Bids Received
                </div>
              </div>
            </div>
            
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
              Compare vendor submissions directly against your defined template criteria.
            </p>

            {bids.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                No bids have been submitted for this event yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Vendor</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Total Amount</th>
                      {templateFields.map((f: any) => (
                        <th key={f.key} style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>{f.name}</th>
                      ))}
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, idx) => {
                      let templateData: any = {};
                      if (bid.templateData) {
                        try { templateData = JSON.parse(bid.templateData); } catch(e) {}
                      }

                      return (
                        <tr key={bid.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <User size={14} color="#64748b" /> {bid.vendorName || 'Unknown Vendor'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ 
                              padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500,
                              backgroundColor: bid.status === 'Revised' ? '#fef3c7' : '#dcfce7',
                              color: bid.status === 'Revised' ? '#b45309' : '#15803d'
                            }}>
                              {bid.status || 'Submitted'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: bid.amount === lowestBidAmount ? '#10b981' : '#2563eb', backgroundColor: bid.amount === lowestBidAmount ? '#ecfdf5' : 'transparent' }}>
                            ${bid.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {bid.amount === lowestBidAmount && <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#10b981', color: '#fff', borderRadius: '12px' }}>Best</span>}
                          </td>
                          {templateFields.map((f: any) => {
                            const val = parseFloat(templateData[f.key]);
                            const isNumeric = !isNaN(val);
                            const isLowest = isNumeric && val === lowestTemplateValues[f.key];

                            return (
                              <td key={f.key} style={{ padding: '12px 16px', color: isLowest ? '#10b981' : '#334155', backgroundColor: isLowest ? '#ecfdf5' : 'transparent', fontWeight: isLowest ? 600 : 400 }}>
                                {templateData[f.key] || '-'}
                              </td>
                            );
                          })}
                          <td style={{ padding: '12px 16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              onClick={() => { setActiveVendorChat(bid); setIsChatOpen(true); }}
                              style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#3b82f6', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                            >
                              💬 Negotiate
                            </button>
                            {bid.amount === lowestBidAmount && (
                              <button 
                                onClick={() => handleAward(bid)}
                                style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', backgroundColor: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 2px 4px rgba(16,185,129,0.2)' }}
                              >
                                🏆 Award
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>

      {/* Slack-Style Chat Drawer */}
      <div style={{ position: 'fixed', top: 0, right: isChatOpen ? 0 : '-400px', width: '400px', height: '100vh', backgroundColor: '#fff', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', transition: 'right 0.3s ease', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>Negotiation</h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> {activeVendorChat?.vendorName}
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
        </div>
        
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f1f5f9' }}>
          {chatHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginTop: '40px' }}>Start a live negotiation with this vendor.</div>
          ) : (
            chatHistory.map(chat => (
              <div key={chat.id} style={{ alignSelf: chat.sender === 'You' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', textAlign: chat.sender === 'You' ? 'right' : 'left' }}>{chat.sender} • {chat.time}</div>
                <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: chat.sender === 'You' ? '#2563eb' : '#fff', color: chat.sender === 'You' ? '#fff' : '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.9rem' }}>
                  {chat.msg}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMsg()}
              style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
            <button onClick={handleSendMsg} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Send</button>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Modal */}
      {isCompareModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                #compare-matrix-modal, #compare-matrix-modal * { visibility: visible; }
                #compare-matrix-modal { position: absolute; left: 0; top: 0; width: 100%; max-height: none; box-shadow: none; overflow: visible; }
                .no-print { display: none !important; }
              }
            `}
          </style>
          <div id="compare-matrix-modal" style={{ width: '90%', maxWidth: '1200px', maxHeight: '90vh', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div className="no-print" style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem' }}>Vendor Comparison Matrix</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>The system has automatically highlighted the most competitive responses in green.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleDownloadCSV} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> Export Excel (CSV)
                </button>
                <button onClick={() => window.print()} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> Export PDF
                </button>
                <button onClick={() => setIsCompareModalOpen(false)} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Close Matrix</button>
              </div>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Vendor Name</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Total Amount</th>
                    {templateFields.map((f: any) => (
                      <th key={f.key} style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>{f.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bids.map(bid => {
                    let templateData: any = {};
                    try { templateData = JSON.parse(bid.templateData); } catch(e) {}
                    
                    const isLowestAmount = bid.amount === lowestBidAmount;

                    return (
                      <tr key={bid.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontWeight: 500, color: '#0f172a' }}>{bid.vendorName}</td>
                        <td style={{ padding: '16px', fontWeight: 600, color: isLowestAmount ? '#10b981' : '#334155', backgroundColor: isLowestAmount ? '#ecfdf5' : 'transparent' }}>
                          ${bid.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          {isLowestAmount && <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#10b981', color: '#fff', borderRadius: '12px' }}>Best</span>}
                        </td>
                        {templateFields.map((f: any) => {
                          const val = parseFloat(templateData[f.key]);
                          const isNumeric = !isNaN(val);
                          const isLowest = isNumeric && val === lowestTemplateValues[f.key];
                          
                          return (
                            <td key={f.key} style={{ padding: '16px', color: isLowest ? '#10b981' : '#334155', backgroundColor: isLowest ? '#ecfdf5' : 'transparent', fontWeight: isLowest ? 600 : 400 }}>
                              {templateData[f.key] || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
