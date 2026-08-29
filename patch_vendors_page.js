const fs = require('fs');
let code = fs.readFileSync('src/app/client/vendors/page.tsx', 'utf8');

// 1. Add specific badges for Onboarding
const badgeBlock = `case 'Joined':
          return <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Joined</span>;
        case 'Onboarded':
          return <span style={{ padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><BadgeCheck size={12} /> Onboarded</span>;
        case 'Approval Pending':
          return <span style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Action Required</span>;
        case 'Onboarding in Progress':
          return <span style={{ padding: '4px 10px', backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Building2 size={12} /> Onboarding</span>;`;

code = code.replace(/case 'Joined':[\s\S]*?<\/span>;/, badgeBlock);

// 2. Add Modal state & onClick to row
const stateHooks = `const [searchQuery, setSearchQuery] = useState('');`;
const newStateHooks = `const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState<any>(null);

  const handleApproveVendor = async (id: string) => {
    try {
      const res = await fetch(\`/api/vendors/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Onboarded' })
      });
      if (res.ok) {
        setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'Onboarded' } : v));
        setSelectedVendorForApproval(null);
      }
    } catch(err) { console.error(err); }
  };
`;
code = code.replace(stateHooks, newStateHooks);

const trBlock = `<tr key={vendor.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }} className="hover-bg-gray">`;
const newTrBlock = `<tr key={vendor.id} onClick={() => { if (vendor.status === 'Approval Pending') setSelectedVendorForApproval(vendor); else window.location.href = \`/client/vendors/\${vendor.id}\`; }} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color 0.15s ease' }} className="hover-bg-gray">`;
code = code.replace(trBlock, newTrBlock);

// 3. Add Modal UI at the bottom before </div>
const modalUI = `
      {selectedVendorForApproval && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a' }}>Review Vendor Application</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div><strong>Company Name:</strong> {selectedVendorForApproval.name}</div>
              <div><strong>Email:</strong> {selectedVendorForApproval.email}</div>
              <div><strong>Phone:</strong> {selectedVendorForApproval.phone}</div>
              <div><strong>Company Code:</strong> {selectedVendorForApproval.companyCode}</div>
              <div><strong>Trade License:</strong> {selectedVendorForApproval.tradeLicense}</div>
              <div><strong>Tax ID:</strong> {selectedVendorForApproval.taxId}</div>
              <div><strong>City:</strong> {selectedVendorForApproval.city}</div>
              <div><strong>Type:</strong> {selectedVendorForApproval.type}</div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedVendorForApproval(null)} style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleApproveVendor(selectedVendorForApproval.id)} style={{ padding: '10px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Approve & Onboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;
code = code.replace(/    <\/div>\s*\);\s*\}\s*$/, modalUI);

fs.writeFileSync('src/app/client/vendors/page.tsx', code, 'utf8');
console.log("Updated Vendors page.");
