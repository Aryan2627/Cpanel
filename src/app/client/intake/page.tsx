'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIntake } from '../../../context/IntakeContext';
import * as XLSX from 'xlsx';
import {
  Search, Plus, FileUp, FileDown, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, FileText, Inbox, MoreHorizontal,
  X, Eye, Edit, ArrowUpRight, AlertCircle, ArrowUpDown, FileCheck
} from 'lucide-react';

export default function IntakeTablePage() {
  const { intakes, addIntake } = useIntake();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportEnabled, setExportEnabled] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setExportEnabled(localStorage.getItem('exportIntake') === 'true');
    const h = () => setExportEnabled(localStorage.getItem('exportIntake') === 'true');
    window.addEventListener('settings-updated', h);
    return () => window.removeEventListener('settings-updated', h);
  }, []);

  const totalRequests = intakes.length;
  const pendingRequests = intakes.filter(i => i.status === 'Draft' || i.status === 'In Progress').length;
  const approvedRequests = intakes.filter(i => i.status === 'Approved').length;
  const rejectedRequests = intakes.filter(i => i.status === 'Rejected').length;

  const handleExport = () => {
    const data = selectedIds.size > 0 ? intakes.filter(i => selectedIds.has(i.refId)) : intakes;
    const ws = XLSX.utils.json_to_sheet(data.map(r => ({
      'Ref ID': r.refId, 'Title': r.title, 'Requester': r.reqName,
      'Status': r.status, 'Qty': r.quantity || 1, 'Requested At': r.reqAt
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Intake Data');
    XLSX.writeFile(wb, 'Intake_Export.xlsx');
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([{
      'Request Title': 'e.g. Server Procurement', 'Category': 'IT Hardware',
      'Department': 'IT', 'Budget / Estimated Price': '5000',
      'Item Name / Description': 'Dell PowerEdge R740', 'Delivery Address': '123 Tech Lane',
      'Required Date': '2024-12-01'
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Intake_Template.xlsx');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setImportError(null);
        const wb = XLSX.read(evt.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws) as any[];
        rows.forEach(row => {
          addIntake({
            refId: `IR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: row['Request Title'] || 'Untitled',
            reqName: 'System Import', buyer: '', type: 'Standard',
            status: 'Draft', quantity: 1,
            reqAt: new Date().toLocaleString(), updAt: new Date().toLocaleString(),
          });
        });
        setIsImportModalOpen(false);
      } catch {
        setImportError('Failed to parse file. Please use the template.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const sorted = useMemo(() => {
    let data = [...intakes];
    if (sortConfig) {
      data.sort((a, b) => {
        const av = (a as any)[sortConfig.key] || '';
        const bv = (b as any)[sortConfig.key] || '';
        return sortConfig.direction === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      });
    }
    return data;
  }, [intakes, sortConfig]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sorted.filter(i => {
      const matchQ = !q || i.title?.toLowerCase().includes(q) || i.refId?.toLowerCase().includes(q) || i.reqName?.toLowerCase().includes(q);
      const matchS = filterStatus === 'All' || i.status === filterStatus;
      return matchQ && matchS;
    });
  }, [sorted, searchQuery, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (key: string) => {
    setSortConfig(prev => prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  const statusStyle = (s: string): React.CSSProperties => {
    if (s === 'Approved') return { background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
    if (s === 'Open') return { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
    if (s === 'Rejected') return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };
    if (s === 'In Progress') return { background: '#faf5ff', color: '#7c3aed', border: '1px solid #c4b5fd' };
    return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }; // Draft
  };

  const kpis = [
    { label: 'Total Requests', value: totalRequests, icon: FileText, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Pending Approval', value: pendingRequests, icon: Clock, color: '#d97706', bg: '#fef3c7' },
    { label: 'Approved', value: approvedRequests, icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
    { label: 'Rejected', value: rejectedRequests, icon: AlertCircle, color: '#dc2626', bg: '#fef2f2' },
  ];

  const statusTabs = ['All', 'Draft', 'Open', 'Approved', 'Rejected', 'In Progress'];

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Premium Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #1a2f6b 100%)', padding: '28px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '380px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileCheck size={20} color="rgba(255,255,255,0.6)" />
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Procurement</p>
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Purchase Intake</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>Manage and track all procurement requests.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setIsImportModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.15s' }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}>
              <FileUp size={16} /> Import
            </button>
            {exportEnabled && (
              <button onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                <FileDown size={16} /> Export
              </button>
            )}
            <Link href="/client/intake/create" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: '#2563eb', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.35)' }}>
              <Plus size={17} /> Create Request
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 32px 40px', marginTop: '-24px', position: 'relative', zIndex: 10 }}>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' }}>
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={i} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 22px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s' }}
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

        {/* ── Search + Filter Toolbar ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', padding: '0 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by title, ID, or requester..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: '#0f172a', padding: '10px 0', width: '100%' }}
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}><X size={14} /></button>}
          </div>
          <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {statusTabs.map(tab => (
              <button key={tab} onClick={() => { setFilterStatus(tab); setCurrentPage(1); }} style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: filterStatus === tab ? '#0d1f4f' : 'transparent', color: filterStatus === tab ? '#fff' : '#64748b', transition: 'all 0.15s', letterSpacing: '0.02em' }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Premium Table ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0d1f4f, #1a2f6b)' }}>
                <th style={{ padding: '13px 16px', width: '40px' }}>
                  <input type="checkbox" checked={selectedIds.size === paginated.length && paginated.length > 0}
                    onChange={e => setSelectedIds(e.target.checked ? new Set(paginated.map(i => i.refId)) : new Set())}
                    style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                </th>
                {[['refId', 'Ref ID'], ['title', 'Title'], ['reqName', 'Requester'], ['status', 'Status'], ['quantity', 'Qty'], ['reqAt', 'Requested At']].map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)} style={{ padding: '13px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {label} <ArrowUpDown size={11} color="rgba(255,255,255,0.35)" />
                    </span>
                  </th>
                ))}
                <th style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map((item, idx) => {
                const isSelected = selectedIds.has(item.refId);
                return (
                  <tr key={item.refId} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafbfc', borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent', transition: 'all 0.12s' }}
                    onMouseOver={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderLeft = '3px solid #2563eb'; } }}
                    onMouseOut={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'; (e.currentTarget as HTMLElement).style.borderLeft = '3px solid transparent'; } }}>
                    <td style={{ padding: '13px 16px' }}>
                      <input type="checkbox" checked={isSelected} onChange={e => {
                        const n = new Set(selectedIds);
                        e.target.checked ? n.add(item.refId) : n.delete(item.refId);
                        setSelectedIds(n);
                      }} style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700 }}>{item.refId}</span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <Link href={`/client/intake`} style={{ fontWeight: 700, color: '#1e3a8a', textDecoration: 'none', fontSize: '0.875rem' }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.color = '#2563eb'}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.color = '#1e3a8a'}>
                        {item.title}
                      </Link>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d1f4f, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.65rem', flexShrink: 0 }}>
                          {(item.reqName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{item.reqName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, ...statusStyle(item.status) }}>{item.status || 'Draft'}</span>
                    </td>
                    <td style={{ padding: '13px 16px', color: '#475569', fontWeight: 600, fontSize: '0.875rem' }}>{item.quantity || 1}</td>
                    <td style={{ padding: '13px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>{item.reqAt}</td>
                    <td style={{ padding: '13px 16px', textAlign: 'center', position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button onClick={() => router.push('/client/intake')} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, color: '#475569', transition: 'all 0.15s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.color = '#2563eb'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}>
                          <Eye size={13} /> View
                        </button>
                        <button onClick={() => router.push(`/client/events/create/single-stage?title=${encodeURIComponent(item.title)}`)}
                          style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px', padding: '5px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', transition: 'all 0.15s' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#dbeafe'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; }}>
                          <ArrowUpRight size={13} /> RFQ
                        </button>
                      </div>
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
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No requests found</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Try adjusting your search or filters, or create a new request.</div>
                      <Link href="/client/intake/create" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '10px 20px', background: '#1e3a8a', color: '#fff', borderRadius: '9px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
                        <Plus size={16} /> Create Request
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ── Pagination Footer ── */}
          {filtered.length > 0 && (
            <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Showing <strong style={{ color: '#0f172a' }}>{Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}–{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> results
                {selectedIds.size > 0 && <span style={{ marginLeft: '12px', color: '#2563eb', fontWeight: 600 }}>· {selectedIds.size} selected</span>}
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#fff', color: currentPage === 1 ? '#cbd5e1' : '#475569', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  <ChevronLeft size={15} /> Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1px solid ' + (currentPage === page ? '#1e3a8a' : '#e2e8f0'), background: currentPage === page ? '#0d1f4f' : '#fff', color: currentPage === page ? '#fff' : '#475569', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '7px', border: '1px solid #e2e8f0', background: '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#475569', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Import Modal ── */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsImportModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '480px', maxWidth: '92vw', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #071330, #0d1f4f)', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Import Requests</h2>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>Upload an Excel file to bulk import purchase requests. Use the template for the correct column format.</p>
              {importError && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '14px' }}>{importError}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleDownloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 16px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                  <FileDown size={17} color="#2563eb" /> Download Import Template
                </button>
                <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 16px', border: '1px solid #bfdbfe', borderRadius: '9px', background: '#eff6ff', cursor: 'pointer', fontWeight: 700, color: '#1d4ed8', fontSize: '0.875rem' }}>
                  <FileUp size={17} /> Choose Excel File
                </button>
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
