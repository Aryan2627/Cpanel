'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching templates:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', minHeight: '100%', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Templates</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Manage dynamic templates for your sourcing events.</p>
        </div>
        <Link 
          href="/client/manage/templates/create" 
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: '500' }}
        >
          + Create a Template
        </Link>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#64748b' }}>Template Name</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#64748b' }}>Fields Count</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#64748b' }}>Created At</th>
              <th style={{ padding: '12px 24px', fontWeight: '500', color: '#64748b' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}>Loading...</td></tr>
            ) : templates.length > 0 ? (
              templates.map((tpl) => {
                const fields = JSON.parse(tpl.fields || '[]');
                return (
                  <tr key={tpl.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                    <td style={{ padding: '12px 24px', color: '#0f172a', fontWeight: '500' }}>{tpl.name}</td>
                    <td style={{ padding: '12px 24px', color: '#64748b' }}>{fields.length} Fields</td>
                    <td style={{ padding: '12px 24px', color: '#64748b' }}>{new Date(tpl.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 24px' }}>
                      <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>View</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No templates created yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
