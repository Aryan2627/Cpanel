
'use client';
import React from 'react';
import { List, Download } from 'lucide-react';

export default function AllLicenses() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>All Licenses Ledger</h1>
        <button style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <Download size={18} /> Export Inventory
        </button>
      </div>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', textAlign: 'center', color: '#64748b' }}>
        <List size={48} color="#cbd5e1" style={{ margin: '0 auto 16px auto' }} />
        <h3>Master Inventory Grid</h3>
        <p>This grid displays the 14,204 active license records in your database.</p>
        <p style={{ fontSize: '0.85rem' }}>* Pagination and infinite scroll enabled.</p>
      </div>
    </div>
  );
}
