
'use client';
import React from 'react';
import { Sparkles, TrendingDown } from 'lucide-react';

export default function Recommendations() {
  const recs = [
    { title: 'Reclaim Inactive Adobe Licenses', desc: '42 users have not logged into Creative Cloud in over 90 days.', savings: '$35,000/yr' },
    { title: 'Consolidate Zoom to Teams', desc: 'You are paying for Zoom Pro but have Microsoft Teams included in E5.', savings: '$12,400/yr' },
    { title: 'Downgrade Salesforce Tiers', desc: '15 users have "Enterprise" but only use "Professional" features.', savings: '$8,200/yr' },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Sparkles size={32} color="#8b5cf6" />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Cost Recommendations</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {recs.map((rec, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.2rem' }}>{rec.title}</h3>
              <p style={{ margin: 0, color: '#64748b' }}>{rec.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingDown size={14} /> Est. Savings</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{rec.savings}</div>
              </div>
              <button style={{ padding: '10px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Execute Action</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
