'use client';
import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Database, LayoutList, Search, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DataDictionaryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  const showToast = (msg: string, type: 'success'|'error') => {
    setToast({msg, type});
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data-dictionary');
      const json = await res.json();
      setData(json || []);
      if (!selectedCategory && json && json.length > 0) {
        setSelectedCategory(json[0].category);
      }
    } catch (e) {
      showToast('Failed to load dictionaries', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const categories = Array.from(new Set(data.map(d => d.category))).sort();
  const activeItems = data.filter(d => d.category === selectedCategory && (!search || d.value.toLowerCase().includes(search.toLowerCase())));

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
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
        showToast('Option added successfully', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add option', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/data-dictionary/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(d => d.id !== id));
        showToast('Option deleted', 'success');
      }
    } catch (e) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc' }}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{ position: 'fixed', top: '24px', left: '50%', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: toast.type === 'success' ? '#0f172a' : '#ef4444', color: '#fff', borderRadius: '40px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2.2rem', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>Data Dictionaries</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>
            Configure dynamic global dropdown values seamlessly.
          </p>
        </div>
        <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
          <Database size={28} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', padding: '40px 48px', flex: 1, minHeight: 0, alignItems: 'stretch' }}>
        
        {/* Left Pane: Categories */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LayoutList size={16} /> Menus
            </h3>
          </div>
          
          <div style={{ padding: '16px' }}>
            {categories.length === 0 && !loading && !isAddingCategory && (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>No menus created yet</div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <AnimatePresence>
                {categories.map(cat => (
                  <motion.button
                    key={cat}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedCategory(cat)}
                    style={{ 
                      padding: '12px 16px', 
                      textAlign: 'left',
                      background: selectedCategory === cat ? '#0f172a' : 'transparent',
                      color: selectedCategory === cat ? '#fff' : '#475569',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: selectedCategory === cat ? 600 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { if (selectedCategory !== cat) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { if (selectedCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {cat}
                    <span style={{ 
                      background: selectedCategory === cat ? 'rgba(255,255,255,0.2)' : '#f1f5f9', 
                      color: selectedCategory === cat ? '#fff' : '#64748b', 
                      padding: '2px 8px', 
                      borderRadius: '10px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700 
                    }}>
                      {data.filter(d => d.category === cat).length}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Category Block */}
            <AnimatePresence>
              {isAddingCategory ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <input 
                    autoFocus
                    placeholder="e.g. Regions..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '12px', outline: 'none', transition: 'border 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                    onFocus={e => e.currentTarget.style.border = '1px solid #3b82f6'}
                    onBlur={e => e.currentTarget.style.border = '1px solid #cbd5e1'}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleAddCategory} style={{ flex: 1, padding: '8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }} style={{ flex: 1, padding: '8px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </motion.div>
              ) : (
                <motion.button 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => setIsAddingCategory(true)}
                  style={{ width: '100%', marginTop: '16px', padding: '14px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                >
                  <Plus size={16} /> New Menu
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Pane: Options */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          {!selectedCategory ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Settings size={32} style={{ color: '#cbd5e1' }} />
              </div>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>No Menu Selected</h2>
              <p style={{ fontSize: '0.95rem', marginTop: '8px', maxWidth: '300px', textAlign: 'center' }}>Choose a dropdown menu from the sidebar to manage its available options.</p>
            </div>
          ) : (
            <>
              {/* Category Header */}
              <div style={{ padding: '32px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: 800 }}>{selectedCategory}</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14}/> Dynamic options mapping
                  </p>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search options..."
                    style={{ padding: '12px 14px 12px 40px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.9rem', outline: 'none', width: '220px', transition: 'border 0.2s' }}
                    onFocus={e => e.currentTarget.style.border = '1px solid #3b82f6'}
                    onBlur={e => e.currentTarget.style.border = '1px solid #e2e8f0'}
                  />
                </div>
              </div>
              
              {/* Add New Option Form */}
              <div style={{ padding: '24px 40px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                <input
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddValue()}
                  placeholder={`Type a new option for ${selectedCategory}...`}
                  style={{ flex: 1, padding: '14px 20px', background: '#f8fafc', border: '1px solid transparent', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', color: '#0f172a' }}
                  onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.border = '1px solid #3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button 
                  onClick={handleAddValue}
                  disabled={isSaving || !newValue.trim()}
                  style={{ padding: '0 28px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600, cursor: isSaving || !newValue.trim() ? 'not-allowed' : 'pointer', opacity: isSaving || !newValue.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                  onMouseEnter={e => { if(!isSaving && newValue.trim()) e.currentTarget.style.background = '#1e293b'; }}
                  onMouseLeave={e => { if(!isSaving && newValue.trim()) e.currentTarget.style.background = '#0f172a'; }}
                >
                  <Plus size={18} /> Add
                </button>
              </div>

              {/* Options List */}
              <div style={{ flex: 1, padding: '24px 40px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                ) : activeItems.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
                    <div style={{ width: '56px', height: '56px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <LayoutList size={24} style={{ color: '#cbd5e1' }} />
                    </div>
                    <div style={{ fontWeight: 600, color: '#475569', fontSize: '1.1rem', marginBottom: '8px' }}>No Options Found</div>
                    <div style={{ fontSize: '0.95rem' }}>Start typing above to add the first option to this menu.</div>
                  </motion.div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <AnimatePresence>
                      {activeItems.map((item, idx) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          transition={{ delay: idx * 0.03 }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fff', transition: 'background 0.2s', borderRadius: '8px' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; const btn = e.currentTarget.querySelector('button'); if(btn) btn.style.opacity = '1'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; const btn = e.currentTarget.querySelector('button'); if(btn) btn.style.opacity = '0'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                            <span style={{ fontSize: '1rem', fontWeight: 500, color: '#0f172a' }}>{item.value}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleDelete(item.id)}
                            style={{ background: '#fef2f2', color: '#ef4444', border: 'none', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'all 0.2s' }}
                            title="Delete option"
                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
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
