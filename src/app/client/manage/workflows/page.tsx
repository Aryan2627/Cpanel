'use client';
import { useState, useEffect } from 'react';

export default function WorkflowsPage() {
  const [dropdowns, setDropdowns] = useState<{ categories: string[], teams: string[], departments: string[] }>({
    categories: [],
    teams: [],
    departments: []
  });

  const [newInput, setNewInput] = useState({ categories: '', teams: '', departments: '' });

  useEffect(() => {
    const saved = localStorage.getItem('customDropdowns');
    if (saved) {
      try {
        setDropdowns(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleAdd = (listName: 'categories' | 'teams' | 'departments') => {
    const value = newInput[listName].trim();
    if (!value) return;

    if (dropdowns[listName].includes(value)) {
      alert(`${value} already exists.`);
      return;
    }

    const updated = {
      ...dropdowns,
      [listName]: [...dropdowns[listName], value]
    };
    
    setDropdowns(updated);
    setNewInput(prev => ({ ...prev, [listName]: '' }));
    localStorage.setItem('customDropdowns', JSON.stringify(updated));
    // Dispatch event so other components know if they are listening
    window.dispatchEvent(new Event('customDropdowns_updated'));
  };

  const handleRemove = (listName: 'categories' | 'teams' | 'departments', itemToRemove: string) => {
    const updated = {
      ...dropdowns,
      [listName]: dropdowns[listName].filter(item => item !== itemToRemove)
    };
    setDropdowns(updated);
    localStorage.setItem('customDropdowns', JSON.stringify(updated));
    window.dispatchEvent(new Event('customDropdowns_updated'));
  };

  const renderList = (title: string, listName: 'categories' | 'teams' | 'departments', icon: string, color: string, gradient: string) => (
    <div style={{ 
      backgroundColor: '#fff', 
      border: 'none', 
      borderRadius: '16px', 
      padding: '24px', 
      flex: 1,
      boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: gradient }} />
      
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.75rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{icon}</span> {title}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
        Define the dropdown options for {title.toLowerCase()} across the platform.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input 
          type="text" 
          value={newInput[listName]}
          onChange={(e) => setNewInput({ ...newInput, [listName]: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(listName)}
          placeholder={`Add new ${title.toLowerCase()}...`}
          style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', backgroundColor: '#f9fafb', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocus={(e) => {
            e.target.style.borderColor = color;
            e.target.style.boxShadow = `0 0 0 3px ${color}33`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button 
          onClick={() => handleAdd(listName)}
          style={{ padding: '0 20px', background: gradient, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
        {dropdowns[listName].length === 0 ? (
          <div style={{ width: '100%', color: '#9ca3af', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '30px 0', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #e5e7eb' }}>
            No items yet. Add one above!
          </div>
        ) : (
          dropdowns[listName].map((item, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '9999px',
                animation: 'slideIn 0.3s ease-out forwards',
                transition: 'background-color 0.2s, transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <span style={{ color: '#374151', fontWeight: '600', fontSize: '0.85rem' }}>{item}</span>
              <button 
                onClick={() => handleRemove(listName, item)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', transition: 'background-color 0.2s, color 0.2s' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );

  return (
    <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100%', margin: '-32px' }}>
      <div id="tour-workflow-intro" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em', marginBottom: '8px' }}>
            UI Platform Database
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
            Manage your global custom dropdown lists here. These lists instantly power dropdowns across the platform with <span style={{ fontWeight: '600', color: '#10b981' }}>zero</span> database load.
          </p>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
          <span style={{ fontSize: '1.5rem', color: '#fff' }}>✨</span>
        </div>
      </div>

      <div id="tour-workflow-categories" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {renderList('Categories', 'categories', '📦', '#3b82f6', 'linear-gradient(90deg, #60a5fa, #3b82f6)')}
        {renderList('Departments', 'departments', '🏢', '#8b5cf6', 'linear-gradient(90deg, #a78bfa, #8b5cf6)')}
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.5rem' }}>🔄</span> Approval Routing Workflows
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '4px 0 0 0' }}>Map departments to their specific approval chains.</p>
          </div>
          <button style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>+ New Workflow</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Workflow Name</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Approvers</th>
              <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>IT Hardware Requests</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>IT</span></td>
              <td style={{ padding: '16px', color: '#4b5563', fontSize: '0.9rem' }}>IT Manager → IT Director</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>Marketing Campaign Budgets</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#f3e8ff', color: '#7e22ce', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Marketing</span></td>
              <td style={{ padding: '16px', color: '#4b5563', fontSize: '0.9rem' }}>CMO</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px', fontWeight: '600', color: '#111827' }}>Standard Procurement</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>General</span></td>
              <td style={{ padding: '16px', color: '#4b5563', fontSize: '0.9rem' }}>Line Manager → Finance</td>
              <td style={{ padding: '16px' }}><span style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
