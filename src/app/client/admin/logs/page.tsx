'use client';

/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It manages the client-side UI, user interactions, and state management.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { useState, useEffect } from 'react';
import { Shield, Download, Search, Clock, Activity, Filter, ChevronLeft, ChevronRight, CheckCircle2, FileText, AlertTriangle, Eye, RefreshCw } from 'lucide-react';

interface AuditLogItem {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string | null;
  entityRef: string | null;
  details: string | null;
  createdAt: string;
}

/**
 * Renders the main AdminAuditLogsPage component.
 * This component handles its own local state and orchestrates user interactions.
 */
export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 50 });
  const [searchActor, setSearchActor] = useState('');
  const [searchAction, setSearchAction] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50',
      });
      if (searchActor) params.set('actor', searchActor);
      if (searchAction) params.set('action', searchAction);

      const res = await fetch(`/api/audit/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        // Fallback to /api/audit
        const fallbackRes = await fetch(`/api/audit?page=${pageNum}`);
        const data = await fallbackRes.json();
        setLogs(data.logs || []);
        setPagination({ page: pageNum, total: data.total || 0, pages: Math.ceil((data.total || 0) / 50), limit: 50 });
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const getBadgeStyle = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('DELETE') || act.includes('REJECT') || act.includes('FAIL')) {
      return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    }
    if (act.includes('ADMIN') || act.includes('OVERRIDE') || act.includes('FORCE')) {
      return { bg: '#fffbe3', color: '#d97706', border: '#fef08a' };
    }
    if (act.includes('APPROVE') || act.includes('CREATE') || act.includes('SUBMIT')) {
      return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
    }
    if (act.includes('NITI') || act.includes('AI') || act.includes('BOT')) {
      return { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' };
    }
    return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
  };

  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity Ref', 'Details'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.actorEmail || ''}"`,
      `"${l.action || ''}"`,
      `"${l.entityType || ''}"`,
      `"${l.entityRef || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Banner */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px 32px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
              <CheckCircle2 size={13} /> Compliance Officer Portal
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
              <Shield size={13} /> SOC2 Audited
            </span>
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>
            System Audit Logs Datagrid
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Immutable history of administrative overrides, AI agent actions, and security access events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => fetchLogs(pagination.page)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={handleExportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 2px 6px rgba(15,23,42,0.15)' }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{pagination.total.toLocaleString()}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Recorded Events</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Filter size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{logs.length}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Active Page Items</div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>90 Days</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Retention Window</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={searchActor}
            onChange={e => setSearchActor(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLogs(1)}
            placeholder="Search by Actor Email..."
            style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <input
            value={searchAction}
            onChange={e => setSearchAction(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLogs(1)}
            placeholder="Filter by Action (e.g. Admin Override)..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={() => fetchLogs(1)}
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Apply Filters
        </button>

        <button
          onClick={() => { setSearchActor(''); setSearchAction(''); fetchLogs(1); }}
          style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Reset
        </button>
      </div>

      {/* Datagrid Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Timestamp</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Actor</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Action</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Entity Type</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Reference</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Details</th>
              <th style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  Loading compliance audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  <Shield size={36} style={{ marginBottom: '8px', display: 'block', margin: '0 auto' }} />
                  No audit logs found matching your criteria.
                </td>
              </tr>
            ) : (
              logs.map(log => {
                const badge = getBadgeStyle(log.action);
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
                      {log.actorEmail || 'System'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', padding: '3px 10px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>
                      {log.entityType || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#2563eb', fontFamily: 'monospace' }}>
                      {log.entityRef ? `…${log.entityRef.slice(-8)}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#64748b', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        style={{ padding: '6px 10px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#334155', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total items)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchLogs(pagination.page - 1)}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', opacity: pagination.page <= 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchLogs(pagination.page + 1)}
                style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.pages ? 0.5 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Log Detail Modal */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '16px', maxWidth: '600px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Audit Record Details</h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div><strong>Action:</strong> {selectedLog.action}</div>
              <div><strong>Actor:</strong> {selectedLog.actorEmail}</div>
              <div><strong>Entity Type:</strong> {selectedLog.entityType || 'N/A'}</div>
              <div><strong>Entity Ref:</strong> {selectedLog.entityRef || 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Raw Details (JSON)</label>
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto', margin: 0, maxHeight: '200px' }}>
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                  } catch {
                    return selectedLog.details || 'No details payload';
                  }
                })()}
              </pre>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSelectedLog(null)} style={{ padding: '8px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
