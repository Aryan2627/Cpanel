'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ContractEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contracts/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setContract(data);
        setContent(data.content);
        setLoading(false);
      });
  }, [params.id]);

  const saveContract = async () => {
    const res = await fetch(`/api/contracts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, status: 'Negotiating' })
    });
    if (res.ok) {
      alert('Contract changes saved!');
      const data = await res.json();
      setContract(data);
    }
  };

  const signContract = async () => {
    if (!window.confirm("Are you sure you want to sign this contract? This action cannot be undone.")) return;
    
    const res = await fetch(`/api/contracts/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSigned: true })
    });
    if (res.ok) {
      alert('You have successfully signed the contract!');
      const data = await res.json();
      setContract(data);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!contract) return <div>Contract not found</div>;

  const isSigned = contract.status === 'Signed';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{contract.title || 'Contract Agreement'}</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Negotiate and sign this document.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className={`status-badge status-${contract.status.toLowerCase().replace(' ', '-')}`}>
            {contract.status}
          </span>
          <button onClick={() => router.push('/client/contracts')} className="btn-secondary">Back</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        <div className="surface" style={{ padding: '0' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '600' }}>
            Document Editor
          </div>
          <div style={{ padding: '24px' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSigned}
              style={{
                width: '100%',
                minHeight: '600px',
                padding: '24px',
                fontFamily: 'monospace',
                fontSize: '1rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                lineHeight: '1.6',
                resize: 'vertical',
                backgroundColor: isSigned ? '#f1f5f9' : '#ffffff'
              }}
            />
          </div>
        </div>

        <div className="surface" style={{ alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>Signatures</h3>
          
          <div style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: contract.clientSigned ? '#f0fdf4' : '#fff' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Client (You)</div>
            <div style={{ fontSize: '0.9rem', color: contract.clientSigned ? '#16a34a' : '#94a3b8' }}>
              {contract.clientSigned ? '✓ Signed' : 'Pending Signature'}
            </div>
          </div>

          <div style={{ marginBottom: '24px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: contract.vendorSigned ? '#f0fdf4' : '#fff' }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>Vendor: {contract.vendorName}</div>
            <div style={{ fontSize: '0.9rem', color: contract.vendorSigned ? '#16a34a' : '#94a3b8' }}>
              {contract.vendorSigned ? '✓ Signed' : 'Pending Signature'}
            </div>
          </div>

          {!isSigned && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn-secondary" 
                onClick={saveContract}
                style={{ width: '100%' }}
              >
                Save Draft
              </button>
              {!contract.clientSigned && (
                <button 
                  className="btn-primary" 
                  onClick={signContract}
                  style={{ width: '100%', backgroundColor: '#16a34a' }}
                >
                  Sign Document
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
