const fs = require('fs');
let code = fs.readFileSync('src/app/client/settings/page.tsx', 'utf8');

// Add currentUser state and fetch effect
const statePoint = `  const [exportIntakeEnabled, setExportIntakeEnabled] = useState(false);`;
const userState = `
  const [currentUser, setCurrentUser] = useState<any>(null);
`;

const effectPoint = `useEffect(() => {
    setWorkflowsEnabled(localStorage.getItem('enableWorkflows') === 'true');`;

const userFetch = `
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setCurrentUser(data))
      .catch(e => console.error(e));
`;

code = code.replace(statePoint, statePoint + userState);
code = code.replace(effectPoint, effectPoint + userFetch);

// Update the billing section
const oldBilling = `{/* Billing & License Section */}`;
const endBilling = `</button>\n          </div>\n        </div>`;

const newBilling = `
        {/* Billing & License Section */}
        <div className="card" style={{ marginBottom: '24px', border: '1px solid #3b82f6' }}>
          <div className="card-header border-b" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
              <Sparkles size={18} />
              Platform License & Billing
            </h3>
          </div>
          <div className="card-body" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>ProcGen {currentUser?.licensePlan || 'Enterprise'} Plan</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                Your current license status is <strong style={{ color: currentUser?.licenseStatus === 'Expired' ? '#ef4444' : '#22c55e' }}>{currentUser?.licenseStatus || 'Loading...'}</strong>. 
                <br/>Expires on: <strong style={{ color: '#fff' }}>{currentUser?.licenseExpiry ? new Date(currentUser.licenseExpiry).toLocaleDateString() : 'Dec 31, 2026'}</strong>
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
              style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Renew License (Generate PO)
            </button>
          </div>
        </div>
`;

const regex = /\{\/\* Billing & License Section \*\/\}[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;
code = code.replace(regex, newBilling);

fs.writeFileSync('src/app/client/settings/page.tsx', code, 'utf8');
console.log("Refined Settings page");
