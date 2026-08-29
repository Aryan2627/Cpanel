const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

const oldUseEffectRegex = /useEffect\(\(\) => \{\s*fetch\('\/api\/intakes'\)[\s\S]*?\.catch\(err => console\.error\("Failed to load products", err\)\);\s*\}, \[\]\);/g;

const newUseEffect = `useEffect(() => {
    Promise.all([
      fetch('/api/intakes').then(res => res.json()),
      fetch('/api/pos').then(res => res.json())
    ])
    .then(([intakes, pos]) => {
      if (intakes && intakes.length > 0) {
        const dbSessions = intakes.map((p: any, i: number) => {
          let historicalPO = null;
          if (Array.isArray(pos)) {
            historicalPO = pos.find(po => po.details && po.details.includes(p.refId));
          }
          
          let prevVendor = 'No Historical Vendor';
          let prevAmount = 40000 + (i * 5000); 
          if (historicalPO) {
             prevVendor = historicalPO.vendorId || 'Unknown Vendor';
             prevAmount = historicalPO.total || prevAmount;
          }

          return {
            id: p.id || \`n\${i}\`,
            name: (p.refId ? p.refId + ' - ' : '') + (p.title || 'Unknown PR'),
            status: 'Live',
            model: 'I3-Strike v4 (Nemotron)',
            target: prevAmount, 
            limit: prevAmount * 1.05, 
            vendorInitial: prevAmount * 1.15,
            prevVendor: prevVendor,
            concessions: ['Net-15 Payment Terms', 'Volume Discount'],
            messages: [
              { sender: 'vendor', text: \`We've reviewed the specs for PR \${p.refId || p.title}. We can do \\$\${(prevAmount * 1.15).toLocaleString()} for the shipment, but that's our bottom line.\`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
            ],
            closed: false,
            logs: [],
            sentiment: 'Softening (-4.2%)',
            sentimentColor: 'var(--success-color)'
          };
        });
        setSessions(dbSessions);
        setActiveId(dbSessions[0].id);
      }
    })
    .catch(err => console.error("Failed to load intel data", err));
  }, []);`;

code = code.replace(oldUseEffectRegex, newUseEffect);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched useEffect logic properly");
