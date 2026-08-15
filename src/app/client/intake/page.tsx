'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useIntake } from '../../../context/IntakeContext';
import * as XLSX from 'xlsx';
import { 
  Search, Filter, Plus, FileUp, FileDown, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, FileEdit, X, LayoutTemplate,
  Inbox, FileText, ArrowUpDown
} from 'lucide-react';

export default function IntakeTablePage() {
  const { intakes, addIntake } = useIntake();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for Search & Filter
  const [searchField, setSearchField] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc'|'desc' } | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Slide-out Drawer State
  const [selectedIntake, setSelectedIntake] = useState<any | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const [exportEnabled, setExportEnabled] = useState(false);
  useEffect(() => {
    setExportEnabled(localStorage.getItem('exportIntake') === 'true');
    const handleSettingsUpdate = () => {
      setExportEnabled(localStorage.getItem('exportIntake') === 'true');
    };
    window.addEventListener('settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('settings_updated', handleSettingsUpdate);
  }, []);

  // -- Mock Data Generation for metrics --
  const totalRequests = intakes.length;
  const pendingRequests = intakes.filter(i => i.status === 'Draft' || i.status === 'In Progress').length;
  const approvedRequests = intakes.filter(i => i.status === 'Approved').length;
  const avgProcessingTime = "2.4 Days"; // Static for mockup

  // Handle Export
  const handleExport = () => {
    const dataToExport = selectedIds.size > 0 
      ? intakes.filter(i => selectedIds.has(i.refId))
      : intakes;

    const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(row => ({
      'Ref ID': row.refId,
      'Title': row.title,
      'Requester Name': row.reqName,
      'Status': row.status,
      'Intake Request Type': row.type,
      'Buyer Name': row.buyer,
      'Requested At': row.reqAt,
      'Updated At': row.updAt,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Intake Data");
    XLSX.writeFile(workbook, "Intake_Data_Export.xlsx");
  };

  const handleDownloadTemplate = () => {
    const templateData = [{
      'Request Title': 'e.g. Server Procurement',
      'Category': 'IT Hardware',
      'Department': 'IT',
      'Budget / Estimated Price': '5000',
      'Item Name / Description': 'Dell PowerEdge R740',
      'Delivery Address': '123 Tech Lane, NY 10001',
      'Required Date': '2024-12-01'
    }];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Intake_Master_Template.xlsx");
  };

  // Handle Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setImportError(null);
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        if (data.length === 0) {
          setImportError("The uploaded file is empty.");
          return;
        }

        // Validate Columns
        const requiredColumns = ['Request Title', 'Category', 'Department', 'Budget / Estimated Price', 'Item Name / Description', 'Delivery Address', 'Required Date'];
        const uploadedColumns = Object.keys(data[0]);
        const missingColumns = requiredColumns.filter(col => !uploadedColumns.includes(col));
        
        if (missingColumns.length > 0) {
          setImportError(`Invalid file format. Missing columns: ${missingColumns.join(', ')}. Please download and use the Master Template.`);
          return;
        }

        for (const row of data) {
          const intake = {
            refId: `INT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: row['Request Title'] || 'Untitled Intake',
            reqName: 'System Import',
            status: 'Draft',
            type: row['Category'] || 'Standalone NFA',
            buyer: '-',
            reqAt: new Date().toISOString().split('T')[0],
            updAt: new Date().toISOString().split('T')[0],
          };
          await addIntake(intake);
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsImportModalOpen(false);
        alert(`Successfully imported ${data.length} intakes!`);
      } catch (err) {
        console.error("Error parsing Excel file", err);
        setImportError("Failed to import. Ensure the Excel file is correctly formatted and not corrupted.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Data processing
  const filteredAndSortedIntakes = useMemo(() => {
    const result = intakes.filter((row) => {
      if (filterStatus !== 'All' && row.status !== filterStatus) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      
      if (searchField === 'Ref ID') return row.refId.toLowerCase().includes(query);
      if (searchField === 'Title') return row.title.toLowerCase().includes(query);
      if (searchField === 'Requester Name') return row.reqName.toLowerCase().includes(query);
      return (
        row.refId.toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.reqName.toLowerCase().includes(query)
      );
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [intakes, filterStatus, searchQuery, searchField, sortConfig]);

  const paginatedIntakes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedIntakes.slice(start, start + itemsPerPage);
  }, [filteredAndSortedIntakes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedIntakes.length / itemsPerPage);

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedIntakes.map(i => i.refId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (refId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(refId)) newSet.delete(refId);
    else newSet.add(refId);
    setSelectedIds(newSet);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved':
        return <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12}/> Approved</span>;
      case 'Draft':
        return <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FileEdit size={12}/> Draft</span>;
      case 'In Progress':
        return <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> Pending</span>;
      default:
        return <span style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 500 }}>{status}</span>;
    }
  };

  const isAllSelected = paginatedIntakes.length > 0 && paginatedIntakes.every(i => selectedIds.has(i.refId));

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#333', minHeight: '100%', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Purchase Intake</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Manage and track all procurement requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setIsImportModalOpen(true); setImportError(null); }} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <FileUp size={16} /> Import
          </button>
          {exportEnabled && (
            <button onClick={handleExport} style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <FileDown size={16} /> Export
            </button>
          )}
          <Link id="tour-create-intake" href="/client/intake/create" style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
            <Plus size={16} /> Create Request
          </Link>
        </div>
      </div>

      <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImport} style={{ display: 'none' }} />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Requests', value: totalRequests, icon: Inbox, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Pending Approval', value: pendingRequests, icon: Clock, color: '#eab308', bg: '#fefce8' },
          { label: 'Approved', value: approvedRequests, icon: CheckCircle2, color: '#22c55e', bg: '#f0fdf4' },
          { label: 'Avg Process Time', value: avgProcessingTime, icon: LayoutTemplate, color: '#8b5cf6', bg: '#f5f3ff' },
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

      {/* Main Table Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {selectedIds.size > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>{selectedIds.size} selected</span>
                <div style={{ height: '24px', width: '1px', backgroundColor: '#cbd5e1' }}></div>
                <button style={{ padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.875rem', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>Bulk Approve</button>
                <button style={{ padding: '6px 12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.875rem', color: '#ef4444', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
              </div>
            ) : (
              <>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  <select 
                    value={searchField} onChange={(e) => setSearchField(e.target.value)}
                    style={{ padding: '8px 12px', border: 'none', borderRight: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc', color: '#475569', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    <option value="All">All Fields</option>
                    <option value="Ref ID">Ref ID</option>
                    <option value="Title">Title</option>
                    <option value="Requester Name">Requester Name</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                    <Search size={16} color="#94a3b8" />
                    <input 
                      type="text" placeholder={`Search...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ padding: '8px', border: 'none', outline: 'none', width: '220px', fontSize: '0.875rem' }} 
                    />
                  </div>
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                    <Filter size={14} /> Status
                  </div>
                  <select 
                    value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: '8px 12px', border: 'none', outline: 'none', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    <option value="All">All</option>
                    <option value="Draft">Draft</option>
                    <option value="In Progress">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px 24px', width: '40px' }}>
                  <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }} />
                </th>
                {['Ref ID', 'Title', 'Requester Name', 'Status', 'Type', 'Requested At'].map((col) => {
                  const key = col === 'Type' ? 'type' : col === 'Requester Name' ? 'reqName' : col === 'Requested At' ? 'reqAt' : col === 'Ref ID' ? 'refId' : col.toLowerCase();
                  const isStatus = col === 'Status';
                  return (
                    <th id={isStatus ? 'tour-intake-status' : undefined} key={col} onClick={() => handleSort(key)} style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {col}
                        <ArrowUpDown size={14} color="#cbd5e1" />
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedIntakes.length > 0 ? (
                paginatedIntakes.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: selectedIds.has(row.refId) ? '#eff6ff' : '#fff', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <input type="checkbox" checked={selectedIds.has(row.refId)} onChange={() => handleSelectRow(row.refId)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }} />
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontWeight: 500 }}>{row.refId}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                      <span onClick={() => setSelectedIntake(row)} style={{ color: '#2563eb', cursor: 'pointer' }}>{row.title}</span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{row.reqName}</td>
                    <td style={{ padding: '16px 24px' }}>{getStatusBadge(row.status)}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{row.type}</td>
                    <td style={{ padding: '16px 24px', color: '#64748b' }}>{row.reqAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '64px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '64px', height: '64px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={32} color="#94a3b8" />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.125rem' }}>No Requests Found</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>Get started by creating your first purchase intake request.</p>
                      </div>
                      <Link href="/client/intake/create" style={{ marginTop: '8px', padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' }}>
                        Create Request
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedIntakes.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedIntakes.length)} to {Math.min(currentPage * itemsPerPage, filteredAndSortedIntakes.length)} of {filteredAndSortedIntakes.length} results
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Drawer for Quick View */}
      {selectedIntake && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ width: '500px', backgroundColor: '#fff', height: '100%', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Request Details</h2>
              <button onClick={() => setSelectedIntake(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                  <h1 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', color: '#0f172a' }}>{selectedIntake.title}</h1>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{selectedIntake.refId}</span>
                </div>
                {getStatusBadge(selectedIntake.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Requester</label>
                  <p style={{ margin: '4px 0 0 0', color: '#333', fontWeight: 500 }}>{selectedIntake.reqName}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Buyer</label>
                  <p style={{ margin: '4px 0 0 0', color: '#333', fontWeight: 500 }}>{selectedIntake.buyer}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Type</label>
                  <p style={{ margin: '4px 0 0 0', color: '#333', fontWeight: 500 }}>{selectedIntake.type}</p>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>Date</label>
                  <p style={{ margin: '4px 0 0 0', color: '#333', fontWeight: 500 }}>{selectedIntake.reqAt}</p>
                </div>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: '#475569', textTransform: 'uppercase' }}>Activity Timeline</h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb', marginTop: '6px' }}></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, color: '#333', fontSize: '0.875rem' }}>Request Created</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{selectedIntake.reqAt} by {selectedIntake.reqName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
              <Link href={`/client/events/create/single-stage?intakeRef=${selectedIntake.refId}&title=${encodeURIComponent(selectedIntake.title || '')}`} style={{ flex: 1, padding: '12px', textAlign: 'center', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', fontWeight: 500, textDecoration: 'none' }}>
                Convert to RFQ
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Import Modal */}
      {isImportModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ width: '500px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'slideIn 0.3s ease-out' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Import Intake Data</h2>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <p style={{ margin: '0 0 20px 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
                To import data in bulk, please use our Master Template. This ensures all columns are correctly mapped and validated before entry.
              </p>
              
              <button onClick={handleDownloadTemplate} style={{ width: '100%', padding: '12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}>
                <FileDown size={18} /> Download Master Template
              </button>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Upload Filled Template</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', transition: 'border-color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                >
                  <FileUp size={24} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}><span style={{ color: '#2563eb', fontWeight: 500 }}>Click to browse</span> or drag and drop</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>XLSX or XLS only</div>
                </div>
              </div>

              {importError && (
                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem', lineHeight: '1.4' }}>
                  <strong>Import Error:</strong><br/>{importError}
                </div>
              )}
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsImportModalOpen(false)} style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}} />
    </div>
  );
}
