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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>All Licenses</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>A complete ledger of all active licenses, subscriptions, and add-ons.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 0', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Product Line</th>
                <th style={{ padding: '12px 0', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Type</th>
                <th style={{ padding: '12px 0', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 0', fontWeight: 600, color: '#0f172a' }}>ProcGen {session?.licensePlan || 'Enterprise'} Platform</td>
                <td style={{ padding: '16px 0', color: '#64748b' }}>Base Subscription</td>
                <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', background: '#ecfdf5', color: '#10b981', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>ACTIVE</span></td>
              </tr>
              <tr>
                <td style={{ padding: '16px 0', fontWeight: 600, color: '#0f172a' }}>{features.sla_tier || 'Standard'} Support SLA</td>
                <td style={{ padding: '16px 0', color: '#64748b' }}>Add-on</td>
                <td style={{ padding: '16px 0' }}><span style={{ padding: '4px 8px', background: '#ecfdf5', color: '#10b981', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
    
        </div>
      </div>
    </div>
  );
}
