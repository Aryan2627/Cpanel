
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Publisher Summary</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Manage your top software vendors.</p>
        
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Microsoft Corporation</div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tier 1 Vendor</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.2rem' }}>$1.2M Spend</div>
        <div style={{ color: '#059669', fontSize: '0.9rem' }}>Compliant</div>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Oracle</div>
        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tier 1 Vendor</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1.2rem' }}>$850K Spend</div>
        <div style={{ color: '#dc2626', fontSize: '0.9rem' }}>Audit Risk</div>
      </div>
    </div>
  </div>
  
      </div>
    </div>
  );
}
