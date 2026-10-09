'use client';

/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It manages the client-side UI, user interactions, and state management.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Zap, Save, Check } from 'lucide-react';

/**
 * Renders the main ApprovalRulesPage component.
 * This component handles its own local state and orchestrates user interactions.
 */
export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [hierarchyCount, setHierarchyCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [activeFlowNames, setActiveFlowNames] = useState<string[]>(['Default Flow']);

  // State for new row
  const [addingToFlow, setAddingToFlow] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    approvalType: 'Quote Selection',
    type: 'TPA',
    logic: 'More than',
    value1: '',
    value2: '',
    department: '',
    approverList: Array.from({ length: 20 }, () => [] as string[])
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, usersRes, deptsRes] = await Promise.all([
        fetch('/api/approval-rules'),
        fetch('/api/users'),
        fetch('/api/departments').catch(() => ({ json: () => [] }))
      ]);
      
      const rulesData = await rulesRes.json();
      const usersData = await usersRes.json();
      const deptsData = await deptsRes.json();
      
      setRules(rulesData);
      setDbUsers(usersData);
      setDepartments(deptsData || [
        { id: '1', name: 'Information Technology' },
        { id: '2', name: 'Finance' },
        { id: '3', name: 'Operations' }
      ]);

      // Calculate max hierarchy columns needed based on existing rules
      let maxH = 5;
      const flows = new Set<string>();
      rulesData.forEach((r: any) => {
        if (r.flowName) flows.add(r.flowName);
        try {
          const arr = JSON.parse(r.approvers || '[]');
          if (arr.length > maxH) maxH = arr.length;
        } catch(e) {}
      });
      setHierarchyCount(maxH);
      
      if (flows.size > 0) {
        setActiveFlowNames(Array.from(flows));
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlow = async () => {
    setIsSaving(true);
    try {
      if (addingToFlow && newRule.value1 && newRule.department) {
        const approvers = newRule.approverList
          .slice(0, hierarchyCount)
          .map(arr => arr.join(','))
          .filter(str => str !== '');

        if (approvers.length === 0) {
          alert("Please select at least one approver for the new rule.");
          setIsSaving(false);
          return;
        }

        const res = await fetch('/api/approval-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flowName: addingToFlow,
            approvalType: newRule.approvalType,
            type: newRule.type,
            logic: newRule.logic,
            value1: newRule.value1,
            value2: newRule.logic === 'Between' ? newRule.value2 : null,
            department: newRule.department,
            approvers: approvers
          })
        });
        const savedRule = await res.json();
        setRules([...rules, savedRule]);
        
        setAddingToFlow(null);
        setNewRule({
          approvalType: 'Quote Selection', type: 'TPA', logic: 'More than', value1: '', value2: '', department: '',
          approverList: Array.from({ length: 20 }, () => [] as string[])
        });
      }
      
      alert("Approval Flow configuration saved successfully!");
    } catch (error) {
      console.error("Error saving flow:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/approval-rules/${id}`, { method: 'DELETE' });
      setRules(rules.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  const handleRenameFlow = (oldName: string, newName: string) => {
    setActiveFlowNames(names => names.map(n => n === oldName ? newName : n));
    // Update local state rules to match new name so they don't disappear
    setRules(rules.map(r => r.flowName === oldName ? { ...r, flowName: newName } : r));
    // (In a full app, you'd want a bulk update endpoint here to actually rename in DB.
    // For now, new rules added will use the new name).
  };

  const handleAddNewFlow = () => {
    let name = "New Flow";
    let counter = 1;
    while(activeFlowNames.includes(name)) {
      name = `New Flow ${counter}`;
      counter++;
    }
    setActiveFlowNames([...activeFlowNames, name]);
  };

  const MultiUserSelect = ({ value, onChange, placeholder = "Select..." }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleUser = (userStr: string) => {
      if (value.includes(userStr)) {
        onChange(value.filter((v: string) => v !== userStr));
      } else {
        onChange([...value, userStr]);
      }
    };
    
    return (
      <div style={{ position: 'relative', width: '130px' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="form-input"
          style={{ minHeight: '32px', padding: '4px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: '4px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          {value.length === 0 ? <span style={{color: '#999'}}>{placeholder}</span> : null}
          {value.map((v: string) => (
            <span key={v} style={{ background: '#e2e8f0', padding: '2px 4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' }}>
              {v.substring(0,10)}{v.length > 10 ? '...' : ''}
              <span onClick={(e) => { e.stopPropagation(); toggleUser(v); }} style={{marginLeft: '4px', cursor: 'pointer', color: '#666'}}>&times;</span>
            </span>
          ))}
        </div>
        {isOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '4px', borderBottom: '1px solid #ddd', fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', textAlign: 'center' }} onClick={() => setIsOpen(false)}>Done</div>
            {dbUsers.map(u => {
               const uName = u.name || u.email; const uVal = u.email || u.name;
               return (
                 <div key={u.id} style={{ padding: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }} onClick={() => toggleUser(uVal)}>
                   <input type="checkbox" checked={value.includes(uVal)} readOnly style={{ margin: 0 }} />
                   <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uName}</span>
                 </div>
               );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-content" style={{ padding: '32px', paddingBottom: '100px' }}>
      
      {/* HEADER SECTION */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-blue" style={{ marginBottom: '12px' }}>
            <Zap size={12} /> Matrix Workflow Engine
          </div>
          <h1 className="page-title" style={{ color: 'var(--text)', marginBottom: '8px' }}>
            Approval Routing Matrix
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '800px', lineHeight: 1.5 }}>
            Configure the exact horizontal approval chain based on the document type, condition, and department. 
            Approvers will be notified sequentially from User 1 to User {hierarchyCount}.
          </p>
        </div>
        <button 
          onClick={handleAddNewFlow}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Add Flow Matrix
        </button>
      </div>

      {/* MATRIX TABLES GROUPED BY FLOW NAME */}
      {activeFlowNames.map((flowName) => {
        const flowRules = rules.filter(r => (r.flowName || 'Default Flow') === flowName);
        
        return (
          <div key={flowName} className="card" style={{ overflowX: 'auto', marginBottom: '40px' }}>
            {/* Flow Title Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text"
                value={flowName}
                onChange={(e) => handleRenameFlow(flowName, e.target.value)}
                style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', background: 'transparent', border: '1px solid transparent', padding: '4px 8px', borderRadius: '4px', flex: 1, outline: 'none' }}
                onFocus={(e) => e.target.style.border = '1px solid #cbd5e1'}
                onBlur={(e) => e.target.style.border = '1px solid transparent'}
                title="Click to rename this flow"
              />
            </div>
            
            <div style={{ padding: '20px' }}>
              <table className="table" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '160px' }}>Approval Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '120px' }}>Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '220px' }}>Condition</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '150px' }}>Department</th>
                    
                    {Array.from({ length: hierarchyCount }).map((_, idx) => (
                      <th key={idx} style={{ padding: '12px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        User {idx + 1}
                        {idx === hierarchyCount - 1 && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>
                            {hierarchyCount > 1 && (
                              <button 
                                onClick={() => setHierarchyCount(hierarchyCount - 1)}
                                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title="Remove last level"
                              >
                                <Minus size={12} />
                              </button>
                            )}
                            <button 
                              onClick={() => setHierarchyCount(hierarchyCount + 1)}
                              style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                              title="Add another level"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </th>
                    ))}
                    <th style={{ padding: '12px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  
                  {/* EXISTING RULES FOR THIS FLOW */}
                  {flowRules.map((rule) => {
                    let parsedApprovers = [];
                    try { parsedApprovers = JSON.parse(rule.approvers || '[]'); } catch(e) {}
                    
                    return (
                      <tr key={rule.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{rule.approvalType || 'Quote Selection'}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{rule.type}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            {rule.logic === 'Between' ? (
                              <>
                                <span style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontWeight: 600 }}>${rule.value1}</span>
                                <span style={{ color: 'var(--text-muted)' }}>&le; {rule.type} &le;</span>
                                <span style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontWeight: 600 }}>${rule.value2}</span>
                              </>
                            ) : (
                              <>
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{rule.logic}</span>
                                <span style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', fontWeight: 600 }}>${rule.value1}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text)' }}>
                          {rule.department}
                        </td>
                        
                        {Array.from({ length: hierarchyCount }).map((_, idx) => (
                          <td key={idx} style={{ padding: '12px', verticalAlign: 'top' }}>
                            {parsedApprovers[idx] ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {parsedApprovers[idx].split(',').map((u: string, i: number) => (
                                   <span key={i} className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{u}</span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>-</span>
                            )}
                          </td>
                        ))}
                        
                        <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'middle' }}>
                          <button onClick={() => handleDelete(rule.id)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* ADD NEW ROW FORM FOR THIS FLOW */}
                  {addingToFlow === flowName && (
                    <tr style={{ background: '#f0fdf4', borderBottom: '2px solid #bbf7d0' }}>
                      <td style={{ padding: '12px' }}>
                        <select 
                          className="form-select" 
                          style={{ padding: '6px', fontSize: '0.85rem', height: '32px' }}
                          value={newRule.approvalType}
                          onChange={(e) => setNewRule({...newRule, approvalType: e.target.value})}
                        >
                          <option value="Quote Selection">Quote Selection</option>
                          <option value="Event Creation">Event Creation</option>
                          <option value="Surrogate Bid Creation">Surrogate Bid Creation</option>
                          <option value="Create Product">Create Product</option>
                          <option value="Reorder Proposal">Reorder Proposal</option>
                          <option value="Create User">Create User</option>
                          <option value="Intake Request">Intake Request</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select 
                          className="form-select" 
                          style={{ padding: '6px', fontSize: '0.85rem', height: '32px' }}
                          value={newRule.type}
                          onChange={(e) => setNewRule({...newRule, type: e.target.value})}
                        >
                          <option value="TPA">TPA</option>
                          <option value="NetLandedRate">Net Landed Rate</option>
                          <option value="PO Value">PO Value</option>
                          <option value="TNA score count">TNA score count</option>
                          <option value="Auction Rank">Auction Rank</option>
                          <option value="Total Proposal Value">Total Proposal Value</option>
                          <option value="Intake Request Condition Type">Intake Request Condition Type</option>
                          <option value="PR Price">PR Price</option>
                        </select>
                      </td>
                      
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <select 
                            className="form-select" 
                            style={{ padding: '6px', fontSize: '0.8rem', height: '30px' }}
                            value={newRule.logic}
                            onChange={(e) => setNewRule({...newRule, logic: e.target.value})}
                          >
                            <option value="More than">More than (&gt;)</option>
                            <option value="Less than">Less than (&lt;)</option>
                            <option value="Between">Between</option>
                          </select>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input 
                              type="number" 
                              placeholder="Value 1" 
                              className="form-input" 
                              style={{ padding: '4px 6px', fontSize: '0.8rem', height: '28px', width: '100%' }}
                              value={newRule.value1}
                              onChange={(e) => setNewRule({...newRule, value1: e.target.value})}
                            />
                            {newRule.logic === 'Between' && (
                              <input 
                                type="number" 
                                placeholder="Value 2" 
                                className="form-input" 
                                style={{ padding: '4px 6px', fontSize: '0.8rem', height: '28px', width: '100%' }}
                                value={newRule.value2}
                                onChange={(e) => setNewRule({...newRule, value2: e.target.value})}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td style={{ padding: '12px' }}>
                        <select 
                          className="form-select" 
                          style={{ padding: '6px', fontSize: '0.85rem', height: '32px' }}
                          value={newRule.department}
                          onChange={(e) => setNewRule({...newRule, department: e.target.value})}
                        >
                          <option value="">Select...</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </td>
                      
                      {Array.from({ length: hierarchyCount }).map((_, idx) => (
                        <td key={idx} style={{ padding: '8px', verticalAlign: 'top' }}>
                          <MultiUserSelect 
                            value={newRule.approverList[idx]} 
                            onChange={(v: string[]) => {
                              const updated = [...newRule.approverList];
                              updated[idx] = v;
                              setNewRule({...newRule, approverList: updated});
                            }} 
                          />
                        </td>
                      ))}
                      
                      <td style={{ padding: '12px', textAlign: 'right', verticalAlign: 'middle' }}>
                        <button onClick={() => setAddingToFlow(null)} style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )}
                  
                </tbody>
              </table>
              
              {addingToFlow !== flowName && (
                <div style={{ marginTop: '16px' }}>
                  <button onClick={() => setAddingToFlow(flowName)} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                    <Plus size={14} /> Add Matrix Row
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* FIXED FOOTER FOR SAVING FLOW */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 250,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure your entire Approval Routing Matrix, then save to apply it globally.
          </span>
          <button 
            onClick={handleSaveFlow} 
            disabled={isSaving || (!!addingToFlow && (!newRule.value1 || !newRule.department))}
            className="btn btn-primary" 
            style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isSaving ? 'Saving...' : (
              <>
                <Check size={16} /> Save Matrix Flow
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
