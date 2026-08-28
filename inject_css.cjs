const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');
if (!code.includes("import './tailwind.css';")) {
  code = code.replace('"use client";', '"use client";\nimport "./tailwind.css";\n');
  fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
}
