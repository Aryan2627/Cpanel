
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Apply Allocations</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Assign available licenses to users or departments.</p>
        
  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px' }}>1. Select License</h2>
      <select style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '16px', backgroundColor: '#fff' }}>
        <option>Office 365 E5 (20 available)</option>
        <option>Adobe Photoshop (5 available)</option>
      </select>
    </div>
    
    <div style={{ flex: 1, minWidth: '300px' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '16px' }}>2. Select Target</h2>
      <select style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '24px', backgroundColor: '#fff' }}>
        <option>Engineering Department</option>
        <option>Marketing Department</option>
      </select>
    </div>
  </div>
  <button style={{ padding: '12px 32px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Assign License</button>
  
      </div>
    </div>
  );
}
