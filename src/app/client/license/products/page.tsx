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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>Product Summary</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>Overview of ProcGen software products provisioned to your organization.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Enabled Modules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            {['cortex_ai', 's2p', 'advanced_analytics', 'vendor_portal', 'contract_analyzer', 'erp_integration', 'supplier_risk_scoring', 'license_manager'].map(mod => (
              features[mod] ? (
                <div key={mod} style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontWeight: 600, color: '#334155' }}>{mod.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                </div>
              ) : null
            ))}
          </div>
    
        </div>
      </div>
    </div>
  );
}
