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
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '32px', marginBottom: '48px' }}>
        
        {/* Column 1: Image */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Image:</label>
          <label style={{ 
            width: '100%', height: '200px', backgroundColor: '#f3f4f6', 
            borderRadius: '4px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', border: '1px dashed #d1d5db', cursor: 'pointer',
            overflow: 'hidden', position: 'relative'
          }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            {imagePreview ? (
              <img src={imagePreview} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem', color: '#9ca3af' }}>↑_</span>
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
              {categories.filter(c => c.type === 'Category').map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              <span style={{ color: '#ef4444' }}>*</span> Subcategory:
            </label>
            <select 
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#fff', color: '#374151', appearance: 'none' }}>
              <option value="">Assign a subcategory for your product</option>
              {categories.filter(c => c.type === 'Subcategory').map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
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
              📎 Add Attachments
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

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <button 
          onClick={handleCreate}
          disabled={isSubmitting}
          style={{ padding: '12px 24px', border: 'none', borderRadius: '4px', backgroundColor: isSubmitting ? '#94a3b8' : '#2563eb', color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
        >
          {isSubmitting ? 'CREATING...' : 'CREATE'}
        </button>
      </div>
      
    </div>
  );
}
