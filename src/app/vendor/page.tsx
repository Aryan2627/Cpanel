'use client';
import React from 'react';
import Link from 'next/link';
import { Package, FileText, CheckCircle, TrendingUp, AlertCircle, MessageSquare } from 'lucide-react';

export default function VendorDashboard() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Vendor Header */}
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>AC</div>
          <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Acme Corporation <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>| Supplier Portal</span></h1>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <MessageSquare color="#94a3b8" />
            <span style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '50%', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
          </div>
          <div style={{ padding: '8px 16px', backgroundColor: '#1e293b', borderRadius: '6px', fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>
            Logout
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Alerts */}
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: '#fca5a5' }}>
          <AlertCircle size={20} />
          <div>
            <span style={{ fontWeight: 600 }}>Action Required:</span> You have a new counter-offer from Buyer (TechCorp) on RFQ-2024-882. 
            <Link href="#" style={{ color: '#fff', textDecoration: 'underline', marginLeft: '12px' }}>Review Offer</Link>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              Active RFQs <FileText size={16} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>12</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              Pending POs <Package size={16} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>4</div>
          </div>

          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', padding: '24px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}></div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              YTD Revenue <TrendingUp size={16} />
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>$1.4M</div>
          </div>

        </div>

        {/* Tables */}
        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 600 }}>Recent Activity</h2>
        
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', backgroundColor: '#0f172a' }}>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Buyer</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>RFQ-2024-882</td>
                <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>Enterprise Servers</td>
                <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>TechCorp Inc.</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>NEEDS REVIEW</span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>View Offer</button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>PO-9928</td>
                <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>Office Supplies Q3</td>
                <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>TechCorp Inc.</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ padding: '4px 10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> AWARDED
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <Link href="/client/vendor/celebrate/PO-9928" style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}>View Contract</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
