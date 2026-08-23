'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, Upload, Filter, Tag, Search, 
  Building2, MapPin, Mail, Phone, CheckCircle2, 
  XCircle, Clock, Check, X, ShieldAlert, BadgeCheck, ChevronDown, Star, AlertTriangle, Copy, Activity
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

  useEffect(() => {
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVendors(data);
        }
      })
      .catch(e => console.error("Error fetching vendors:", e))
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
        return <div className="status-badge joined"><CheckCircle2 size={14} /> <span>Joined</span></div>;
      case 'Invited':
        return <div className="status-badge invited"><Clock size={14} /> <span>Invited</span></div>;
      case 'Blacklisted':
        return <div className="status-badge blacklisted"><ShieldAlert size={14} /> <span>Blacklisted</span></div>;
      default:
        return <div className="status-badge default"><span>{status}</span></div>;
    }
  };

  const filteredVendors = vendors.filter(v => {
    let matches = true;
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
    if (advancedFilters.name && !(v.name || '').toLowerCase().includes(advancedFilters.name.toLowerCase())) matches = false;
    if (advancedFilters.code && !(v.vendorCode || '').toLowerCase().includes(advancedFilters.code.toLowerCase())) matches = false;
    if (advancedFilters.contact && !(v.email || '').toLowerCase().includes(advancedFilters.contact.toLowerCase()) && !(v.phone || '').toLowerCase().includes(advancedFilters.contact.toLowerCase())) matches = false;
    if (advancedFilters.type && !(v.type || '').toLowerCase().includes(advancedFilters.type.toLowerCase())) matches = false;
    if (advancedFilters.location && !(v.city || '').toLowerCase().includes(advancedFilters.location.toLowerCase())) matches = false;
    return matches;
  });

  return (
    <div className="vendor-mgmt-container">
      
      {/* Animated Background Elements */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>

      <div className="content-wrapper">
        {/* Header Area */}
        <div className="header-section">
          <div>
            <h1 className="page-title">Global Vendor Network</h1>
            <p className="page-subtitle">Manage supplier relationships, monitor trust metrics, and expand your procurement reach.</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <Upload size={16} /> Bulk Upload
            </button>
            <button className="btn-primary" onClick={() => setIsInviteOpen(true)}>
              <UserPlus size={16} /> Invite Vendor
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {[
            { label: 'Total Network', value: vendors.length, icon: Building2, color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', shadow: 'rgba(59, 130, 246, 0.25)' },
            { label: 'Active Suppliers', value: vendors.filter(v => v.status === 'Joined').length, icon: BadgeCheck, color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.25)' },
            { label: 'Pending Invitations', value: vendors.filter(v => v.status === 'Invited').length, icon: Clock, color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245, 158, 11, 0.25)' },
            { label: 'High Risk / Blocked', value: vendors.filter(v => v.status === 'Blacklisted').length, icon: ShieldAlert, color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', shadow: 'rgba(239, 68, 68, 0.25)' },
          ].map((stat, i) => (
            <div key={i} className="kpi-card glass-panel stagger-enter" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="kpi-icon-wrapper" style={{ background: stat.color, boxShadow: `0 8px 16px ${stat.shadow}` }}>
                <stat.icon size={22} color="#fff" strokeWidth={2} />
              </div>
              <div className="kpi-content">
                <p className="kpi-label">{stat.label}</p>
                <h3 className="kpi-value">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar-section glass-panel stagger-enter" style={{ animationDelay: '0.4s' }}>
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" placeholder="Search vendors across all fields..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="toolbar-actions">
            <div className="filter-container">
              <button className={`btn-filter ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                <Filter size={16} /> Advanced Filters
              </button>
              
              {isFilterOpen && (
                <div className="filter-popover glass-panel">
                  <div className="filter-popover-header">
                    <h3>Filter Parameters</h3>
                    <button className="btn-clear" onClick={() => setAdvancedFilters({ name: '', code: '', contact: '', type: '', location: '' })}>Clear All</button>
                  </div>
                  
                  <div className="filter-fields">
                    <div className="input-group">
                      <label>Vendor Name</label>
                      <input type="text" value={advancedFilters.name} onChange={e => setAdvancedFilters({...advancedFilters, name: e.target.value})} placeholder="e.g. Acme Corp" />
                    </div>
                    <div className="input-group">
                      <label>Vendor Code</label>
                      <input type="text" value={advancedFilters.code} onChange={e => setAdvancedFilters({...advancedFilters, code: e.target.value})} placeholder="e.g. VEN-1001" />
                    </div>
                    <div className="input-group">
                      <label>Contact Info</label>
                      <input type="text" value={advancedFilters.contact} onChange={e => setAdvancedFilters({...advancedFilters, contact: e.target.value})} placeholder="Email or Phone" />
                    </div>
                    <div className="input-group">
                      <label>Type</label>
                      <input type="text" value={advancedFilters.type} onChange={e => setAdvancedFilters({...advancedFilters, type: e.target.value})} placeholder="e.g. Manufacturer" />
                    </div>
                    <div className="input-group">
                      <label>Location</label>
                      <input type="text" value={advancedFilters.location} onChange={e => setAdvancedFilters({...advancedFilters, location: e.target.value})} placeholder="e.g. New York" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="data-grid-container stagger-enter" style={{ animationDelay: '0.5s' }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Supplier Details</th>
                <th>Classification</th>
                <th>Contact Registry</th>
                <th>Operational Hub</th>
                <th>Trust Index</th>
                {showBankruptcyPredictor && <th>Risk Oracle</th>}
                <th>Network Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={showBankruptcyPredictor ? 8 : 7} className="loading-state">
                    <div className="spinner"></div>
                    <p>Synchronizing Global Vendor Data...</p>
                  </td>
                </tr>
              ) : filteredVendors.length > 0 ? filteredVendors.map((vendor, i) => (
                <tr className="data-row" key={vendor.id} onClick={() => router.push(`/client/vendors/${vendor.id}`)} style={{ animationDelay: `${0.6 + (i * 0.05)}s` }}>
                  <td onClick={e => e.stopPropagation()}>
                    <label className="checkbox-container">
                      <input type="checkbox" />
                      <span className="checkmark"></span>
                    </label>
                  </td>
                  <td>
                    <div className="vendor-profile-cell">
                      <div className="vendor-avatar">
                        {(vendor.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="vendor-info">
                        <span className="vendor-name">{vendor.name || 'Unnamed Vendor'}</span>
                        <div className="vendor-code-badge">
                          <span>{vendor.vendorCode}</span>
                          <button 
                            className="copy-action"
                            onClick={(e) => { e.stopPropagation(); handleCopy(vendor.vendorCode, `code-${vendor.id}`); }}
                            title="Copy Vendor Code"
                          >
                            {copiedId === `code-${vendor.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">{vendor.type}</span>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <div className="contact-icon"><Mail size={12} /></div>
                        <span className="contact-text">{vendor.email}</span>
                        <button className="copy-action-hidden" onClick={(e) => { e.stopPropagation(); handleCopy(vendor.email, `email-${vendor.id}`); }}>
                          {copiedId === `email-${vendor.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <div className="contact-item">
                        <div className="contact-icon"><Phone size={12} /></div>
                        <span className="contact-text">{vendor.phone}</span>
                        <button className="copy-action-hidden" onClick={(e) => { e.stopPropagation(); handleCopy(vendor.phone, `phone-${vendor.id}`); }}>
                          {copiedId === `phone-${vendor.id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="location-cell">
                      <MapPin size={14} className="location-icon" /> {vendor.city}
                    </div>
                  </td>
                  <td>
                    {vendor.trustScore ? (
                      <div className="trust-score-cell">
                        <div className="trust-stars">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={12} fill={star <= vendor.trustScore ? '#f59e0b' : '#e2e8f0'} color={star <= vendor.trustScore ? '#f59e0b' : '#e2e8f0'} />
                          ))}
                        </div>
                        <span className="trust-number">{vendor.trustScore.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="empty-dash">-</span>
                    )}
                  </td>
                  {showBankruptcyPredictor && (
                    <td>
                      {vendor.financialHealth ? (
                        <div className={`risk-badge risk-${vendor.financialHealth.toLowerCase()}`}>
                          <span className="risk-dot"></span>
                          {vendor.financialHealth.toUpperCase()}
                        </div>
                      ) : (
                        <span className="empty-dash">-</span>
                      )}
                    </td>
                  )}
                  <td>
                    {getStatusBadge(vendor.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={showBankruptcyPredictor ? 8 : 7} className="empty-state-cell">
                    <div className="empty-state-icon">
                      <Search size={32} />
                    </div>
                    <p>No vendors found matching your parameters.</p>
                    <button className="btn-secondary" onClick={() => { setSearchQuery(''); setAdvancedFilters({ name: '', code: '', contact: '', type: '', location: '' }); }}>Clear Filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal Slide-out Drawer */}
      {isInviteOpen && (
        <div className="modal-overlay" onClick={() => setIsInviteOpen(false)}>
          <div className="modal-drawer" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2><UserPlus size={20} className="header-icon" /> Invite Network Partner</h2>
                <p>Onboard a new supplier to the procurement platform.</p>
              </div>
              <button className="btn-close" onClick={() => setIsInviteOpen(false)}><X size={24} /></button>
            </div>

            <div className="modal-body">
              <div className="input-group">
                <label>Company Name <span className="required">*</span></label>
                <input type="text" placeholder="e.g. Acme Corp" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Email Address <span className="required">*</span></label>
                <input type="email" placeholder="vendor@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="input-group">
                <label>Vendor Profile <span className="required">*</span></label>
                <div className="radio-group">
                  <label className={`radio-card ${formData.type === 'Manufacturer/Trader' ? 'active' : ''}`}>
                    <input type="radio" checked={formData.type === 'Manufacturer/Trader'} onChange={() => setFormData({...formData, type: 'Manufacturer/Trader'})} />
                    <span>Manufacturer</span>
                  </label>
                  <label className={`radio-card ${formData.type === 'Broker' ? 'active' : ''}`}>
                    <input type="radio" checked={formData.type === 'Broker'} onChange={() => setFormData({...formData, type: 'Broker'})} />
                    <span>Broker</span>
                  </label>
                </div>
              </div>

              <div className="input-grid">
                <div className="input-group">
                  <label>Vendor Code</label>
                  <input type="text" placeholder="Auto-generated if empty" value={formData.vendorCode} onChange={e => setFormData({...formData, vendorCode: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Operational Hub <span className="required">*</span></label>
                  <div className="select-wrapper">
                    <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                      <option value="" disabled>Select Location</option>
                      <option value="New York">New York</option>
                      <option value="London">London</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Tokyo">Tokyo</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Berlin">Berlin</option>
                    </select>
                    <ChevronDown size={16} className="select-icon" />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsInviteOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Transmitting...' : <><Activity size={16} /> Send Access Key</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Premium Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --primary: #3b82f6;
          --primary-glow: rgba(59, 130, 246, 0.5);
          --bg-main: #f4f7fb;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.8);
          --text-main: #0f172a;
          --text-muted: #64748b;
        }

        .vendor-mgmt-container {
          min-height: 100vh;
          background-color: var(--bg-main);
          position: relative;
          overflow: hidden;
          padding: 32px 40px;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          z-index: 1;
        }

        /* Animated Orbs for Premium Background */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          z-index: -1;
          opacity: 0.6;
          animation: float 20s infinite ease-in-out;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: rgba(59, 130, 246, 0.2);
          top: -100px; left: -100px;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: rgba(16, 185, 129, 0.15);
          bottom: 100px; right: -50px;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: rgba(139, 92, 246, 0.15);
          top: 30%; left: 40%;
          animation-delay: -10s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -50px); }
          66% { transform: translate(-30px, 50px); }
        }

        /* Glassmorphism Utilities */
        .glass-panel {
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
          border-radius: 20px;
        }

        .content-wrapper {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Typography */
        .page-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-main);
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .page-subtitle {
          color: var(--text-muted);
          font-size: 1.05rem;
          margin: 0;
          font-weight: 400;
        }

        /* Header Layout */
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .header-actions {
          display: flex;
          gap: 16px;
        }

        /* Buttons */
        .btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.4);
        }
        .btn-secondary {
          background: white;
          color: var(--text-main);
          border: 1px solid #e2e8f0;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        /* KPI Grid */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .kpi-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kpi-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08);
          border-color: rgba(255, 255, 255, 1);
        }
        .kpi-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-label {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0 0 6px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .kpi-value {
          color: var(--text-main);
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }

        /* Toolbar */
        .toolbar-section {
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .search-bar-wrapper {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          width: 360px;
          padding: 10px 16px;
          transition: all 0.2s;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .search-bar-wrapper:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .search-icon {
          color: #94a3b8;
          margin-right: 12px;
        }
        .search-input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          background: transparent;
          color: var(--text-main);
        }
        .search-input::placeholder { color: #94a3b8; }
        
        .filter-container { position: relative; }
        .btn-filter {
          background: white;
          color: var(--text-main);
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-filter:hover, .btn-filter.active {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }
        
        .filter-popover {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 320px;
          padding: 24px;
          z-index: 50;
          transform-origin: top right;
          animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .filter-popover-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .filter-popover-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
        .btn-clear { background: none; border: none; color: var(--primary); cursor: pointer; font-weight: 600; font-size: 0.85rem; }
        .filter-fields { display: flex; flexDirection: column; gap: 16px; }

        /* Data Grid */
        .data-grid-container {
          overflow-x: auto;
          padding-bottom: 60px;
        }
        .data-grid {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 12px;
          text-align: left;
        }
        .data-grid th {
          padding: 0 24px 8px 24px;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .data-row {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          opacity: 0;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .data-row:hover {
          transform: translateY(-2px) scale(1.005);
          box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.04);
          background: #ffffff;
        }
        .data-row td {
          padding: 20px 24px;
          vertical-align: middle;
        }
        .data-row td:first-child { border-top-left-radius: 16px; border-bottom-left-radius: 16px; border: 1px solid transparent; border-right: none; }
        .data-row td:last-child { border-top-right-radius: 16px; border-bottom-right-radius: 16px; border: 1px solid transparent; border-left: none; }
        .data-row:hover td { border-color: rgba(255,255,255,1); }

        /* Custom Checkbox */
        .checkbox-container {
          display: block;
          position: relative;
          cursor: pointer;
          width: 20px;
          height: 20px;
        }
        .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
        .checkmark {
          position: absolute; top: 0; left: 0; height: 20px; width: 20px;
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .checkbox-container:hover input ~ .checkmark { background-color: #e2e8f0; }
        .checkbox-container input:checked ~ .checkmark { background-color: var(--primary); border-color: var(--primary); }
        .checkmark:after {
          content: ""; position: absolute; display: none;
          left: 6px; top: 2px; width: 5px; height: 10px;
          border: solid white; border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .checkbox-container input:checked ~ .checkmark:after { display: block; }

        /* Cell Styles */
        .vendor-profile-cell { display: flex; alignItems: center; gap: 16px; }
        .vendor-avatar {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          display: flex; align-items: center; justify-content: center;
          color: #4338ca; font-weight: 800; font-size: 1.2rem;
          box-shadow: inset 0 2px 4px rgba(255,255,255,0.6), 0 4px 8px rgba(199, 210, 254, 0.5);
        }
        .vendor-info { display: flex; flex-direction: column; gap: 4px; }
        .vendor-name { font-weight: 700; color: var(--text-main); font-size: 1.05rem; }
        .vendor-code-badge {
          display: flex; align-items: center; gap: 6px;
          background: #f1f5f9; padding: 2px 8px; border-radius: 6px; width: fit-content;
          font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--text-muted);
        }
        .copy-action { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 2px; display: flex; transition: color 0.2s; }
        .copy-action:hover { color: var(--primary); }

        .type-badge {
          background: rgba(241, 245, 249, 0.8);
          color: #475569;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .contact-cell { display: flex; flex-direction: column; gap: 8px; }
        .contact-item { display: flex; align-items: center; gap: 8px; color: #475569; font-size: 0.9rem; }
        .contact-icon { width: 24px; height: 24px; border-radius: 6px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; }
        .copy-action-hidden { opacity: 0; background: none; border: none; cursor: pointer; color: #94a3b8; padding: 2px; transition: opacity 0.2s; }
        .data-row:hover .copy-action-hidden { opacity: 1; }

        .location-cell { display: flex; align-items: center; gap: 8px; font-weight: 500; color: #475569; font-size: 0.95rem; }
        .location-icon { color: #94a3b8; }

        .trust-score-cell { display: flex; align-items: center; gap: 10px; }
        .trust-stars { display: flex; gap: 2px; }
        .trust-number { font-weight: 700; font-size: 1.1rem; color: #0f172a; }

        .risk-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.05em;
        }
        .risk-dot { width: 6px; height: 6px; border-radius: 50%; }
        .risk-excellent { background: rgba(16, 185, 129, 0.1); color: #059669; }
        .risk-excellent .risk-dot { background: #059669; box-shadow: 0 0 8px #10b981; }
        .risk-stable { background: rgba(245, 158, 11, 0.1); color: #d97706; }
        .risk-stable .risk-dot { background: #d97706; }
        .risk-critical { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .risk-critical .risk-dot { background: #dc2626; animation: pulse 2s infinite; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.85rem;
        }
        .status-badge.joined { background: rgba(34, 197, 94, 0.1); color: #15803d; border: 1px solid rgba(34, 197, 94, 0.2); }
        .status-badge.invited { background: rgba(59, 130, 246, 0.1); color: #1d4ed8; border: 1px solid rgba(59, 130, 246, 0.2); }
        .status-badge.blacklisted { background: rgba(239, 68, 68, 0.1); color: #b91c1c; border: 1px solid rgba(239, 68, 68, 0.2); }
        .status-badge.default { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          z-index: 100; display: flex; justify-content: flex-end; animation: fadeIn 0.3s;
        }
        .modal-drawer {
          width: 540px; background: white; height: 100%;
          box-shadow: -20px 0 50px rgba(0,0,0,0.1);
          display: flex; flex-direction: column; animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .modal-header { padding: 32px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .modal-header h2 { margin: 0 0 8px 0; font-size: 1.5rem; color: var(--text-main); display: flex; align-items: center; gap: 12px; }
        .modal-header p { margin: 0; color: var(--text-muted); font-size: 0.95rem; }
        .header-icon { padding: 8px; background: #eff6ff; border-radius: 10px; color: var(--primary); }
        .btn-close { background: none; border: none; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
        .btn-close:hover { color: var(--text-main); }
        
        .modal-body { padding: 32px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 28px; }
        .input-group label { display: block; font-size: 0.9rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px; }
        .input-group label .required { color: #ef4444; }
        .input-group input[type="text"], .input-group input[type="email"], .select-wrapper select {
          width: 100%; padding: 14px 16px; border: 1px solid #cbd5e1; border-radius: 12px;
          font-size: 1rem; color: var(--text-main); outline: none; transition: all 0.2s;
          box-sizing: border-box; background: #fff;
        }
        .input-group input:focus, .select-wrapper select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .select-wrapper { position: relative; }
        .select-wrapper select { appearance: none; }
        .select-icon { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
        
        .radio-group { display: flex; gap: 16px; }
        .radio-card {
          flex: 1; padding: 16px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer;
          display: flex; align-items: center; gap: 12px; transition: all 0.2s; background: #fff;
        }
        .radio-card input { accent-color: var(--primary); width: 18px; height: 18px; }
        .radio-card span { font-weight: 600; color: var(--text-main); font-size: 0.95rem; }
        .radio-card.active { border-color: var(--primary); background: #eff6ff; }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .modal-footer { padding: 24px 32px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 16px; background: #f8fafc; }

        .spinner { width: 32px; height: 32px; border: 3px solid #cbd5e1; border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px auto; }
        .loading-state, .empty-state-cell { padding: 80px 0; text-align: center; color: var(--text-muted); }
        .empty-state-icon { width: 64px; height: 64px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; color: #94a3b8; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }

        .stagger-enter { opacity: 0; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}

