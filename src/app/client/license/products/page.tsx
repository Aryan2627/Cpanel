
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Product Summary</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Review software utilization by product.</p>
        
  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
    <thead>
      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Product Name</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Publisher</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Seats Used</th>
        <th style={{ padding: '16px 8px', fontWeight: 500, color: '#6b7280' }}>Total Seats</th>
      </tr>
    </thead>
    <tbody>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Creative Cloud All Apps</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Adobe</td>
        <td style={{ padding: '16px 8px' }}>432</td>
        <td style={{ padding: '16px 8px' }}>450</td>
      </tr>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Office 365 E5</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Microsoft</td>
        <td style={{ padding: '16px 8px' }}>1980</td>
        <td style={{ padding: '16px 8px' }}>2000</td>
      </tr>
      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
        <td style={{ padding: '16px 8px' }}>Sales Cloud Enterprise</td>
        <td style={{ padding: '16px 8px', color: '#6b7280' }}>Salesforce</td>
        <td style={{ padding: '16px 8px' }}>250</td>
        <td style={{ padding: '16px 8px' }}>300</td>
      </tr>
    </tbody>
  </table>
  
      </div>
    </div>
  );
}
