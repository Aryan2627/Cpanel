
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Contract Expiry</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Master Service Agreements (MSAs) expiring soon.</p>
        
  <div style={{ padding: '24px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
    <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '1.1rem' }}>Microsoft Enterprise Agreement</h3>
    <div style={{ color: '#7f1d1d', marginBottom: '16px' }}>MSA-2023-991 • Expires Nov 30 (Next 30 Days)</div>
    <button style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Review Contract</button>
  </div>
  
      </div>
    </div>
  );
}
