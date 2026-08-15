'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useIntake } from '../../../context/IntakeContext';
import { 
  RefreshCcw, Filter, LayoutGrid, List, Plus, 
  ChevronDown, ChevronRight, AlertCircle, CheckCircle2, 
  Package, Server, FileText, X, ArrowRight, Lightbulb
} from 'lucide-react';

export default function PRPage() {
  const { intakes } = useIntake();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('Open');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2 mins ago');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [projectType, setProjectType] = useState<'new'|'draft'|null>(null);
  
  // Bidding Stages State
  const [techStage, setTechStage] = useState(false);
  const [rfq, setRfq] = useState(false);
  const [auction, setAuction] = useState(false);

  // MOCK DATA AUGMENTATION
  const prData = useMemo(() => {
    return intakes.map((row, i) => {
      // Mock sub-items for accordion
      const items = [
        { id: `${row.refId}-L1`, name: 'Dell XPS 15 Laptops', qty: 5, uom: 'EA', status: 'Pending' },
        { id: `${row.refId}-L2`, name: 'Logitech MX Master 3S', qty: 5, uom: 'EA', status: 'Pending' }
      ];
      // Randomly assign priority based on index to ensure variety
      const priority = i % 3 === 0 ? 'High' : i % 2 === 0 ? 'Medium' : 'Low';
      // Map basic statuses to tabs
      let tabStatus = 'Open';
      if (row.status === 'Approved') tabStatus = 'Completed';
      else if (row.status === 'In Progress') tabStatus = 'In Progress';
      
      return {
        ...row,
        items,
        priority,
        tabStatus,
        fundCenter: 100000 + (i * 12345) % 900000,
        storageLocation: ['HRSP', 'EDSP', 'ESSP'][i % 3]
      };
    });
  }, [intakes]);

  // Tab Filtering
  const filteredData = prData.filter(d => activeTab === 'All' || d.tabStatus === activeTab);

  // Handlers
  const handleSelectRow = (refId: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(refId)) newSet.delete(refId);
    else newSet.add(refId);
    setSelectedRows(newSet);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRows(new Set(filteredData.map(i => i.refId)));
    else setSelectedRows(new Set());
  };

  const toggleExpand = (refId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(refId)) newSet.delete(refId);
    else newSet.add(refId);
    setExpandedRows(newSet);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSync('Just now');
    }, 1500);
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High') return <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>High</span>;
    if (priority === 'Medium') return <span style={{ backgroundColor: '#fef9c3', color: '#a16207', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Medium</span>;
    return <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>Low</span>;
  };

  // Modal logic
  const handleAuctionToggle = () => {
    if (!auction) { setTechStage(false); setRfq(false); }
    setAuction(!auction);
  };

  const openWizard = () => {
    setWizardStep(1);
    setProjectType(null);
    setIsModalOpen(true);
  };

  const handleWizardSubmit = () => {
    setIsModalOpen(false);
    
    const selectedPRData = filteredData.filter(d => selectedRows.has(d.refId));
    const exportedItems: any[] = [];
    selectedPRData.forEach(pr => {
       pr.items.forEach((item: any) => {
           exportedItems.push({
               _source: pr.refId,
               name: item.name,
               qty: item.qty,
               uom: item.uom,
               code: item.id
           });
       });
    });
    localStorage.setItem('prToEventItems', JSON.stringify(exportedItems));

    const prs = Array.from(selectedRows).join(',');
    const destination = auction 
      ? `/client/events/create/auction?fromPR=true&prs=${prs}` 
      : `/client/events/create/single-stage?fromPR=true&prs=${prs}`;
    
    setSelectedRows(new Set());
    window.location.href = destination;
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#333', minHeight: '100%', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Purchase Requisitions</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Review and convert ERP requisitions into procurement projects.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Last synced: {lastSync}</span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Functional Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0 16px' }}>
          {['Open', 'In Progress', 'Completed', 'Hold', 'All'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 20px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                color: activeTab === tab ? '#2563eb' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              {tab}
              {tab !== 'All' && (
                <span style={{ 
                  backgroundColor: activeTab === tab ? '#eff6ff' : '#f1f5f9', 
                  color: activeTab === tab ? '#2563eb' : '#94a3b8', 
                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' 
                }}>
                  {prData.filter(d => d.tabStatus === tab).length}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Toolbar & Smart Alert */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            {/* Smart Consolidation Alert */}
            {selectedRows.size > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fefce8', border: '1px solid #fef08a', color: '#a16207', padding: '8px 16px', borderRadius: '6px', fontSize: '0.875rem', animation: 'fadeIn 0.3s ease-out' }}>
                <Lightbulb size={16} />
                <span style={{ fontWeight: 500 }}>Smart Tip:</span> You selected {selectedRows.size} PRs. We recommend combining these into a single RFQ event to leverage volume discounts!
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={openWizard}
              disabled={selectedRows.size === 0}
              style={{ 
                padding: '8px 16px', border: 'none', borderRadius: '6px', 
                backgroundColor: selectedRows.size > 0 ? '#10b981' : '#f1f5f9', 
                color: selectedRows.size > 0 ? '#fff' : '#94a3b8', 
                cursor: selectedRows.size > 0 ? 'pointer' : 'not-allowed', 
                display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500',
                boxShadow: selectedRows.size > 0 ? '0 4px 6px -1px rgba(16, 185, 129, 0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Package size={16} /> 
              Create Project {selectedRows.size > 0 ? `(${selectedRows.size})` : ''}
            </button>
          </div>
        </div>

        {/* Accordion Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', width: '40px' }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.size === filteredData.length && filteredData.length > 0} style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '16px', width: '40px' }}></th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>PR NO (Ref ID)</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Title / Material</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Requester</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Priority</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>FUND CENTER</th>
                <th style={{ padding: '16px', fontWeight: 600, color: '#475569' }}>Storage Loc</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row) => (
                  <React.Fragment key={row.refId}>
                    {/* Main Row */}
                    <tr style={{ borderBottom: expandedRows.has(row.refId) ? 'none' : '1px solid #e2e8f0', backgroundColor: selectedRows.has(row.refId) ? '#eff6ff' : '#fff', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px' }}>
                        <input type="checkbox" checked={selectedRows.has(row.refId)} onChange={() => handleSelectRow(row.refId)} style={{ accentColor: '#2563eb', width: '16px', height: '16px', cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '16px', cursor: 'pointer' }} onClick={() => toggleExpand(row.refId)}>
                        {expandedRows.has(row.refId) ? <ChevronDown size={18} color="#64748b" /> : <ChevronRight size={18} color="#64748b" />}
                      </td>
                      <td style={{ padding: '16px', color: '#2563eb', fontWeight: 500 }}>{row.refId}</td>
                      <td style={{ padding: '16px', color: '#333', fontWeight: 500 }}>{row.title}</td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{row.reqName}</td>
                      <td style={{ padding: '16px' }}>{getPriorityBadge(row.priority)}</td>
                      <td style={{ padding: '16px', color: '#64748b', fontFamily: 'monospace' }}>{row.fundCenter}</td>
                      <td style={{ padding: '16px', color: '#64748b' }}>{row.storageLocation}</td>
                    </tr>
                    
                    {/* Expanded Nested Row */}
                    {expandedRows.has(row.refId) && (
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <td colSpan={2}></td>
                        <td colSpan={6} style={{ padding: '0 16px 16px 0' }}>
                          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px', marginTop: '-8px' }}>
                            <table style={{ width: '100%', fontSize: '0.8125rem' }}>
                              <thead>
                                <tr>
                                  <th style={{ padding: '8px', color: '#94a3b8', fontWeight: 500, textAlign: 'left' }}>Item ID</th>
                                  <th style={{ padding: '8px', color: '#94a3b8', fontWeight: 500, textAlign: 'left' }}>Description</th>
                                  <th style={{ padding: '8px', color: '#94a3b8', fontWeight: 500, textAlign: 'left' }}>Qty</th>
                                  <th style={{ padding: '8px', color: '#94a3b8', fontWeight: 500, textAlign: 'left' }}>UOM</th>
                                  <th style={{ padding: '8px', color: '#94a3b8', fontWeight: 500, textAlign: 'left' }}>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.items.map(item => (
                                  <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '8px', color: '#475569' }}>{item.id}</td>
                                    <td style={{ padding: '8px', color: '#333', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: '8px', color: '#475569' }}>{item.qty}</td>
                                    <td style={{ padding: '8px', color: '#475569' }}>{item.uom}</td>
                                    <td style={{ padding: '8px', color: '#475569' }}>{item.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Server size={28} color="#94a3b8" />
                      </div>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>No PRs available</h3>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Change the tab filter to view other requests.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Step Wizard Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Create Project</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>{selectedRows.size} Purchase Requisitions selected</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              
              {/* Stepper Progress */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: wizardStep >= 1 ? '#2563eb' : '#94a3b8', fontWeight: 600, fontSize: '0.875rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: wizardStep >= 1 ? '#eff6ff' : '#f1f5f9', border: wizardStep >= 1 ? '1px solid #2563eb' : '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                  Project Type
                </div>
                <div style={{ flex: 1, height: '1px', backgroundColor: wizardStep >= 2 ? '#2563eb' : '#e2e8f0', margin: '0 16px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: wizardStep >= 2 ? '#2563eb' : '#94a3b8', fontWeight: 600, fontSize: '0.875rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: wizardStep >= 2 ? '#eff6ff' : '#f1f5f9', border: wizardStep >= 2 ? '1px solid #2563eb' : '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                  Bidding Stages
                </div>
              </div>

              {/* Step 1: Project Type */}
              {wizardStep === 1 && (
                <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: '0 0 16px 0' }}>Select Project Type</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    
                    <div 
                      onClick={() => setProjectType('new')}
                      style={{ border: projectType === 'new' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', backgroundColor: projectType === 'new' ? '#eff6ff' : '#fff', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: '40px', height: '40px', backgroundColor: projectType === 'new' ? '#bfdbfe' : '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: projectType === 'new' ? '#1d4ed8' : '#64748b' }}><Plus size={20} /></div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.9375rem' }}>Start New Project</h4>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Create a brand new sourcing event from the selected PRs.</p>
                    </div>

                    <div 
                      onClick={() => setProjectType('draft')}
                      style={{ border: projectType === 'draft' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', backgroundColor: projectType === 'draft' ? '#eff6ff' : '#fff', transition: 'all 0.2s' }}
                    >
                      <div style={{ width: '40px', height: '40px', backgroundColor: projectType === 'draft' ? '#bfdbfe' : '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: projectType === 'draft' ? '#1d4ed8' : '#64748b' }}><FileText size={20} /></div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.9375rem' }}>Add to Draft</h4>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Merge these PRs into an existing draft project.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Bidding Stages */}
              {wizardStep === 2 && (
                <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: '0 0 16px 0' }}>Configure Bidding Stages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', cursor: auction ? 'not-allowed' : 'pointer', backgroundColor: auction ? '#f8fafc' : '#fff', opacity: auction ? 0.6 : 1 }}>
                      <input type="checkbox" checked={techStage} onChange={() => setTechStage(!techStage)} disabled={auction} style={{ marginTop: '2px', accentColor: '#2563eb', width: '16px', height: '16px' }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.9375rem' }}>Technical Stage</h4>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Require vendors to submit technical proposals before pricing.</p>
                      </div>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', cursor: auction ? 'not-allowed' : 'pointer', backgroundColor: auction ? '#f8fafc' : '#fff', opacity: auction ? 0.6 : 1 }}>
                      <input type="checkbox" checked={rfq} onChange={() => setRfq(!rfq)} disabled={auction} style={{ marginTop: '2px', accentColor: '#2563eb', width: '16px', height: '16px' }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.9375rem' }}>RFQ (Request for Quotation)</h4>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Standard sealed bidding process for pricing.</p>
                      </div>
                    </label>

                    <div style={{ position: 'relative', margin: '8px 0' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#e2e8f0' }}></div>
                      <div style={{ position: 'relative', display: 'inline-block', backgroundColor: '#fff', padding: '0 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', left: '50%', transform: 'translateX(-50%)' }}>OR</div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', cursor: (techStage || rfq) ? 'not-allowed' : 'pointer', backgroundColor: (techStage || rfq) ? '#f8fafc' : '#fff', opacity: (techStage || rfq) ? 0.6 : 1 }}>
                      <input type="checkbox" checked={auction} onChange={handleAuctionToggle} disabled={techStage || rfq} style={{ marginTop: '2px', accentColor: '#2563eb', width: '16px', height: '16px' }} />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.9375rem' }}>Reverse Auction</h4>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>Dynamic, real-time competitive bidding event.</p>
                      </div>
                    </label>

                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <button 
                onClick={() => {
                  if (wizardStep === 2) setWizardStep(1);
                  else setIsModalOpen(false);
                }}
                style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
              >
                {wizardStep === 2 ? 'Back' : 'Cancel'}
              </button>
              
              <button 
                onClick={() => {
                  if (wizardStep === 1) setWizardStep(2);
                  else handleWizardSubmit();
                }}
                disabled={wizardStep === 1 ? !projectType : (!techStage && !rfq && !auction)}
                style={{ 
                  padding: '8px 16px', border: 'none', borderRadius: '6px', 
                  backgroundColor: (wizardStep === 1 ? !projectType : (!techStage && !rfq && !auction)) ? '#94a3b8' : '#2563eb', 
                  color: '#fff', cursor: (wizardStep === 1 ? !projectType : (!techStage && !rfq && !auction)) ? 'not-allowed' : 'pointer', 
                  fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                {wizardStep === 1 ? <>Next <ArrowRight size={16} /></> : 'Confirm Setup'}
              </button>
            </div>

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-anim { animation: spin 1s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}
