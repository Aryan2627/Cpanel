const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

const regex = /<div style=\{\{ display: 'flex', gap: '12px', background: 'var\(--surface-color\)'.*?<\/button>\s*<\/div>/s;

if (code.match(regex)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
    console.log("Successfully removed the toggle buttons via Regex.");
} else {
    console.log("Regex did not match.");
}
