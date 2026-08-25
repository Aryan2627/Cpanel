'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CreateProductPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  useEffect(() => {
    const loadCategories = () => {
      const saved = localStorage.getItem('customDropdowns');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCategories(parsed.categories || []);
        } catch (e) {}
      }
    };
    
    loadCategories();
    
    // Listen for updates from other tabs/components
    window.addEventListener('customDropdowns_updated', loadCategories);
    return () => window.removeEventListener('customDropdowns_updated', loadCategories);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    uom: '',
    category: '',
    subCategory: '',
    description: '',
    terms: '',
    articleCode: '',
    hsnCode: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to S3/Cloudinary here.
      // For this SQLite demo, we'll convert it to a base64 string to store directly.
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!formData.name) {
      alert("Name is required!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: imagePreview // Save the base64 string
        })
      });
      
      if (res.ok) {
        alert("Product successfully created!");
        router.push('/client/manage/products');
      } else {
        const error = await res.json();
        alert("Error: " + error.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create product.");
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', minHeight: '100%', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      
      <div id="tour-product-form" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '32px', marginBottom: '48px' }}>
        
        {/* Column 1: Image */}
        <div id="tour-product-image">
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>Product Image</label>
          <label 
            style={{ 
              width: '100%', height: '240px', backgroundColor: '#f8fafc', 
              borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
              justifyContent: 'center', border: '2px dashed #cbd5e1', cursor: 'pointer',
              overflow: 'hidden', position: 'relative', transition: 'all 0.2s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.backgroundColor = '#eff6ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
          >
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            {imagePreview ? (
              <img src={imagePreview} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.5rem', color: '#4f46e5' }}></span>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Click or drag to upload</span>
              </div>
            )}
          </label>
        </div>

        {/* Column 2: Main Details */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              <span style={{ color: '#ef4444' }}>*</span> Name:
            </label>
            <textarea 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="What is the name of your product?"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Unit of Measurement (UOM):
            </label>
            <select 
              name="uom"
              value={formData.uom}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none' }}>
              <option value="">Provide a default unit for your product</option>
              <option value="Pieces (PCS)">Pieces (PCS)</option>
              <option value="Kilograms (KG)">Kilograms (KG)</option>
              <option value="Liters (L)">Liters (L)</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              <span style={{ color: '#ef4444' }}>*</span> Category:
            </label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none' }}>
              <option value="">Which category does your product belong to?</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>



          <button style={{ padding: '10px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
            + ADD PRODUCT VARIANT
          </button>
        </div>

        {/* Column 3: Secondary Details */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Description:
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a brief description for your product"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', resize: 'vertical', minHeight: '90px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Terms & Conditions:
            </label>
            <input 
              type="text" 
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              placeholder="Does your product has any terms or conditions?"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Article Code:
            </label>
            <input 
              type="text" 
              name="articleCode"
              value={formData.articleCode}
              onChange={handleChange}
              placeholder="Do you have a unique identifier for this product?"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Attachments:
            </label>
            <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '500' }}>
               Add Attachments
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              HSN Code:
            </label>
            <input 
              type="text" 
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleChange}
              placeholder="Enter answer here..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
        </div>

      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleCreate}
          disabled={isSubmitting}
          style={{ 
            padding: '14px 32px', border: 'none', borderRadius: '8px', 
            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', 
            color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer', 
            fontSize: '1rem', fontWeight: '600', letterSpacing: '0.025em',
            boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 20px -3px rgba(37, 99, 235, 0.4)'; } }}
          onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.3)'; } }}
        >
          {isSubmitting ? 'CREATING...' : 'CREATE PRODUCT'}
        </button>
      </div>
      
    </div>
  );
}
