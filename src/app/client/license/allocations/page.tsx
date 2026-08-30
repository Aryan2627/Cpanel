
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Allocate Module Access</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Grant or revoke access to premium ProcGen features for specific teams.</p>
        
  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px' }}>1. Select ProcGen Module</h2>
      <select style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '16px', backgroundColor: '#fff' }}>
        <option>AI Negotiator Add-on (10 seats available)</option>
        <option>Procurement Core Seat (8 seats available)</option>
      </select>
    </div>
    
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px' }}>2. Select Target User / Department</h2>
      <select style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '24px', backgroundColor: '#fff' }}>
        <option>Software Engineering Department</option>
        <option>Hardware Procurement Team</option>
      </select>
    </div>
  </div>
  <button style={{ padding: '12px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Grant Access</button>
  
      </div>
    </div>
  );
}
