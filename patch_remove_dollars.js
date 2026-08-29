const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// Replace all instances of ">$" with ">" (targets React nodes like <p>$...)
code = code.replace(/>\$/g, '>');

// Replace text occurrences in the chat messages
code = code.replace(/We can do \$\$\{\(prevAmount \* 1\.15\)\.toLocaleString\(\)\}/g, "We can do ${parseFloat((prevAmount * 1.15).toFixed(2)).toLocaleString()}");
code = code.replace(/We can do \$45,000/g, "We can do 45,000");
code = code.replace(/best price is \$950,000/g, "best price is 950,000");
code = code.replace(/at \$\{\(activeSession\?\.limit \|\| 42000\)\.toLocaleString\(\)\}/g, "at ${(activeSession?.limit || 42000).toLocaleString()}");

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Removed dollar signs.");
