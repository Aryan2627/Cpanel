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
  const [quantity, setQuantity] = useState<number | string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentUser, setCurrentUser] = useState('Current User');

  useEffect(() => {
    const saved = localStorage.getItem('customDropdowns');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.departments) setDepartments(parsed.departments);
      } catch (e) {}
    }
    
    // Fetch current user name
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setCurrentUser(data.name);
        }
      })
      .catch(err => console.error('Failed to fetch user', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const now = new Date();
    const formattedDate = `${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, ${now.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}`;
    const newId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await addIntake({
        refId: newId,
        title: title || 'New Request',
        reqName: currentUser,
        status: 'Draft',
        type: category || 'Standalone NFA',
        buyer: '-',
        reqAt: formattedDate,
        updAt: formattedDate,
        quantity: Number(quantity) || 1,
      });

      setSubmitted(true);
      router.push('/client/intake');
    } catch (error: any) {
      alert(error.message || 'Failed to submit intake.');
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Request Submitted</h2>
        <p style={{ margin: 0, color: '#64748b' }}>Your purchase request is being processed.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: '0 0 8px 0' }}>Create Purchase Request</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Fill out the details below to submit a new intake request.</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        
        {/* Section 1 */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 20px 0' }}>General Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Request Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select 
                required 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff' }}
              >
                <option value="">Select a category...</option>
                {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                {categories.length === 0 && (
                  <>
                    <option value="IT Hardware">IT Hardware</option>
                    <option value="Software / SaaS">Software / SaaS</option>
                    <option value="Professional Services">Professional Services</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Department <span style={{ color: '#ef4444' }}>*</span></label>
                <select 
                  required 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', backgroundColor: '#fff' }}
                >
                  <option value="">Select department...</option>
                  {departments.map((dept, idx) => <option key={idx} value={dept}>{dept}</option>)}
                  {departments.length === 0 && <option value="General">General</option>}
                </select>
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Budget (Estimated) <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} 
                  min="0" step="0.01" required 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 20px 0' }}>Item Details</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Item Description <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea 
                required rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Quantity <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Required Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input 
                  type="date" required 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Delivery Address <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea 
                required rows={2}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: '#334155' }}>Attachments</label>
              <input 
                type="file" multiple 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px dashed #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#f8fafc' }}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ padding: '20px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => router.back()}
            style={{ padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#334155', fontWeight: 500, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 500, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

