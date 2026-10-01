'use client';

import React, { useState, useEffect } from 'react';
import { Folder, FileText, Plus, X, Play, RefreshCw, ChevronRight } from 'lucide-react';

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

  const AGENTS = ['Niti', 'Anveshan', 'Tark', 'Garuda', 'Jarvis'];

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

    const highlightYAML = (text: string) => {
    if (!text) return '';
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Single-pass regex to prevent HTML tag collisions
    const regex = /(#.*$)|("(?:\\"|[^"])*")|^(\s*(?:-\s+)?)([a-zA-Z0-9_]+)(:)|(:[ ]+)(true|false|null)\b|(:[ ]+)(\d+(?:\.\d+)?)\b/gm;
    
    return escaped.replace(regex, (match, pComment, pString, pKeySpace, pKey, pColon, pBoolSpace, pBool, pNumSpace, pNum) => {
      if (pComment) return `<span style="color: #008000;">${pComment}</span>`;
      if (pString) return `<span style="color: #a31515;">${pString}</span>`;
      if (pKey) return `${pKeySpace}<span style="color: #0451a5; font-weight: 500;">${pKey}</span>${pColon}`;
      if (pBool) return `${pBoolSpace}<span style="color: #0000ff;">${pBool}</span>`;
      if (pNum) return `${pNumSpace}<span style="color: #098658;">${pNum}</span>`;
      return match;
    });
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
        alert('Deployed to ' + activeRule.consumedBy + ' successfully!');
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

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.consumedBy]) acc[rule.consumedBy] = [];
    acc[rule.consumedBy].push(rule);
    return acc;
  }, {} as Record<string, any[]>);

  // Lifecycle Steps Header Component
  const LifecycleHeader = () => (
    <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff', padding: '0 32px', height: '70px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '800px' }}>
        
        {/* Step 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginTop: '16px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</div>
          <div>
            <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>Bootstrap</div>
            <div style={{ color: '#93c5fd', fontSize: '0.75rem' }}>Build context repos</div>
          </div>
        </div>
        <ChevronRight size={16} color="#cbd5e1" style={{ margin: '0 16px' }} />

        {/* Step 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</div>
          <div>
            <div style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>Simulate</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Run evaluations</div>
          </div>
        </div>
        <ChevronRight size={16} color="#cbd5e1" style={{ margin: '0 16px' }} />

        {/* Step 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</div>
          <div>
            <div style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>Deploy</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Push to agents</div>
          </div>
        </div>
        <ChevronRight size={16} color="#cbd5e1" style={{ margin: '0 16px' }} />

        {/* Step 4 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>4</div>
          <div>
            <div style={{ color: '#334155', fontWeight: 600, fontSize: '0.9rem' }}>Observe</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Traces & drift</div>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', backgroundColor: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <LifecycleHeader />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <div style={{ width: '320px', borderRight: '1px solid #e5e7eb', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>CONTEXT REPO</div>
            <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 600, padding: '4px 10px', borderRadius: '12px' }}>
              procurement-rules
            </div>
            <button onClick={() => setIsCreating(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Plus size={16} />
            </button>
          </div>

          <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={14} className="animate-spin" /> Loading...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.keys(groupedRules).map(agentName => (
                  <div key={agentName}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>
                      <Folder size={16} fill="#fbbf24" color="#d97706" /> {agentName}/
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px' }}>
                      {groupedRules[agentName].map((rule: any) => (
                        <div 
                          key={rule.id}
                          onClick={() => { setActiveRuleId(rule.id); setContent(rule.content); setIsCreating(false); }}
                          style={{ 
                            padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem',
                            backgroundColor: activeRuleId === rule.id && !isCreating ? '#eff6ff' : 'transparent',
                            color: activeRuleId === rule.id && !isCreating ? '#2563eb' : '#475569',
                            borderRadius: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '4px', backgroundColor: activeRuleId === rule.id && !isCreating ? '#2563eb' : '#94a3b8', transform: 'rotate(45deg)' }} />
                            {rule.name}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            v{rule.version || '1.0.0'}
                          </div>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
          {isCreating ? (
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ color: '#0f172a', margin: 0, fontWeight: 600 }}>Create Context Definition</h2>
                <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>Target Agent</label>
                  <select value={newAgent} onChange={e => setNewAgent(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none' }}>
                    {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>Definition Filename</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. strict_slas.yml" style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#475569', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>Short Description</label>
                  <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What does this boundary enforce?" style={{ width: '100%', padding: '12px', borderRadius: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#0f172a', outline: 'none' }} />
                </div>
                
                <button onClick={handleCreate} disabled={!newName || saving} style={{ marginTop: '12px', background: '#2563eb', color: '#fff', padding: '12px', borderRadius: '6px', fontWeight: 500, border: 'none', cursor: 'pointer' }}>
                  {saving ? 'Creating...' : 'Initialize Context'}
                </button>
              </div>
            </div>
          ) : activeRule ? (
            <>
              {/* Editor Header */}
              <div style={{ padding: '16px 32px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {activeRule.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ backgroundColor: '#f1f5f9', color: '#3b82f6', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '16px', fontWeight: 500 }}>
                    v{activeRule.version || '1.0.0'} · AI + human
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving || content === activeRule.content}
                    style={{ background: 'none', border: 'none', color: (saving || content === activeRule.content) ? '#94a3b8' : '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: (saving || content === activeRule.content) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Play size={14} fill={(saving || content === activeRule.content) ? '#94a3b8' : '#2563eb'} /> {saving ? 'Deploying...' : 'Deploy'}
                  </button>
                </div>
              </div>

              {/* Editor Area (Light Theme Code Look) */}
              <div style={{ flex: 1, padding: '32px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px', fontFamily: 'Consolas, Monaco, monospace' }}>
                  # {activeRule.consumedBy.toLowerCase()} · {activeRule.consumedBy}/{activeRule.name}
                </div>
                <div style={{ position: 'relative', flex: 1, overflow: 'auto' }}>
                  <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    spellCheck={false}
                    style={{ 
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      backgroundColor: 'transparent', border: 'none', 
                      color: 'transparent', caretColor: '#000', 
                      fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.9rem', lineHeight: 1.8, 
                      resize: 'none', outline: 'none', zIndex: 2, margin: 0, padding: 0
                    }}
                  />
                  <div 
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: highlightYAML(content) + '<br/>' }}
                    style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.9rem', lineHeight: 1.8,
                      pointerEvents: 'none', zIndex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      color: '#000', margin: 0, padding: 0
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Select a rule from the context repo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
