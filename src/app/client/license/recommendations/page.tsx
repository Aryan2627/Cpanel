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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>Recommendations</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>AI-driven insights to optimize your organizations software footprint.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <div style={{ padding: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '1.05rem' }}>Upsize Seat Capacity</h4>
            <p style={{ margin: 0, color: '#1e3a8a', fontSize: '0.9rem' }}>You are utilizing {features.seats_used || 0} out of {features.seats_allocated || 1} seats. Consider upgrading your tier before hitting the hard limit.</p>
          </div>
          <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#b91c1c', fontSize: '1.05rem' }}>Security Action Required</h4>
            <p style={{ margin: 0, color: '#991b1b', fontSize: '0.9rem' }}>2 users have not logged in for over 90 days. We recommend reclaiming these licenses.</p>
          </div>
    
        </div>
      </div>
    </div>
  );
}
