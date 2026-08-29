const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

code = code.replace(
  `  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const dbSessions = data.map((p: any, i: number) => ({
            id: p.id || \`n\${i}\`,
            name: p.name || 'Unknown Product',`,
  `  useEffect(() => {
    fetch('/api/intakes')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const dbSessions = data.map((p: any, i: number) => ({
            id: p.id || \`n\${i}\`,
            name: (p.refId ? p.refId + ' - ' : '') + (p.title || 'Unknown PR'),`
);

code = code.replace(
  `text: \`We've reviewed the specs for \${p.name}. We can do \\$\${(45000 + i * 5000).toLocaleString()} for the shipment, but that's our bottom line.\``,
  `text: \`We've reviewed the specs for PR \${p.refId || p.title}. We can do \\$\${(45000 + i * 5000).toLocaleString()} for the shipment, but that's our bottom line.\``
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched to use /api/intakes");
