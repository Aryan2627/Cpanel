const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// The block to replace
const searchBlock = `              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{currentUser?.name || 'Loading...'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{currentUser?.email || ''}</div>
              </div>
            </div>
          </div>`;

const replaceBlock = `              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f8fafc' }}>{currentUser?.name || 'Loading...'}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{currentUser?.email || ''}</div>
              </div>
            </div>
            
            <div style={{ padding: '0 12px 12px 12px' }}>
              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    // Also trigger next-auth signout just in case to clear client state
                    const { signOut } = await import('next-auth/react');
                    await signOut({ redirect: true, callbackUrl: '/login' });
                  } catch(e) {
                    window.location.href = '/login';
                  }
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                Sign Out
              </button>
            </div>
          </div>`;

code = code.replace(searchBlock, replaceBlock);
fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Added logout button");
