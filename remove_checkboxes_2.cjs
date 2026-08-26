const fs = require('fs');
const file = 'src/app/client/intake/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Use a more resilient replacement for the row checkbox
code = code.replace(
    / *<td style=\{\{ padding: '12px 16px' \}\}>\s*<input type="checkbox"[^>]*>\s*<\/td>\s*/g,
    ''
);

fs.writeFileSync(file, code, 'utf8');
console.log('Removed row checkboxes');
