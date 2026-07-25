'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorContractsDashboard() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const vendorId = 'vendor-mock-id'; // In real app, from auth session

  useEffect(() => {
    fetch(`/api/contracts?vendorId=${vendorId}`)
      .then(res => res.json())
      .then(data => setContracts(data))
      .catch(err => console.error('Error fetching contracts:', err));
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Sidebar - Glassmorphism */}
      <aside style={{ width: '280px', flexShrink: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>V</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>Vendor Portal</div>
        </div>
        <ul style={{ listStyle: 'none', padding: '0 16px', margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li><Link href="/vendor" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px' }}>Dashboard</Link></li>
          <li><Link href="/vendor/events" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px' }}>Active RFQs</Link></li>
          <li><Link href="#" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px' }}>My Bids</Link></li>
          <li><Link href="#" style={{ display: 'block', padding: '12px 16px', color: '#94a3b8', textDecoration: 'none', borderRadius: '8px' }}>Purchase Orders</Link></li>
          <li><Link href="/vendor/contracts" style={{ display: 'block', padding: '12px 16px', color: '#fff', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', textDecoration: 'none', borderRadius: '8px' }}>Contracts</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>My Contracts</h1>
          <p style={{ color: '#94a3b8', margin: '0 0 40px 0', fontSize: '1.05rem' }}>Review, negotiate, and sign contracts awarded to you.</p>

          <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Contract ID</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Title</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Total Value</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>No contracts assigned to you yet.</td></tr>
                ) : (
                  contracts.map(contract => (
                    <tr key={contract.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <Link href={`/vendor/contracts/${contract.id}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
                          {contract.id.substring(0,8).toUpperCase()}
                        </Link>
                      </td>
                      <td style={{ padding: '16px 24px', fontWeight: '500' }}>{contract.title}</td>
                      <td style={{ padding: '16px 24px' }}>${contract.total.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                          background: contract.status === 'Signed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: contract.status === 'Signed' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${contract.status === 'Signed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {contract.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <button 
                          onClick={() => router.push(`/vendor/contracts/${contract.id}`)}
                          style={{ 
                            padding: '8px 16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                          }}
                        >
                          {contract.status === 'Signed' ? 'View' : 'Review & Sign'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
