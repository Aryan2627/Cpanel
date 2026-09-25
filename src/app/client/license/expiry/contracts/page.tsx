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
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0', color: '#0f172a' }}>Contract Expiry</h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 40px 0' }}>Master service agreements and legal contract expiration dates.</p>
        
        <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <div>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Master Service Agreement</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0f172a' }}>ProcGen Global EULA</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Expiration Date</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ef4444' }}>{features.contract_expiry || 'No Expiry Set'}</div>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>If your contract is nearing expiration, please contact your account representative to initiate the renewal process to prevent service disruption.</p>
    
        </div>
      </div>
    </div>
  );
}
