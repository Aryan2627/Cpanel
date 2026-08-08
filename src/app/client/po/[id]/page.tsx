'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download } from 'lucide-react';

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        `}
      </style>

      {/* Action Bar (Not Printed) */}
      <div className="no-print" style={{ maxWidth: '900px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          <Printer size={16} /> Export to PDF / Print
        </button>
      </div>

      {/* Standard Purchase Order Document */}
      <div className="print-container" style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#000' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', border: '1px solid #000', marginBottom: '24px' }}>
          <div style={{ width: '150px', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <span style={{ color: '#666', fontSize: '0.875rem' }}>Company<br/>Logo</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #000', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
              Acme Corporation
            </div>
            <div style={{ padding: '12px', textAlign: 'center', fontSize: '1rem' }}>
              123 Business Road, Enterprise City, EC 12345
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, padding: '8px 16px', border: '1px solid #000', fontSize: '1.25rem', display: 'inline-block' }}>Standard Purchase Order</h1>
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

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '32px', fontSize: '0.9rem' }}>
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
              <tr key={\`empty-\${i}\`}>
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

      </div>
    </div>
  );
}
