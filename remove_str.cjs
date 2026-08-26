const fs = require('fs');
const file = 'src/app/client/intake/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" checked={selectedIds.has(row.refId)} onChange={() => handleSelectRow(row.refId)} style={{ cursor: 'pointer', width: '16px', height: '16px',  }} />
                    </td>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, '');
    fs.writeFileSync(file, code, 'utf8');
    console.log('Replaced row checkbox string');
} else {
    console.log('Target string not found');
}
