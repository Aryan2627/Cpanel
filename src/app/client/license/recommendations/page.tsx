
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Recommended Changes</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Simple, actionable cost-saving recommendations.</p>
        
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '4px' }}>Reclaim Inactive Adobe Licenses</div>
        <div style={{ color: '#6b7280' }}>42 users have not logged into Creative Cloud in 90 days.</div>
      </div>
      <button style={{ padding: '10px 20px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>Reclaim (Save $35k)</button>
    </div>

    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '4px' }}>Consolidate Zoom to Teams</div>
        <div style={{ color: '#6b7280' }}>You pay for Zoom Pro but have Teams included in E5.</div>
      </div>
      <button style={{ padding: '10px 20px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>Cancel Zoom (Save $12k)</button>
    </div>
  </div>
  
      </div>
    </div>
  );
}
