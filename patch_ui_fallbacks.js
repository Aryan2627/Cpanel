const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// The UI was using `(activeSession?.prevAmount || 40000)` which overrides 0 values back to 40000. Let's fix that.
code = code.replace(
  /\{\(activeSession\?\.prevAmount \|\| 40000\)\.toLocaleString\(undefined, \{minimumFractionDigits: 2, maximumFractionDigits: 2\}\)\}/g,
  `{(activeSession?.prevAmount != null && activeSession?.prevAmount !== 0 ? activeSession.prevAmount : 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

code = code.replace(
  /\{\(activeSession\?\.target \|\| 40000\)\.toLocaleString\(undefined, \{minimumFractionDigits: 2, maximumFractionDigits: 2\}\)\}/g,
  `{(activeSession?.target || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

code = code.replace(
  /\{\(activeSession\?\.limit \|\| 42000\)\.toLocaleString\(undefined, \{minimumFractionDigits: 2, maximumFractionDigits: 2\}\)\}/g,
  `{(activeSession?.limit || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched UI fallbacks");
