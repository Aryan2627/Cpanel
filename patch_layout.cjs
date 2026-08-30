const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// Update currentUser type
code = code.replace(/useState<\{ name: string; email: string; companyName\?: string \} \| null>/, "useState<{ name: string; email: string; companyName?: string; licenseStatus?: string; licensePlan?: string; organizationId?: string } | null>");

// Insert Lockout screen logic right before the return statement
const returnIndex = code.indexOf('return (');
if (returnIndex !== -1) {
  const lockoutCode = `
  const handleGeneratePO = async () => {
    try {
      const res = await fetch('/api/license/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: currentUser?.organizationId })
      });
      if (res.ok) {
        alert("Renewal PO Generated Successfully! Your license is now in a 14-day grace period. You may now continue using the platform.");
        window.location.reload();
      } else {
        alert("Failed to generate PO");
      }
    } catch(e) {
      console.error(e);
    }
  };

  if (currentUser && currentUser.licenseStatus === 'Expired') {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', flexDirection: 'column', fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 'bold' }}>License Expired</h1>
        <p style={{ marginBottom: '32px', color: '#94a3b8', fontSize: '1.2rem', maxWidth: '500px', textAlign: 'center' }}>
          Your ProcGen {currentUser.licensePlan} license has expired. Your platform access has been locked.
        </p>
        <button 
          onClick={handleGeneratePO}
          style={{ background: '#3b82f6', color: '#fff', padding: '16px 32px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}
        >
          Generate Renewal Purchase Order (PO)
        </button>
      </div>
    );
  }

  `;
  
  code = code.slice(0, returnIndex) + lockoutCode + code.slice(returnIndex);
}

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Patched layout.tsx");
