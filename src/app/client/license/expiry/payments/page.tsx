
'use client';
import React from 'react';
import { CreditCard } from 'lucide-react';

export default function PaymentsDue() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Licenses with Payments Due</h1>
      
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Invoice ID</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Publisher</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569' }}>Due Date</th>
              <th style={{ padding: '16px', textAlign: 'right', color: '#475569' }}>Amount</th>
              <th style={{ padding: '16px', textAlign: 'center', color: '#475569' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '16px', fontWeight: 500 }}><CreditCard size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }}/>INV-8832</td>
              <td style={{ padding: '16px' }}>Salesforce</td>
              <td style={{ padding: '16px', color: '#ef4444', fontWeight: 600 }}>Nov 15, 2026</td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>$14,500.00</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>
                <button style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Generate PO</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
