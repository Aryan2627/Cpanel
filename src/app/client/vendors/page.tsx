'use client';
import React, { useState, useEffect } from 'react';

export default function VendorManagement() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'Manufacturer/Trader',
    vendorCode: '',
    dealsIn: '',
    tradeLicense: '',
    inviteVia: 'Tax ID',
    city: ''
  });

  const [vendors, setVendors] = useState<any[]>([
    {
      id: 'mock1',
      name: '234',
      vendorCode: '12345',
      companyCode: '-',
      email: 'demo1@gmail.com',
      phone: '+91 9876543210',
      type: 'Selling firm',
      city: 'Abbottabad',
      status: 'Invited'
    },
    {
      id: 'mock2',
      name: '31',
      vendorCode: '-',
      companyCode: '-',
      email: '4124@gmail.com',
      phone: '+91 7888992627',
      type: 'Selling firm',
      city: 'Corman Park No. 344',
      status: 'Joined'
    }
  ]);

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Map DB schema to UI structure
          const formatted = data.map((v: any) => ({
            id: v.id,
            name: v.name || '-',
            vendorCode: v.vendorCode || '-',
            companyCode: v.companyCode || '-',
            email: v.email || '-',
            phone: v.phone || '-',
            type: v.type || 'Selling firm',
            city: v.city || '-',
            status: v.status || 'Invited'
          }));
          
          setVendors(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newVendors = formatted.filter(v => !existingIds.has(v.id));
            return [...newVendors, ...prev];
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill out all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          type: formData.type,
          vendorCode: formData.vendorCode,
          dealsIn: formData.dealsIn,
          tradeLicense: formData.tradeLicense,
          city: formData.city,
          status: 'Invited'
        })
      });
      
      if (res.ok) {
        const newVendor = await res.json();
        alert('Vendor successfully invited!');
        
        // Append to local state
        setVendors([{
          id: newVendor.id,
          name: newVendor.name,
          vendorCode: newVendor.vendorCode || '-',
          companyCode: '-',
          email: newVendor.email,
          phone: '-',
          type: newVendor.type || 'Selling firm',
          city: newVendor.city || '-',
          status: 'Invited'
        }, ...vendors]);
        
        setIsInviteOpen(false);
        setFormData({
          name: '', email: '', type: 'Manufacturer/Trader', vendorCode: '', dealsIn: '', tradeLicense: '', inviteVia: 'Tax ID', city: ''
        });
      }
    } catch (err) {
      console.error(err);
      alert('Error inviting vendor');
    }
    setIsSubmitting(false);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Joined':
        return { color: '#10b981', border: '1px solid #a7f3d0', backgroundColor: '#f0fdf4' };
      case 'Invited':
        return { color: '#64748b', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
      case 'Blacklisted':
        return { color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' };
      default:
        return { color: '#64748b', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' };
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#ffffff', minHeight: '100%', fontFamily: '"Inter", sans-serif', position: 'relative' }}>
      
      {/* Top Section */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>Vendors Joined</div>
        <div style={{ fontSize: '1.5rem', color: '#1e293b' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1.75rem' }}>{vendors.filter(v => v.status === 'Joined').length}</span> / {vendors.length}
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          
          {/* Search Group */}
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderRight: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem', cursor: 'pointer' }}>
              Name <span style={{ fontSize: '0.7rem' }}>▼</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <input type="text" placeholder="" style={{ border: 'none', outline: 'none', width: '150px' }} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <button style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#ffffff', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
          </button>
          
          <button style={{ padding: '8px 16px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#ffffff', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            Add Tag
          </button>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button style={{ padding: '8px 16px', border: 'none', backgroundColor: 'transparent', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Bulk Upload
          </button>
          <button onClick={() => setIsInviteOpen(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Invite Vendor
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', color: '#334155' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '600' }}>
              <th style={{ padding: '16px', width: '48px', borderBottom: '1px solid #e2e8f0' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Name <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>▼</span></th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Vendor<br/>Code</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Company<br/>Code</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Email</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Phone</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Tags</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Type</th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>City <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>▼</span></th>
              <th style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0' }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0' }}>{vendor.name}</td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0' }}>{vendor.vendorCode}</td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>{vendor.companyCode}</td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0' }}>{vendor.email}</td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>{vendor.phone.replace(' ', '\n')}</td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ padding: '4px 8px', border: '1px solid #fdba74', borderRadius: '4px', color: '#ea580c', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      hinz
                    </span>
                  </div>
                </td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>{vendor.type.replace(' ', '\n')}</td>
                <td style={{ padding: '16px', borderRight: '1px solid #e2e8f0', whiteSpace: 'pre-line' }}>{vendor.city}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', ...getStatusStyle(vendor.status) }}>
                    {vendor.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal Overlay */}
      {isInviteOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          {/* Drawer Panel */}
          <div style={{ width: '480px', backgroundColor: '#ffffff', height: '100%', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s forwards' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Invite New Vendor</h2>
              <button onClick={() => setIsInviteOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}><span style={{ color: '#ef4444' }}>*</span> POC - Full Name</label>
                <input type="text" placeholder="Enter POC Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}><span style={{ color: '#ef4444' }}>*</span> Email</label>
                <input type="email" placeholder="Enter Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}><span style={{ color: '#ef4444' }}>*</span> Choose vendor profile</label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer', color: '#1e293b' }}>
                    <input type="radio" checked={formData.type === 'Manufacturer/Trader'} onChange={() => setFormData({...formData, type: 'Manufacturer/Trader'})} style={{ accentColor: '#2563eb' }} />
                    Manufacturer/Trader
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer', color: '#1e293b' }}>
                    <input type="radio" checked={formData.type === 'Broker'} onChange={() => setFormData({...formData, type: 'Broker'})} style={{ accentColor: '#2563eb' }} />
                    Broker
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Vendor Code</label>
                <input type="text" placeholder="Enter Vendor Code" value={formData.vendorCode} onChange={e => setFormData({...formData, vendorCode: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>Deals In</label>
                <input type="text" placeholder="Search by product category" value={formData.dealsIn} onChange={e => setFormData({...formData, dealsIn: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}><span style={{ color: '#ef4444' }}>*</span> Trade Licence Number</label>
                <input type="text" placeholder="Trade Licence Number" value={formData.tradeLicense} onChange={e => setFormData({...formData, tradeLicense: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}><span style={{ color: '#ef4444' }}>*</span> Invite Vendor via</label>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer', color: '#1e293b' }}>
                    <input type="radio" checked={formData.inviteVia === 'Tax ID'} onChange={() => setFormData({...formData, inviteVia: 'Tax ID'})} style={{ accentColor: '#2563eb' }} />
                    Tax ID
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', cursor: 'pointer', color: '#1e293b' }}>
                    <input type="radio" checked={formData.inviteVia === 'Enter details manually'} onChange={() => setFormData({...formData, inviteVia: 'Enter details manually'})} style={{ accentColor: '#2563eb' }} />
                    Enter details manually
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}><span style={{ color: '#ef4444' }}>*</span> Business Location</label>
                <div style={{ position: 'relative' }}>
                  <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', outline: 'none', appearance: 'none', backgroundColor: '#fff', color: formData.city ? '#1e293b' : '#94a3b8' }}>
                    <option value="" disabled>Select Business Location</option>
                    <option value="New York">New York</option>
                    <option value="London">London</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Tokyo">Tokyo</option>
                  </select>
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '0.8rem' }}>▼</span>
                </div>
              </div>

            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsInviteOpen(false)} style={{ padding: '10px 24px', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 24px', border: 'none', borderRadius: '4px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '500', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>{isSubmitting ? 'Saving...' : 'Next'}</button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}
