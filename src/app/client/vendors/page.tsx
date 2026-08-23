'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, Upload, Filter, Tag, Search, 
  Building2, MapPin, Mail, Phone, CheckCircle2, 
  XCircle, Clock, Check, X, ShieldAlert, BadgeCheck, ChevronDown, Star, AlertTriangle, Copy, AlertCircle
} from 'lucide-react';

export default function VendorManagement() {
  const router = useRouter();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ name: '', code: '', contact: '', type: '', location: '' });
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', type: 'Manufacturer/Trader', vendorCode: '', 
    dealsIn: '', tradeLicense: '', inviteVia: 'Tax ID', city: ''
  });

  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBankruptcyPredictor, setShowBankruptcyPredictor] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('godTierFeatures');
        if (saved) {
          const features = JSON.parse(saved);
          if (features.bankruptcyPredictor !== undefined) {
            return features.bankruptcyPredictor;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return true;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/vendors')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}`);
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          const text = await res.text();
          throw new Error(`Expected JSON but got HTML/text: ${text.substring(0, 50)}`);
        }
      })
      .then(data => {
        if (Array.isArray(data)) {
          setVendors(data);
        }
      })
      .catch(e => {
        console.error("Error fetching vendors:", e);
        setFetchError(e.message);
      })
      .finally(() => setIsLoading(false));
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
          vendorCode: formData.vendorCode || '-',
          companyCode: '-', 
          email: formData.email, 
          phone: '-',
          type: formData.type || 'Selling firm', 
          city: formData.city || '-', 
          status: 'Invited'
        })
      });

      if (res.ok) {
        const newVendor = await res.json();
        setVendors([newVendor, ...vendors]);
        setIsInviteOpen(false);
        setFormData({ name: '', email: '', type: 'Manufacturer/Trader', vendorCode: '', dealsIn: '', tradeLicense: '', inviteVia: 'Tax ID', city: '' });
      } else {
        alert('Failed to save vendor');
      }
    } catch(err) {
      alert('Error saving vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Joined':
        return <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Joined</span>;
      case 'Invited':
        return <span style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Invited</span>;
      case 'Blacklisted':
        return <span style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12} /> Blacklisted</span>;
      default:
        return <span style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{status}</span>;
    }
  };

  const filteredVendors = vendors.filter(v => {
    let matches = true;
    
    // Universal search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchUniversal = (v.name || '').toLowerCase().includes(q) || 
               (v.email || '').toLowerCase().includes(q) ||
               (v.vendorCode || '').toLowerCase().includes(q) ||
               (v.phone || '').toLowerCase().includes(q) ||
               (v.type || '').toLowerCase().includes(q) ||
               (v.city || '').toLowerCase().includes(q);
      if (!matchUniversal) matches = false;
    }

    // Advanced filters
    if (advancedFilters.name && !(v.name || '').toLowerCase().includes(advancedFilters.name.toLowerCase())) matches = false;
    if (advancedFilters.code && !(v.vendorCode || '').toLowerCase().includes(advancedFilters.code.toLowerCase())) matches = false;
    if (advancedFilters.contact && !(v.email || '').toLowerCase().includes(advancedFilters.contact.toLowerCase()) && !(v.phone || '').toLowerCase().includes(advancedFilters.contact.toLowerCase())) matches = false;
    if (advancedFilters.type && !(v.type || '').toLowerCase().includes(advancedFilters.type.toLowerCase())) matches = false;
    if (advancedFilters.location && !(v.city || '').toLowerCase().includes(advancedFilters.location.toLowerCase())) matches = false;

    return matches;
  });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100%', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
      {/* Sub Header */}
      {fetchError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', padding: '16px', borderRadius: '8px', marginBottom: '24px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Error fetching vendors:</strong> {fetchError.includes('HTML') || fetchError.includes('504') ? 'Database server might be sleeping. Please wait a moment and refresh.' : fetchError}
          </div>
        </div>
      )}
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Vendor Management</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Manage your supplier network, invite new vendors, and track onboarding.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Vendors', value: vendors.length, icon: Building2, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active & Joined', value: vendors.filter(v => v.status === 'Joined').length, icon: BadgeCheck, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pending Invites', value: vendors.filter(v => v.status === 'Invited').length, icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Blacklisted', value: vendors.filter(v => v.status === 'Blacklisted').length, icon: ShieldAlert, color: '#ef4444', bg: '#fef2f2' },
        ].map((stat, i) => (
          <div key={i} className="kpi-card" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'all 0.2s ease', cursor: 'default' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.01em' }}>{stat.label}</p>
              <h3 style={{ margin: '6px 0 0 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Toolbar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', width: '280px' }}>
              <div style={{ padding: '0 12px' }}><Search size={16} color="#94a3b8" /></div>
              <input 
                type="text" placeholder="Search universally..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', padding: '8px 12px 8px 0', outline: 'none', width: '100%', fontSize: '0.875rem' }} 
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: isFilterOpen ? '#f1f5f9' : '#fff', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                <Filter size={16} /> Filter
              </button>
              
              {isFilterOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', width: '300px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Advanced Filters</h3>
                    <button onClick={() => setAdvancedFilters({ name: '', code: '', contact: '', type: '', location: '' })} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>Clear All</button>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>Vendor Name</label>
                    <input type="text" value={advancedFilters.name} onChange={e => setAdvancedFilters({...advancedFilters, name: e.target.value})} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', outline: 'none' }} placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>Vendor Code</label>
                    <input type="text" value={advancedFilters.code} onChange={e => setAdvancedFilters({...advancedFilters, code: e.target.value})} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', outline: 'none' }} placeholder="e.g. VEN-1001" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>Contact Info</label>
                    <input type="text" value={advancedFilters.contact} onChange={e => setAdvancedFilters({...advancedFilters, contact: e.target.value})} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', outline: 'none' }} placeholder="Email or Phone" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>Type</label>
                    <input type="text" value={advancedFilters.type} onChange={e => setAdvancedFilters({...advancedFilters, type: e.target.value})} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', outline: 'none' }} placeholder="e.g. Manufacturer" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#475569', marginBottom: '4px' }}>Location</label>
                    <input type="text" value={advancedFilters.location} onChange={e => setAdvancedFilters({...advancedFilters, location: e.target.value})} style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.875rem', outline: 'none' }} placeholder="e.g. New York" />
                  </div>
                </div>
              )}
            </div>
            <button style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <Tag size={16} /> Tags
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <Upload size={16} /> Bulk Upload
            </button>
            <button onClick={() => setIsInviteOpen(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}>
              <UserPlus size={16} /> Invite Vendor
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px 24px', width: '40px' }}><input type="checkbox" style={{ accentColor: '#2563eb', cursor: 'pointer', width: '16px', height: '16px' }} /></th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Vendor Name</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Vendor Code</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Trust Score</th>
                {showBankruptcyPredictor && <th style={{ padding: '16px 24px', fontWeight: 600 }}>Financial Health</th>}
                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={showBankruptcyPredictor ? 8 : 7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
                    <p style={{ margin: 0 }}>Loading vendors...</p>
                  </td>
                </tr>
              ) : filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                <tr className="vendor-row" onClick={() => router.push(`/client/vendors/${vendor.id}`)} key={vendor.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', transition: 'all 0.2s ease', cursor: 'pointer' }}>
                  <td style={{ padding: '20px 24px' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" style={{ accentColor: '#2563eb', cursor: 'pointer', width: '16px', height: '16px' }} />
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                        {(vendor.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{vendor.name || 'Unnamed Vendor'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#475569', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', width: 'fit-content' }}>
                      {vendor.vendorCode}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(vendor.vendorCode, `code-${vendor.id}`); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '2px', display: 'flex', transition: 'color 0.2s' }}
                        title="Copy Vendor Code"
                      >
                        {copiedId === `code-${vendor.id}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.875rem' }}>
                        <div style={{ backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '4px', display: 'flex' }}><Mail size={14} color="#64748b" /></div>
                        {vendor.email}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(vendor.email, `email-${vendor.id}`); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', marginLeft: 'auto', display: 'flex', opacity: 0.6, transition: 'opacity 0.2s' }}
                          title="Copy Email"
                          className="copy-btn"
                        >
                          {copiedId === `email-${vendor.id}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.875rem' }}>
                        <div style={{ backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '4px', display: 'flex' }}><Phone size={14} color="#64748b" /></div>
                        {vendor.phone}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopy(vendor.phone, `phone-${vendor.id}`); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', marginLeft: 'auto', display: 'flex', opacity: 0.6, transition: 'opacity 0.2s' }}
                          title="Copy Phone"
                          className="copy-btn"
                        >
                          {copiedId === `phone-${vendor.id}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#475569', fontWeight: 500 }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>{vendor.type}</span>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                      <MapPin size={16} color="#94a3b8" /> {vendor.city}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#475569' }}>
                    {vendor.trustScore ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: vendor.trustScore > 4 ? '#10b981' : vendor.trustScore < 3 ? '#ef4444' : '#f59e0b', backgroundColor: vendor.trustScore > 4 ? '#ecfdf5' : vendor.trustScore < 3 ? '#fef2f2' : '#fef3c7', padding: '4px 10px', borderRadius: '12px', width: 'fit-content' }}>
                        <Star size={14} fill={vendor.trustScore > 4 ? '#10b981' : vendor.trustScore < 3 ? '#ef4444' : '#f59e0b'} /> {vendor.trustScore}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                  {showBankruptcyPredictor && (
                    <td style={{ padding: '20px 24px', color: '#475569' }}>
                      {vendor.financialHealth ? (
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: vendor.financialHealth === 'Excellent' ? '#ecfdf5' : vendor.financialHealth === 'Stable' ? '#fef3c7' : '#fef2f2', color: vendor.financialHealth === 'Excellent' ? '#10b981' : vendor.financialHealth === 'Stable' ? '#f59e0b' : '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}>
                          {vendor.financialHealth === 'Critical' && <AlertTriangle size={12} />}
                          {vendor.financialHealth.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>-</span>
                      )}
                    </td>
                  )}
                  <td style={{ padding: '20px 24px' }}>
                    {getStatusBadge(vendor.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={showBankruptcyPredictor ? 8 : 7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <Users size={32} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <p style={{ margin: 0 }}>No vendors found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Slide-out Drawer */}
      {isInviteOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 100, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.2s' }}>
          <div style={{ width: '500px', backgroundColor: '#ffffff', height: '100%', boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s forwards' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><UserPlus size={20} color="#2563eb" /> Invite Vendor</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Send an invitation to join the procurement network.</p>
              </div>
              <button onClick={() => setIsInviteOpen(false)} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" placeholder="e.g. Acme Corp" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="email" placeholder="vendor@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Vendor Profile <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: formData.type === 'Manufacturer/Trader' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: formData.type === 'Manufacturer/Trader' ? '#eff6ff' : '#fff' }}>
                    <input type="radio" checked={formData.type === 'Manufacturer/Trader'} onChange={() => setFormData({...formData, type: 'Manufacturer/Trader'})} style={{ accentColor: '#2563eb' }} />
                    <span style={{ fontSize: '0.9375rem', color: formData.type === 'Manufacturer/Trader' ? '#1d4ed8' : '#475569', fontWeight: 500 }}>Manufacturer</span>
                  </label>
                  <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: formData.type === 'Broker' ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: formData.type === 'Broker' ? '#eff6ff' : '#fff' }}>
                    <input type="radio" checked={formData.type === 'Broker'} onChange={() => setFormData({...formData, type: 'Broker'})} style={{ accentColor: '#2563eb' }} />
                    <span style={{ fontSize: '0.9375rem', color: formData.type === 'Broker' ? '#1d4ed8' : '#475569', fontWeight: 500 }}>Broker</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Vendor Code</label>
                  <input type="text" placeholder="Optional" value={formData.vendorCode} onChange={e => setFormData({...formData, vendorCode: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9375rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>City <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9375rem', outline: 'none', appearance: 'none', backgroundColor: '#fff', color: formData.city ? '#0f172a' : '#94a3b8' }}>
                      <option value="" disabled>Select City</option>
                      <option value="New York">New York</option>
                      <option value="London">London</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Tokyo">Tokyo</option>
                    </select>
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }}><ChevronDown size={16} /></span>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setIsInviteOpen(false)} style={{ padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 24px', border: 'none', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSubmitting ? 'Sending...' : <><Mail size={16} /> Send Invite</>}
              </button>
            </div>

          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05) !important; }
        .vendor-row:hover { background-color: #f8fafc !important; }
        .vendor-row:hover .copy-btn { opacity: 1 !important; }
      `}} />
    </div>
  );
}
