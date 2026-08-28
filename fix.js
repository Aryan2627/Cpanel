const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');
code = code.replace(/placeholder=\\{\\\`Type as the Vendor for \\\$\\{activeSession.name\\}\\.\\.\\.\\\\`\\}/, 'placeholder={`Type as the Vendor for ${activeSession.name}...`}');
fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
