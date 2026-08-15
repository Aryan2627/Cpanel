'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Star, AlertTriangle, ShieldAlert, BadgeCheck, 
  MapPin, Package, Clock, MessageSquare, Activity, Globe, Leaf, Share2, Link as LinkIcon, TrendingDown, TrendingUp, DollarSign
} from 'lucide-react';

export default function VendorProfileDashboard() {
  const params = useParams();
  const router = useRouter();
  
  const [showBankruptcyPredictor, setShowBankruptcyPredictor] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('godTierFeatures');
      if (saved) {
        const features = JSON.parse(saved);
        if (features.bankruptcyPredictor !== undefined) {
          setShowBankruptcyPredictor(features.bankruptcyPredictor);
        }
      }
    } catch (e) {}
  }, []);

  // Mock data for the specific vendor
  const vendor = {
    id: params.id,
    name: params.id === 'mock1' ? 'Alpha Technologies' : params.id === 'mock2' ? 'Global Supply Co.' : 'Untrustworthy LLC',
    city: params.id === 'mock1' ? 'Tokyo, Japan' : params.id === 'mock2' ? 'London, UK' : 'Unknown',
    status: params.id === 'mock3' ? 'Blacklisted' : 'Joined',
    trustScore: params.id === 'mock1' ? 4.8 : params.id === 'mock2' ? 3.5 : 1.2,
    type: 'Manufacturer',
    contact: 'contact@vendor.com'
  };

  // Mock Performance Breakdown (SRM)
  const performance = {
    quality: vendor.trustScore > 4 ? 4.9 : vendor.trustScore < 3 ? 1.5 : 3.8,
    speed: vendor.trustScore > 4 ? 4.7 : vendor.trustScore < 3 ? 1.0 : 3.2,
    communication: vendor.trustScore > 4 ? 4.8 : vendor.trustScore < 3 ? 1.1 : 3.5,
    pastOrders: [
      { id: 'PO-2026-001', date: '2026-06-15', amount: '$45,000', rating: vendor.trustScore > 4 ? 5 : 2, notes: vendor.trustScore > 4 ? 'Delivered 2 days early.' : 'Late delivery, poor packaging.' },
      { id: 'PO-2026-089', date: '2026-07-22', amount: '$12,500', rating: vendor.trustScore > 4 ? 4 : 1, notes: 'Standard fulfillment.' }
    ]
  };

  // Mock Geopolitical Risk Alert
  const riskAlert = vendor.city.includes('Tokyo') ? {
    level: 'High Risk',
    color: '#ef4444',
    bg: '#fef2f2',
    icon: <AlertTriangle size={20} color="#ef4444" />,
    message: 'Typhoon warning in the Sea of Japan. Expect 3-5 day shipping delays from this manufacturing region.'
  } : vendor.city.includes('London') ? {
    level: 'Moderate Risk',
    color: '#f59e0b',
    bg: '#fef3c7',
    icon: <Activity size={20} color="#f59e0b" />,
    message: 'Potential port worker strike next week. Monitor shipments closely.'
  } : {
    level: 'Low Risk',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: <ShieldAlert size={20} color="#10b981" />,
    message: 'No active geopolitical or weather threats in this region.'
  };

  // Mock Financial Health AI
  const financialHealth = vendor.id === 'mock1' ? {
    status: 'Excellent', risk: 'Low', color: '#10b981', bg: '#ecfdf5', score: 92,
    insights: ['Credit rating upgraded to AAA', 'Positive Q2 Earnings Report', 'Low Debt-to-Equity Ratio']
  } : vendor.id === 'mock2' ? {
    status: 'Stable', risk: 'Medium', color: '#f59e0b', bg: '#fef3c7', score: 68,
    insights: ['Credit rating unchanged (BBB)', 'Neutral news sentiment', 'Slight delay in recent filings']
  } : {
    status: 'Insolvent', risk: 'Critical', color: '#ef4444', bg: '#fef2f2', score: 18,
    warning: "Danger: Vendor's financial health score has plummeted 30% this month. Do not award.",
    insights: ['Multiple missed debt payments reported', 'Negative SEC filings detected', 'CEO resigned abruptly']
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f1f5f9', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => router.push('/client/vendors')} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <ArrowLeft size={20} color="#475569" />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{vendor.name}</h1>
            {vendor.status === 'Joined' ? (
              <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><BadgeCheck size={14} /> Verified</span>
            ) : (
              <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Blacklisted</span>
            )}
          </div>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {vendor.city}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={14} /> {vendor.type}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Feature 4: Supply Chain Risk & Geopolitical Alerts */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${riskAlert.color}`, padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: riskAlert.color }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} color="#3b82f6" /> Live Intelligence & Risk Monitor
              </h2>
              <span style={{ padding: '6px 12px', backgroundColor: riskAlert.bg, color: riskAlert.color, borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {riskAlert.icon} {riskAlert.level}
              </span>
            </div>
            <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {riskAlert.message}
            </p>
          </div>

          {/* Feature 9: Financial Health & Insolvency AI */}
          {showBankruptcyPredictor && (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: `2px solid ${financialHealth.risk === 'Critical' ? '#ef4444' : '#e2e8f0'}`, padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', position: 'relative' }}>
              {financialHealth.risk === 'Critical' && (
                <div style={{ backgroundColor: '#ef4444', color: '#fff', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(239,68,68,0.2)' }}>
                  <AlertTriangle size={24} /> {financialHealth.warning}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <DollarSign size={20} color="#0f172a" /> Financial Health & Insolvency AI
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Live analysis of SEC filings, credit scores, and news.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: financialHealth.color, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    {financialHealth.score} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: financialHealth.color, backgroundColor: financialHealth.bg, padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                    {financialHealth.risk} Risk
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '0.85rem', color: '#475569', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Insights</h3>
                {financialHealth.insights.map((insight, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    {financialHealth.risk === 'Critical' ? <TrendingDown size={16} color="#ef4444" /> : <TrendingUp size={16} color="#10b981" />}
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature 3: Vendor Performance Scorecard (SRM) */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#8b5cf6" /> Supplier Relationship Management (SRM)
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 700, color: vendor.trustScore > 4 ? '#10b981' : vendor.trustScore < 3 ? '#ef4444' : '#f59e0b' }}>
                <Star size={24} fill="currentColor" /> {vendor.trustScore} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/ 5.0</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Product Quality', value: performance.quality, icon: Package },
                { label: 'Delivery Speed', value: performance.speed, icon: Clock },
                { label: 'Communication', value: performance.communication, icon: MessageSquare }
              ].map((metric, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '140px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                    <metric.icon size={16} /> {metric.label}
                  </div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(metric.value / 5) * 100}%`, height: '100%', backgroundColor: metric.value > 4 ? '#10b981' : metric.value < 3 ? '#ef4444' : '#f59e0b', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ width: '30px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{metric.value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Past PO Reviews</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {performance.pastOrders.map((po, i) => (
                <div key={i} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{po.id} <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '8px' }}>{po.date}</span></div>
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>"{po.notes}"</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', color: po.rating > 3 ? '#10b981' : '#ef4444' }}>
                    {[1,2,3,4,5].map(star => <Star key={star} size={14} fill={star <= po.rating ? 'currentColor' : 'none'} color={star <= po.rating ? 'currentColor' : '#cbd5e1'} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Feature 6: Multi-Tier Tracking (Scope 3) */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Share2 size={20} color="#10b981" /> Multi-Tier Scope 3 Supply Chain
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Declared Sub-Contractors & Raw Material Sources</p>
              </div>
              <button style={{ padding: '6px 12px', backgroundColor: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Leaf size={14} /> ESG Compliant
              </button>
            </div>

            {/* Visual Node Map (CSS-based) */}
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              
              {/* Vertical connecting line */}
              <div style={{ position: 'absolute', left: '49px', top: '40px', bottom: '40px', width: '2px', backgroundColor: '#cbd5e1', zIndex: 0 }}></div>

              {/* Tier 1 (This Vendor) */}
              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 6px rgba(37,99,235,0.3)', flexShrink: 0 }}>T1</div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', border: '2px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', marginBottom: '2px' }}>Direct Supplier (Tier 1)</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{vendor.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Final Assembly & Manufacturing</div>
                </div>
              </div>

              {/* Tier 2 (Sub-contractor) */}
              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1, marginLeft: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(139,92,246,0.3)', flexShrink: 0, marginTop: '8px' }}>T2</div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '2px' }}>Sub-Assembly (Tier 2)</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Shenzhen Circuit Corp.</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Provides logic boards. Location: Shenzhen, China.</div>
                </div>
              </div>

              {/* Tier 3 (Raw Materials) */}
              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1, marginLeft: '40px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(245,158,11,0.3)', flexShrink: 0, marginTop: '8px' }}>T3</div>
                <div style={{ flex: 1, backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '2px' }}>Raw Material (Tier 3)</div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Global Lithium Mines Ltd.</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Provides raw lithium for batteries. Location: Perth, Australia.</div>
                </div>
              </div>

            </div>

            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <LinkIcon size={20} color="#3b82f6" style={{ marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#1d4ed8', fontSize: '0.9rem' }}>Blockchain Verified</h4>
                <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.8rem', lineHeight: '1.4' }}>This vendor has securely attested their supply chain via the Vendor Portal. Tier 2 and Tier 3 sources are verified against global conflict-mineral databases.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
