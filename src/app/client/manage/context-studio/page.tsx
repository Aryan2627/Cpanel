'use client';

import React, { useState, useEffect } from 'react';
import { Database, FileCode, CheckCircle2, Save, Plus, Folder, RefreshCw, Cpu, X } from 'lucide-react';

export default function ContextStudioPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [activeRuleId, setActiveRuleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  
  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAgent, setNewAgent] = useState('Niti');
  const [newDesc, setNewDesc] = useState('');

  const AGENTS = [
    'Niti',
    'Anveshan',
    'Tark',
    'Garuda',
    'Jarvis'
  ];

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
        if (data.length > 0 && !activeRuleId) {
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
        alert('Context rule updated and deployed to ' + activeRule.consumedBy + ' successfully!');
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/context-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.endsWith('.yml') ? newName : newName + '.yml',
          description: newDesc || 'Custom context definition',
          consumedBy: newAgent,
          content: 'definition: "New Strategy"\nscope:\n  regions: [Global]\nrules:\n  - "Rule 1"'
        })
      });
      if (res.ok) {
        const created = await res.json();
        setRules([created, ...rules]);
        setActiveRuleId(created.id);
        setContent(created.content);
        setIsCreating(false);
        setNewName('');
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  // Group rules by agent
  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.consumedBy]) acc[rule.consumedBy] = [];
    acc[rule.consumedBy].push(rule);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', backgroundColor: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sidebar / Context Repo */}
      <div style={{ width: '300px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>
              <Database size={20} color="#a78bfa" />
              Context Studio
            </div>
            <button onClick={() => setIsCreating(true)} style={{ background: 'rgba(167, 139, 250, 0.15)', border: '1px solid rgba(167, 139, 250, 0.3)', color: '#a78bfa', borderRadius: '6px', padding: '4px', cursor: 'pointer' }}>
              <Plus size={16} />
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Omni-Agent Logic Controller</p>
        </div>

        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={14} className="animate-spin" /> Loading Agents...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.keys(groupedRules).map(agentName => (
                <div key={agentName}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Cpu size={14} color="#38bdf8" /> {agentName}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '1px solid #334155', marginLeft: '6px' }}>
                    {groupedRules[agentName].map((rule: any) => (
                      <div 
                        key={rule.id}
                        onClick={() => { setActiveRuleId(rule.id); setContent(rule.content); setIsCreating(false); }}
                        style={{ 
                          padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                          backgroundColor: activeRuleId === rule.id && !isCreating ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
                          color: activeRuleId === rule.id && !isCreating ? '#a78bfa' : '#cbd5e1'
                        }}
                      >
                        <FileCode size={14} />
                        {rule.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', position: 'relative' }}>
        {isCreating ? (
          <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#fff', margin: 0 }}>Create Context Definition</h2>
              <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Target Agent</label>
                <select value={newAgent} onChange={e => setNewAgent(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }}>
                  {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Definition Filename</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. strict_slas.yml" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '6px' }}>Short Description</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this boundary enforce?" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
              </div>
              
              <button onClick={handleCreate} disabled={!newName || saving} style={{ marginTop: '16px', background: '#8b5cf6', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {saving ? 'Creating...' : 'Initialize Context'}
              </button>
            </div>
          </div>
        ) : activeRule ? (
          <>
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

            <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                # You are editing the global context for {activeRule.consumedBy}. YAML/JSON formatting is supported.
              </div>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ 
                  flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', 
                  color: '#e2e8f0', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.95rem', lineHeight: 1.6, resize: 'none', outline: 'none',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select or create a context definition
          </div>
        )}
      </div>
    </div>
  );
}
