"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, ShieldAlert, Loader2 } from 'lucide-react';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', field: 'estimatedValue', operator: '>=', value: '', approverRole: '' });

  // Fetch rules on mount
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/approval-rules');
      const data = await res.json();
      setRules(data);
    } catch (error) {
      console.error("Error fetching rules:", error);
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
      setRules([...rules, savedRule]);
      setIsAdding(false);
      setNewRule({ name: '', field: 'estimatedValue', operator: '>=', value: '', approverRole: '' });
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

  return (
    <div className="p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Settings size={24} className="text-blue-600"/> Approval Workflows
            </h1>
            <p className="text-slate-500 mt-1">Configure dynamic routing rules for Purchase Requests.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add New Rule
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-semibold">Rule Name</th>
                <th className="p-4 font-semibold">Trigger Field</th>
                <th className="p-4 font-semibold">Logic</th>
                <th className="p-4 font-semibold">Value</th>
                <th className="p-4 font-semibold">Action (Add Approver)</th>
                <th className="p-4 font-semibold text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2" size={20} /> Loading rules...
                  </td>
                </tr>
              ) : rules.length === 0 && !isAdding ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                    No approval rules configured yet. Click "Add New Rule" to create one.
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{rule.name}</td>
                    <td className="p-4 text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{rule.field}</span></td>
                    <td className="p-4 text-slate-600 font-mono text-sm">{rule.operator}</td>
                    <td className="p-4 text-slate-900 font-semibold">{rule.value}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm font-semibold border border-blue-100">
                        <ShieldAlert size={14} /> {rule.approverRole}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(rule.id)} className="text-slate-400 hover:text-red-600 p-2 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* INLINE ADD FORM */}
              {isAdding && (
                <tr className="bg-blue-50/30 border-b border-blue-100">
                  <td className="p-4">
                    <input type="text" placeholder="e.g. Legal Review" className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
                  </td>
                  <td className="p-4">
                    <select className="w-full p-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}>
                      <option value="estimatedValue">Amount ($)</option>
                      <option value="category">Category</option>
                      <option value="department">Department</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select className="w-full p-2 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})}>
                      <option value=">=">Is Greater Than (&gt;=)</option>
                      <option value="==">Equals (==)</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input type="text" placeholder="e.g. 50000" className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                  </td>
                  <td className="p-4">
                    <input type="text" placeholder="e.g. CFO" className="w-full p-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={newRule.approverRole} onChange={e => setNewRule({...newRule, approverRole: e.target.value})} />
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={handleSaveRule} disabled={isSaving} className="bg-emerald-500 text-white px-4 py-2 rounded-md font-semibold text-sm mr-2 hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setIsAdding(false)} className="text-slate-500 text-sm hover:text-slate-700 font-medium">Cancel</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
