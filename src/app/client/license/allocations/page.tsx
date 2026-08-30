
'use client';
import React from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';

export default function Allocations() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Apply Allocations & Exemptions</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '16px', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Available Pool</h3>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>Office 365 E5 (20 seats available)</div>
          <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}>Adobe Photoshop (5 seats available)</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button style={{ width: '48px', height: '48px', borderRadius: '24px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowRightLeft size={24} />
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Target Users / Groups</h3>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
             <Users size={20} color="#64748b" /> Engineering Dept
          </div>
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' }}>
             <Users size={20} color="#64748b" /> Marketing Dept
          </div>
        </div>
      </div>
    </div>
  );
}
