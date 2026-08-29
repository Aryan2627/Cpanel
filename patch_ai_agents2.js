const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

code = code.replace(
  /We've reviewed the specs for \$\{p\.name\}\./g,
  "We've reviewed the specs for PR ${p.refId || p.title}."
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Fixed p.name reference in text");
