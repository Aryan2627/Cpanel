const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');
code = code.replace(/placeholder=\\{\\`Type as the Vendor for \\\$\\{activeSession\.name\\}\\.\\.\\.\\`\\}/g, 'placeholder={`Type as the Vendor for ${activeSession.name}...`}');
// let's do a broader replace just in case
code = code.replace(/placeholder=\{`Type as the Vendor for \$\{activeSession\.name\}\.\.\.`\}/g, 'placeholder={`Type as the Vendor for ${activeSession.name}...`}');

// Let's just hardcode replacing the exact bad line
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('placeholder=') && lines[i].includes('Type as the Vendor for')) {
    lines[i] = '                    placeholder={`Type as the Vendor for ${activeSession.name}...`}';
  }
}
fs.writeFileSync('src/app/client/ai-agents/page.tsx', lines.join('\n'), 'utf8');
