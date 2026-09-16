const fs = require('fs');
let content = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

content = content.replace(/display: 'flex', height: '100vh', width: '100vw', background: '#f8fafc', overflow: 'hidden'/, "display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#f1f5f9', overflow: 'hidden'");

const headerHtml = 
      {/* SERVICENOW POLARIS HEADER */}
      <header style={{ height: '56px', background: '#1c252a', borderBottom: '1px solid #11181c', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, color: '#fff', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.location.href='/client'}>
            <div style={{ width: '28px', height: '28px', background: '#0fa87a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 900, color: '#fff', fontSize: '1rem' }}>P</span>
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>ProcGen</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '24px' }}>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: isSidebarOpen ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <span>All</span>
            </button>
            <button style={{ background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <span>Favorites</span>
            </button>
            <button style={{ background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <span>History</span>
            </button>
            <button style={{ background: 'transparent', border: 'none', padding: '8px 12px', borderRadius: '4px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
              <span>Workspaces</span>
            </button>
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '6px 16px', gap: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '14px' }}>Search</span>
            <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '0.875rem' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', position: 'relative' }}>
            <span style={{ fontSize: '16px' }}>Bell</span>
          </button>
          <button style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer' }}>
            <span style={{ fontSize: '16px' }}>Gear</span>
          </button>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0fa87a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => window.location.href='/client/profile'}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
;

content = content.replace(/<nav/, headerHtml + '<nav');

content = content.replace(/<header style={{ height: '60px'.*?<\/header>/s, '');

content = content.replace(/width: isSidebarOpen \? '260px' : '0px', background: '#050c1f'.*?zIndex: 10 }}/s, "width: isSidebarOpen ? '260px' : '0px', background: '#1c252a', borderRight: '1px solid #11181c', display: 'flex', flexDirection: 'column', transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden', flexShrink: 0, zIndex: 10 }}");

content = content.replace(/<div style={{ padding: '24px 20px', display: 'flex'.*?<\/div>/s, '');

content = content.replace(/<TourButton \/>/, '</div>\n        <TourButton />');

fs.writeFileSync('src/app/client/layout.tsx', content);
console.log('Done!');