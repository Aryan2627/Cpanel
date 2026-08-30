
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Support SLAs</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Upcoming expirations for your dedicated ProcGen support tiers.</p>
        
  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
    <li style={{ padding: '24px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>ProcGen Premium 24/7 Support SLA</div>
        <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Your dedicated account manager SLA is expiring.</div>
      </div>
      <div style={{ color: '#dc2626', fontWeight: 500, textAlign: 'right' }}>
        Renew By: Nov 15, 2026<br/><span style={{ fontSize: '0.85rem' }}>12 Days</span>
      </div>
    </li>
  </ul>
  
      </div>
    </div>
  );
}
