const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// Add companyName to the currentUser type
code = code.replace(
  'const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);',
  'const [currentUser, setCurrentUser] = useState<{ name: string; email: string; companyName?: string } | null>(null);'
);

// Inject a global top bar into main-content
const topBarCode = `
          {/* Global Top Header */}
          <header style={{ 
            height: '64px', 
            backgroundColor: '#ffffff', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization</span>
                <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>{currentUser?.companyName || 'Loading...'}</span>
              </div>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 'bold', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                {currentUser?.companyName ? currentUser.companyName.substring(0,2).toUpperCase() : 'B2B'}
              </div>
            </div>
          </header>
`;

code = code.replace(
  '<main className="main-content" style={{ position: \'relative\', width: isSidebarOpen ? \'calc(100vw - 270px)\' : \'100vw\', transition: \'width 0.3s ease\' }}>',
  '<main className="main-content" style={{ position: \'relative\', width: isSidebarOpen ? \'calc(100vw - 270px)\' : \'100vw\', transition: \'width 0.3s ease\', display: \'flex\', flexDirection: \'column\', minHeight: \'100vh\' }}>\n' + topBarCode
);

// Fix height logic so children can stretch properly
code = code.replace(
  '{children}',
  '<div style={{ flex: 1, display: \'flex\', flexDirection: \'column\' }}>{children}</div>'
);

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Patched layout with top bar");
