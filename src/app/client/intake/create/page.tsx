'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '../../../../context/IntakeContext';

export default function PurchaseIntake() {
  const router = useRouter();
  const { addIntake } = useIntake();
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('customDropdowns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.departments) setDepartments(parsed.departments);
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitted(true);
    
    // Add to context
    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, ${now.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}`;
    const newId = `IR-210${Math.floor(Math.random() * 10) + 4}`;

    await addIntake({
      refId: newId,
      title: title || 'New Request',
      reqName: 'Current User',
      status: 'Draft',
      type: category || 'Standalone NFA',
      buyer: '-',
      reqAt: formattedDate,
      updAt: formattedDate,
    });

    // Redirect back to the intake table immediately after await finishes
    router.push('/client/intake');
  };

  if (submitted) {
    return (
      <div className="surface" style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ color: 'var(--success-color)', fontSize: '3rem', marginBottom: '16px' }}>✓</div>
        <h2>Purchase Requisition Submitted</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Generating PR number and awaiting approval...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create Purchase Request</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="surface">
        <h3 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>General Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Request Title <span style={{color: '#ef4444'}}>*</span></label>
            <input type="text" className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category <span style={{color: '#ef4444'}}>*</span></label>
            <select className="form-input" required value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category...</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
              {categories.length === 0 && (
                <>
                  <option value="IT Hardware">IT Hardware</option>
                  <option value="Software / SaaS">Software / SaaS</option>
                  <option value="Professional Services">Professional Services</option>
                </>
              )}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department <span style={{color: '#ef4444'}}>*</span></label>
            <select className="form-input" required>
              <option value="">Select Department...</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept}</option>
              ))}
              {departments.length === 0 && (
                <option value="General">General</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Budget / Estimated Price <span style={{color: '#ef4444'}}>*</span></label>
            <input type="number" className="form-input" required />
          </div>
        </div>

        <h3 style={{ margin: '30px 0 20px', color: 'var(--accent-color)' }}>Item Details & Delivery</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           <div className="form-group">
            <label className="form-label">Item Name / Description <span style={{color: '#ef4444'}}>*</span></label>
            <textarea className="form-input" rows={3} required></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Address <span style={{color: '#ef4444'}}>*</span></label>
            <textarea className="form-input" rows={3} required></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Required Date <span style={{color: '#ef4444'}}>*</span></label>
            <input type="date" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Attachments (Images, PDF, Excel)</label>
            <input type="file" className="form-input" multiple />
          </div>
        </div>
        
        <div style={{ marginTop: '30px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Submit for Approval</button>
        </div>
      </form>
    </div>
  );
}
