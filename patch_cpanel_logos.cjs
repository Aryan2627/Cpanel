const fs = require('fs');

// Patch layout.tsx
let layoutCode = fs.readFileSync('src/app/client/layout.tsx', 'utf8');
const layoutOld = `<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 35 25 C 50 10, 80 15, 80 40" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 65 75 C 50 90, 20 85, 20 60" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 25 35 L 35 45 L 75 45 M 35 55 L 70 55 M 40 65 L 65 65" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="55" cy="75" r="5" fill="#0f172a" />
                </svg>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.05em' }}>PROCGEN</h2>
            </div>`;
const layoutNew = `<div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '6px 12px', borderRadius: '8px' }}>
              <img src="/logo.webp" alt="ProcGen Logo" style={{ height: '32px', objectFit: 'contain' }} />
            </div>`;
if (layoutCode.includes(layoutOld)) {
    layoutCode = layoutCode.replace(layoutOld, layoutNew);
    fs.writeFileSync('src/app/client/layout.tsx', layoutCode, 'utf8');
}

// Patch login.tsx
let loginCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');
const loginOld = `<div className="brand-logo">
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M 35 25 C 50 10, 80 15, 80 40" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
              <path d="M 65 75 C 50 90, 20 85, 20 60" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
              <path d="M 25 35 L 35 45 L 75 45 M 35 55 L 70 55 M 40 65 L 65 65" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            PROCGEN
          </div>`;
const loginNew = `<div className="brand-logo" style={{ background: '#fff', padding: '12px 24px', borderRadius: '12px', width: 'fit-content' }}>
            <img src="/logo.webp" alt="ProcGen Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </div>`;
if (loginCode.includes(loginOld)) {
    loginCode = loginCode.replace(loginOld, loginNew);
    fs.writeFileSync('src/app/login/page.tsx', loginCode, 'utf8');
}

// Patch signup.tsx
let signupCode = fs.readFileSync('src/app/signup/page.tsx', 'utf8');
if (signupCode.includes(loginOld)) {
    signupCode = signupCode.replace(loginOld, loginNew);
    fs.writeFileSync('src/app/signup/page.tsx', signupCode, 'utf8');
}

console.log("Patched Cpanel logos.");
