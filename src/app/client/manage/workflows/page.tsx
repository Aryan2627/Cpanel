'use client';
import { useState, useEffect } from 'react';
import { Plus, X, GitBranch, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', category: '' });
  const [approvers, setApprovers] = useState<string[]>(['']);
  
  // Mock categories for now, ideally fetched from DB
  const [categories, setCategories] = useState<string[]>(['IT Hardware', 'Marketing', 'Office Supplies', 'General']);

  useEffect(() => {
    fetchWorkflows();
    
    // Also try to load categories from our simple dropdown list if they exist
    try {
      const saved = localStorage.getItem('customDropdowns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories && parsed.categories.length > 0) {
          setCategories(parsed.categories);
        }
      }
    } catch (e) {}
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (Array.isArray(data)) setWorkflows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddApprover = () => setApprovers([...approvers, '']);
  const handleRemoveApprover = (index: number) => setApprovers(approvers.filter((_, i) => i !== index));
  const handleApproverChange = (index: number, val: string) => {
    const newArr = [...approvers];
    newArr[index] = val;
    setApprovers(newArr);
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name || !newWorkflow.category || approvers.some(a => !a.trim())) {
      alert("Please fill all fields and provide valid emails for approvers.");
      return;
    }

    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkflow.name,
          category: newWorkflow.category,
          approvers: approvers.map(a => a.trim())
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewWorkflow({ name: '', category: '' });
        setApprovers(['']);
        fetchWorkflows();
      } else {
        alert("Failed to create workflow.");
      }
    } catch (error) {
      alert("Error creating workflow.");
    }
  };

  return (
    <div style={{ padding: '32px', backgroundColor: '#f8fafc', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: '#4f46e5', display: 'flex' }}>
              <GitBranch size={24} />
            </div>
            Approval Workflows
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Configure category-specific hierarchy approvals for Sourcing Events.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} /> Create Workflow
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Workflow Name</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Category Trigger</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Approval Chain</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading workflows...</td></tr>
            ) : workflows.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No workflows configured yet. Create one to get started!</td></tr>
            ) : (
              workflows.map(wf => {
                let parsedApprovers = [];
                try { parsedApprovers = JSON.parse(wf.approvers); } catch(e) {}
                
                return (
                  <tr key={wf.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px', fontWeight: 500, color: '#0f172a' }}>{wf.name}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 12px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {wf.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {parsedApprovers.map((ap: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.875rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>{ap}</span>
                            {i < parsedApprovers.length - 1 && <ArrowRight size={14} color="#94a3b8" />}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {wf.isActive ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.875rem', fontWeight: 500 }}><CheckCircle2 size={16} /> Active</span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}><ShieldAlert size={16} /> Inactive</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', width: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Create Workflow</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Workflow Name</label>
                <input 
                  type="text" value={newWorkflow.name} onChange={e => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  placeholder="e.g. High Value IT Purchases"
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Trigger Category</label>
                <select 
                  value={newWorkflow.category} onChange={e => setNewWorkflow({...newWorkflow, category: e.target.value})}
                  style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="" disabled>Select a category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Approval Hierarchy (Sequential)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {approvers.map((appr, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                        {index + 1}
                      </div>
                      <input 
                        type="email" value={appr} onChange={e => handleApproverChange(index, e.target.value)}
                        placeholder="approver@company.com"
                        style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} 
                      />
                      {approvers.length > 1 && (
                        <button onClick={() => handleRemoveApprover(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={handleAddApprover} style={{ alignSelf: 'flex-start', padding: '6px 12px', background: 'none', border: '1px dashed #cbd5e1', borderRadius: '6px', color: '#4f46e5', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                    + Add Step
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreateWorkflow} style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Save Workflow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
