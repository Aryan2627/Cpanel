
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Seat Optimization</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Actionable recommendations to optimize your ProcGen platform usage.</p>
        
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '4px' }}>Reclaim AI Negotiator Seats</div>
        <div style={{ color: '#6b7280' }}>5 buyers have not used the AI Negotiation feature in 60 days.</div>
      </div>
      <button style={{ padding: '10px 20px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>Reclaim (Free up 5 seats)</button>
    </div>

    <div style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '4px' }}>Downgrade Inactive Users</div>
        <div style={{ color: '#6b7280' }}>12 users have read-only habits and can be downgraded to "Viewer" seats.</div>
      </div>
      <button style={{ padding: '10px 20px', backgroundColor: '#f9fafb', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}>Downgrade Users</button>
    </div>
  </div>
  
      </div>
    </div>
  );
}
