'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileCode, CheckCircle2, Save, Play, Search, Folder, RefreshCw } from 'lucide-react';

export default function ContextStudioPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [activeRuleId, setActiveRuleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/context-studio');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
        if (data.length > 0) {
          setActiveRuleId(data[0].id);
          setContent(data[0].content);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const activeRule = rules.find(r => r.id === activeRuleId);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/context-studio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeRuleId, content })
      });
      if (res.ok) {
        const updated = await res.json();
        setRules(rules.map(r => r.id === updated.id ? updated : r));
        alert('Context rule updated and deployed to agents successfully!');
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar / Context Repo */}
      <div style={{ width: '280px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>
            <Database size={20} color="#a78bfa" />
            Context Studio
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Version controlled AI boundaries</p>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Folder size={14} /> definitions/
          </div>
          
          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={14} className="animate-spin" /> Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {rules.map(rule => (
                <div 
                  key={rule.id}
                  onClick={() => {
                    setActiveRuleId(rule.id);
                    setContent(rule.content);
                  }}
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    backgroundColor: activeRuleId === rule.id ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                    color: activeRuleId === rule.id ? '#a78bfa' : '#cbd5e1',
                    borderLeft: activeRuleId === rule.id ? '2px solid #a78bfa' : '2px solid transparent'
                  }}
                >
                  <FileCode size={16} />
                  {rule.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>
        {activeRule ? (
          <>
            {/* Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 6px 0', fontWeight: 600 }}>{activeRule.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>Consumed by: <strong style={{ color: '#cbd5e1' }}>{activeRule.consumedBy}</strong></span>
                  <span>Version: <strong style={{ color: '#cbd5e1' }}>{activeRule.version}</strong></span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}><CheckCircle2 size={14} /> Active</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleSave}
                  disabled={saving || content === activeRule.content}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: (saving || content === activeRule.content) ? '#334155' : '#8b5cf6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: (saving || content === activeRule.content) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                >
                  <Save size={16} /> {saving ? 'Deploying...' : 'Deploy Context'}
                </button>
              </div>
            </div>

            {/* Code Editor Area */}
            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                # You are editing the global context for this agent. YAML/JSON formatting is supported.
              </div>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ 
                  flex: 1, 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  color: '#e2e8f0', 
                  fontFamily: 'Consolas, Monaco, monospace', 
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a context definition to edit
          </div>
        )}
      </div>
    </div>
  );
}
