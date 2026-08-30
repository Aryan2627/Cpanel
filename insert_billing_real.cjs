const fs = require('fs');
let code = fs.readFileSync('src/app/client/settings/page.tsx', 'utf8');

// Add currentUser state and fetch effect if not present
if (!code.includes('const [currentUser, setCurrentUser] = useState')) {
  const statePoint = `  const [exportIntakeEnabled, setExportIntakeEnabled] = useState(false);`;
  const userState = `\n  const [currentUser, setCurrentUser] = useState<any>(null);`;
  code = code.replace(statePoint, statePoint + userState);

  const effectPoint = `useEffect(() => {
    setWorkflowsEnabled(localStorage.getItem('enableWorkflows') === 'true');`;

  const userFetch = `
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(e => console.error(e));
`;
  code = code.replace(effectPoint, effectPoint + userFetch);
}


// Insert Billing section
const billingSection = `
        {/* Billing & License Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #3b82f6', padding: '24px', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.1)', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#3b82f6' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Sparkles size={24} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Platform License & Billing</h3>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1e293b' }}>ProcGen {currentUser?.licensePlan || 'Enterprise'} Plan</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Your current license status is <strong style={{ color: currentUser?.licenseStatus === 'Expired' ? '#ef4444' : '#10b981' }}>{currentUser?.licenseStatus || 'Loading...'}</strong>. 
                <br/>Expires on: <strong>{currentUser?.licenseExpiry ? new Date(currentUser.licenseExpiry).toLocaleDateString() : 'Dec 31, 2026'}</strong>
              </p>
            </div>
            <button 
              onClick={async () => {
                if (confirm("Are you sure you want to generate a $12,500 PO to renew your license?")) {
                   try {
                     const res = await fetch('/api/license/renew', { 
                       method: 'POST', 
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ organizationId: currentUser?.organizationId }) 
                     });
                     if (res.ok) {
                       alert('Purchase Order Generated Successfully! Check your PO list.');
                       window.location.reload();
                     } else {
                       alert('Failed to generate PO.');
                     }
                   } catch(e) {}
                }
              }}
              style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}>
              Renew License (Generate PO)
            </button>
          </div>
        </div>
`;

// Insert right before Advanced Enterprise Modules
const insertionPoint = `{/* Advanced Enterprise Modules */}`;
if (!code.includes('Platform License & Billing')) {
  code = code.replace(insertionPoint, billingSection + '\n        ' + insertionPoint);
}

fs.writeFileSync('src/app/client/settings/page.tsx', code, 'utf8');
console.log("Successfully inserted Billing section");
