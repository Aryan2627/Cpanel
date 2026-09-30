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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>License Allocations</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>Monitor active seat usage against your organizations provisioned capacity.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total Provisioned Seats</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a' }}>{features.seats_allocated || 'Unlimited'}</div>
            </div>
            <div>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Seats Currently Assigned</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#3b82f6' }}>{features.seats_used || '0'}</div>
            </div>
          </div>
          <div style={{ marginTop: '32px' }}>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#3b82f6', width: `${Math.min(100, ((features.seats_used || 0) / (features.seats_allocated || 1)) * 100)}%` }} />
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>Capacity usage across all active enterprise environments.</div>
          </div>
    
        </div>
      </div>
    </div>
  );
}
