const fs = require('fs');

const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const searchStr = `) : f.role === 'Calculation' ? (`;

const replaceStr = `) : f.role === 'Creator' ? (
                        <div style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '1rem', fontWeight: 500, cursor: 'not-allowed' }}>
                          {f.type === 'number' ? Number(f.defaultValue || 0).toLocaleString() : (f.defaultValue || '-')}
                        </div>
                      ) : f.role === 'Calculation' ? (`;

if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync(file, code, 'utf8');
    console.log("Updated Creator fields rendering to read-only");
} else {
    console.log("Could not find Calculation string");
}
