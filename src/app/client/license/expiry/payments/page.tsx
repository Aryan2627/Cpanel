"use client";
import React, { useEffect, useState } from 'react';

export default function Page() {
  const [session, setSession] = useState<any>(null);
  const [features, setFeatures] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setSession(d);
        if (d.features) {
          try {
            setFeatures(JSON.parse(d.features));
          } catch(e) {}
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8faff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>Payments Due</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>Outstanding invoices and upcoming scheduled billing for your software subscriptions.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Next Scheduled Payment</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>${features.payment_due ? features.payment_due.toLocaleString() : '0.00'}</div>
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Payment Due Date</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 600, color: features.payment_date ? '#f59e0b' : '#10b981', marginTop: '10px' }}>{features.payment_date || 'Fully Paid'}</div>
            </div>
          </div>
          <button style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Download Invoice (PDF)</button>
    
        </div>
      </div>
    </div>
  );
}
