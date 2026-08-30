
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>API & Token Consumption</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Track your usage of AI tokens, document processing credits, and API calls.</p>
        
  <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#374151', marginBottom: '32px', maxWidth: '600px' }}>
    ProcGen Enterprise includes 1,000,000 AI Negotiation tokens and 50,000 OCR document scans per month. Use this dashboard to monitor consumption and configure overage limits.
  </p>
  <button style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Configure Overage Rules</button>
  
      </div>
    </div>
  );
}
