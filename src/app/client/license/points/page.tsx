
'use client';
import React from 'react';
import { Settings2 } from 'lucide-react';

export default function PointsRuleSets() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Points Rule Sets</h1>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', maxWidth: '600px' }}>
        <Settings2 size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
        <h2>Metric Configuration Engine</h2>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>Configure complex licensing metrics such as IBM Processor Value Units (PVU), Oracle Core Factors, or Microsoft CAL multiplexing rules.</p>
        <button style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>+ Create New Rule Set</button>
      </div>
    </div>
  );
}
