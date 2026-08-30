
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>License Summary</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>A clear, high-level overview of your software assets.</p>
        
  <div style={{ display: 'flex', gap: '32px', marginBottom: '48px', flexWrap: 'wrap' }}>
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>$2.4M</div>
    </div>
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Licenses</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>14,204</div>
    </div>
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Under-utilized</div>
      <div style={{ fontSize: '2.5rem', fontWeight: 300 }}>$184k</div>
    </div>
  </div>

  <h2 style={{ fontSize: '1.2rem', fontWeight: 500, borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '24px' }}>Recent Activity</h2>
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '1rem', color: '#374151', lineHeight: '2' }}>
    <li style={{ padding: '8px 0' }}>• 50 new Adobe CC licenses allocated to Marketing.</li>
    <li style={{ padding: '8px 0' }}>• Oracle DB maintenance expires in 12 days.</li>
    <li style={{ padding: '8px 0' }}>• Microsoft Enterprise Agreement renewal finalized.</li>
  </ul>
  
      </div>
    </div>
  );
}
