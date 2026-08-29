const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// 1. Update Session Type
code = code.replace(
  'prevVendor?: string;',
  'prevVendor?: string;\n  prevAmount?: number;\n  insight?: string;\n  trend?: number;'
);

// 2. Replace useEffect map logic
const oldMapRegex = /const dbSessions = intakes\.map\(\(p: any, i: number\) => \{[\s\S]*?return \{[\s\S]*?sentimentColor: sentimentColor\s*\};\s*\}\);/g;

const newMapStr = `const dbSessions = intakes.map((p: any, i: number) => {
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
            
            // AI Intelligence & Market Refinement
            const prTitle = (p.title || '').toLowerCase();
            let trend = -2.0;
            let insight = "Market is softening; push for a standard 2% cost reduction.";
            let sentiment = "Softening (-2.0%)";
            let sentimentColor = "var(--success-color)";
            
            if (prTitle.includes('laptop') || prTitle.includes('hardware') || p.type === 'Hardware') {
               trend = -5.0; // Deflationary
               insight = "Global chip surplus detected. IT Hardware market is highly deflationary right now. Aggressive 5% reduction recommended.";
               sentiment = "Deflationary (-5.0%)";
            } else if (prTitle.includes('steel') || prTitle.includes('material') || prTitle.includes('burger')) {
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

            const targetPrice = prevAmount * (1 + (trend / 100));
            const limitPrice = targetPrice * 1.05; // Hard limit 5% above target

            return {
              id: p.id || \`n\${i}\`,
              name: (p.refId ? p.refId + ' - ' : '') + (p.title || 'Unknown PR'),
              status: 'Live',
              model: 'I3-Strike v4 (Nemotron)',
              target: targetPrice, 
              limit: limitPrice, 
              vendorInitial: prevAmount * 1.15,
              prevVendor: prevVendor,
              prevAmount: prevAmount,
              insight: insight,
              trend: trend,
              concessions: ['Net-15 Payment Terms', 'Volume Discount'],
              messages: [
                { sender: 'vendor', text: \`We've reviewed the specs for PR \${p.refId || p.title}. We can do \\$\${(prevAmount * 1.15).toLocaleString()} for the shipment, but that's our bottom line.\`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
              ],
              closed: false,
              logs: [],
              sentiment: sentiment,
              sentimentColor: sentimentColor
            };
          });`;

code = code.replace(oldMapRegex, newMapStr);

// 3. UI Updates

// Update Awarded PO Price in Event Summary
code = code.replace(
  `\${(activeSession?.target || 40000).toLocaleString()}`,
  `\${(activeSession?.prevAmount || activeSession?.target || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);

// Update Bidders Table Awarded Price (Wait, I replaced activeSession?.target above. Let's make it more precise)
// Actually, it's easier to do this safely via precise string match.
code = code.replace(
  /<p style=\{\{ margin: 0, color: 'var\(--success-color\)', fontWeight: 'bold', fontSize: '18px' \}\}>.*<\/p>/g,
  `<p style={{ margin: 0, color: 'var(--success-color)', fontWeight: 'bold', fontSize: '18px' }}>\${(activeSession?.prevAmount || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>`
);

code = code.replace(
  /<td style=\{\{ padding: '12px 16px', color: 'var\(--text-primary\)', fontWeight: 'bold' \}\}>.*<\/td>/g,
  `<td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 'bold' }}>\${(activeSession?.prevAmount || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>`
);

// Update the AI Price Prediction Insight text
code = code.replace(
  `Based on historical PO data for <strong>{activeSession?.name}</strong>, combined with current macroeconomic inflation indicators, the AI recommends adjusting your guardrails before floating the new event.`,
  `{activeSession?.insight || "Based on historical PO data, combined with current macroeconomic inflation indicators, the AI recommends adjusting your guardrails before floating the new event."}`
);

// Update Target Price calculation to just show activeSession.target directly and format dynamically
code = code.replace(
  `\${((activeSession?.target || 40000) * 0.98).toLocaleString()}`,
  `\${(activeSession?.target || 40000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);
code = code.replace(
  `<TrendingDown size={12} /> -2.0% from last cycle`,
  `<TrendingDown size={12} style={{ transform: (activeSession?.trend || 0) > 0 ? 'rotate(180deg)' : 'none' }} /> {(activeSession?.trend || -2.0) > 0 ? '+' : ''}{activeSession?.trend || -2.0}% from last cycle`
);

// Update Limit Price calculation to just show activeSession.limit directly
code = code.replace(
  `\${((activeSession?.limit || 42000) * 0.99).toLocaleString()}`,
  `\${(activeSession?.limit || 42000).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
);
code = code.replace(
  `<TrendingDown size={12} /> -1.0% from last cycle`,
  `<Settings2 size={12} /> +5.0% buffer above target`
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Applied refined AI logic and UI");
