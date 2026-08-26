const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

code = code.replace(/style=\{\{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' \}\}/, 
`style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}`);

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log('Fixed client page number scrolling');
