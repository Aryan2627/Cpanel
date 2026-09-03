'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useIntake } from '../../../context/IntakeContext';
import {
  RefreshCcw, Plus, ChevronDown, ChevronRight, CheckCircle2,
  FileText, X, ArrowRight, Search, ClipboardList, AlertTriangle,
  Clock, Layers, ArrowUpDown, ShieldCheck
} from 'lucide-react';

export default function PRPage() {
  const { intakes } = useIntake();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('Open');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2 mins ago');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [projectType, setProjectType] = useState<'new'|'draft'|null>(null);
  const [techStage, setTechStage] = useState(false);
  const [rfq, setRfq] = useState(false);
  const [auction, setAuction] = useState(false);

  const prData = useMemo(() => {
    return intakes.map((row, i) => {
      const items = [{ id: `${row.refId}-L1`, name: row.title || 'Product Request', qty: row.quantity || 1, uom: 'EA', status: 'Pending' }];
      const priority = i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low';
      let tabStatus = 'Open';
      if (row.status === 'Approved') tabStatus = 'Completed';
      else if (row.status === 'In Progress') tabStatus = 'In Progress';
      return { ...row, refId: row.refId.replace('IR-', 'PR-'), items, priority, tabStatus, fundCenter: 100000 + (i * 12345) % 900000, storageLocation: ['HRSP', 'EDSP', 'ESSP'][i % 3] };
    });
  }, [intakes]);

  const tabs = [
    { label: 'Open', count: prData.filter(d => d.tabStatus === 'Open').length },
    { label: 'In Progress', count: prData.filter(d => d.tabStatus === 'In Progress').length },
    { label: 'Completed', count: prData.filter(d => d.tabStatus === 'Completed').length },
    { label: 'Hold', count: 0 },
    { label: 'All', count: prData.length },
  ];

  const filteredData = useMemo(() => {
    return prData.filter(d => {
      if (activeTab !== 'All' && d.tabStatus !== activeTab) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (d.refId || '').toLowerCase().includes(q) || (d.title || '').toLowerCase().includes(q) || (d.reqName || '').toLowerCase().includes(q);
    });
  }, [prData, activeTab, searchQuery]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRows(new Set(filteredData.map(i => i.refId)));
    else setSelectedRows(new Set());
  };

  const toggleExpand = (refId: string) => {
    const s = new Set(expandedRows);
    s.has(refId) ? s.delete(refId) : s.add(refId);
    setExpandedRows(s);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => { setIsSyncing(false); setLastSync('Just now'); }, 1500);
  };

  const handleAuctionToggle = () => {
    if (!auction) { setTechStage(false); setRfq(false); }
    setAuction(!auction);
  };

  const openWizard = () => {
    if (selectedRows.size === 0) { alert('Please select at least one PR first.'); return; }
    setWizardStep(1); setProjectType(null); setIsModalOpen(true);
  };

  const handleWizardSubmit = () => {
    setIsModalOpen(false);
    const selectedPRData = filteredData.filter(d => selectedRows.has(d.refId));
    const exportedItems: any[] = [];
    selectedPRData.forEach(pr => pr.items.forEach((item: any) => {
      exportedItems.push({ refId: pr.refId, title: pr.title || item.name, qty: item.qty, uom: item.uom });
    }));
    const query = encodeURIComponent(JSON.stringify(exportedItems));
    const prs = selectedPRData.map(d => d.refId).join(',');
    if (auction) window.location.href = `/client/events/create/auction?prs=${prs}`;
    else window.location.href = `/client/events/create/single-stage?prs=${prs}`;
  };

  const priorityStyle = (p: string): React.CSSProperties => {
    if (p === 'High') return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' };
    if (p === 'Medium') return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
    return { background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac' };
  };

  const kpis = [
    { label: 'Total PRs', value: prData.length, icon: ClipboardList, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Open', value: prData.filter(d => d.tabStatus === 'Open').length, icon: Clock, color: '#d97706', bg: '#fef3c7' },
    { label: 'In Progress', value: prData.filter(d => d.tabStatus === 'In Progress').length, icon: Layers, color: '#7c3aed', bg: '#faf5ff' },
    { label: 'Completed', value: prData.filter(d => d.tabStatus === 'Completed').length, icon: CheckCircle2, color: '#16a34a', bg: '#dcfce7' },
  ];

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Premium Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #071330 0%, #0d1f4f 55%, #1a2f6b 100%)', padding: '28px 32px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(59,130,246,0.12), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="rgba(255,255,255,0.55)" />
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Procurement</p>
            </div>
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.5px' }}>Purchase Requisitions</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.9rem' }}>Review and convert ERP requisitions into procurement projects.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={openWizard} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: selectedRows.size > 0 ? '#2563eb' : 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: selectedRows.size > 0 ? '0 4px 14px rgba(37,99,235,0.4)' : 'none', transition: 'all 0.2s' }}>
              <Plus size={17} /> Create Project {selectedRows.size > 0 && `(${selectedRows.size})`}
            </button>
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

          {/* Tabs */}
          <div style={{ padding: '0 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '2px', background: '#fafbfc' }}>
            {tabs.map(tab => (
              <button key={tab.label} onClick={() => { setActiveTab(tab.label); }} style={{ padding: '14px 16px', border: 'none', borderBottom: activeTab === tab.label ? '2px solid #1e3a8a' : '2px solid transparent', background: 'transparent', cursor: 'pointer', fontSize: '0.82rem', fontWeight: activeTab === tab.label ? 700 : 500, color: activeTab === tab.label ? '#1e3a8a' : '#64748b', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {tab.label}
                <span style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, background: activeTab === tab.label ? '#0d1f4f' : '#f1f5f9', color: activeTab === tab.label ? '#fff' : '#64748b' }}>{tab.count}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', margin: '8px 0' }}>
              <Search size={14} color="#94a3b8" />
              <input type="text" placeholder="Search PRs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.82rem', color: '#0f172a', padding: '8px 0', width: '200px' }} />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}><X size={13} /></button>}
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0d1f4f, #1a2f6b)' }}>
                <th style={{ padding: '13px 16px', width: '44px' }}>
                  <input type="checkbox" checked={selectedRows.size === filteredData.length && filteredData.length > 0} onChange={handleSelectAll} style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '13px 8px', width: '36px' }}></th>
                {[['refId', 'PR No (Ref ID)'], ['title', 'Title / Material'], ['quantity', 'Quantity'], ['reqName', 'Requester'], ['priority', 'Priority'], ['storageLocation', 'Location']].map(([key, label]) => (
                  <th key={key} style={{ padding: '13px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{label} <ArrowUpDown size={10} color="rgba(255,255,255,0.3)" /></span>
                  </th>
                ))}
                <th style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.75)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.map((item, idx) => {
                const isSelected = selectedRows.has(item.refId);
                const isExpanded = expandedRows.has(item.refId);
                return (
                  <React.Fragment key={item.refId}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafbfc', borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent', transition: 'all 0.12s' }}
                      onMouseOver={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderLeft = '3px solid #3b82f6'; } }}
                      onMouseOut={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#fff' : '#fafbfc'; (e.currentTarget as HTMLElement).style.borderLeft = '3px solid transparent'; } }}>
                      <td style={{ padding: '13px 16px' }}>
                        <input type="checkbox" checked={isSelected} onChange={() => { const s = new Set(selectedRows); isSelected ? s.delete(item.refId) : s.add(item.refId); setSelectedRows(s); }} style={{ accentColor: '#2563eb', cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '13px 8px' }}>
                        <button onClick={() => toggleExpand(item.refId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                          <ChevronRight size={16} />
                        </button>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700 }}>{item.refId}</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: '#1e3a8a', fontSize: '0.875rem' }}>{item.title || '—'}</td>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '6px', fontSize: '0.82rem' }}>{item.quantity || 1} <span style={{ color: '#94a3b8', fontWeight: 400 }}>EA</span></span>
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
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, ...priorityStyle(item.priority) }}>{item.priority}</span>
                      </td>
                      <td style={{ padding: '13px 16px', color: '#64748b', fontSize: '0.82rem', fontWeight: 500 }}>
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 9px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{item.storageLocation}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <button onClick={() => { setSelectedRows(new Set([item.refId])); openWizard(); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '7px', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = '#dbeafe'}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = '#eff6ff'}>
                          <ArrowRight size={13} /> Create Project
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Sub-items */}
                    {isExpanded && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <div style={{ background: 'linear-gradient(135deg, #f8faff, #eff6ff)', borderTop: '1px solid #bfdbfe', padding: '12px 24px 12px 72px' }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Line Items</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                              <thead>
                                <tr>
                                  {['Item', 'Description', 'Qty', 'UOM', 'Status'].map(h => (
                                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.items.map((li: any, lIdx: number) => (
                                  <tr key={li.id} style={{ borderTop: '1px solid rgba(191,219,254,0.4)' }}>
                                    <td style={{ padding: '8px 10px', color: '#64748b', fontWeight: 600 }}>#{lIdx + 1}</td>
                                    <td style={{ padding: '8px 10px', color: '#1e3a8a', fontWeight: 700 }}>{li.name}</td>
                                    <td style={{ padding: '8px 10px', color: '#0f172a', fontWeight: 600 }}>{li.qty}</td>
                                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{li.uom}</td>
                                    <td style={{ padding: '8px 10px' }}>
                                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700 }}>{li.status}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan={9} style={{ padding: '64px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={28} color="#cbd5e1" />
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>No requisitions found</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Try adjusting your filters.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          {filteredData.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong style={{ color: '#0f172a' }}>{filteredData.length}</strong> requisition{filteredData.length !== 1 ? 's' : ''}
                {selectedRows.size > 0 && <span style={{ marginLeft: '12px', color: '#2563eb', fontWeight: 600 }}>· {selectedRows.size} selected</span>}
              </div>
              {selectedRows.size > 0 && (
                <button onClick={openWizard} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 18px', background: '#2563eb', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
                  <Plus size={15} /> Create Project from {selectedRows.size} PR{selectedRows.size > 1 ? 's' : ''}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Project Wizard Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '520px', maxWidth: '92vw', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #071330, #0d1f4f)', padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Step {wizardStep} of 2</div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{wizardStep === 1 ? 'Project Setup' : 'Configure Stages'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              {wizardStep === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 8px', lineHeight: 1.6 }}>
                    Creating a sourcing project from <strong style={{ color: '#0f172a' }}>{selectedRows.size}</strong> selected PR{selectedRows.size > 1 ? 's' : ''}. Choose how you want to proceed:
                  </p>
                  {[
                    { key: 'new', icon: Plus, title: 'Create New Project', desc: 'Start fresh — configure stages, templates, and vendors.', color: '#2563eb', bg: '#eff6ff' },
                    { key: 'draft', icon: FileText, title: 'Save as Draft', desc: 'Save this PR set as a draft to configure later.', color: '#7c3aed', bg: '#faf5ff' },
                  ].map(opt => {
                    const Icon = opt.icon;
                    const sel = projectType === opt.key;
                    return (
                      <div key={opt.key} onClick={() => setProjectType(opt.key as 'new'|'draft')}
                        style={{ padding: '16px', borderRadius: '12px', border: sel ? `2px solid ${opt.color}` : '2px solid #e2e8f0', background: sel ? opt.bg : '#fff', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'flex-start', transition: 'all 0.15s' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={20} color={opt.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '3px' }}>{opt.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{opt.desc}</div>
                        </div>
                        {sel && <CheckCircle2 size={18} color={opt.color} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                  <button onClick={() => { if (projectType) setWizardStep(2); }} disabled={!projectType}
                    style={{ marginTop: '8px', width: '100%', padding: '12px', background: projectType ? '#1e3a8a' : '#e2e8f0', color: projectType ? '#fff' : '#94a3b8', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: projectType ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Next: Configure Stages <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 8px', lineHeight: 1.6 }}>Select the bidding stages for this sourcing event:</p>
                  {[
                    { state: techStage, setter: setTechStage, label: 'Technical Validation', desc: 'Qualify vendors on spec compliance before pricing.', color: '#7c3aed', bg: '#faf5ff' },
                    { state: rfq, setter: setRfq, label: 'RFQ / Reverse Auction', desc: 'Collect price quotes from invited vendors.', color: '#2563eb', bg: '#eff6ff' },
                    { state: auction, setter: handleAuctionToggle as any, label: 'Live Auction Only', desc: 'Real-time competitive bidding (disables above stages).', color: '#d97706', bg: '#fef3c7' },
                  ].map((opt, i) => (
                    <div key={i} onClick={() => opt.setter(!opt.state)}
                      style={{ padding: '14px 16px', borderRadius: '10px', border: opt.state ? `2px solid ${opt.color}` : '2px solid #e2e8f0', background: opt.state ? opt.bg : '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{opt.label}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>{opt.desc}</div>
                      </div>
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: opt.state ? `2px solid ${opt.color}` : '2px solid #cbd5e1', background: opt.state ? opt.color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {opt.state && <CheckCircle2 size={14} color="#fff" />}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button onClick={() => setWizardStep(1)} style={{ flex: 1, padding: '11px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#475569', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>← Back</button>
                    <button onClick={handleWizardSubmit} disabled={!techStage && !rfq && !auction}
                      style={{ flex: 2, padding: '11px', background: (techStage || rfq || auction) ? '#1e3a8a' : '#e2e8f0', color: (techStage || rfq || auction) ? '#fff' : '#94a3b8', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: (techStage || rfq || auction) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Plus size={16} /> Launch Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
