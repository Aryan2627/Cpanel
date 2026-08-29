const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// Wrap Historical Cycle Analysis
code = code.replace(
  `{/* Historical Cycle Analysis */}\n              <div className="surface" style={{ padding: '32px' }}>`,
  `{/* Historical Cycle Analysis */}\n              <div className="surface" style={{ padding: '32px', opacity: isPredicting ? 0.4 : 1, transition: 'opacity 0.3s', pointerEvents: isPredicting ? 'none' : 'auto' }}>`
);

// Wrap Pricing Recommendation
code = code.replace(
  `{/* Pricing Recommendation */}\n            <div className="surface" style={{ padding: '24px', background: 'linear-gradient(180deg, var(--surface-color) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>`,
  `{/* Pricing Recommendation */}\n            <div className="surface" style={{ padding: '24px', background: 'linear-gradient(180deg, var(--surface-color) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', opacity: isPredicting ? 0.4 : 1, transition: 'opacity 0.3s', pointerEvents: isPredicting ? 'none' : 'auto' }}>`
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Applied opacity for loading state");
