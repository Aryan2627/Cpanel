'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VendorContractEditor({ params }: { params: { id: string } }) {
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
      body: JSON.stringify({ vendorSigned: true })
    });
    if (res.ok) {
      alert('You have successfully signed the contract!');
      const data = await res.json();
      setContract(data);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Loading...</div>;
  if (!contract) return <div style={{ color: '#fff', padding: '40px' }}>Contract not found</div>;

  const isSigned = contract.status === 'Signed';

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <Link href="/vendor/contracts" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '8px', display: 'inline-block' }}>&larr; Back to Contracts</Link>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{contract.title || 'Contract Agreement'}</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem' }}>Review and sign this document with the client.</p>
            </div>
            <div>
              <span style={{ 
                padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600',
                background: contract.status === 'Signed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: contract.status === 'Signed' ? '#34d399' : '#fbbf24',
                border: `1px solid ${contract.status === 'Signed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
              }}>
                {contract.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
            {/* Editor Area */}
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', color: '#f8fafc', fontWeight: '600' }}>
                Document Editor
              </div>
              <div style={{ padding: '24px' }}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isSigned}
                  style={{
                    width: '100%', minHeight: '600px', padding: '24px', fontFamily: 'monospace',
                    fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                    lineHeight: '1.6', resize: 'vertical',
                    backgroundColor: isSigned ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.02)',
                    color: '#e2e8f0', outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Signature Area */}
            <div style={{ alignSelf: 'start', background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fff', marginBottom: '24px', marginTop: 0 }}>Signatures</h3>
              
              <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid', borderColor: contract.clientSigned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: contract.clientSigned ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>Client (ProcGen Buyer)</div>
                <div style={{ fontSize: '0.9rem', color: contract.clientSigned ? '#34d399' : '#94a3b8' }}>
                  {contract.clientSigned ? '✓ Signed' : 'Pending Signature'}
                </div>
              </div>

              <div style={{ marginBottom: '32px', padding: '16px', border: '1px solid', borderColor: contract.vendorSigned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', backgroundColor: contract.vendorSigned ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>Vendor (You)</div>
                <div style={{ fontSize: '0.9rem', color: contract.vendorSigned ? '#34d399' : '#94a3b8' }}>
                  {contract.vendorSigned ? '✓ Signed' : 'Pending Signature'}
                </div>
              </div>

              {!isSigned && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <button 
                    onClick={saveContract}
                    style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#f8fafc', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Save Draft
                  </button>
                  {!contract.vendorSigned && (
                    <button 
                      onClick={signContract}
                      style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                      Sign Document
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
