
'use client';
import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 8px 0' }}>Assigned User Seats</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', margin: '0 0 40px 0' }}>Search and manage which employees have access to specific ProcGen modules.</p>
        
  <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
    <input type="text" placeholder="Search by employee name or email..." style={{ flex: 1, padding: '12px 16px', fontSize: '1rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
    <button style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', cursor: 'pointer' }}>Search Directory</button>
  </div>
  <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
    Search above to load the user directory and their module assignments.
  </div>
  
      </div>
    </div>
  );
}
