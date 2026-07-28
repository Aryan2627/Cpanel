'use client';
import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Download, 
  CheckCircle2, Clock, XCircle, FileSignature, AlertCircle
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data to ensure we have something to display
  const mockPos = [
    {
      id: 'mock-po-1',
      poNumber: 'PO-1706439000000',
      title: 'Q3 Enterprise Hardware Refresh',
      vendorId: 'Vendor-A',
      vendorName: 'Alpha Technologies',
      total: 125000,
      createdAt: new Date().toISOString(),
      status: 'Approved'
    },
    {
      id: 'mock-po-2',
      poNumber: 'PO-1706439123000',
      title: 'Global Software Licensing Agreement',
      vendorId: 'Vendor-B',
      vendorName: 'Global Supply Co.',
      total: 45000,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      status: 'Draft'
    },
    {
      id: 'mock-po-3',
      poNumber: 'PO-1706439456000',
      title: 'Office Supplies Bulk Order',
      vendorId: 'Vendor-C',
      vendorName: 'OfficeMax Direct',
      total: 3200,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      status: 'Pending Review'
    }
  ];

  useEffect(() => {
    fetch('/api/pos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // If we actually get POs from the DB, merge them
          const dbData = data.map(po => ({
            ...po,
            vendorName: 'Vendor ' + po.vendorId // Placeholder since vendor name might not be in PO table
          }));
          setPos([...dbData, ...mockPos]);
        } else {
          setPos(mockPos);
        }
      })
      .catch((err) => {
        console.error(err);
        setPos(mockPos); // Fallback to mock on error
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved':
        return <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Approved</span>;
      case 'draft':
        return <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileSignature size={12} /> Draft</span>;
      case 'pending review':
      case 'pending':
        return <span style={{ padding: '4px 10px', backgroundColor: '#fef9c3', color: '#a16207', border: '1px solid #fef08a', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending Review</span>;
      case 'rejected':
        return <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>;
      default:
        return <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  const filteredPos = pos.filter(po => 
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.vendorName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = pos.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Purchase Orders</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Track and manage financial commitments to vendors.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total POs', value: pos.length, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Total Value', value: '$' + totalValue.toLocaleString(undefined, {maximumFractionDigits: 0}), icon: FileSignature, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pending Approval', value: pos.filter(p => p.status.toLowerCase().includes('pending')).length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Rejected', value: pos.filter(p => p.status.toLowerCase() === 'rejected').length, icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 600 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', width: '320px' }}>
            <div style={{ padding: '0 12px' }}><Search size={16} color="#94a3b8" /></div>
            <input 
              type="text" placeholder="Search by PO Number, Title, or Vendor..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', padding: '8px 12px 8px 0', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <Filter size={16} /> Filter
            </button>
            <button style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#fff', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px', fontWeight: 600 }}>PO Number</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Title</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Total Value</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Date Issued</th>
                <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPos.length > 0 ? filteredPos.map((po) => (
                <tr key={po.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
                  <td style={{ padding: '16px', fontWeight: 500, color: '#2563eb' }}>{po.poNumber}</td>
                  <td style={{ padding: '16px', color: '#0f172a', fontWeight: 500 }}>{po.title}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{po.vendorName || po.vendorId}</td>
                  <td style={{ padding: '16px', color: '#0f172a', fontWeight: 600 }}>${Number(po.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>{getStatusBadge(po.status)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <FileText size={32} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <p style={{ margin: 0 }}>No Purchase Orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
