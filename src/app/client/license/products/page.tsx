
'use client';
import React from 'react';
import { Box, Search, Filter } from 'lucide-react';

export default function ProductSummary() {
  const products = [
    { name: 'Creative Cloud All Apps', publisher: 'Adobe', type: 'Subscription', total: 450, used: 432, cost: '$85.99/mo' },
    { name: 'Office 365 E5', publisher: 'Microsoft', type: 'Subscription', total: 2000, used: 1980, cost: '$38.00/mo' },
    { name: 'Sales Cloud Enterprise', publisher: 'Salesforce', type: 'Subscription', total: 300, used: 250, cost: '$150.00/mo' },
    { name: 'AutoCAD 2024', publisher: 'Autodesk', type: 'Perpetual', total: 50, used: 55, cost: '$1,865/yr' }, // Overutilized
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Product Summary</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Analyze consumption metrics by specific software product.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '10px', left: '12px' }} />
            <input type="text" placeholder="Search products..." style={{ padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '250px' }} />
          </div>
          <button style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}>
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Product Name</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Publisher</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Utilization</th>
              <th style={{ padding: '16px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const utilPct = Math.round((p.used / p.total) * 100);
              const isOver = utilPct > 100;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, color: '#0f172a' }}>
                    <Box size={20} color="#3b82f6" /> {p.name}
                  </td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{p.publisher}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ color: isOver ? '#ef4444' : '#334155', fontWeight: 600 }}>{p.used} / {p.total} Seats</span>
                      <span style={{ color: isOver ? '#ef4444' : '#64748b' }}>{utilPct}%</span>
                    </div>
                    <div style={{ width: '200px', backgroundColor: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(utilPct, 100)}%`, backgroundColor: isOver ? '#ef4444' : '#10b981', height: '100%' }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: '#0f172a' }}>{p.cost}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
