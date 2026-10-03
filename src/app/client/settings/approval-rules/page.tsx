"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, ShieldAlert, Loader2, ArrowRight, DollarSign, Tag, Building2, Zap, X, ShieldCheck } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', field: 'estimatedValue', operator: '>=', value: '', approverRole: '' });

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

  // Helper to render nice logic chips
  const renderCondition = (rule: any) => {
    const isAmount = rule.field === 'estimatedValue';
    const isCategory = rule.field === 'category';
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
          {isAmount ? <DollarSign size={14} className="text-emerald-600"/> : isCategory ? <Tag size={14} className="text-blue-600"/> : <Building2 size={14} className="text-indigo-600"/>}
          {isAmount ? 'Spend Amount' : isCategory ? 'Category' : 'Department'}
        </span>
        <span className="text-slate-400 font-mono text-xs">{rule.operator === '>=' ? '≥' : rule.operator}</span>
        <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm text-slate-900 rounded-md font-semibold">
          {isAmount && '$'}{rule.value}
        </span>
      </div>
    );
  };

  return (
    <div className="p-8 font-sans bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
              <Zap size={14} className="fill-blue-600" /> Workflow Engine
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Routing & Rules
            </h1>
            <p className="text-slate-500 max-w-xl leading-relaxed">
              Automate your procurement compliance. Define dynamic conditions to automatically route Purchase Requests to the right approvers based on spend, category, or department.
            </p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 group"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" /> Create Rule
          </button>
        </div>

        {/* RULES LIST */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
              <p className="text-slate-500 font-medium">Loading your workflow rules...</p>
            </div>
          ) : rules.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Rules Configured</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't set up any dynamic routing rules yet. By default, all requests will only go to the Direct Manager.</p>
              <button onClick={() => setIsAdding(true)} className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
                <Plus size={18} /> Create your first rule
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rules.map((rule, index) => (
                <div key={rule.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-bold text-slate-400">RULE {index + 1}</span>
                      <h3 className="font-bold text-slate-900 text-lg">{rule.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl w-max">
                      {renderCondition(rule)}
                      <ArrowRight size={16} className="text-slate-300 mx-2" />
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500 font-medium">Route to</span>
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold shadow-sm">
                          <ShieldCheck size={14} /> {rule.approverRole}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(rule.id)} 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Rule"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL: ADD RULE */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings size={20} className="text-blue-600" /> Create Routing Rule
              </h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rule Name</label>
                <input type="text" placeholder="e.g. Legal Review for High Spend" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 text-slate-900 font-medium" 
                  value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IF CONDITION IS MET</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Trigger Field</label>
                    <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium" 
                      value={newRule.field} onChange={e => setNewRule({...newRule, field: e.target.value})}>
                      <option value="estimatedValue">Spend Amount ($)</option>
                      <option value="category">PR Category</option>
                      <option value="department">Department</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Logic</label>
                    <select className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 font-medium" 
                      value={newRule.operator} onChange={e => setNewRule({...newRule, operator: e.target.value})}>
                      <option value=">=">Is Greater Than (≥)</option>
                      <option value="==">Exactly Equals (==)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trigger Value</label>
                  <input type="text" placeholder={newRule.field === 'estimatedValue' ? "e.g. 50000" : "e.g. Software"} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium" 
                    value={newRule.value} onChange={e => setNewRule({...newRule, value: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5"><ArrowRight size={14} className="text-slate-400"/> THEN ASSIGN TO</label>
                <div className="relative">
                  <ShieldAlert size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="e.g. CFO, IT Security, Legal Counsel" className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-bold" 
                    value={newRule.approverRole} onChange={e => setNewRule({...newRule, approverRole: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveRule} 
                disabled={isSaving || !newRule.name || !newRule.value || !newRule.approverRole} 
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
              >
                {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Rule'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
