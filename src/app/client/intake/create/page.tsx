'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIntake } from '../../../../context/IntakeContext';

export default function PurchaseIntake() {
  const router = useRouter();
  const { addIntake } = useIntake();
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Add to context
    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, ${now.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}`;
    const newId = `IR-210${Math.floor(Math.random() * 10) + 4}`;

    addIntake({
      refId: newId,
      title: title || 'New Request',
      reqName: 'Current User',
      status: 'Draft',
      type: 'Standalone NFA',
      buyer: '-',
      reqAt: formattedDate,
      updAt: formattedDate,
    });

    setTimeout(() => {
      // Redirect back to the intake table
      router.push('/client/intake');
    }, 1500);
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
            <label className="form-label">Request Title</label>
            <input type="text" className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" required>
              <option value="">Select Category...</option>
              <option value="it">IT Hardware</option>
              <option value="software">Software / SaaS</option>
              <option value="services">Professional Services</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input type="text" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Budget / Estimated Price</label>
            <input type="number" className="form-input" required />
          </div>
        </div>

        <h3 style={{ margin: '30px 0 20px', color: 'var(--accent-color)' }}>Item Details & Delivery</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           <div className="form-group">
            <label className="form-label">Item Name / Description</label>
            <textarea className="form-input" rows={3} required></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <textarea className="form-input" rows={3} required></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Required Date</label>
            <input type="date" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Attachments (Images, PDF, Excel)</label>
            <input type="file" className="form-input" multiple />
          </div>
        </div>
        
        <div style={{ marginTop: '30px', display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary">Submit for Approval</button>
        </div>
      </form>
    </div>
  );
}
