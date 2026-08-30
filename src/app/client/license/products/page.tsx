
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>ProcGen Modules</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Review the specific ProcGen platform modules your organization has licensed.</p>
        
  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
    <thead>
      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Module Name</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Access Level</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Seats Used</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Total Seats</th>
      </tr>
    </thead>
    <tbody>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Procurement Core</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Full Access</td>
        <td style={{ padding: '16px 8px' }}>142</td>
        <td style={{ padding: '16px 8px' }}>150</td>
      </tr>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>AI Negotiator Add-on</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Premium</td>
        <td style={{ padding: '16px 8px' }}>15</td>
        <td style={{ padding: '16px 8px' }}>25</td>
      </tr>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>ERP Sync (C-Panel)</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>API Only</td>
        <td style={{ padding: '16px 8px' }}>Unlimited</td>
        <td style={{ padding: '16px 8px' }}>Unlimited</td>
      </tr>
    </tbody>
  </table>
  
      </div>
    </div>
  );
}
