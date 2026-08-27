const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// 1. Add state
if (!code.includes('isSidebarOpen')) {
  code = code.replace(
    'const [currentUser',
    'const [isSidebarOpen, setIsSidebarOpen] = useState(true);\n  const [currentUser'
  );
}

// 2. Modify sidebar nav
code = code.replace(
  '<nav className="sidebar">',
  '<nav className="sidebar" style={{ width: isSidebarOpen ? "270px" : "0px", minWidth: isSidebarOpen ? "270px" : "0px", overflow: "hidden", transition: "all 0.3s ease", padding: isSidebarOpen ? undefined : "0", borderRight: isSidebarOpen ? undefined : "none", opacity: isSidebarOpen ? 1 : 0 }}>'
);

// 3. Add toggle button
code = code.replace(
  '<main className="main-content">',
  `<main className="main-content" style={{ position: 'relative', width: isSidebarOpen ? 'calc(100vw - 270px)' : '100vw', transition: 'width 0.3s ease' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                position: 'fixed',
                bottom: '24px',
                left: isSidebarOpen ? '280px' : '24px',
                zIndex: 50,
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
              }}
              title="Toggle Sidebar"
            >
              {isSidebarOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>`
);

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Slider button added.");
