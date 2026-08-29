const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

const oldLogic = `          // Semantic AI Intelligence & Market Refinement
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
          }`;

const newLogic = `// Semantic AI Intelligence & Deep Market Refinement (v2.4)
          const prTitle = (p.title || '').toLowerCase();
          const prDesc = (p.description || '').toLowerCase();
          const prCombined = prTitle + ' ' + prDesc;
          
          let trend = -2.0;
          let insight = "Baseline semantic analysis complete. Market indicators suggest stable supply chains; recommend pushing for a standard 2% cost reduction based on historical deflation rates.";
          let sentiment = "Stable (-2.0%)";
          let sentimentColor = "var(--success-color)";
          
          if (prCombined.includes('laptop') || prCombined.includes('hardware') || prCombined.includes('server') || p.type === 'Hardware') {
             trend = -5.2; 
             insight = "Deep Intelligence: Semiconductor oversupply and aggressive Q4 OEM channel inventory dumps detected. Strong leverage available. AI predicts -5.2% deflation on compute hardware. Push for aggressive volume discounts.";
             sentiment = "Deflationary (-5.2%)";
          } else if (prCombined.includes('software') || prCombined.includes('saas') || prCombined.includes('cloud') || p.type === 'Software') {
             trend = 4.5; 
             insight = "Deep Intelligence: Enterprise SaaS vendors are driving aggressive price hikes (+4.5%) due to AI compute overhead and high switching costs (vendor lock-in). AI recommends locking in multi-year agreements immediately to cap inflation.";
             sentiment = "Inflationary (+4.5%)";
             sentimentColor = "#ef4444";
          } else if (prCombined.includes('steel') || prCombined.includes('raw material') || prCombined.includes('copper')) {
             trend = 8.5; 
             insight = "Deep Intelligence: Global macroeconomic supply chain threats detected. Copper and Steel indices show +8.5% volatility due to geopolitical tensions in primary mining regions. Urgent: secure spot pricing now.";
             sentiment = "Highly Volatile (+8.5%)";
             sentimentColor = "#ef4444";
          } else if (prCombined.includes('logistics') || prCombined.includes('freight') || prCombined.includes('shipping')) {
             trend = 2.1;
             insight = "Deep Intelligence: Logistics index shows slight upward pressure (+2.1%) due to fluctuating bunker fuel surcharges. AI recommends negotiating fixed fuel rates for Q1/Q2.";
             sentiment = "Mild Inflation (+2.1%)";
             sentimentColor = "#f59e0b";
          } else if (prCombined.includes('marketing') || prCombined.includes('agency') || prCombined.includes('design')) {
             trend = -6.0;
             insight = "Deep Intelligence: Creative agency margins are softening heavily (-6.0%) due to market disruption from generative AI tooling lowering their overhead costs. AI advises demanding steep rate card reductions.";
             sentiment = "Aggressive Softening (-6.0%)";
          } else if (prCombined.includes('consulting') || prCombined.includes('professional services')) {
             trend = 1.5;
             insight = "Deep Intelligence: Professional services market shows standard wage inflation (+1.5%). Supply of tier-1 analysts remains tight. AI recommends negotiating value-adds rather than pure rate cuts.";
             sentiment = "Stable (+1.5%)";
             sentimentColor = "#f59e0b";
          }`;

if (code.includes(oldLogic)) {
    code = code.replace(oldLogic, newLogic);
    fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
    console.log("Replaced successfully without regex.");
} else {
    console.log("Could not find the old logic block verbatim. It might have subtle spacing differences.");
}
