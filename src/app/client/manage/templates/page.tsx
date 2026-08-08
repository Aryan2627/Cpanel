'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileCode2, PlusCircle, Search, Filter, 
  MoreVertical, FileText, Code2, PlayCircle 
} from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTemplates = () => {
      const saved = localStorage.getItem('customTemplates');
      if (saved) {
        try {
          setTemplates(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse templates', e);
        }
      }
      setLoading(false);
    };

    loadTemplates();

    window.addEventListener('templates_updated', loadTemplates);
    return () => window.removeEventListener('templates_updated', loadTemplates);
  }, []);

  const filteredTemplates = templates.filter(tpl => 
    tpl.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Template Management</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Create and manage dynamic pricing templates and formula logic.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Templates', value: templates.length, icon: FileCode2, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active Templates', value: templates.length, icon: PlayCircle, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Total Fields Configured', value: templates.reduce((acc, t) => acc + (t.fields ? t.fields.length : 0), 0), icon: Code2, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 600 }}>{loading ? '-' : stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', width: '320px' }}>
              <div style={{ padding: '0 8px 0 12px' }}><Search size={16} color="#94a3b8" /></div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by name..."
                style={{ border: 'none', padding: '8px 12px 8px 0', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <Filter size={16} /> Filter
            </button>
            <Link href="/client/manage/templates/create" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
                <PlusCircle size={16} /> Create Template
              </button>
            </Link>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#fff', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Template Name</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Configuration</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Created Date</th>
                <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>Loading templates...</td></tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <FileCode2 size={32} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <p style={{ margin: 0 }}>No templates found.</p>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tpl) => {
                  const fields = tpl.fields || [];
                  const hasFormula = fields.some((f: any) => f.formula);
                  return (
                    <tr key={tpl.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <FileText size={16} />
                          </div>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{tpl.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{fields.length} Fields</span>
                          {hasFormula && (
                             <span style={{ padding: '4px 10px', backgroundColor: '#fdf4ff', color: '#c026d3', border: '1px solid #fae8ff', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Code2 size={12} /> Formula logic
                             </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#475569' }}>
                        {new Date(tpl.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 12px', color: '#0f172a', fontWeight: 500, cursor: 'pointer', fontSize: '0.75rem', marginRight: '8px' }}>
                          View Schema
                        </button>
                        <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
