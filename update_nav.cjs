const fs = require('fs');
const file = 'src/app/client/layout.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetStr = "{ name: 'Tenders & Auctions', path: '/client/events' },";
if (code.includes(targetStr)) {
  code = code.replace(targetStr, targetStr + "\n    { name: 'AI Negotiators', path: '/client/ai-agents' },");
  fs.writeFileSync(file, code);
  console.log("Added to sidebar");
} else {
  console.log("Could not find insertion point");
}
