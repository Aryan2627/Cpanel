'use client';
import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  actorEmail: string;
  action: string;
  entityType: string | null;
  entityRef: string | null;
  details: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN: '#16a34a',
  LOGOUT: '#64748b',
  BID_SUBMITTED: '#2563eb',
  EVENT_CREATED: '#7c3aed',
  EVENT_PUBLISHED: '#0891b2',
  EVENT_AWARDED: '#d97706',
  PO_CREATED: '#dc2626',
  INTAKE_CREATED: '#ea580c',
  APPROVAL_APPROVED: '#16a34a',
  APPROVAL_REJECTED: '#dc2626',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/audit?page=${page}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : { logs: [], total: 0 })
      .then(data => { setLogs(data.logs || []); setTotal(data.total || 0); setLoading(false); })
      .catch(() => null);
    return () => controller.abort();
  }, [page]);

  const formatDate = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filtered = logs.filter(l =>
    !search ||
    l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.entityRef || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '32px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>📋 Audit Trail</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>{total} total actions recorded</p>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <input
            type="text"
            placeholder="Search by user, action, or reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No audit logs found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Timestamp', 'User', 'Action', 'Entity', 'Reference'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => (
                <tr key={log.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                  <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: '500' }}>{log.actorEmail}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '99px', background: `${ACTION_COLORS[log.action] || '#64748b'}18`, color: ACTION_COLORS[log.action] || '#64748b', fontWeight: '600', fontSize: '0.78rem' }}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{log.entityType || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#2563eb', fontFamily: 'monospace', fontSize: '0.82rem' }}>{log.entityRef || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Page {page} · {total} total records</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'default' : 'pointer', color: '#64748b' }}>← Prev</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', background: page * 50 >= total ? '#f8fafc' : '#fff', cursor: page * 50 >= total ? 'default' : 'pointer', color: '#64748b' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
