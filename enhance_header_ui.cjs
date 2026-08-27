const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

const oldHeader = `<header style={{ 
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
          </header>`;

const newHeader = `<header style={{ 
            height: '64px', 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '6px 16px 6px 6px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '50px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,1)',
              transition: 'all 0.2s ease',
              cursor: 'default'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff', 
                fontWeight: '800',
                fontSize: '0.8rem',
                boxShadow: '0 2px 5px rgba(37, 99, 235, 0.3)'
              }}>
                {currentUser?.companyName ? currentUser.companyName.substring(0,2).toUpperCase() : 'B2'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '-1px' }}>Workspace</span>
                <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, letterSpacing: '-0.01em' }}>{currentUser?.companyName || 'Loading...'}</span>
              </div>
            </div>
          </header>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Updated layout header UI");
