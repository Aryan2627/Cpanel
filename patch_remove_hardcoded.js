const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

const regex = /<tr style=\{\{ borderBottom: '1px solid var\(--surface-border\)' \}\}>\s*<td style=\{\{ padding: '12px 16px', color: 'var\(--text-primary\)', fontWeight: '500' \}\}>Apex Materials<\/td>[\s\S]*?<td style=\{\{ padding: '12px 16px', textAlign: 'center' \}\}>\s*<span style=\{\{ background: 'rgba\(239,68,68,0\.1\)', color: 'rgba\(239,68,68,0\.8\)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' \}\}>LOST<\/span>\s*<\/td>\s*<\/tr>\s*<tr>\s*<td style=\{\{ padding: '12px 16px', color: 'var\(--text-primary\)', fontWeight: '500' \}\}>IronWorks LLC<\/td>[\s\S]*?<td style=\{\{ padding: '12px 16px', textAlign: 'center' \}\}>\s*<span style=\{\{ background: 'rgba\(239,68,68,0\.1\)', color: 'rgba\(239,68,68,0\.8\)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' \}\}>LOST<\/span>\s*<\/td>\s*<\/tr>/m;

if (code.match(regex)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
    console.log("Successfully removed hardcoded rows.");
} else {
    console.log("Could not find the hardcoded rows to remove.");
}
