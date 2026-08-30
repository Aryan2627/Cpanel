
'use client';
import React from 'react';
import { FileText } from 'lucide-react';

export default function ContractExpiry() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Contract Expiry</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {['Next 30 Days', '30-90 Days', '90+ Days'].map(col => (
          <div key={col} style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#475569' }}>{col}</h3>
            {col === 'Next 30 Days' && (
              <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><FileText size={16} /> Microsoft Enterprise Agreement</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>MSA-2023-991 • Expires Nov 30</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
