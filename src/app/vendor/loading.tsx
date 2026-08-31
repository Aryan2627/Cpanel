import React from 'react';

export default function Loading() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%', 
      height: '100%', 
      minHeight: '80vh',
      padding: '32px',
      gap: '24px',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      backgroundColor: '#020617' // Vendor dark theme
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
      
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ height: '36px', width: '250px', backgroundColor: '#1e293b', borderRadius: '8px' }}></div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ height: '40px', width: '120px', backgroundColor: '#1e293b', borderRadius: '8px' }}></div>
          <div style={{ height: '40px', width: '120px', backgroundColor: '#1e293b', borderRadius: '8px' }}></div>
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '120px', backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}></div>
        ))}
      </div>

      {/* Main Table/Content Skeleton */}
      <div style={{ flex: 1, backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', padding: '24px' }}>
        <div style={{ height: '24px', width: '200px', backgroundColor: '#1e293b', borderRadius: '4px', marginBottom: '32px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ height: '60px', width: '100%', backgroundColor: '#1e293b', borderRadius: '8px' }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
