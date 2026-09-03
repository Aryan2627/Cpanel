'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText, Search, CheckCircle2, Clock, XCircle,
  FileSignature, AlertCircle, ArrowUpDown, X, Inbox,
  TrendingUp, Eye, Package, ArrowUpRight
} from 'lucide-react';

const mockPos = [
  { id: 'mock-po-1', poNumber: 'PO-1706439000000', title: 'Q3 Enterprise Hardware Refresh', vendorId: 'Vendor-A', vendorName: 'Alpha Technologies', total: 125000, createdAt: new Date().toISOString(), status: 'Approved' },
  { id: 'mock-po-2', poNumber: 'PO-1706439123000', title: 'Global Software Licensing Agreement', vendorId: 'Vendor-B', vendorName: 'Global Supply Co.', total: 45000, createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Draft' },
  { id: 'mock-po-3', poNumber: 'PO-1706439456000', title: 'Office Supplies Bulk Order', vendorId: 'Vendor-C', vendorName: 'OfficeMax Direct', total: 3200, createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Pending Review' },
  { id: 'mock-po-4', poNumber: 'PO-1706440000000', title: 'Annual IT Infrastructure Maintenance', vendorId: 'Vendor-D', vendorName: 'TechServ Ltd.', total: 78500, createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'Pending Vendor' },
  { id: 'mock-po-5', poNumber: 'PO-1706441000000', title: 'Marketing Material Print Run', vendorId: 'Vendor-E', vendorName: 'PrintPro Studios', total: 12300, createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Rejected' },
];

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/pos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const dbData = data.map(po => ({ ...po, vendorName: 'Vendor ' + po.vendorId }));
          setPos([...dbData, ...mockPos]);
        } else {
          setPos(mockPos);
        }
      })
      .catch(() => setPos(mockPos));
  }, []);

  const totalValue = pos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);

  const kpis = [
    { label: 'Total POs', value: pos.length, icon: FileText, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Total Value', value: '\u20b9' + totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 }), icon: TrendingUp, color: '#16a34a', bg: '#dcfce7' },
    { label: 'Pending Approval', value: pos.filter(p => p.status.toLowerCase().includes('pending')).length, icon: Clock, color: '#d97706', bg: '#fef3c7' },
    { label: 'Rejected', value: pos.filter(p => p.status.toLowerCase() === 'rejected').length, icon: AlertCircle, color: '#dc2626', bg: '#fef2f2' },
  ];

  const statusTabs = ['All', 'Draft', 'Pending Review', 'Pending Vendor', 'Approved', 'Rejected'];

  const statusStyle = (s: string): React.CSSProperties => {
    const sl = s.toLowerCase();
    if (sl === 'approved') return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
    if (sl === 'rejected') return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };
    if (sl.includes('pending')) return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
    if (sl === 'draft') return { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    return { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' };
  };

  const filtered = useMemo(() => {
    let data = [...pos];
    if (filterStatus !== 'All') data = data.filter(p => p.status === filterStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p =>
        (p.poNumber || '').toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.vendorName || '').toLowerCase().includes(q)
      );
    }
    if (sortConfig) {
      data.sort((a, b) => {
        const av = (a as any)[sortConfig.key] ?? '';
        const bv = (b as any)[sortConfig.key] ?? '';
        return sortConfig.direction === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
    }
    return data;
  }, [pos, filterStatus, searchQuery, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Premium Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #1a2f6b 100%)', padding: '28px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Package size={18} color="rgba(255,255,255,0.55)" />
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Procurement</p>
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Purchase Orders</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>Track and manage financial commitments to vendors.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {selectedIds.size > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px 16px', color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>
                {selectedIds.size} selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 40px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{k.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.05em', lineHeight: 1 }}>{k.value}</div>
                </div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={k.color} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Table Card ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding: '0 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '4px', background: '#fafbfc', flexWrap: 'wrap' }}>
            {statusTabs.map(tab => (
              <button key={tab} onClick={() => setFilterStatus(tab)} style={{ padding: '14px 14px', border: 'none', borderBottom: filterStatus === tab ? '2px solid #1e3a8a' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: filterStatus === tab ? 700 : 500, color: filterStatus === tab ? '#1e3a8a' : '#64748b', transition: 'all 0.15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tab}
                <span style={{ padding: '1px 6px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700, background: filterStatus === tab ? '#0d1f4f' : '#f1f5f9', color: filterStatus === tab ? '#fff' : '#94a3b8' }}>
                  {tab === 'All' ? pos.length : pos.filter(p => p.status === tab).length}
                </span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '8px 0' }}>
              <Search size={14} color="#94a3b8" />
              <input type="text" placeholder="Search PO, title, vendor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', color: '#0f172a', padding: '8px 0', width: '220px' }} />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}><X size={13} /></button>}
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0d1f4f, #1a2f6b)' }}>
                <th style={{ padding: '13px 16px', width: '44px' }}>
                  <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={e => setSelectedIds(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())}
                    style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                </th>
                {[['poNumber', 'PO Number'], ['title', 'Title'], ['vendorName', 'Vendor'], ['total', 'Total Value'], ['createdAt', 'Date Issued'], ['status', 'Status']].map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)} style={{ padding: '13px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{label} <ArrowUpDown size={10} color="rgba(255,255,255,0.3)" /></span>
                  </th>
                ))}
                <th style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((po, idx) => {
                const isSelected = selectedIds.has(po.id);
                return (
                  <tr key={po.id} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafbfc', borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent', transition: 'all 0.12s' }}
                    onMouseOver={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderLeft = '3px solid #3b82f6'; } }}
                    onMouseOut={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'; (e.currentTarget as HTMLElement).style.borderLeft = '3px solid transparent'; } }}>
                    <td style={{ padding: '13px 16px' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => { const s = new Set(selectedIds); isSelected ? s.delete(po.id) : s.add(po.id); setSelectedIds(s); }} style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700 }}>{po.poNumber}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: '#1e3a8a', fontSize: '0.875rem', maxWidth: '220px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.title}</div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d1f4f, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.65rem', flexShrink: 0 }}>
                          {(po.vendorName || 'V').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{po.vendorName || po.vendorId}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                        {Number(po.total).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#64748b', fontSize: '0.82rem' }}>
                      {new Date(po.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', ...statusStyle(po.status) }}>
                        {po.status.toLowerCase() === 'approved' && <CheckCircle2 size={11} />}
                        {po.status.toLowerCase() === 'rejected' && <XCircle size={11} />}
                        {po.status.toLowerCase().includes('pending') && <Clock size={11} />}
                        {po.status.toLowerCase() === 'draft' && <FileSignature size={11} />}
                        {po.status}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <Link href={`/client/po/${po.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#dbeafe'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.background = '#eff6ff'}>
                        <Eye size={13} /> View PO
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} style={{ padding: '64px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Inbox size={28} color="#cbd5e1" />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No purchase orders found</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Try adjusting your search or status filter.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Showing <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> of <strong style={{ color: '#0f172a' }}>{pos.length}</strong> purchase orders
                {selectedIds.size > 0 && <span style={{ marginLeft: '12px', color: '#2563eb', fontWeight: 600 }}>· {selectedIds.size} selected</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Filtered value: <strong style={{ color: '#16a34a', fontSize: '0.9rem' }}>
                  {filtered.reduce((a, p) => a + (Number(p.total) || 0), 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
