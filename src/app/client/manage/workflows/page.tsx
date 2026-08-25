'use client';
import { useState, useEffect } from 'react';
import { Settings, Plus, X, List } from 'lucide-react';

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

  const renderList = (title: string, listName: 'categories' | 'teams' | 'departments') => (
    <div style={{ 
      backgroundColor: '#fff', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      padding: '24px', 
      flex: 1
    }}>
      <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <List size={18} color="#64748b" /> {title}
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
        Define the dropdown options for {title.toLowerCase()} mapping across the platform.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={newInput[listName]}
          onChange={(e) => setNewInput({ ...newInput, [listName]: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(listName)}
          placeholder={`Add new ${title.toLowerCase()}...`}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontSize: '0.9rem', backgroundColor: '#fff' }}
        />
        <button 
          onClick={() => handleAdd(listName)}
          style={{ padding: '0 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem' }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
        {dropdowns[listName].length === 0 ? (
          <div style={{ padding: '24px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
            No records found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <tbody>
              {dropdowns[listName].map((item, idx) => (
                <tr key={idx} style={{ borderBottom: idx === dropdowns[listName].length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#334155' }}>
                    {item}
                  </td>
                  <td style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleRemove(listName, item)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Settings size={24} color="#0f172a" />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Data Field Mapping</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage your global custom dropdown lists and data mappings for the platform database.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {renderList('Categories', 'categories')}
        {renderList('Departments', 'departments')}
      </div>
    </div>
  );
}
