"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Zap, Save, Search } from 'lucide-react';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for new row
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({
    approvalType: 'Quote Selection',
    type: 'TPA',
    logic: 'More than',
    value1: '',
    value2: '',
    department: '',
    approver1: '',
    approver2: '',
    approver3: '',
    approver4: '',
    approver5: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, usersRes, deptsRes] = await Promise.all([
        fetch('/api/approval-rules'),
        fetch('/api/users'),
        fetch('/api/departments').catch(() => ({ json: () => [] })) // Fallback
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
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRule = async () => {
    if (!newRule.value1 || !newRule.department) return;
    setIsSaving(true);
    
    // Extract non-empty approvers in order
    const approvers = [
      newRule.approver1, newRule.approver2, newRule.approver3, newRule.approver4, newRule.approver5
    ].filter(a => a.trim() !== '');

    if (approvers.length === 0) {
      alert("Please select at least one approver.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/approval-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
      
      // Reset
      setIsAdding(false);
      setNewRule({
        approvalType: 'Quote Selection', type: 'TPA', logic: 'More than', value1: '', value2: '', department: '',
        approver1: '', approver2: '', approver3: '', approver4: '', approver5: ''
      });
    } catch (error) {
      console.error("Error saving rule:", error);
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

  // Helper component for Searchable User Dropdown (mini version for table cells)
  const UserSelect = ({ value, onChange, placeholder = "Select..." }: any) => {
    return (
      <select 
        className="form-select" 
        style={{ padding: '6px', fontSize: '0.8rem', height: '32px', minWidth: '120px' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {dbUsers.map(u => (
          <option key={u.id} value={u.name || u.email}>{u.name || u.email}</option>
        ))}
      </select>
    );
  };

  return (
    <div className="page-content" style={{ padding: '32px' }}>
      
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
            Approvers will be notified sequentially from User 1 to User 5.
          </p>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '180px' }}>Approval Type</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '120px' }}>Type</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '220px' }}>Condition</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700, width: '150px' }}>Department</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>User 1</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>User 2</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>User 3</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>User 4</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 700 }}>User 5</th>
              <th style={{ padding: '12px', width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            
            {/* EXISTING RULES */}
            {rules.map((rule) => {
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
                  
                  {/* Approvers 1 to 5 */}
                  {[0,1,2,3,4].map(idx => (
                    <td key={idx} style={{ padding: '12px' }}>
                      {parsedApprovers[idx] ? (
                        <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>{parsedApprovers[idx]}</span>
                      ) : (
                        <span style={{ color: 'var(--border)', fontSize: '0.8rem' }}>-</span>
                      )}
                    </td>
                  ))}
                  
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(rule.id)} style={{ color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* ADD NEW ROW FORM */}
            {isAdding && (
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
                
                {/* 5 User Selects */}
                <td style={{ padding: '8px' }}>
                  <UserSelect value={newRule.approver1} onChange={(v: string) => setNewRule({...newRule, approver1: v})} />
                </td>
                <td style={{ padding: '8px' }}>
                  <UserSelect value={newRule.approver2} onChange={(v: string) => setNewRule({...newRule, approver2: v})} />
                </td>
                <td style={{ padding: '8px' }}>
                  <UserSelect value={newRule.approver3} onChange={(v: string) => setNewRule({...newRule, approver3: v})} />
                </td>
                <td style={{ padding: '8px' }}>
                  <UserSelect value={newRule.approver4} onChange={(v: string) => setNewRule({...newRule, approver4: v})} />
                </td>
                <td style={{ padding: '8px' }}>
                  <UserSelect value={newRule.approver5} onChange={(v: string) => setNewRule({...newRule, approver5: v})} />
                </td>
                
                <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button 
                    onClick={handleSaveRule} 
                    disabled={isSaving || !newRule.value1 || !newRule.department}
                    className="btn btn-primary" 
                    style={{ padding: '6px 10px', height: '32px', fontSize: '0.8rem' }}
                  >
                    {isSaving ? '...' : <Save size={14} />}
                  </button>
                </td>
              </tr>
            )}
            
          </tbody>
        </table>
        
        {!isAdding && (
          <div style={{ marginTop: '16px' }}>
            <button onClick={() => setIsAdding(true)} className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              <Plus size={14} /> Add Matrix Row
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
}
