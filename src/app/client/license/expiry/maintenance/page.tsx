
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Maintenance Expiry</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Upcoming support and maintenance cutoffs.</p>
        
  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
    <li style={{ padding: '24px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Oracle Database Enterprise</div>
        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Support contract expires soon.</div>
      </div>
      <div style={{ color: '#dc2626', fontWeight: 500, textAlign: 'right' }}>
        Nov 15, 2026<br/><span style={{ fontSize: '0.85rem' }}>12 Days</span>
      </div>
    </li>
    <li style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>VMware vSphere Standard</div>
        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Maintenance expires soon.</div>
      </div>
      <div style={{ color: '#d97706', fontWeight: 500, textAlign: 'right' }}>
        Dec 18, 2026<br/><span style={{ fontSize: '0.85rem' }}>45 Days</span>
      </div>
    </li>
  </ul>
  
      </div>
    </div>
  );
}
