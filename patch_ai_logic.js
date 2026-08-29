const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// The issue is that the old map function overrides the semantic analysis map function
// because we had two patches modifying the map function differently. Let's make sure the semantic one is actually active.
// Wait, looking at the code, prevAmount isn't being set dynamically with the semantic target. 
// Ah, the first image shows "Awarded PO Price: 40,000.00" but the bid amount is "1,725". 
// This means prevAmount is falling back to 40000 instead of getting the real PO amount.
// Why did historicalPO.total not work? The PO amount might be stored as a string or maybe the details match logic failed.

// Let's rewrite the mapping logic completely and accurately.
const startMarker = `const dbSessions = intakes.map((p: any, i: number) => {`;
const endMarker = `setSessions(dbSessions);`;

const regex = new RegExp(`const dbSessions = intakes\\.map\\(\\(p: any, i: number\\) => \\{[\\s\\S]*?\\}\\);\\s*setSessions\\(dbSessions\\);`);

const newMapLogic = `const dbSessions = intakes.map((p: any, i: number) => {
          let historicalPO = null;
          if (Array.isArray(pos)) {
            // Find PO where details (array of PR IDs) includes this PR's refId
            historicalPO = pos.find(po => po.details && po.details.includes(p.refId));
          }
          
          let prevVendor = 'No Historical Vendor';
          // Fix fallback logic. If we have a historical PO, use its total. Otherwise use a small fallback or 0.
          let prevAmount = historicalPO ? (parseFloat(historicalPO.total) || 0) : 0; 
          
          if (historicalPO) {
             prevVendor = historicalPO.vendorId || 'Unknown Vendor';
          }

          // Semantic AI Intelligence & Market Refinement
          const prTitle = (p.title || '').toLowerCase();
          let trend = -2.0;
          let insight = "Market is softening; push for a standard 2% cost reduction.";
          let sentiment = "Softening (-2.0%)";
          let sentimentColor = "var(--success-color)";
          
          if (prTitle.includes('laptop') || prTitle.includes('hardware') || p.type === 'Hardware') {
             trend = -5.0; // Deflationary
             insight = "Global chip surplus detected. IT Hardware market is highly deflationary right now. Aggressive 5% reduction recommended.";
             sentiment = "Deflationary (-5.0%)";
          } else if (prTitle.includes('steel') || prTitle.includes('material') || prTitle.includes('burger') || prTitle.includes('pizza')) {
             trend = 3.5; // Inflationary
             insight = "Supply chain constraints and raw material indices are up 3.5%. Focus on holding price rather than deep cuts.";
             sentiment = "Inflationary (+3.5%)";
             sentimentColor = "#ef4444";
          } else if (prTitle.includes('service') || prTitle.includes('consult')) {
             trend = 0.0; // Stable
             insight = "Labor rates are stable. Negotiate on value-adds and concessions rather than base rate.";
             sentiment = "Stable (0.0%)";
             sentimentColor = "var(--text-secondary)";
          }

          // Calculate AI targets based on historical amount (if no history, fallback to a dummy baseline like 1000)
          const baseLineForMath = prevAmount > 0 ? prevAmount : 1000;
          const targetPrice = baseLineForMath * (1 + (trend / 100));
          const limitPrice = targetPrice * 1.05; // Hard limit 5% above target
          const vendorInitialEstimate = baseLineForMath * 1.15;

          return {
            id: p.id || \`n\${i}\`,
            name: (p.refId ? p.refId + ' - ' : '') + (p.title || 'Unknown PR'),
            status: 'Live',
            model: 'I3-Strike v4 (Nemotron)',
            target: targetPrice, 
            limit: limitPrice, 
            vendorInitial: vendorInitialEstimate,
            prevVendor: prevVendor,
            prevAmount: prevAmount,
            insight: insight,
            trend: trend,
            concessions: ['Net-15 Payment Terms', 'Volume Discount'],
            messages: [
              { sender: 'vendor', text: \`We've reviewed the specs for PR \${p.refId || p.title}. We can do \${vendorInitialEstimate.toLocaleString()} for the shipment, but that's our bottom line.\`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
            ],
            closed: false,
            logs: [],
            sentiment: sentiment,
            sentimentColor: sentimentColor
          };
        });
        setSessions(dbSessions);`;

code = code.replace(regex, newMapLogic);
fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched Map Logic");
