'use client';
import { useState, useEffect } from 'react';
import { Shield, Download, Search, Clock, Activity, Filter, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 50 });
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' });
      if (search) params.set('actor', search);
      if (actionFilter) params.set('action', actionFilter);
      const res = await fetch(`/api/audit/logs?${params}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, total: 0, pages: 1, limit: 50 });
    } catch {
      setLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColor = (action: string) => {
    if (!action) return '#64748b';
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('FAIL')) return '#ef4444';
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('AWARD')) return '#10b981';
    if (action.includes('LOGIN')) return '#3b82f6';
    if (action.includes('GDPR')) return '#8b5cf6';
    if (action.includes('UPDATE') || action.includes('EDIT')) return '#f59e0b';
    return '#64748b';
  };

  const actionBg = (action: string) => actionColor(action) + '15';

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {['SOC 2 Type II Ready', 'ISO 27001 Aligned', 'GDPR Compliant'].map(badge => (
              <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                <CheckCircle2 size={12} /> {badge}
              </span>
            ))}
          </div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Audit Trail
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Immutable, tamper-proof log of every action. Retained 90 days.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.open('/api/gdpr/export', '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <Download size={16} /> Export Data (GDPR)
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Events', value: pagination.total.toLocaleString(), icon: <Activity size={20} />, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'This Page', value: logs.length, icon: <Filter size={20} />, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Retention', value: '90 Days', icon: <Clock size={20} />, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Compliance', value: 'Active', icon: <Shield size={20} />, color: '#f59e0b', bg: '#fffbeb' },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLogs(1)}
            placeholder="Search by actor email..."
            style={{ width: '100%', padding: '11px 14px 11px 42px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
          />
        </div>
        <input
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchLogs(1)}
          placeholder="Filter action (e.g. LOGIN)..."
          style={{ width: '220px', padding: '11px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: '#fff' }}
        />
        <button onClick={() => fetchLogs(1)} style={{ padding: '11px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          Search
        </button>
        <button onClick={() => { setSearch(''); setActionFilter(''); fetchLogs(1); }} style={{ padding: '11px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['Timestamp (IST)', 'Actor', 'Action', 'Entity', 'Reference', 'Details'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
                  <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
                  <Shield size={40} style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 600 }}>No audit events found</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Audit events will appear here as users interact with the platform</div>
                </td>
              </tr>
            ) : logs.map((log, i) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <td style={{ padding: '13px 16px', fontSize: '0.78rem', color: '#475569', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#475569', flexShrink: 0 }}>
                      {(log.actorEmail || '?').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>{log.actorEmail || 'System'}</span>
                  </div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ display: 'inline-flex', padding: '4px 10px', background: actionBg(log.action), color: actionColor(log.action), borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  {log.entityType || '—'}
                </td>
                <td style={{ padding: '13px 16px', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                  {log.entityRef ? `…${log.entityRef.slice(-8)}` : '—'}
                </td>
                <td style={{ padding: '13px 16px', fontSize: '0.78rem', color: '#64748b', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {log.details ? (() => { try { return JSON.stringify(JSON.parse(log.details)); } catch { return log.details; } })() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 4px' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} events
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled={pagination.page <= 1} onClick={() => fetchLogs(pagination.page - 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pagination.page <= 1 ? 0.4 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const p = Math.max(1, pagination.page - 2) + i;
              if (p > pagination.pages) return null;
              return (
                <button key={p} onClick={() => fetchLogs(p)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: p === pagination.page ? '#0f172a' : '#fff', color: p === pagination.page ? '#fff' : '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>{p}</button>
              );
            })}
            <button disabled={pagination.page >= pagination.pages} onClick={() => fetchLogs(pagination.page + 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: pagination.page >= pagination.pages ? 0.4 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
