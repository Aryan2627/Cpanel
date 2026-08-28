const fs = require('fs');

let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

const hookInsert = `
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const dbSessions = data.map((p: any, i: number) => ({
            id: p.id || \`n\${i}\`,
            name: p.name || 'Unknown Product',
            status: 'Live',
            model: 'α-Strike v4 (Nemotron)',
            target: 40000 + (i * 5000),
            limit: 42000 + (i * 5000),
            vendorInitial: 45000 + (i * 5000),
            concessions: ['Net-15 Payment Terms', 'Volume Discount'],
            messages: [
              { sender: 'vendor', text: \`We've reviewed the specs for \${p.name}. We can do $\${(45000 + i * 5000).toLocaleString()} for the shipment, but that's our bottom line.\`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
            ],
            closed: false,
            logs: [],
            sentiment: 'Softening (-4.2%)',
            sentimentColor: 'var(--success-color)'
          }));
          setSessions(dbSessions);
          setActiveId(dbSessions[0].id);
        }
      })
      .catch(err => console.error("Failed to load products", err));
  }, []);
`;

// Insert after the first useEffect (the one that scrolls chat)
code = code.replace(
  /  \/\/ Initial trigger for live sessions/,
  hookInsert + '\n  // Initial trigger for live sessions'
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
