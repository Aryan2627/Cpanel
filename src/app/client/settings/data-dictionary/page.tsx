'use client';
import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Database, LayoutList, Check, X, Search } from 'lucide-react';

export default function DataDictionaryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // New Value State
  const [newValue, setNewValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data-dictionary');
      const json = await res.json();
      setData(json || []);
      
      // If we don't have a selected category, pick the first one available
      if (!selectedCategory && json && json.length > 0) {
        setSelectedCategory(json[0].category);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get unique categories
  const categories = Array.from(new Set(data.map(d => d.category))).sort();
  
  // Filter items for the selected category
  const activeItems = data.filter(d => d.category === selectedCategory && (!search || d.value.toLowerCase().includes(search.toLowerCase())));

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    // We just select it; the actual record is created when the first value is added
    setSelectedCategory(newCategoryName.trim());
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleAddValue = async () => {
    if (!newValue.trim() || !selectedCategory) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/data-dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, value: newValue.trim() })
      });
      if (res.ok) {
        const created = await res.json();
        setData([...data, created]);
        setNewValue('');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add option');
      }
    } catch (e) {
      alert('Network error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    try {
      const res = await fetch(`/api/data-dictionary/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(d => d.id !== id));
      }
    } catch (e) {
      alert('Failed to delete');
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '28px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>Master Data Dictionaries</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Manage the global dropdown options available across forms (Departments, Categories, Locations, etc.)
          </p>
        </div>
        <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
          <Database size={24} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Pane: Categories */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutList size={16} /> Dropdown Menus
            </h3>
          </div>
          
          <div style={{ padding: '12px' }}>
            {categories.length === 0 && !loading && !isAddingCategory && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No menus created yet</div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left',
                    background: selectedCategory === cat ? '#eff6ff' : 'transparent',
                    color: selectedCategory === cat ? '#1d4ed8' : '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  {cat}
                  <span style={{ color: selectedCategory === cat ? '#3b82f6' : '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                    {data.filter(d => d.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Add Category Block */}
            {isAddingCategory ? (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input 
                  autoFocus
                  placeholder="e.g. Sub-Department"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '8px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddCategory} style={{ flex: 1, padding: '6px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Create</button>
                  <button onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }} style={{ flex: 1, padding: '6px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingCategory(true)}
                style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={16} /> New Dropdown Menu
              </button>
            )}
          </div>
        </div>

        {/* Right Pane: Options for Selected Category */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          {!selectedCategory ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <Settings size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h2 style={{ margin: 0, color: '#475569', fontSize: '1.25rem', fontWeight: 600 }}>Select a Dropdown Menu</h2>
              <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Choose a menu from the left pane to manage its options</p>
            </div>
          ) : (
            <>
              {/* Category Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>{selectedCategory} Options</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>These values will appear anywhere the {selectedCategory} dropdown is used.</p>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search options..."
                    style={{ padding: '10px 12px 10px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
              
              {/* Add New Option Form */}
              <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                <input
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddValue()}
                  placeholder={`Add new option to ${selectedCategory}...`}
                  style={{ flex: 1, padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
                />
                <button 
                  onClick={handleAddValue}
                  disabled={isSaving || !newValue.trim()}
                  style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 600, cursor: isSaving || !newValue.trim() ? 'not-allowed' : 'pointer', opacity: isSaving || !newValue.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={18} /> Add Option
                </button>
              </div>

              {/* Options List */}
              <div style={{ flex: 1, padding: '32px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
                ) : activeItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '8px' }}>No options found</div>
                    <div style={{ fontSize: '0.9rem' }}>Add your first option above to get started</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {activeItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{item.value}</span>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title="Delete option"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
