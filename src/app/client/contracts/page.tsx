'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContractsDashboard() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => setContracts(data))
      .catch(err => console.error('Error fetching contracts:', err));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contracts</h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Manage and negotiate active contracts.</p>
      </div>

      <div className="surface">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contract ID</th>
                <th>Title</th>
                <th>Vendor</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>No contracts found.</td></tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.id}>
                    <td>
                      <Link href={`/client/contracts/${contract.id}`} style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>
                        {contract.id.substring(0,8).toUpperCase()}
                      </Link>
                    </td>
                    <td>{contract.title || 'Untitled Contract'}</td>
                    <td>{contract.vendorName || 'Unknown Vendor'}</td>
                    <td>${contract.total.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${contract.status.toLowerCase().replace(' ', '-')}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => router.push(`/client/contracts/${contract.id}`)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        {contract.status === 'Signed' ? 'View' : 'Negotiate & Sign'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
