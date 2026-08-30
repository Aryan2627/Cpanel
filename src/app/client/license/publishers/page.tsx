
'use client';
import React from 'react';
import { Building2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function PublisherSummary() {
  const publishers = [
    { name: 'Microsoft Corporation', tier: 'Tier 1', spend: '$1.2M', compliance: 'Compliant', risk: 'Low' },
    { name: 'Oracle', tier: 'Tier 1', spend: '$850K', compliance: 'Audit Risk', risk: 'High' },
    { name: 'Adobe Systems', tier: 'Tier 2', spend: '$320K', compliance: 'Compliant', risk: 'Low' },
    { name: 'Atlassian', tier: 'Tier 2', spend: '$150K', compliance: 'Under-Licensed', risk: 'Medium' },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '32px' }}>Publisher Summary</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {publishers.map((pub, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px' }}><Building2 size={24} color="#475569" /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{pub.name}</h3>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>{pub.tier}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Annual Spend</div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{pub.spend}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Compliance</div>
                <div style={{ fontWeight: 600, color: pub.risk === 'High' ? '#ef4444' : pub.risk === 'Medium' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {pub.risk === 'Low' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />} {pub.compliance}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
