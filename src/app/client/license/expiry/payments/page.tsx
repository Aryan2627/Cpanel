
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>ProcGen Invoices Due</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Upcoming renewal payments for your ProcGen software platform.</p>
        
  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
    <thead>
      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Invoice</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Service</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Due Date</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280', textAlign: 'right' }}>Amount</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280', textAlign: 'right' }}>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style={{ padding: '16px 8px' }}>INV-PROC-8832</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>ProcGen Enterprise Annual Renewal</td>
        <td style={{ padding: '16px 8px', color: '#dc2626' }}>Nov 15, 2026</td>
        <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 500 }}>$12,500.00</td>
        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
          <button style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>Generate PO</button>
        </td>
      </tr>
    </tbody>
  </table>
  
      </div>
    </div>
  );
}
