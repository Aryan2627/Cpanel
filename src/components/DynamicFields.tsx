"use client";
import React, { useEffect, useState } from 'react';

export default function DynamicFields({ formName, value, onChange, orgId, isDark }: any) {
  const [configs, setConfigs] = useState([]);
  
  useEffect(() => {
    // Uses a default orgId if not provided (for demo purposes)
    const org = orgId || 'org_1';
    fetch('/api/form-config?orgId=' + org)
      .then(r => r.json())
      .then(data => {
        if(Array.isArray(data)) {
          setConfigs(data.filter((c: any) => c.formName === formName && c.isActive));
        }
      })
      .catch(console.error);
  }, [formName, orgId]);

  if (configs.length === 0) return null;

  return (
    <>
      {configs.map((c: any) => {
        let opts = [];
        try { opts = JSON.parse(c.options || '[]'); } catch(e){}
        const val = value[c.fieldName] || '';
        
        return (
          <div key={c.fieldName} className="mb-4">
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {c.fieldLabel}
            </label>
            {c.fieldType === 'dropdown' ? (
              <select 
                value={val}
                onChange={(e) => onChange({...value, [c.fieldName]: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              >
                <option value="">Select {c.fieldLabel}</option>
                {opts.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input
                type={c.fieldType}
                value={val}
                onChange={(e) => onChange({...value, [c.fieldName]: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                placeholder={`Enter ${c.fieldLabel}`}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
