const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// The template literals are inside JSX expressions that span multiple lines, let's use a regex to strip '$' right before '{('
code = code.replace(/\$\{\(/g, '{(');
code = code.replace(/\$\{\(/g, '{('); // do it twice in case

// Check if any specific '$' followed by '{' remains that should be removed
// Wait, template literals inside backticks (e.g., `...${...}`) need to KEEP their $ so Javascript parses them properly!
// The JSX rendering ones are NOT in backticks, they are like:
// >\s*\$\{\(

code = code.replace(/>\s*\$\{\(/g, '> {(');

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Removed UI dollar signs.");
