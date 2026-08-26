const fs = require('fs');

function implementVendorModal(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add state for the modal
  content = content.replace(
    /const \[isVendorDropdownOpen, setIsVendorDropdownOpen\] = useState\(false\);/,
    "const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);\n  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);"
  );

  // 2. Replace the search input and dropdown with an "Add Participants" button
  const participantsHeaderRegex = /<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '16px' \}\}>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{selectedVendors\.length > 0 \? \(/;

  const replaceParticipantsSection = `<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <button 
                  onClick={() => setIsVendorModalOpen(true)}
                  style={{ padding: '10px 20px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <Plus size={18} color="#3b82f6" /> Add Participants
                </button>
              </div>
            </div>
            
            {selectedVendors.length > 0 ? (`;

  content = content.replace(participantsHeaderRegex, replaceParticipantsSection);

  // 3. Add the modal rendering right before the final return `</div>` of the page or just before `{isTinderModalOpen`
  const modalUI = `
      {/* Vendor Selection Modal */}
      {isVendorModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '600px', maxWidth: '90%', maxHeight: '80vh', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalSlideUp 0.3s ease-out forwards' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', color: '#0f172a' }}>Select Participants</h2>
              <button onClick={() => setIsVendorModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', left: '16px', transform: 'translateY(-50%)', color: '#94a3b8' }}><Search size={18} /></div>
                <input 
                  type="text" 
                  placeholder="Search vendors by name or email..." 
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1px solid #cbd5e1', borderRadius: '12px', outline: 'none', fontSize: '0.95rem', color: '#0f172a' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px' }}>
              {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => {
                  const isSelected = selectedVendors.some(v => v.id === vendor.id);
                  return (
                    <label key={vendor.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedVendors(selectedVendors.filter(v => v.id !== vendor.id));
                          } else {
                            setSelectedVendors([...selectedVendors, vendor]);
                          }
                        }}
                        style={{ width: '20px', height: '20px', accentColor: '#3b82f6', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '1rem' }}>{vendor.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>{vendor.email} &bull; {vendor.type || 'Vendor'}</div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>No vendors found matching "{vendorSearch}"</div>
              )}
            </div>
            
            <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>{selectedVendors.length} selected</span>
              <button onClick={() => setIsVendorModalOpen(false)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.3)' }}>Done</button>
            </div>
          </div>
        </div>
      )}
`;

  // Insert before the Smart Match modal (if it exists) or before the final closing div.
  if (content.includes('{isTinderModalOpen &&')) {
    content = content.replace(/\{isTinderModalOpen &&/, modalUI + '\n      {isTinderModalOpen &&');
  } else {
    // If not found, insert before the last </div>
    content = content.replace(/<\/div>\s*$/, modalUI + '\n    </div>');
  }

  // Also add modalSlideUp keyframes if not present
  if (!content.includes('modalSlideUp')) {
    const keyframes = `
      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      \`}} />
    `;
    // Insert after the Sticky Header or similar top-level element
    content = content.replace(/\{renderTour\(\)\}/, '{renderTour()}\n' + keyframes);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ' + filePath);
}

implementVendorModal('src/app/client/events/create/auction/page.tsx');
implementVendorModal('src/app/client/events/create/single-stage/page.tsx');
