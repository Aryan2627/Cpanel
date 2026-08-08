'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter state
  const [searchField, setSearchField] = useState('code');
  const [searchQuery, setSearchQuery] = useState('');

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
      }
      return true;
    });
  }, [products, searchQuery, searchField]);

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
             </select>
             <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', backgroundColor: '#fff', width: '100%' }}>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Search Criteria"
                  style={{ padding: '8px 0', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }} 
                />
                <span style={{ color: '#9ca3af', marginLeft: '8px' }}>🔍</span>
             </div>
          </div>
          
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            ≡ <span style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>1</span>
          </button>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
             ⇪ Bulk Upload
          </button>
          <button style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontSize: '1rem' }}>
            📥
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
              <th style={{ padding: '16px 24px', fontWeight: '600', color: '#111827', borderBottom: '1px solid #e5e7eb' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '24px' }}>Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '24px', color: '#6b7280' }}>No products found.</td></tr>
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
                  <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                    <button 
                      onClick={() => {
                        const currentCart = JSON.parse(localStorage.getItem('rfqCart') || '[]');
                        if (!currentCart.find((p: any) => p.id === prod.id)) {
                          const newCart = [...currentCart, prod];
                          localStorage.setItem('rfqCart', JSON.stringify(newCart));
                          window.dispatchEvent(new Event('cart_updated'));
                        }
                      }}
                      style={{ padding: '6px 12px', border: '1px solid #3b82f6', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' }}
                    >
                      + Add to Cart
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
