const fs = require('fs');

const file = 'src/app/vendor/events/[id]/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldFooterStart = `{/* Total Footer */}
            <div style={{ padding: '24px', backgroundColor: '#020617', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>`;

const newFooterStart = `{/* Total Footer */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
            <div style={{ padding: '24px', backgroundColor: '#020617', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>`;

if (code.includes(oldFooterStart)) {
    code = code.replace(oldFooterStart, newFooterStart);
    // Add the closing div for the wrapper
    const oldFooterEnd = `              </div>
            </div>`;
    const newFooterEnd = `              </div>
            </div>
          </div>`;
    code = code.replace(oldFooterEnd, newFooterEnd);
    fs.writeFileSync(file, code, 'utf8');
    console.log('Fixed footer wrapper');
} else {
    console.log('Footer start not found');
}
