'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, BarChart3, FileText, User, Leaf, AlertTriangle, Target, Globe, BrainCircuit, Hammer } from 'lucide-react';

export default function BuyerEventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const [event, setEvent] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeVendorChat, setActiveVendorChat] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());
  
  const [isCounterOfferMode, setIsCounterOfferMode] = useState(false);
  const [counterOfferPrice, setCounterOfferPrice] = useState('');
  const [counterOfferExpiry, setCounterOfferExpiry] = useState('24h');
  const [counterOfferReason, setCounterOfferReason] = useState('Market intel suggests this is the ceiling');
  
  const [showBankruptcyPredictor, setShowBankruptcyPredictor] = useState(true);
  const [showGhostBidding, setShowGhostBidding] = useState(false);
  
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('godTierFeatures');
      if (saved) {
        const features = JSON.parse(saved);
        if (features.bankruptcyPredictor !== undefined) {
          setShowBankruptcyPredictor(features.bankruptcyPredictor);
        }
        if (features.ghostBidding !== undefined) {
          setShowGhostBidding(features.ghostBidding);
        }
      }
    } catch (e) {}
    
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMsg = () => {
    if (!chatMessage.trim()) return;
    setChatHistory([...chatHistory, { id: Date.now(), sender: 'You', type: 'text', msg: chatMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setChatMessage('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { id: Date.now()+1, sender: activeVendorChat?.vendorName || 'Vendor', type: 'text', msg: 'Understood. We will review and get back to you shortly.', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }, 1500);
  };

  const handleSendCounterOffer = () => {
    if (!counterOfferPrice) return;
    const newOffer = {
      id: Date.now(),
      sender: 'You',
      type: 'counter_offer',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      offerDetails: {
        price: counterOfferPrice,
        expiry: counterOfferExpiry,
        reason: counterOfferReason
      }
    };
    setChatHistory([...chatHistory, newOffer]);
    setIsCounterOfferMode(false);
    setCounterOfferPrice('');
    
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        id: Date.now()+1, 
        sender: activeVendorChat?.vendorName || 'Vendor', 
        type: 'text',
        msg: `We have reviewed your counter-offer of $${newOffer.offerDetails.price}. After consulting with our management, we accept these revised terms to secure the partnership.`, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    }, 2500);
  };

  const handleDownloadCSV = () => {
    let csv = 'Vendor Name,Composite Score,Total Amount (USD),Original Currency,CO2 Footprint,';
    csv += templateFields.map((f: any) => f.name).join(',') + '\n';
    bids.forEach(bid => {
      let templateData: any = {};
      try { templateData = JSON.parse(bid.templateData); } catch(e) {}
      let row = `"${bid.vendorName}",${bid.score || 0},${bid.usdAmount},${bid.currency || 'USD'},"${bid.esgScore || 'N/A'}",`;
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
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEventData();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'latest_bid_sync') fetchEventData();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [params.id]);

  const handleAward = async (bid: any) => {
    try {
      let bidTemplateData: any = {};
      try { bidTemplateData = JSON.parse(bid.templateData); } catch(e) {}
      const poDetails = { templateFields, bidData: bidTemplateData, vendorEmail: bid.vendorId || 'vendor@example.com' };
      const poRes = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `PO for Event ${event.refId}`,
          vendorId: bid.vendorName,
          total: bid.usdAmount || bid.amount,
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

  const parsedStages = useMemo(() => {
    if (!event || !event.stages) return [];
    try { return JSON.parse(event.stages); } catch(e) { return []; }
  }, [event]);

  const templateFields = useMemo(() => {
    if (parsedStages.length > 0 && parsedStages[activeTabIndex] && parsedStages[activeTabIndex].templateFields) {
      return parsedStages[activeTabIndex].templateFields;
    }
    return [];
  }, [parsedStages, activeTabIndex]);

  const enableESG = templateFields.some((f: any) => f.enableESG);

  // Process Bids: Currency Conversion & Scoring
  const processedBids = useMemo(() => {
    const exchangeRates: Record<string, number> = { 'USD': 1, 'EUR': 1.1, 'GBP': 1.25, 'JPY': 0.0067 };
    
    // Find min values for scoring
    const minVals: Record<string, number> = {};
    templateFields.forEach((f: any) => {
      if (f.weight > 0) {
        const vals = bids.map(b => {
          let data: any = {};
          try { data = JSON.parse(b.templateData) } catch(e) {}
          const val = parseFloat(data[f.key]);
          return isNaN(val) ? null : val;
        }).filter(v => v !== null) as number[];
        if (vals.length > 0) minVals[f.key] = Math.min(...vals);
      }
    });

    const processed = bids.map(bid => {
      let data: any = {};
      try { data = JSON.parse(bid.templateData); } catch(e) {}
      
      const currency = bid.currency || 'USD';
      const usdAmount = bid.amount * (exchangeRates[currency] || 1);
      
      // Calculate Composite Score out of 100
      let score = 0;
      templateFields.forEach((f: any) => {
        if (f.weight > 0) {
          const val = parseFloat(data[f.key]);
          if (!isNaN(val) && minVals[f.key]) {
            // Lower is better: (Min / VendorVal) * Weight
            score += (minVals[f.key] / val) * f.weight;
          }
        }
      });
      // Normalize to 100 if weights exceed 100
      const totalWeight = templateFields.reduce((acc: number, f: any) => acc + (f.weight || 0), 0);
      if (totalWeight > 0) {
        score = (score / totalWeight) * 100;
      } else {
        score = 0;
      }

      // Mock ESG Carbon calculation (heuristic based on amount for demo)
      let esgScore = 'N/A';
      if (enableESG) {
        esgScore = `${Math.floor(usdAmount * 0.015)} kg CO2e`;
      }

      // Mock Trust Score, Risk, and Financial Health
      let trustScore = 4.8;
      let riskLevel = 'Low Risk';
      let financialHealth = 'Excellent';
      if ((bid.vendorName || '').includes('Global') || (bid.vendorName || '').includes('Supplier B')) { trustScore = 3.5; riskLevel = 'Moderate Risk'; financialHealth = 'Stable'; }
      if ((bid.vendorName || '').includes('Untrustworthy') || (bid.vendorName || '').includes('Supplier C')) { trustScore = 1.2; riskLevel = 'High Risk'; financialHealth = 'Critical'; }

      return { ...bid, usdAmount, score: Math.round(score * 10) / 10, esgScore, parsedData: data, trustScore, riskLevel, financialHealth };
    }).sort((a: any, b: any) => b.score - a.score); // Highest score first
    
    // Add AI Ghost Bid if enabled
    if (showGhostBidding && processed.length > 0) {
      // Calculate realistic ghost bid values (e.g. 5% better than the best minimums)
      const ghostData: any = {};
      let ghostUsdAmount = 0;
      
      templateFields.forEach((f: any) => {
        if (minVals[f.key]) {
          const ghostVal = minVals[f.key] * 0.95; // AI predicts market can do 5% better
          ghostData[f.key] = ghostVal.toFixed(2);
        } else {
          ghostData[f.key] = "AI Optimized";
        }
      });
      
      // Calculate ghost score
      let score = 0;
      templateFields.forEach((f: any) => {
        if (f.weight > 0 && minVals[f.key]) {
          score += (minVals[f.key] / parseFloat(ghostData[f.key])) * f.weight;
        }
      });
      const totalWeight = templateFields.reduce((acc: number, f: any) => acc + (f.weight || 0), 0);
      score = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
      
      // Approximate ghost usd amount from the lowest human bid * 0.95
      const lowestHumanAmount = Math.min(...processed.map(b => b.usdAmount));
      ghostUsdAmount = lowestHumanAmount * 0.95;

      processed.unshift({
        id: 'ai-ghost-bid',
        vendorName: 'AI "Ghost Bid" (Market Intel)',
        isGhost: true,
        score: Math.round(score * 10) / 10,
        usdAmount: ghostUsdAmount,
        currency: 'USD',
        amount: ghostUsdAmount,
        esgScore: enableESG ? `${Math.floor(ghostUsdAmount * 0.012)} kg CO2e` : 'N/A', // 20% cleaner than human average
        parsedData: ghostData,
        trustScore: 5.0,
        riskLevel: 'Low Risk',
        financialHealth: 'Excellent'
      });
    }

    return processed;
  }, [bids, templateFields, enableESG, showGhostBidding]);

  const bestBid = processedBids[0]; // Best is highest score

  if (loading) return <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>Loading Event Details...</div>;
  if (error) return <div style={{ padding: '24px', color: '#ef4444' }}>{error}</div>;
  if (!event) return null;

  return (
    <>
      <div style={{ backgroundColor: '#f8fafc', color: '#333', minHeight: '100%', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <button onClick={() => router.push('/client/events')} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={20} color="#475569" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{event.title}</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>{event.refId} • {event.type} • {event.account}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
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
                        return <div style={{ fontWeight: 500, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={16} /> Event Ended</div>;
                      }
                      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                      const m = Math.floor((diff / 1000 / 60) % 60);
                      const s = Math.floor((diff / 1000) % 60);
                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 500, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} /> Live & Receiving Bids</div>
                          <div style={{ fontWeight: 700, color: '#b45309', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                            {d > 0 && `${d}d `}{h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
                          </div>
                        </div>
                      );
                    }
                    return <div style={{ fontWeight: 500, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={16} /> Live</div>;
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: '2 1 600px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} color="#2563eb" /> Bidding Summary & Best Value Scoring
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => setIsCompareModalOpen(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)' }}>
                    <BarChart3 size={16} /> Compare Matrix
                  </button>
                  <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 500 }}>
                    {bids.length} Bids Received
                  </div>
                </div>
              </div>
              
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
                Compare vendor submissions directly against your defined template criteria. Composite scores are calculated out of 100 based on field weights.
              </p>

              {parsedStages.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  {parsedStages.map((stage: any, idx: number) => {
                    const isActive = idx === activeTabIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveTabIndex(idx)}
                        style={{
                          padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s',
                          backgroundColor: isActive ? '#eff6ff' : 'transparent',
                          color: isActive ? '#2563eb' : '#64748b',
                          boxShadow: isActive ? 'inset 0 0 0 1px #bfdbfe' : 'none'
                        }}
                      >
                        {stage.type || stage.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {processedBids.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                  No bids have been submitted for this event yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', padding: '0 8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 16px', textAlign: 'left', fontSize: '0.95rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '0 24px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Vendor</th>
                        <th style={{ padding: '0 24px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Score</th>
                        <th style={{ padding: '0 24px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Total Amount (USD)</th>
                        {enableESG && <th style={{ padding: '0 24px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Carbon Footprint</th>}
                        <th style={{ padding: '0 24px', fontWeight: 600, color: '#64748b', textAlign: 'right', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedBids.map((bid: any, idx: number) => {
                        const isBest = bid.id === bestBid?.id && bid.score > 0 && !bid.isGhost;
                        
                        if (bid.isGhost) {
                          return (
                            <tr key={bid.id} style={{ backgroundColor: '#faf5ff', backgroundImage: 'linear-gradient(to right, #faf5ff, #f3e8ff)', boxShadow: '0 4px 6px -1px rgba(147, 51, 234, 0.1)', borderRadius: '12px', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(147, 51, 234, 0.15)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(147, 51, 234, 0.1)'; }}>
                              <td style={{ padding: '20px 24px', fontWeight: 600, color: '#6b21a8', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', border: '1px solid #e9d5ff', borderRight: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                                  <BrainCircuit size={18} color="#9333ea" /> {bid.vendorName}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#9333ea', marginTop: '6px', fontWeight: 500, backgroundColor: '#f3e8ff', padding: '4px 8px', borderRadius: '12px', display: 'inline-block' }}>
                                  Generative Market Baseline
                                </div>
                              </td>
                              <td style={{ padding: '20px 24px', borderTop: '1px solid #e9d5ff', borderBottom: '1px solid #e9d5ff' }}>
                                <span style={{ padding: '6px 12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, backgroundColor: '#d8b4fe', color: '#581c87', boxShadow: '0 2px 4px rgba(147,51,234,0.2)' }}>
                                  {bid.score > 0 ? `${bid.score}/100` : 'N/A'}
                                </span>
                              </td>
                              <td style={{ padding: '20px 24px', fontWeight: 700, color: '#6b21a8', fontSize: '1.1rem', borderTop: '1px solid #e9d5ff', borderBottom: '1px solid #e9d5ff' }}>
                                ${bid.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              {enableESG && (
                                <td style={{ padding: '20px 24px', color: '#16a34a', fontWeight: 600, borderTop: '1px solid #e9d5ff', borderBottom: '1px solid #e9d5ff' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Leaf size={16} /> {bid.esgScore}</div>
                                </td>
                              )}
                              <td style={{ padding: '20px 24px', textAlign: 'right', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', border: '1px solid #e9d5ff', borderLeft: 'none' }}>
                                <span style={{ fontSize: '0.85rem', color: '#9333ea', fontStyle: 'italic', fontWeight: 600 }}>AI Expected Value</span>
                              </td>
                            </tr>
                          );
                        }
                        
                        return (
                          <tr key={bid.id} style={{ backgroundColor: isBest ? '#f0fdf4' : '#ffffff', border: isBest ? '2px solid #10b981' : '1px solid #e2e8f0', boxShadow: isBest ? '0 10px 25px -5px rgba(16, 185, 129, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.05)', borderRadius: '12px', transition: 'all 0.2s ease', position: 'relative' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isBest ? '0 15px 30px -5px rgba(16, 185, 129, 0.3)' : '0 10px 15px -3px rgba(0,0,0,0.1)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isBest ? '0 10px 25px -5px rgba(16, 185, 129, 0.2)' : '0 4px 6px -1px rgba(0,0,0,0.05)'; }}>
                            <td style={{ padding: '20px 24px', fontWeight: 600, color: '#0f172a', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', border: isBest ? '2px solid #34d399' : '1px solid #e2e8f0', borderRight: 'none', position: 'relative' }}>
                              {isBest && (
                                <div style={{ position: 'absolute', top: '-12px', left: '24px', backgroundColor: '#10b981', color: '#fff', padding: '2px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Target size={12} /> TOP CHOICE
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.05rem', marginTop: isBest ? '8px' : '0' }}>
                                <User size={18} color={isBest ? '#10b981' : '#64748b'} /> {bid.vendorName || 'Unknown Vendor'}
                                {bid.riskLevel === 'High Risk' && <span title="High Supply Chain Risk" style={{ display: 'flex' }}><AlertTriangle size={16} color="#ef4444" /></span>}
                                {bid.riskLevel === 'Moderate Risk' && <span title="Moderate Supply Chain Risk" style={{ display: 'flex' }}><AlertTriangle size={16} color="#f59e0b" /></span>}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                <div style={{ fontSize: '0.8rem', color: bid.trustScore > 4 ? '#10b981' : bid.trustScore < 3 ? '#ef4444' : '#f59e0b', fontWeight: 700, backgroundColor: bid.trustScore > 4 ? '#ecfdf5' : bid.trustScore < 3 ? '#fef2f2' : '#fffbeb', padding: '4px 8px', borderRadius: '6px', border: `1px solid ${bid.trustScore > 4 ? '#a7f3d0' : bid.trustScore < 3 ? '#fecaca' : '#fde68a'}` }}>
                                  ★ {bid.trustScore} Trust
                                </div>
                                {showBankruptcyPredictor && bid.financialHealth === 'Critical' && (
                                  <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, backgroundColor: '#fef2f2', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={12} /> Insolvency Risk
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '20px 24px', borderTop: isBest ? '2px solid #34d399' : '1px solid #e2e8f0', borderBottom: isBest ? '2px solid #34d399' : '1px solid #e2e8f0' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '54px', height: '54px', borderRadius: '50%', backgroundColor: isBest ? '#10b981' : '#f1f5f9', color: isBest ? '#fff' : '#334155', fontWeight: 800, fontSize: '1.1rem', boxShadow: isBest ? '0 4px 10px rgba(16,185,129,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                                {bid.score > 0 ? bid.score : '-'}
                              </div>
                            </td>
                            <td style={{ padding: '20px 24px', fontWeight: 700, color: '#0f172a', fontSize: '1.15rem', borderTop: isBest ? '2px solid #34d399' : '1px solid #e2e8f0', borderBottom: isBest ? '2px solid #34d399' : '1px solid #e2e8f0' }}>
                              ${bid.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {bid.currency !== 'USD' && <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>Orig: {bid.amount} {bid.currency}</div>}
                            </td>
                            {enableESG && (
                              <td style={{ padding: '20px 24px', color: '#16a34a', fontWeight: 600, borderTop: isBest ? '2px solid #34d399' : '1px solid #e2e8f0', borderBottom: isBest ? '2px solid #34d399' : '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdf4', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', border: '1px solid #bbf7d0' }}><Leaf size={16} /> {bid.esgScore}</div>
                              </td>
                            )}
                            <td style={{ padding: '20px 24px', textAlign: 'right', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', border: isBest ? '2px solid #34d399' : '1px solid #e2e8f0', borderLeft: 'none' }}>
                              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button onClick={() => { setActiveVendorChat(bid); setIsChatOpen(true); }} style={{ padding: '10px 16px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#dbeafe'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.transform = 'scale(1)'; }}>
                                  💬 Negotiate
                                </button>
                                {isBest && (!showBankruptcyPredictor || bid.financialHealth !== 'Critical') && (
                                  <button onClick={() => handleAward(bid)} style={{ padding: '10px 20px', background: 'linear-gradient(to right, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(16,185,129,0.4)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(16,185,129,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(16,185,129,0.4)'; }}>
                                    🏆 Award Vendor
                                  </button>
                                )}
                                {showBankruptcyPredictor && bid.financialHealth === 'Critical' && (
                                  <span style={{ padding: '10px 16px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertTriangle size={16} /> Blocked
                                  </span>
                                )}
                              </div>
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
              <div key={chat.id} style={{ alignSelf: chat.sender === 'You' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', textAlign: chat.sender === 'You' ? 'right' : 'left' }}>{chat.sender} • {chat.time}</div>
                {chat.type === 'counter_offer' ? (
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fff', border: '2px solid #3b82f6', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontWeight: 700, marginBottom: '12px', borderBottom: '1px solid #bfdbfe', paddingBottom: '8px' }}>
                      <Hammer size={16} /> FORMAL COUNTER OFFER
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Target Price</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>${Number(chat.offerDetails.price).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Valid For</span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{chat.offerDetails.expiry}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Justification</span>
                      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#475569' }}>"{chat.offerDetails.reason}"</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '10px 14px', borderRadius: '12px', backgroundColor: chat.sender === 'You' ? '#2563eb' : '#fff', color: chat.sender === 'You' ? '#fff' : '#334155', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.9rem' }}>
                    {chat.msg}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
          {isCounterOfferMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Issue Counter Offer</span>
                <button onClick={() => setIsCounterOfferMode(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Target Price (USD)</label>
                <input type="number" value={counterOfferPrice} onChange={e => setCounterOfferPrice(e.target.value)} placeholder="e.g. 50000" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Expiration</label>
                  <select value={counterOfferExpiry} onChange={e => setCounterOfferExpiry(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}>
                    <option value="2h">2 Hours</option>
                    <option value="24h">24 Hours</option>
                    <option value="48h">48 Hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Justification</label>
                <select value={counterOfferReason} onChange={e => setCounterOfferReason(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}>
                  <option value="Market intel suggests this is the ceiling">Market intel suggests this is the ceiling</option>
                  <option value="We have a lower competing bid">We have a lower competing bid</option>
                  <option value="Internal budget constraints">Internal budget constraints</option>
                </select>
              </div>
              <button onClick={handleSendCounterOffer} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
                <Hammer size={16} /> Send Formal Offer
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={() => setIsCounterOfferMode(true)} style={{ padding: '10px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Issue Counter Offer">
                <Hammer size={18} />
              </button>
              <input type="text" placeholder="Type your message..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMsg()} style={{ flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
              <button onClick={handleSendMsg} style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Send</button>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Matrix Modal */}
      {isCompareModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>
            {`@media print { body * { visibility: hidden; } #compare-matrix-modal, #compare-matrix-modal * { visibility: visible; } #compare-matrix-modal { position: absolute; left: 0; top: 0; width: 100%; max-height: none; box-shadow: none; overflow: visible; } .no-print { display: none !important; } }`}
          </style>
          <div id="compare-matrix-modal" style={{ width: '90%', maxWidth: '1400px', maxHeight: '90vh', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            
            <div className="no-print" style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} color="#6366f1" /> Advanced Vendor Comparison Matrix</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Fields flagged in red signify a breach of your internal Hidden Target Price.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleDownloadCSV} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Export CSV</button>
                <button onClick={() => window.print()} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Export PDF</button>
                <button onClick={() => setIsCompareModalOpen(false)} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Close Matrix</button>
              </div>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Vendor Name</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Composite Score</th>
                    <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Total (USD)</th>
                    {enableESG && <th style={{ padding: '16px', fontWeight: 600, color: '#16a34a' }}>CO2 Footprint</th>}
                    {templateFields.map((f: any) => (
                      <th key={f.key} style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>
                        {f.name}
                        {f.targetPrice && <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400, marginTop: '2px' }}>Target: ${f.targetPrice}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedBids.map((bid: any) => {
                    if (bid.isGhost) {
                      return (
                        <tr key={bid.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#faf5ff', backgroundImage: 'linear-gradient(to right, #faf5ff, #f3e8ff)' }}>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BrainCircuit size={16} /> {bid.vendorName}
                          </td>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#6b21a8' }}>{bid.score > 0 ? `${bid.score}/100` : 'N/A'}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: '#6b21a8' }}>
                            ${bid.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          {enableESG && <td style={{ padding: '16px', color: '#16a34a', fontWeight: 500 }}>{bid.esgScore}</td>}
                          {templateFields.map((f: any) => (
                            <td key={f.key} style={{ padding: '16px', color: '#9333ea', fontStyle: 'italic' }}>
                              {bid.parsedData[f.key] || '-'}
                            </td>
                          ))}
                        </tr>
                      );
                    }
                    
                    return (
                      <tr key={bid.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{bid.vendorName}</td>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#2563eb' }}>{bid.score > 0 ? `${bid.score}/100` : 'N/A'}</td>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>
                          ${bid.usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          {bid.currency !== 'USD' && <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Globe size={10} /> {bid.currency} Rate Applied</div>}
                        </td>
                        {enableESG && <td style={{ padding: '16px', color: '#16a34a', fontWeight: 500 }}>{bid.esgScore}</td>}
                        
                        {templateFields.map((f: any) => {
                          const rawVal = bid.parsedData[f.key];
                          const val = parseFloat(rawVal);
                          const isNumeric = !isNaN(val);
                          const target = parseFloat(f.targetPrice);
                          
                          // Check if target breached
                          const targetBreached = isNumeric && !isNaN(target) && val > target;

                          return (
                            <td key={f.key} style={{ padding: '16px', backgroundColor: targetBreached ? '#fef2f2' : 'transparent', color: targetBreached ? '#dc2626' : '#334155' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {targetBreached && <AlertTriangle size={14} color="#ef4444" />}
                                {rawVal || '-'}
                              </div>
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
