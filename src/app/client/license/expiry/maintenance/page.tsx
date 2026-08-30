
'use client';
import React from 'react';
import { Wrench } from 'lucide-react';

export default function MaintenanceExpiry() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>License & Maintenance Expiry</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Track support cutoffs for perpetual software.</p>
      
      <div style={{ borderLeft: '4px solid #e2e8f0', marginLeft: '24px', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
         <div style={{ position: 'relative' }}>
           <div style={{ position: 'absolute', left: '-42px', top: '0', backgroundColor: '#ef4444', color: '#fff', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wrench size={16} /></div>
           <h3 style={{ margin: '0 0 4px 0' }}>Oracle Database Enterprise - Support Expiring</h3>
           <p style={{ margin: 0, color: '#ef4444', fontWeight: 600 }}>Expires in 12 Days (Nov 15, 2026)</p>
         </div>
         <div style={{ position: 'relative' }}>
           <div style={{ position: 'absolute', left: '-42px', top: '0', backgroundColor: '#f59e0b', color: '#fff', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wrench size={16} /></div>
           <h3 style={{ margin: '0 0 4px 0' }}>VMware vSphere Standard - Maintenance</h3>
           <p style={{ margin: 0, color: '#f59e0b', fontWeight: 600 }}>Expires in 45 Days (Dec 18, 2026)</p>
         </div>
      </div>
    </div>
  );
}
