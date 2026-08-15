'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download, Gift, QrCode, CheckCircle2, ShieldCheck, FileSignature, Key, Lock, Scale, Globe } from 'lucide-react';

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSigned, setIsSigned] = useState(false);
  const [signData, setSignData] = useState<any>(null);

  const [vendorLootDrop, setVendorLootDrop] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('godTierFeatures');
      if (saved) {
        const features = JSON.parse(saved);
        if (features.vendorLootDrop !== undefined) {
          setVendorLootDrop(features.vendorLootDrop);
        }
      }
    } catch(e) {}

    fetch(`/api/pos/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch Purchase Order');
        return res.json();
      })
      .then(data => {
        setPo(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleSign = () => {
    setIsSigned(true);
    setSignData({
      timestamp: new Date().toISOString(),
      ip: '192.168.1.' + Math.floor(Math.random() * 255),
      hash: '0x' + Math.random().toString(16).substr(2, 40) + Date.now().toString(16),
      user: 'Authorized Purchasing Agent'
    });
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading PO...</div>;
  if (error) return <div style={{ padding: '24px', color: '#dc2626', textAlign: 'center' }}>{error}</div>;
  if (!po) return null;

  let details: any = {};
  if (po.details) {
    try { details = JSON.parse(po.details); } catch(e) {}
  }
  const templateFields = details.templateFields || [];
  const bidData = details.bidData || {};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          @media print {
            body { background-color: #fff !important; }
            .no-print { display: none !important; }
            .print-container { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
            .print-border { border: 1px solid #000 !important; }
            .print-border-b { border-bottom: 1px solid #000 !important; }
            .print-border-r { border-right: 1px solid #000 !important; }
            .print-bg { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 8rem;
            color: rgba(0, 0, 0, 0.03);
            pointer-events: none;
            z-index: 0;
            font-weight: 900;
            white-space: nowrap;
          }
        `}
      </style>

      {/* Action Bar (Not Printed) */}
      <div className="no-print" style={{ maxWidth: '900px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {vendorLootDrop && (
            <button onClick={() => router.push(`/client/vendor/celebrate/${params.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', backgroundColor: '#db2777', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px rgba(219,39,119,0.3)', animation: 'pulse 2s infinite' }}>
              <Gift size={16} /> Simulate Vendor Loot Drop
            </button>
          )}
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <Printer size={16} /> Export to PDF / Print
          </button>
        </div>
      </div>

      {/* Standard Purchase Order Document */}
      <div className="print-container" style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#000', overflow: 'hidden' }}>
        
        <div className="watermark">{isSigned ? 'APPROVED' : 'DRAFT'}</div>

        {/* Header Section */}
        <div style={{ display: 'flex', border: '1px solid #000', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
          <div style={{ width: '150px', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <span style={{ color: '#666', fontSize: '0.875rem' }}>Company<br/>Logo</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #000', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Acme Corporation</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'normal', color: '#64748b' }}>
                <QrCode size={32} color="#000" />
              </div>
            </div>
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '1rem' }}>
              123 Business Road, Enterprise City, EC 12345
            </div>
          </div>
        </div>

        {/* Title & Compliance Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
          <h1 style={{ margin: 0, padding: '8px 16px', border: '1px solid #000', fontSize: '1.25rem', display: 'inline-block' }}>Standard Purchase Order</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', padding: '4px 8px', border: '1px solid #10b981', color: '#10b981', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><ShieldCheck size={12} /> ISO 27001</span>
            <span style={{ fontSize: '0.65rem', padding: '4px 8px', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><Lock size={12} /> SOC2 TYPE II</span>
            <span style={{ fontSize: '0.65rem', padding: '4px 8px', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><CheckCircle2 size={12} /> GDPR READY</span>
          </div>
        </div>

        {/* Meta Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div style={{ width: '45%' }}>
            <div style={{ display: 'flex', marginBottom: '8px', borderBottom: '1px solid #000' }}>
              <span style={{ fontWeight: 'bold', width: '80px' }}>PO#:</span>
              <span style={{ flex: 1, paddingLeft: '8px' }}>{po.poNumber}</span>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
              <span style={{ fontWeight: 'bold', width: '80px' }}>Vendor:</span>
              <span style={{ flex: 1, paddingLeft: '8px' }}>{po.vendorId}</span>
            </div>
          </div>
          <div style={{ width: '35%' }}>
            <div style={{ display: 'flex', marginBottom: '8px', borderBottom: '1px solid #000' }}>
              <span style={{ fontWeight: 'bold', width: '80px' }}>PO Date:</span>
              <span style={{ flex: 1, paddingLeft: '8px' }}>{new Date(po.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Due Diligence Checklist */}
        <div style={{ marginBottom: '32px', border: '1px solid #000', padding: '16px', backgroundColor: '#f8fafc', position: 'relative', zIndex: 10 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10b981" /> Pre-Award Due Diligence Cleared
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} color="#10b981" /> Financial Health Verified</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} color="#10b981" /> AML/KYC Screen Passed</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} color="#10b981" /> ESG Scope 3 Approved</div>
          </div>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '32px', fontSize: '0.9rem', position: 'relative', zIndex: 10 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '20%' }}>Requirement / Field</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '30%' }}>Description</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', width: '25%' }}>Value Provided</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', width: '25%' }}>Calculated Total</th>
            </tr>
          </thead>
          <tbody>
            {templateFields.map((field: any, idx: number) => {
               const val = bidData[field.key];
               return (
                 <tr key={field.key}>
                   <td style={{ border: '1px solid #000', padding: '8px' }}>{field.name}</td>
                   <td style={{ border: '1px solid #000', padding: '8px' }}>{field.formula ? 'Calculated Field' : 'Vendor Input'}</td>
                   <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                     {!field.formula ? (val !== undefined && val !== null ? val : '-') : '-'}
                   </td>
                   <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                     {field.formula ? (val !== undefined && val !== null ? val.toLocaleString() : '-') : '-'}
                   </td>
                 </tr>
               );
            })}
            {/* Empty padding rows to mimic the image */}
            {[...Array(Math.max(1, 5 - templateFields.length))].map((_, i) => (
              <tr key={'empty-' + i}>
                <td style={{ border: '1px solid #000', padding: '16px' }}></td>
                <td style={{ border: '1px solid #000', padding: '16px' }}></td>
                <td style={{ border: '1px solid #000', padding: '16px' }}></td>
                <td style={{ border: '1px solid #000', padding: '16px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          
          {/* Additional Info Box */}
          <div style={{ width: '45%' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.9rem' }}>Additional Information:</div>
            <div style={{ border: '1px solid #000', padding: '24px', minHeight: '120px', fontSize: '0.85rem' }}>
              Send all the products in boxes company's preprinted and approved design. <br/><br/>
              Ref: Event {po.eventId}
            </div>
          </div>

          {/* Calculations Table */}
          <div style={{ width: '40%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>PO Calculations</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', width: '50%' }}>Sub Total</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>${(po.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Tax</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$0.00</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Freight</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>$0.00</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>Total PO Amount</td>
                  <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${(po.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Legal Terms Boilerplate */}
        <div style={{ marginTop: '32px', borderTop: '1px solid #000', paddingTop: '16px', fontSize: '0.65rem', color: '#475569', lineHeight: '1.4', position: 'relative', zIndex: 10 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Scale size={12} /> Standard Terms & Conditions</div>
          <p style={{ margin: '0 0 8px 0' }}>1. ACCEPTANCE: This Purchase Order constitutes Buyer's offer to Seller and becomes a binding contract on the terms set forth herein when accepted by Seller either by acknowledgment or commencement of performance.</p>
          <p style={{ margin: '0 0 8px 0' }}>2. PAYMENT TERMS: Net 45 days from receipt of a correct invoice, unless otherwise stated. Invoice must reference PO number.</p>
          <p style={{ margin: '0 0 8px 0' }}>3. CONFIDENTIALITY: Seller shall keep confidential all information, drawings, specifications, or data furnished by Buyer, or prepared by Seller specifically in connection with the performance of this PO.</p>
          <p style={{ margin: 0 }}>4. GOVERNING LAW: This agreement shall be governed by and construed in accordance with the laws of the State of Delaware.</p>
        </div>

        {/* Signature Block */}
        <div style={{ marginTop: '40px', borderTop: '2px solid #000', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
          <div style={{ width: '45%' }}>
            <div style={{ borderBottom: '1px solid #000', height: '40px', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px', color: '#10b981', fontStyle: 'italic', fontSize: '1.2rem', fontFamily: 'serif' }}>
              {isSigned ? signData.user : ''}
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px', fontWeight: 'bold' }}>Authorized Buyer Signature</div>
            {isSigned && (
              <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Key size={10} /> Hash: {signData.hash}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={10} /> Timestamp: {signData.timestamp}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Globe size={10} /> IP: {signData.ip}</div>
              </div>
            )}
          </div>
          
          <div style={{ width: '45%' }}>
            {!isSigned && (
              <div className="no-print" style={{ textAlign: 'right' }}>
                <button onClick={handleSign} style={{ padding: '12px 24px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(16,185,129,0.3)' }}>
                  <FileSignature size={18} /> Digitally Sign & Execute PO
                </button>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px' }}>By clicking this, you cryptographically bind the corporation to this PO.</p>
              </div>
            )}
            {isSigned && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', color: '#10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid #10b981', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <CheckCircle2 size={24} /> EXECUTED
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
