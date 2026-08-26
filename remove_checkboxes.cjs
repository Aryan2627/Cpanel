const fs = require('fs');

const file = 'src/app/client/intake/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Remove header checkbox
code = code.replace(
    /<th style=\{\{ padding: '12px 16px', width: '40px' \}\}>\s*<input type="checkbox"[^>]+>\s*<\/th>/,
    ''
);

// Remove row checkboxes
code = code.replace(
    /<td style=\{\{ padding: '12px 16px' \}\}>\s*<input type="checkbox"[^>]+>\s*<\/td>/g,
    ''
);

// We should also remove the `backgroundColor: selectedIds.has(row.refId) ? '#eff6ff' : '#fff'` to avoid confusion, but it won't trigger anyway since you can't click them.
code = code.replace(
    /backgroundColor: selectedIds.has\(row.refId\) \? '#eff6ff' : '#fff'/g,
    "backgroundColor: '#fff'"
);

fs.writeFileSync(file, code, 'utf8');
console.log('Removed checkboxes from intake page');
