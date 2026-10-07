"use client";
import React, { useState } from 'react';
import { Plus, Trash2, Settings, ShieldAlert } from 'lucide-react';

// Mock data to simulate what we fetch from the Database
const INITIAL_RULES = [
  { id: 1, name: "IT Review for Software", field: "category", operator: "==", value: "Software", approver: "IT Security" },
  { id: 2, name: "Mid-Tier Spend", field: "estimatedValue", operator: ">=", value: "10000", approver: "VP of Department" },
  { id: 3, name: "Executive Spend", field: "estimatedValue", operator: ">=", value: "50000", approver: "CFO" }
];

export default function ApprovalSettingsPage() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', field: 'estimatedValue', operator: '>=', value: '', approver: '' });

  const handleSaveRule = () => {
    // In reality, this would be a POST to /api/approval-rules
    setRules([...rules, { ...newRule, id: Date.now() }]);
    setIsAdding(false);
    setNewRule({ name: '', field: 'estimatedValue', operator: '>=', value: '', approver: '' });
  };

  const handleDelete = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings size={24} className="text-blue-600"/> Approval Workflows
          </h1>
          <p className="text-slate-500 mt-1">Configure dynamic routing rules for Purchase Requests.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
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
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{rule.name}</td>
                <td className="p-4 text-slate-600"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{rule.field}</span></td>
                <td className="p-4 text-slate-600 font-mono text-sm">{rule.operator}</td>
                <td className="p-4 text-slate-900 font-semibold">{rule.value}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-sm font-semibold">
                    <ShieldAlert size={14} /> {rule.approver}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(rule.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {/* INLINE ADD FORM */}
            {isAdding && (
              <tr className="bg-blue-50/50">
                <td className="p-4">
                  <input type="text" placeholder="e.g. Legal Review" className="w-full p-2 border rounded" 
                    value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
                </td>
                <td className="p-4">
                  <select className="w-full p-2 border rounded bg-white" value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}>
                    <option value="estimatedValue">Amount ($)</option>
                    <option value="category">Category</option>
                    <option value="department">Department</option>
                  </select>
                </td>
                <td className="p-4">
                  <select className="w-full p-2 border rounded bg-white" value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})}>
                    <option value=">=">Is Greater Than (&gt;=)</option>
                    <option value="==">Equals (==)</option>
                  </select>
                </td>
                <td className="p-4">
                  <input type="text" placeholder="e.g. 50000" className="w-full p-2 border rounded" 
                    value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                </td>
                <td className="p-4">
                  <input type="text" placeholder="e.g. CFO" className="w-full p-2 border rounded" 
                    value={newRule.approver} onChange={e => setNewRule({...newRule, approver: e.target.value})} />
                </td>
                <td className="p-4 text-right">
                  <button onClick={handleSaveRule} className="bg-emerald-500 text-white px-3 py-1.5 rounded font-semibold text-sm mr-2 hover:bg-emerald-600">Save</button>
                  <button onClick={() => setIsAdding(false)} className="text-slate-500 text-sm hover:underline">Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
