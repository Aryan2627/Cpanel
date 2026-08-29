const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// The $ signs are in the UI. 
// Example: <p ...> \n ${(activeSession...
// Example: <td ...>${(activeSession...
// Let's replace only occurrences of '$' that are NOT inside backticks. 
// A safer way is to just do explicit string replaces for the exact lines.

code = code.replace(
  `\${(activeSession?.prevAmount || activeSession?.target || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
  `{(activeSession?.prevAmount || activeSession?.target || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

code = code.replace(
  `\${(activeSession?.prevAmount || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>`,
  `{(activeSession?.prevAmount || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>`
);

code = code.replace(
  `\${(activeSession?.vendorInitial || 45000).toLocaleString()}</td>`,
  `{(activeSession?.vendorInitial || 45000).toLocaleString()}</td>`
);

code = code.replace(
  `\${(activeSession?.prevAmount || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`,
  `{(activeSession?.prevAmount || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`
);

code = code.replace(
  `\${(activeSession?.target || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
  `{(activeSession?.target || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

code = code.replace(
  `\${(activeSession?.limit || 42000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
  `{(activeSession?.limit || 42000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Safe replacement completed.");
