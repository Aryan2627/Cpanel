const fs = require('fs');

const files = [
  'src/app/client/events/create/auction/page.tsx',
  'src/app/client/events/create/single-stage/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');

    // Replace the Participants Card Content
    const newParticipantsCard = `
          {/* Card 3: Participants */}
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 1px 3px -1px rgba(0,0,0,0.02)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}><Users size={20} color="#8b5cf6" /> Participants</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {showTinderMatchmaking && (
                  <button 
                    onClick={() => setIsTinderModalOpen(true)}
                    style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', border: 'none', borderRadius: '24px', padding: '8px 16px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px rgba(236, 72, 153, 0.3)', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                     Smart Match AI
                  </button>
                )}
                <button 
                  onClick={() => {
                    setTempSelectedVendorIds(new Set(selectedVendors.map(v => v.id)));
                    setIsVendorModalOpen(true);
                  }}
                  style={{ background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '24px', padding: '8px 16px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)' }}
                >
                  <Plus size={16} /> Add Participant
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedVendors.length > 0 ? (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {selectedVendors.map(vendor => (
                    <div key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(to right, #f3e8ff, #e0e7ff)', color: '#4338ca', padding: '8px 16px', borderRadius: '24px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid #c7d2fe', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease' }}>
                      <ShieldCheck size={16} /> {vendor.name}
                      <button onClick={() => handleRemoveVendor(vendor.id)} style={{ background: 'rgba(255,255,255,0.5)', border: 'none', color: '#4338ca', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '4px' }}>&times;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '32px', border: '1px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                  No participants added yet. Click "Add Participant" to invite vendors.
                </div>
              )}
            </div>
          </div>`;

    const regex = /\{\/\* Card 3: Participants \*\/\}[\s\S]*?No vendors selected yet\.\<\/div>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>/;
    
    if (regex.test(code)) {
        code = code.replace(regex, newParticipantsCard);
        
        // ensure Modal UI is at the bottom, before Tinder modal
        const modalUI = `
      {/* Vendor Selection Modal */}
      {isVendorModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#8b5cf6" /> Select Vendors
              </h2>
              <button onClick={() => setIsVendorModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={18} /></div>
                <input 
                  type="text" 
                  placeholder="Search vendors by name, email, or category..." 
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div style={{ padding: '0', overflowY: 'auto', flex: 1, background: '#fff' }}>
              {vendors.filter(v => (v.name+v.email+v.categories).toLowerCase().includes(vendorSearch.toLowerCase())).length > 0 ? (
                vendors.filter(v => (v.name+v.email+v.categories).toLowerCase().includes(vendorSearch.toLowerCase())).map(vendor => (
                  <label key={vendor.id} style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <input 
                      type="checkbox" 
                      checked={tempSelectedVendorIds.has(vendor.id)}
                      onChange={(e) => {
                        const newSet = new Set(tempSelectedVendorIds);
                        if (e.target.checked) newSet.add(vendor.id);
                        else newSet.delete(vendor.id);
                        setTempSelectedVendorIds(newSet);
                      }}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#8b5cf6' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1rem', marginBottom: '2px' }}>{vendor.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', gap: '12px' }}>
                        <span>{vendor.email}</span>
                        {vendor.region && <span>• {vendor.region}</span>}
                        {vendor.categories && <span>• {vendor.categories.join(', ')}</span>}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  No vendors found matching "{vendorSearch}".
                </div>
              )}
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>
                {tempSelectedVendorIds.size} vendors selected
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsVendorModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setSelectedVendors(vendors.filter(v => tempSelectedVendorIds.has(v.id)));
                    setIsVendorModalOpen(false);
                    setVendorSearch('');
                  }} 
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#8b5cf6', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.4)' }}
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;
        if (!code.includes('Vendor Selection Modal')) {
           code = code.replace('{/* Tinder Matchmaking Modal */}', modalUI + '\n      {/* Tinder Matchmaking Modal */}');
        } else {
           code = code.replace(/\{\/\* Vendor Selection Modal \*\/\}[\s\S]*?\{\/\* Tinder Matchmaking Modal \*\/\}/, modalUI + '\n      {/* Tinder Matchmaking Modal */}');
        }

        fs.writeFileSync(file, code, 'utf8');
        console.log('Successfully replaced in', file);
    } else {
        console.log('Regex did NOT match in', file);
    }
  }
});
