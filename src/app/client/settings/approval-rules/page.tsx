"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ShieldAlert, Loader2, ArrowRight, DollarSign, Tag, Building2, Zap, X, ShieldCheck, Check, Layers, Search, User } from 'lucide-react';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', field: 'estimatedValue', operator: '>=', value: '', approverRole: '', hierarchyLevel: 50 });
  
  // Searchable Dropdown State
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
    
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, usersRes] = await Promise.all([
        fetch('/api/approval-rules'),
        fetch('/api/users')
      ]);
      
      const rulesData = await rulesRes.json();
      const usersData = await usersRes.json();
      
      setRules(rulesData);
      setDbUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRule = async () => {
    if (!newRule.name || !newRule.value || !newRule.approverRole) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/approval-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      const savedRule = await res.json();
      setRules([...rules, savedRule].sort((a, b) => (a.hierarchyLevel || 50) - (b.hierarchyLevel || 50)));
      setIsAdding(false);
      setNewRule({ name: '', field: 'estimatedValue', operator: '>=', value: '', approverRole: '', hierarchyLevel: 50 });
      setSearchTerm('');
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

  const renderCondition = (rule: any) => {
    const isAmount = rule.field === 'estimatedValue';
    const isCategory = rule.field === 'category';
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
        <span className={isAmount ? "badge badge-green" : isCategory ? "badge badge-blue" : "badge badge-purple"}>
          {isAmount ? <DollarSign size={12} /> : isCategory ? <Tag size={12} /> : <Building2 size={12} />}
          {isAmount ? 'Spend Amount' : isCategory ? 'Category' : 'Department'}
        </span>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 'bold' }}>
          {rule.operator === '>=' ? '≥' : rule.operator}
        </span>
        <span style={{ padding: '2px 8px', background: '#fff', border: '1px solid var(--border)', borderRadius: '4px', fontWeight: 700 }}>
          {isAmount && '$'}{rule.value}
        </span>
      </div>
    );
  };

  const sortedRules = [...rules].sort((a, b) => (a.hierarchyLevel || 50) - (b.hierarchyLevel || 50));
  const filteredUsers = dbUsers.filter(u => (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-content" style={{ padding: '32px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER SECTION */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <div className="badge badge-blue" style={{ marginBottom: '12px' }}>
              <Zap size={12} /> Workflow Engine
            </div>
            <h1 className="page-title" style={{ color: 'var(--text)', marginBottom: '8px' }}>
              Routing & Rules
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Automate your procurement compliance. Define dynamic conditions to automatically route Purchase Requests to the right approvers based on spend, category, or department.
            </p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            <Plus size={16} /> Create Rule
          </button>
        </div>

        {/* RULES LIST */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 className="spin-anim" size={32} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading your workflow rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldAlert size={32} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>No Rules Configured</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', lineHeight: 1.5 }}>
                You haven't set up any dynamic routing rules yet. By default, all requests will only go to the Direct Manager.
              </p>
              <button onClick={() => setIsAdding(true)} className="btn btn-secondary">
                <Plus size={16} /> Create your first rule
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sortedRules.map((rule, index) => (
                <div key={rule.id} style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>LEVEL {rule.hierarchyLevel || 50}</span>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', margin: 0 }}>{rule.name}</h3>
                    </div>
                    
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', background: '#f8fafc', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '10px' }}>
                      {renderCondition(rule)}
                      <ArrowRight size={16} color="var(--text-muted)" />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Route to</span>
                        <span className="badge badge-green" style={{ padding: '4px 10px', fontSize: '0.85rem' }}>
                          <User size={14} /> {rule.approverRole}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(rule.id)} 
                    className="btn btn-danger"
                    style={{ padding: '8px', borderRadius: '50%' }}
                    title="Delete Rule"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD RULE */}
      {isAdding && (
        <div className="modal-backdrop">
          <div className="modal" style={{ width: '100%', maxWidth: '540px', overflow: 'visible' }}>
            
            <div className="modal-header" style={{ background: '#f8fafc' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="var(--accent)" /> Create Routing Rule
              </h2>
              <button onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Rule Name</label>
                <input type="text" placeholder="e.g. Legal Review for High Spend" className="form-input" 
                  value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  If Condition is Met
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Trigger Field</label>
                    <select className="form-select" value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}>
                      <option value="estimatedValue">Spend Amount ($)</option>
                      <option value="category">PR Category</option>
                      <option value="department">Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Logic</label>
                    <select className="form-select" value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})}>
                      <option value=">=">Is Greater Than (≥)</option>
                      <option value="==">Exactly Equals (==)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Trigger Value</label>
                  <input type="text" placeholder={newRule.field === 'estimatedValue' ? "e.g. 50000" : "e.g. Software"} className="form-input" 
                    value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '0' }}>
                
                {/* SEARCHABLE USER DROPDOWN */}
                <div className="form-group" style={{ marginBottom: 0 }} ref={dropdownRef}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={14} color="var(--text-muted)" /> Then Assign To
                  </label>
                  
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Search size={16} />
                    </div>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '36px', fontWeight: 700 }}
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                        // If they clear the text, clear the selection
                        if (e.target.value === '') {
                          setNewRule({...newRule, approverRole: ''});
                        }
                      }}
                      onFocus={() => setShowDropdown(true)}
                    />
                    
                    {showDropdown && (
                      <div style={{ 
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, 
                        background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 9999, 
                        maxHeight: '220px', overflowY: 'auto' 
                      }}>
                        {filteredUsers.length === 0 ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No users found</div>
                        ) : (
                          filteredUsers.map(user => (
                            <div 
                              key={user.id}
                              style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              onClick={() => {
                                setNewRule({...newRule, approverRole: user.name || user.email});
                                setSearchTerm(user.name || user.email);
                                setShowDropdown(false);
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{user.name || 'Unnamed'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.email} • {user.role || 'Member'}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    *Search specific users from database
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hierarchy Level</label>
                  <select 
                    className="form-select"
                    value={newRule.hierarchyLevel}
                    onChange={e => setNewRule({...newRule, hierarchyLevel: parseInt(e.target.value)})}
                  >
                    <option value="20">Level 20 (Department Head)</option>
                    <option value="50">Level 50 (SME / Security / Legal)</option>
                    <option value="90">Level 90 (Finance / Executive)</option>
                  </select>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Determines approval order
                  </p>
                </div>
              </div>

            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsAdding(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleSaveRule} 
                disabled={isSaving || !newRule.name || !newRule.value || !newRule.approverRole} 
                className="btn btn-primary"
              >
                {isSaving ? <Loader2 size={16} className="spin-anim" /> : <Check size={16} />} 
                {isSaving ? 'Saving...' : 'Save Rule'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
