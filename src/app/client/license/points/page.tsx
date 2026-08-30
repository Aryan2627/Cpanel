
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Points Rule Sets</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Manage custom licensing metrics and calculations.</p>
        
  <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', marginBottom: '32px', maxWidth: '600px' }}>
    Use this section to configure complex calculation metrics like IBM PVU or Oracle Core Factors. Select a publisher to load their default rule templates.
  </p>
  <button style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Create Rule Set</button>
  
      </div>
    </div>
  );
}
