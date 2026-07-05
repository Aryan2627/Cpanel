'use client';
import { useState, useEffect, useMemo } from 'react';

export default function CategoryPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', type: 'Category', code: '', alias: '', origins: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) return;
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsCreateModalOpen(false);
      setFormData({ name: '', type: 'Category', code: '', alias: '', origins: '' });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    const lowerQuery = searchQuery.toLowerCase();
    return categories.filter(cat => 
      (cat.name && cat.name.toLowerCase().includes(lowerQuery)) ||
      (cat.code && cat.code.toLowerCase().includes(lowerQuery)) ||
      (cat.alias && cat.alias.toLowerCase().includes(lowerQuery))
    );
  }, [categories, searchQuery]);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          
          {/* Search Section */}
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden', width: '320px' }}>
             <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', backgroundColor: '#fff', width: '100%' }}>
                <span style={{ color: '#9ca3af', marginRight: '8px' }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search for category and subcategory"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '10px 0', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
                />
             </div>
          </div>
          
          {/* Filter & Create Button */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              ≡ <span style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>1</span>
            </button>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              + Create Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#eef2f6' }}>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Category Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Number of<br/>Subcategories</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Number of Products</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Alias</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Category Code</th>
                <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '24px' }}>Loading categories...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', color: '#6b7280' }}>No categories found.</td></tr>
              ) : (
                filteredCategories.map((cat, idx) => (
                  <tr key={idx} style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 24px', color: '#4b5563', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: '#6b7280', fontSize: '1rem' }}>⧉</span> {cat.name}
                    </td>
                    <td style={{ padding: '16px 24px', color: '#4b5563' }}>{cat.subCats || 0}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563' }}>{cat.products || 0}</td>
                    <td style={{ padding: '16px 24px', color: '#9ca3af' }}>{cat.alias || '-'}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563' }}>{cat.code || '-'}</td>
                    <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4b5563' }}>
                        ✎
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end'
        }}>
          {/* Slide-out panel from the right */}
          <div style={{ 
            backgroundColor: '#fff', width: '500px', height: '100%', 
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Create Category</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#9ca3af', cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
              
              {/* Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Name :
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Type */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '16px' }}>
                  <span style={{ color: '#ef4444' }}>*</span> Type :
                </label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="categoryType" checked={formData.type === 'Category'} onChange={() => setFormData({ ...formData, type: 'Category' })} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                    Category
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="radio" name="categoryType" checked={formData.type === 'Subcategory'} onChange={() => setFormData({ ...formData, type: 'Subcategory' })} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                    Subcategory
                  </label>
                </div>
              </div>

              {/* Category Code */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Category Code :
                </label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter category code"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Alias */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Alias :
                </label>
                <input 
                  type="text" 
                  value={formData.alias}
                  onChange={e => setFormData({ ...formData, alias: e.target.value })}
                  placeholder="Add aliases"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              {/* Origins */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Origins :
                </label>
                <input 
                  type="text" 
                  value={formData.origins}
                  onChange={e => setFormData({ ...formData, origins: e.target.value })}
                  placeholder="Add origins"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '10px 24px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!formData.name}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '4px', backgroundColor: formData.name ? '#2563eb' : '#9ca3af', color: '#fff', cursor: formData.name ? 'pointer' : 'not-allowed', fontWeight: '500', fontSize: '0.9rem' }}>
                  OK
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
