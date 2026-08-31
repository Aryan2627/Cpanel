
'use client';
import { useState, useEffect } from 'react';
import { Settings, Plus, X, List, CheckCircle2, User, Workflow } from 'lucide-react';

export default function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<'DATA' | 'APPROVALS'>('APPROVALS');

  // --- DATA FIELD MAPPING STATE ---
  const [dropdowns, setDropdowns] = useState<{ categories: string[], teams: string[], departments: string[] }>({
    categories: [],
    teams: [],
    departments: []
  });
  const [newInput, setNewInput] = useState({ categories: '', teams: '', departments: '' });

  // --- APPROVAL WORKFLOWS STATE ---
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', category: 'General', approvers: [] as string[] });

  useEffect(() => {
    // Load custom dropdowns
    const saved = localStorage.getItem('customDropdowns');
    if (saved) {
      try {
        setDropdowns(JSON.parse(saved));
      } catch (e) {}
    }

    // Load users
    fetch('/api/users').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setUsers(data);
    });

    // Load workflows
    fetch('/api/workflows').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setWorkflows(data);
    });
  }, []);

  // --- DATA MAPPING HANDLERS ---
  const handleAdd = (listName: 'categories' | 'teams' | 'departments') => {
    const value = newInput[listName].trim();
    if (!value) return;
    if (dropdowns[listName].includes(value)) {
      alert(`${value} already exists.`);
      return;
    }
    const updated = { ...dropdowns, [listName]: [...dropdowns[listName], value] };
    setDropdowns(updated);
    setNewInput(prev => ({ ...prev, [listName]: '' }));
    localStorage.setItem('customDropdowns', JSON.stringify(updated));
    window.dispatchEvent(new Event('customDropdowns_updated'));
  };

  const handleRemove = (listName: 'categories' | 'teams' | 'departments', itemToRemove: string) => {
    const updated = { ...dropdowns, [listName]: dropdowns[listName].filter(item => item !== itemToRemove) };
    setDropdowns(updated);
    localStorage.setItem('customDropdowns', JSON.stringify(updated));
    window.dispatchEvent(new Event('customDropdowns_updated'));
  };

  const renderList = (title: string, listName: 'categories' | 'teams' | 'departments') => (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '24px', flex: 1 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <List size={18} color="#64748b" /> {title}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
        Define the dropdown options for {title.toLowerCase()} mapping across the platform.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={newInput[listName]}
          onChange={(e) => setNewInput({ ...newInput, [listName]: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(listName)}
          placeholder={`Add new ${title.toLowerCase()}...`}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontSize: '0.9rem' }}
        />
        <button 
          onClick={() => handleAdd(listName)}
          style={{ padding: '0 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} /> Add
        </button>
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
        {dropdowns[listName].length === 0 ? (
          <div style={{ padding: '24px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>No records found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <tbody>
              {dropdowns[listName].map((item, idx) => (
                <tr key={idx} style={{ borderBottom: idx === dropdowns[listName].length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#334155' }}>{item}</td>
                  <td style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                    <button onClick={() => handleRemove(listName, item)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Remove"><X size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // --- APPROVAL WORKFLOW HANDLERS ---
  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || newWorkflow.approvers.length === 0) {
      alert("Name and at least one approver are required.");
      return;
    }
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkflow)
      });
      if (res.ok) {
        const created = await res.json();
        setWorkflows([created, ...workflows]);
        setShowCreateModal(false);
        setNewWorkflow({ name: '', category: 'General', approvers: [] });
      }
    } catch (e) {
      alert("Failed to create workflow");
    }
  };

  const toggleApprover = (email: string) => {
    setNewWorkflow(prev => {
      const exists = prev.approvers.includes(email);
      if (exists) return { ...prev, approvers: prev.approvers.filter(a => a !== email) };
      return { ...prev, approvers: [...prev.approvers, email] };
    });
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Workflow size={32} color="#0f172a" />
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Workflows & Settings</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Manage approval chains, users, and global data mapping.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px' }}>
        <div 
          onClick={() => setActiveTab('APPROVALS')}
          style={{ paddingBottom: '12px', fontWeight: '600', cursor: 'pointer', color: activeTab === 'APPROVALS' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'APPROVALS' ? '2px solid #2563eb' : '2px solid transparent' }}
        >
          Approval Workflows
        </div>
        <div 
          onClick={() => setActiveTab('DATA')}
          style={{ paddingBottom: '12px', fontWeight: '600', cursor: 'pointer', color: activeTab === 'DATA' ? '#2563eb' : '#64748b', borderBottom: activeTab === 'DATA' ? '2px solid #2563eb' : '2px solid transparent' }}
        >
          Data Field Mapping
        </div>
      </div>

      {activeTab === 'DATA' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {renderList('Categories', 'categories')}
          {renderList('Departments', 'departments')}
        </div>
      )}

      {activeTab === 'APPROVALS' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Active Approval Chains</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> New Workflow
            </button>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            {workflows.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                No approval workflows configured. Click "New Workflow" to build one.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Workflow Name</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Approvers (In Order)</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((wf, i) => {
                    const approversList = JSON.parse(wf.approvers || '[]');
                    return (
                      <tr key={wf.id} style={{ borderBottom: i === workflows.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '0.95rem', fontWeight: '500', color: '#0f172a' }}>{wf.name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#64748b' }}>
                          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>{wf.category}</span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {approversList.map((email: string, index: number) => {
                                const userMatch = users.find(u => u.email === email);
                                return (
                                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#334155' }}>
                                      <User size={14} color="#64748b" /> {userMatch ? userMatch.name : email}
                                    </div>
                                    {index < approversList.length - 1 && <span style={{ color: '#cbd5e1' }}>→</span>}
                                  </div>
                                );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '600px', maxWidth: '90%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Build Approval Workflow</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Workflow Name *</label>
                <input 
                  type="text" 
                  value={newWorkflow.name} 
                  onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})} 
                  placeholder="e.g., IT Hardware Capital Expenditure"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Select Approvers from User Directory *</label>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {users.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No users found in the system. Add users first.</div>
                  ) : (
                    users.map(u => {
                      const isSelected = newWorkflow.approvers.includes(u.email);
                      return (
                        <div 
                          key={u.id} 
                          onClick={() => toggleApprover(u.email)}
                          style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isSelected ? '#eff6ff' : '#fff', transition: 'background 0.2s' }}
                        >
                          <div>
                            <div style={{ fontWeight: '600', color: isSelected ? '#1d4ed8' : '#334155', fontSize: '0.95rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.email} • {u.role}</div>
                          </div>
                          {isSelected && <CheckCircle2 color="#2563eb" size={20} />}
                        </div>
                      )
                    })
                  )}
                </div>
                {newWorkflow.approvers.length > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>Approval Order:</strong> 
                    {newWorkflow.approvers.map((email, i) => (
                      <span key={i}>{users.find(u => u.email === email)?.name}{i < newWorkflow.approvers.length - 1 ? ' ➔ ' : ''}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '20px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '10px 24px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateWorkflow} disabled={!newWorkflow.name || newWorkflow.approvers.length === 0} style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: (!newWorkflow.name || newWorkflow.approvers.length === 0) ? 0.5 : 1 }}>
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
