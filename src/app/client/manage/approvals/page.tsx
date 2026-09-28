'use client';
import { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle2, ShieldAlert, GitMerge, Play, Save, ChevronLeft, User, Server, ArrowDown } from 'lucide-react';

export default function ApprovalsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'builder'>('list');

  // Linear Flow State
  const [flowName, setFlowName] = useState('Untitled Workflow');
  const [steps, setSteps] = useState<any[]>([
    { id: '1', type: 'trigger', label: 'PR Submitted', assignee: '' }
  ]);
  const [showAddMenu, setShowAddMenu] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/workflows').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setWorkflows(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveFlow = async () => {
    try {
      const res = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: flowName,
          category: 'Custom Flow',
          approvers: JSON.stringify(steps.filter(s => s.type === 'approval').map(s => s.assignee || 'System')),
        })
      });
      if (res.ok) {
        const wf = await res.json();
        setWorkflows([wf, ...workflows]);
        setMode('list');
      }
    } catch (e) {
      alert("Error saving flow");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workflow?')) return;
    const res = await fetch(`/api/workflows?id=${id}`, { method: 'DELETE' });
    if (res.ok) setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  const addStep = (index: number, type: string) => {
    const newStep = {
      id: Date.now().toString(),
      type,
      label: type === 'approval' ? 'Manager Approval' : type === 'condition' ? 'Amount > $10K' : 'System Action',
      assignee: type === 'approval' ? 'IT Director' : ''
    };
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    setSteps(newSteps);
    setShowAddMenu(null);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, field: string, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  if (mode === 'builder') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f8fafc', zIndex: 1000, overflow: 'hidden' }}>
        
        {/* Atlan-style Header */}
        <div style={{ height: '70px', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setMode('list')} style={{ background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0f172a', transition: 'all 0.2s' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linear Automations</span>
              <input 
                value={flowName} 
                onChange={e => setFlowName(e.target.value)} 
                style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', border: 'none', outline: 'none', background: 'transparent', padding: 0, width: '300px' }}
                placeholder="Name this workflow..."
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSaveFlow} style={{ padding: '12px 28px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
              <Save size={18} /> Save & Activate
            </button>
          </div>
        </div>

        {/* Linear Builder Canvas */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {steps.map((step, index) => (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                
                {/* Step Card */}
                <div style={{ 
                  width: '100%', 
                  background: '#fff', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  {index > 0 && (
                    <button onClick={() => removeStep(step.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}><Trash2 size={18} /></button>
                  )}
                  
                  {/* Card Header Color Bar */}
                  <div style={{ 
                    height: '6px', 
                    width: '100%', 
                    background: step.type === 'trigger' ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 
                                step.type === 'approval' ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' :
                                step.type === 'condition' ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                                'linear-gradient(90deg, #10b981, #34d399)'
                  }}></div>

                  <div style={{ padding: '24px' }}>
                    {/* Editable Step Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: step.type === 'trigger' ? '#eff6ff' : step.type === 'approval' ? '#f5f3ff' : step.type === 'condition' ? '#fffbeb' : '#ecfdf5',
                        color: step.type === 'trigger' ? '#3b82f6' : step.type === 'approval' ? '#8b5cf6' : step.type === 'condition' ? '#f59e0b' : '#10b981'
                      }}>
                        {step.type === 'trigger' && <Play size={20} />}
                        {step.type === 'approval' && <User size={20} />}
                        {step.type === 'condition' && <GitMerge size={20} />}
                        {step.type === 'action' && <Server size={20} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
                          {step.type === 'trigger' ? 'Trigger' : step.type === 'approval' ? 'Approval Step' : step.type === 'condition' ? 'Logic Condition' : 'System Action'}
                        </div>
                        <input 
                          value={step.label}
                          onChange={(e) => updateStep(step.id, 'label', e.target.value)}
                          placeholder="Enter step name..."
                          style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', border: 'none', borderBottom: '2px solid #e2e8f0', outline: 'none', background: 'transparent', padding: '2px 0', width: '100%' }}
                        />
                      </div>
                    </div>

                    {/* TRIGGER fields */}
                    {step.type === 'trigger' && (
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>Trigger Description</label>
                        <input value={step.description || ''} onChange={e => updateStep(step.id, 'description', e.target.value)} placeholder="e.g. Fires when a new PR is submitted..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                      </div>
                    )}

                    {/* APPROVAL fields */}
                    {step.type === 'approval' && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Assigned Role / User</label>
                          <input value={step.assignee || ''} onChange={e => updateStep(step.id, 'assignee', e.target.value)} placeholder="e.g. Finance Manager, VP of Operations..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>SLA / Deadline</label>
                          <input value={step.sla || ''} onChange={e => updateStep(step.id, 'sla', e.target.value)} placeholder="e.g. 2 business days" style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Instructions for Approver</label>
                          <input value={step.instructions || ''} onChange={e => updateStep(step.id, 'instructions', e.target.value)} placeholder="e.g. Review all attached quotes before approving..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                      </div>
                    )}

                    {/* CONDITION fields */}
                    {step.type === 'condition' && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Condition / Criteria (IF)</label>
                          <input value={step.ifCondition || ''} onChange={e => updateStep(step.id, 'ifCondition', e.target.value)} placeholder="e.g. PR Total Amount > $50,000" style={{ width: '100%', padding: '10px 14px', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>If TRUE → Route To</label>
                            <input value={step.trueRoute || ''} onChange={e => updateStep(step.id, 'trueRoute', e.target.value)} placeholder="e.g. VP Approval" style={{ width: '100%', padding: '10px 14px', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>If FALSE → Route To</label>
                            <input value={step.falseRoute || ''} onChange={e => updateStep(step.id, 'falseRoute', e.target.value)} placeholder="e.g. Auto-Approve" style={{ width: '100%', padding: '10px 14px', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ACTION fields */}
                    {step.type === 'action' && (
                      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Action Type</label>
                          <select value={step.actionType || 'notify'} onChange={e => updateStep(step.id, 'actionType', e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff', cursor: 'pointer' }}>
                            <option value="notify">Send Email Notification</option>
                            <option value="po">Auto-Generate Purchase Order</option>
                            <option value="erp">Sync to ERP System</option>
                            <option value="reject">Auto-Reject Request</option>
                            <option value="escalate">Escalate to Senior Manager</option>
                            <option value="close">Close & Archive Request</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Notes / Details</label>
                          <input value={step.actionNote || ''} onChange={e => updateStep(step.id, 'actionNote', e.target.value)} placeholder="e.g. Notify requester with rejection reason..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Connector Line & Add Button */}
                <div style={{ position: 'relative', width: '2px', height: '60px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setShowAddMenu(showAddMenu === index ? null : index)}
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: '2px solid #e2e8f0', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', zIndex: 2,
                      transition: 'all 0.2s', transform: showAddMenu === index ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    <Plus size={16} />
                  </button>

                  {/* Add Node Popover */}
                  {showAddMenu === index && (
                    <div style={{ position: 'absolute', top: '15px', left: '30px', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', width: '240px', padding: '12px', zIndex: 20 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', padding: '4px 12px 8px 12px', textTransform: 'uppercase' }}>Add Next Step</div>
                      
                      <button onClick={() => addStep(index, 'approval')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ color: '#8b5cf6' }}><User size={18} /></div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Approval</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Assign to user or role</div>
                        </div>
                      </button>

                      <button onClick={() => addStep(index, 'condition')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ color: '#f59e0b' }}><GitMerge size={18} /></div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Logic Condition</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>If/Else branching</div>
                        </div>
                      </button>

                      <button onClick={() => addStep(index, 'action')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#ecfdf5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ color: '#10b981' }}><Server size={18} /></div>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>System Action</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Automated updates</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* End of Flow Indicator */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px' }}>
               <div style={{ padding: '8px 20px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <CheckCircle2 size={16} /> END OF WORKFLOW
               </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // List Mode (Default)
  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', background: '#fff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px' }}>
            <Server size={14} /> Workflow Automation Engine
          </div>
          <h1 style={{ margin: '0 0 12px 0', fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>Flow & Approvals</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem', maxWidth: '600px', lineHeight: 1.5 }}>Design visual, automated workflows for procurement processes. Build complex multi-stage approvals, conditionals, and system actions instantly.</p>
        </div>
        <button onClick={() => {
          setSteps([{ id: '1', type: 'trigger', label: 'PR Submitted', assignee: '' }]); setFlowName('New Linear Flow'); setMode('builder');
        }} style={{ padding: '14px 28px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)', transition: 'all 0.2s', backgroundImage: 'linear-gradient(to right, #0f172a, #1e293b)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <Plus size={18} /> Create New Flow
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        workflows.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
            {workflows.map(w => {
              let approverList: string[] = [];
              try { 
                let parsed = JSON.parse(w.approvers || '[]'); 
                if (Array.isArray(parsed)) {
                  approverList = parsed;
                } else if (typeof parsed === 'string') {
                  approverList = [parsed];
                }
              } catch (e) {
                if (typeof w.approvers === 'string' && w.approvers.length > 0) {
                  approverList = [w.approvers];
                }
              }
              
              return (
                <div key={w.id} style={{ backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', cursor: 'pointer', position: 'relative', overflow: 'hidden' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                  
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <div style={{ display: 'inline-flex', padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, marginBottom: '12px', border: '1px solid #e2e8f0' }}>{w.category || 'Custom Flow'}</div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{w.name}</h3>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>Updated {new Date(w.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><ArrowDown size={12} /> Linear Path</div>
                    {approverList.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(37,99,235,0.1)' }}><Play size={12} /></div>
                           <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Trigger Event</div>
                        </div>
                        {approverList.map((ap: string, i: number) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '13px', borderLeft: '2px solid #cbd5e1', paddingLeft: '14px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f8faff', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0, border: '1px solid #e2e8f0' }}>{i + 1}</div>
                            <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}><User size={14} color="#64748b" /> {ap}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Flow contains non-user actions</div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}><CheckCircle2 size={14} /> Active</div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(w.id); }} style={{ padding: '10px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '80px', textAlign: 'center', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}><GitMerge size={36} color="#64748b" /></div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', margin: '0 0 12px 0' }}>No workflows configured</h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '400px', margin: '0 0 32px 0', lineHeight: 1.5 }}>Build your first visual approval flow to route purchase requests automatically through your organization.</p>
            <button onClick={() => {
              setSteps([{ id: '1', type: 'trigger', label: 'PR Submitted', assignee: '' }]); setFlowName('New Linear Flow'); setMode('builder');
            }} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px', background: '#2563eb', color: '#fff', borderRadius: '14px', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.4)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}><Plus size={20} /> Create New Flow</button>
          </div>
        )
      )}
    </div>
  );
}