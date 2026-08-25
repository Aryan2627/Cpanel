'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchField, setSearchField] = useState('code');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Upload State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lowerQuery = searchQuery.toLowerCase();
    return products.filter(prod => {
      if (searchField === 'code') {
        return prod.code?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'name') {
        return prod.name?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'category') {
        return prod.category?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'subcategory') {
        return (prod.subCategory || prod.subcategory)?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'status') {
        return prod.status?.toLowerCase().includes(lowerQuery);
      } else if (searchField === 'createdBy') {
        return prod.createdBy?.toLowerCase().includes(lowerQuery);
      }
      return true;
    });
  }, [products, searchQuery, searchField]);

  const handleDownloadMaster = () => {
    const csvContent = "Name,UOM,Category,Subcategory\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "product_master.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async () => {
    if (!bulkFile) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert('File is empty or only contains headers.');
        setUploading(false);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const productsToAdd = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Basic split, won't handle commas inside quotes, but fine for simple master file
        const values = lines[i].split(',').map(v => v.trim());
        const prod: any = {};
        headers.forEach((h, idx) => {
          if (h === 'name') prod.name = values[idx];
          if (h === 'uom') prod.uom = values[idx];
          if (h === 'category') prod.category = values[idx];
          if (h === 'subcategory') prod.subcategory = values[idx];
        });
        if (prod.name) productsToAdd.push(prod);
      }
      
      try {
        const res = await fetch('/api/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: productsToAdd })
        });
        if (res.ok) {
          alert('Products uploaded successfully!');
          setShowBulkModal(false);
          setBulkFile(null);
          fetch('/api/products').then(r => r.json()).then(data => setProducts(data));
        } else {
          alert('Failed to upload products.');
        }
      } catch (err) {
        console.error(err);
        alert('Error uploading products.');
      }
      setUploading(false);
    };
    reader.readAsText(bulkFile);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        
        {/* Search Section */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden', width: '280px' }}>
             <select 
               value={searchField}
               onChange={(e) => setSearchField(e.target.value)}
               style={{ padding: '8px 12px', border: 'none', borderRight: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '0.85rem' }}
             >
               <option value="code">Product Code</option>
               <option value="name">Product Name</option>
               <option value="category">Category</option>
               <option value="subcategory">Subcategory</option>
               <option value="status">Status</option>
               <option value="createdBy">Created By</option>
             </select>
             <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#fff', width: '100%' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Search Criteria"
                  style={{ padding: '8px 0', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
                />
                <span style={{ color: '#9ca3af', marginLeft: '8px' }}></span>
             </div>
          </div>
          
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            ≡ <span style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>1</span>
          </button>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setShowBulkModal(true)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
             ⇪ Bulk Upload
          </button>
          <Link href="/client/manage/products/create" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
              + Create Product
            </button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#eef2f6' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Product Code</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>Product Name</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Category</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Subcategory</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Created By</th>
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Created On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '24px' }}>Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '24px', color: '#6b7280' }}>No products found.</td></tr>
            ) : (
              filteredProducts.map((prod, idx) => (
                <tr key={idx} style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '16px 24px', color: '#3b82f6', textAlign: 'left', fontWeight: '500', cursor: 'pointer' }}>{prod.code.substring(0,8)}</td>
                  <td style={{ padding: '16px 24px', color: '#111827', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {prod.imageUrl ? (
                       <img src={prod.imageUrl} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                       <span style={{ color: '#9ca3af', fontSize: '1rem' }}>⧉</span>
                    )}
                    {prod.name}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#4b5563' }}>{prod.category || '-'}</td>
                  <td style={{ padding: '16px 24px', color: '#4b5563' }}>{prod.subCategory || '-'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ backgroundColor: prod.status === 'Active' ? '#dcfce7' : '#f3f4f6', color: prod.status === 'Active' ? '#166534' : '#374151', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
                      {prod.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#4b5563' }}>{prod.createdBy}</td>
                  <td style={{ padding: '16px 24px', color: '#4b5563' }}>{new Date(prod.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Premium Bulk Upload Modal */}
      {showBulkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}>
          
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '560px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(226,232,240,0.5)', overflow: 'hidden', transform: 'scale(1)', animation: 'scaleUp 0.2s ease-out' }}>
            
            {/* Header with Gradient */}
            <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding: '32px 32px 24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Bulk Import Products</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Upload your master CSV file to instantly sync catalog.</p>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '32px' }}>
              
              {/* Step 1: Download Master */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: 600 }}>1. Get the Template</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Download our pre-formatted CSV template.</p>
                </div>
                <button 
                  onClick={handleDownloadMaster} 
                  style={{ padding: '10px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download .CSV
                </button>
              </div>
              
              {/* Step 2: Upload */}
              <div style={{ position: 'relative' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: 600 }}>2. Upload Populated File</h4>
                
                <div style={{ 
                  border: bulkFile ? '2px solid #3b82f6' : '2px dashed #cbd5e1', 
                  backgroundColor: bulkFile ? '#eff6ff' : '#f8fafc',
                  padding: '40px', borderRadius: '16px', textAlign: 'center', marginBottom: '32px',
                  transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  
                  {!bulkFile ? (
                    <div style={{ pointerEvents: 'none' }}>
                      <div style={{ width: '48px', height: '48px', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#94a3b8' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                      <p style={{ margin: '0 0 4px', color: '#334155', fontWeight: 600, fontSize: '1rem' }}>Click to browse or drag file here</p>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Supports .csv formats</p>
                    </div>
                  ) : (
                    <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)', color: '#fff' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <p style={{ margin: '0 0 4px', color: '#047857', fontWeight: 600, fontSize: '1rem' }}>File Ready for Import</p>
                      <p style={{ margin: 0, color: '#059669', fontSize: '0.85rem' }}>{bulkFile.name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                <button 
                  onClick={() => { setShowBulkModal(false); setBulkFile(null); }} 
                  style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#475569', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFileUpload} 
                  disabled={!bulkFile || uploading} 
                  style={{ 
                    padding: '10px 24px', border: 'none', borderRadius: '8px', 
                    background: !bulkFile || uploading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', 
                    color: '#fff', cursor: !bulkFile || uploading ? 'not-allowed' : 'pointer', 
                    fontWeight: 600, boxShadow: !bulkFile || uploading ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={(e) => { if (!bulkFile || uploading) return; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)'; }}
                  onMouseLeave={(e) => { if (!bulkFile || uploading) return; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'; }}
                >
                  {uploading ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                      Uploading...
                    </>
                  ) : 'Start Import'}
                </button>
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}} />
        </div>
      )}
    </div>
  );
}
