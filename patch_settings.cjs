const fs = require('fs');
let code = fs.readFileSync('src/app/client/settings/page.tsx', 'utf8');

const insertionPoint = `<div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header border-b">
            <h3>Jarvis AI & Workflows</h3>
          </div>`;

const licenseSection = `
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
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>ProcGen Enterprise Plan</h4>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                Your current license status is <strong style={{ color: '#fff' }}>Active</strong>. 
                <br/>Expires on: <strong style={{ color: '#fff' }}>Dec 31, 2026</strong>
              </p>
            </div>
            <button 
              onClick={async () => {
                if (confirm("Are you sure you want to generate a $12,500 PO to renew your license?")) {
                   try {
                     const orgId = localStorage.getItem('orgId') || '1'; // Fallback if missing
                     const res = await fetch('/api/license/renew', { method: 'POST', body: JSON.stringify({ organizationId: orgId }) });
                     if (res.ok) alert('Purchase Order Generated Successfully! Check your PO list.');
                   } catch(e) {}
                }
              }}
              style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Renew License (Generate PO)
            </button>
          </div>
        </div>

`;

code = code.replace(insertionPoint, licenseSection + insertionPoint);
fs.writeFileSync('src/app/client/settings/page.tsx', code, 'utf8');
console.log("Added License section to Settings page");
