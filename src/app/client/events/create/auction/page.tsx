'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SingleStageCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') || '';
  
  const [title, setTitle] = useState(initialTitle);
  
  // States for Event Type and Templates
  const [eventType, setEventType] = useState('Rank based');
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  
  const [template, setTemplate] = useState('Select Templates');
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<any>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [dbTemplates, setDbTemplates] = useState<any[]>([]);

  // State for dynamic creator fields
  const [creatorData, setCreatorData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch Templates from database
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbTemplates(data);
        }
      })
      .catch(err => console.error("Error fetching templates", err));
  }, []);

  // States for Vendors / Participants
  const [vendorSearch, setVendorSearch] = useState('');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // Refs for closing dropdowns on outside click (simplified)
  
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch('/api/vendors');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setVendors(data);
          }
        }
      } catch(err) {
        console.error("Failed to fetch vendors", err);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
    v.email?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const handleSelectVendor = (vendor: any) => {
    if (!selectedVendors.find(v => v.id === vendor.id)) {
      setSelectedVendors([...selectedVendors, vendor]);
    }
    setVendorSearch('');
    setIsVendorDropdownOpen(false);
  };

  const handleRemoveVendor = (id: number) => {
    setSelectedVendors(selectedVendors.filter(v => v.id !== id));
  };

  // States for Live/Test Mode
  const [eventMode, setEventMode] = useState('Live Event');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f8fafc', margin: '-32px' }}>
      
      <div style={{ flex: 1, backgroundColor: '#ffffff', margin: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <h1 className="page-title" style={{ padding: '24px 32px 0 32px', margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>Create Reverse Auction</h1>
        <p style={{ padding: '0 32px', color: '#64748b' }}>Configure event settings, items, and invite suppliers to your reverse auction.</p>

        {/* Top Header - Event Title & Mode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '1.05rem', marginRight: '16px' }}>Event Title :</div>
            <input 
              type="text" 
              placeholder="Enter the title of this event" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '1.05rem', color: '#000000', width: '100%', backgroundColor: 'transparent' }}
            />
          </div>
          
          {/* Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '24px' }}>
            <div 
              onClick={() => setEventMode('Live Event')}
              style={{ 
                padding: '6px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '20px', cursor: 'pointer',
                backgroundColor: eventMode === 'Live Event' ? '#ffffff' : 'transparent',
                color: eventMode === 'Live Event' ? '#2563eb' : '#64748b',
                boxShadow: eventMode === 'Live Event' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              🔴 Live Event
            </div>
            <div 
              onClick={() => setEventMode('Test Event')}
              style={{ 
                padding: '6px 16px', fontSize: '0.85rem', fontWeight: '600', borderRadius: '20px', cursor: 'pointer',
                backgroundColor: eventMode === 'Test Event' ? '#ffffff' : 'transparent',
                color: eventMode === 'Test Event' ? '#f59e0b' : '#64748b',
                boxShadow: eventMode === 'Test Event' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              🧪 Test Event
            </div>
          </div>
        </div>

        {/* Second Header - Event Type & Templates */}
        <div style={{ display: 'flex', gap: '64px', padding: '16px 32px', borderBottom: '1px solid #f1f5f9' }}>
          {/* Event Type */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.85rem', color: '#000000', marginBottom: '8px' }}>Event Type</div>
            <div 
              onClick={() => setIsEventTypeOpen(!isEventTypeOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#000000', cursor: 'pointer', userSelect: 'none' }}
            >
              <span>{eventType === 'Rank based' ? '🏆' : '💰'}</span> {eventType} <span style={{ color: '#000000', marginLeft: '4px' }}>▼</span>
            </div>
            {isEventTypeOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10 }}>
                <div 
                  onClick={() => { setEventType('Rank based'); setIsEventTypeOpen(false); }}
                  style={{ padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🏆 Rank based
                </div>
                <div 
                  onClick={() => { setEventType('Price based'); setIsEventTypeOpen(false); }}
                  style={{ padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  💰 Price based
                </div>
              </div>
            )}
          </div>
          
          {/* Templates */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.85rem', color: '#000000', marginBottom: '8px' }}>Templates</div>
            <div 
              onClick={() => setIsTemplateOpen(!isTemplateOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#000000', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '1.1rem' }}>⊞</span> {template} <span style={{ color: '#000000', marginLeft: '4px', fontSize: '0.8rem' }}>▼</span>
            </div>
            {isTemplateOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '150px' }}>
                {dbTemplates.length > 0 ? (
                  dbTemplates.map((t: any) => (
                    <div 
                      key={t.id}
                      onClick={() => { 
                        setTemplate(t.name); 
                        setSelectedTemplateObj(t); 
                        setIsTemplateOpen(false);
                        setCreatorData({}); 
                      }}
                      style={{ padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {t.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px 16px', color: '#94a3b8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    No templates found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Product Requirements */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>Product Requirements</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>Category</label>
                <input 
                  type="text" 
                  placeholder="e.g. IT Equipment"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>Delivery Date</label>
                <input 
                  type="date" 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>UOM</label>
                <input 
                  type="text" 
                  placeholder="e.g. EA, KG"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>Target Price</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>Product Specifications</label>
              <textarea 
                placeholder="Enter detailed specifications, requirements, and compliance standards..."
                rows={5}
                style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
              <button style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📎 Attach Documents
              </button>
              <button style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ➕ Add Another Line Item
              </button>
            </div>
            
            {/* Dynamic Template Configuration Section */}
            {selectedTemplateObj && (
              <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>Template Configuration</h2>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>Fill in the fields required by you (the Creator) for this template.</p>
                
                {(() => {
                  try {
                    const fields = JSON.parse(selectedTemplateObj.fields) || [];
                    const creatorFields = fields.filter((f: any) => f.role === 'Creator');
                    
                    if (creatorFields.length === 0) {
                      return <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>This template has no Buyer-filled requirements.</div>;
                    }

                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {creatorFields.map((f: any) => (
                          <div key={f.id}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', color: '#000000', marginBottom: '8px' }}>{f.name}</label>
                            <input 
                              type="number" 
                              placeholder={`Enter ${f.name}`}
                              value={creatorData[f.key] || ''}
                              onChange={(e) => setCreatorData({ ...creatorData, [f.key]: e.target.value })}
                              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.95rem', color: '#000000' }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  } catch(e) {
                    return null;
                  }
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar 1 - Participants */}
        <div style={{ padding: '16px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#000000', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Participants <span style={{ fontSize: '0.75rem' }}>▼</span>
          </div>
          
          {/* Selected Vendors Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {selectedVendors.map(vendor => (
              <div key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 8px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid #bfdbfe' }}>
                {vendor.name}
                <span onClick={() => handleRemoveVendor(vendor.id)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>&times;</span>
              </div>
            ))}
          </div>

          {/* Vendor Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <input 
              type="text" 
              placeholder="Search vendors you want to add..." 
              value={vendorSearch}
              onChange={(e) => {
                setVendorSearch(e.target.value);
                setIsVendorDropdownOpen(true);
              }}
              onFocus={() => setIsVendorDropdownOpen(true)}
              style={{ border: 'none', outline: 'none', fontSize: '0.95rem', color: '#000000', width: '100%', backgroundColor: 'transparent' }}
            />
            {isVendorDropdownOpen && vendorSearch.length > 0 && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px', width: '300px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map(vendor => (
                    <div 
                      key={vendor.id}
                      onClick={() => handleSelectVendor(vendor)}
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '500', color: '#000000', fontSize: '0.9rem' }}>{vendor.name}</div>
                      <div style={{ color: '#000000', fontSize: '0.8rem' }}>{vendor.email}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '8px 12px', color: '#000000', fontSize: '0.9rem' }}>No vendors found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar 2 - Actions & Schedule */}
        <div style={{ padding: '16px 32px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
          
          {/* Left Actions */}
          <div style={{ display: 'flex', gap: '24px', color: '#cbd5e1', fontWeight: '500', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>⊞</span> Savings
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span style={{ fontSize: '1.2rem' }}>📄</span> Terms & Conditions
            </div>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            
            {/* Schedule Info */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.8rem', color: '#000000', marginBottom: '4px' }}>Schedule</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000', fontSize: '0.9rem', cursor: 'pointer' }}>
                <span>🕒</span> Now - 12:36 am, 1st Jul (30 Mins) <span style={{ fontSize: '0.75rem' }}>▼</span>
              </div>
            </div>

            {/* Send Button */}
            <button 
              onClick={async () => {
                if (title && selectedVendors.length > 0 && template !== 'Select Templates') {
                  try {
                    const res = await fetch('/api/events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        refId: `EVT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
                        title: title,
                        type: eventType,
                        account: 'Internal',
                        itemsCount: 1,
                        stages: [{ 
                          name: template, 
                          mode: eventMode,
                          templateFields: selectedTemplateObj ? JSON.parse(selectedTemplateObj.fields).map((f: any) => ({
                            ...f,
                            defaultValue: f.role === 'Creator' ? (creatorData[f.key] || 0) : undefined
                          })) : [] 
                        }],
                        participants: selectedVendors
                      })
                    });
                    if (res.ok) {
                      alert("Event successfully created and published to Vendor Portal!");
                      router.push('/client/events');
                    } else {
                      alert("Error creating event");
                    }
                  } catch (err) {
                    alert("Network error");
                  }
                } else {
                  let missing = [];
                  if (!title) missing.push("Title");
                  if (selectedVendors.length === 0) missing.push("at least one Vendor");
                  if (template === 'Select Templates') missing.push("a Template");
                  alert(`Please provide: ${missing.join(', ')}`);
                }
              }}
              style={{ 
                backgroundColor: (title && selectedVendors.length > 0 && template !== 'Select Templates') ? '#2563eb' : '#f1f5f9', 
                color: (title && selectedVendors.length > 0 && template !== 'Select Templates') ? '#ffffff' : '#94a3b8', 
                border: '1px solid #cbd5e1', borderRadius: '4px', 
                padding: '12px 24px', fontWeight: '600', fontSize: '0.95rem', 
                cursor: 'pointer'
              }}>
              Launch Event
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SingleStageCreatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SingleStageCreateContent />
    </Suspense>
  );
}
