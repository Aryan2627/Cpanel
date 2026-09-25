"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from '../../../../context/SessionContext';

export default function Page() {
  const { session, loading } = useSession();
  const [features, setFeatures] = useState<any>({});

  useEffect(() => {
    if (session?.features) {
      try {
        setFeatures(JSON.parse(session.features));
      } catch(e) {}
    }
  }, [session]);

  if (loading) return <div style={{ padding: '40px', color: '#64748b', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8faff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>Maintenance Expiry</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>View your current support SLA tier and upcoming maintenance renewals.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Active Support Tier</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', marginBottom: '32px' }}>{features.sla_tier || 'Standard'} SLA</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Guaranteed Response Time</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{features.sla_tier === 'Platinum' ? '< 4 hours (24/7/365)' : (features.sla_tier === 'Premium' ? '< 24 hours' : '< 48 hours')}</div>
            </div>
            <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Dedicated Customer Success Manager</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{features.sla_tier === 'Platinum' ? 'Included' : 'Available as add-on'}</div>
            </div>
          </div>
    
        </div>
      </div>
    </div>
  );
}
