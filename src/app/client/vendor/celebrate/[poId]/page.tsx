'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Download, ArrowLeft, FileText } from 'lucide-react';

export default function VendorLootDropPage() {
  const params = useParams();
  const router = useRouter();
  
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pos/${params.poId}`)
      .then(res => res.json())
      .then(data => {
        setPo(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  }, [params.poId]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#64748b' }}>Loading Purchase Order...</div>;
  }

  if (!po) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#64748b' }}>Purchase Order Not Found.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#0f172a', fontFamily: 'Inter, sans-serif', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Back Button */}
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '24px' }}>
        <button onClick={() => router.back()} style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569', padding: '10px 20px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
          <ArrowLeft size={18} /> Return to Dashboard
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 12px 0', color: '#0f172a' }}>
          Contract Awarded
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Congratulations! The client has selected you for this project. Review your Purchase Order below.
        </p>
      </div>

      {/* Standard Card Container */}
      <div style={{ width: '100%', maxWidth: '800px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Card Content */}
        <div style={{ padding: '40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Official PO</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{po.poNumber}</div>
            </div>
            <div style={{ padding: '12px 20px', background: '#ecfdf5', color: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <Check size={20} strokeWidth={3} /> Awarded
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>Client</div>
              <div style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 500 }}>Acme Corporation</div>
            </div>
            
            <div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>Event Source</div>
              <div style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 500 }}>Event ID: {po.eventId}</div>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>Total Contract Value</div>
            <div style={{ fontSize: '3rem', fontWeight: 700, color: '#15803d' }}>
              ${Number(po.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
        <button style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Accept & Sign Contract
        </button>
        <button style={{ padding: '12px 24px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export PDF
        </button>
      </div>

    </div>
  );
}
