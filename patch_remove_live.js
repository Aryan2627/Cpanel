const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// 1. Set default viewMode to predictor
code = code.replace(
  `const [viewMode, setViewMode] = useState<'negotiator' | 'predictor'>('negotiator');`,
  `const [viewMode, setViewMode] = useState<'negotiator' | 'predictor'>('predictor');`
);

// 2. Remove the toggle buttons
const toggleBlock = `<div style={{ display: 'flex', gap: '8px', background: 'var(--bg-color)', padding: '4px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <button 
              onClick={() => setViewMode('negotiator')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'negotiator' ? 'var(--primary-color)' : 'transparent', color: viewMode === 'negotiator' ? '#fff' : 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <Activity size={16} /> Live Nodes
            </button>
            <button 
              onClick={() => setViewMode('predictor')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'predictor' ? 'var(--primary-color)' : 'transparent', color: viewMode === 'predictor' ? '#fff' : 'var(--text-secondary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <LineChart size={16} /> Predictor (Pre-Event)
            </button>
          </div>`;

code = code.replace(toggleBlock, '');

// 3. (Optional) Let's just remove the whole negotiator view to clean up bundle size, or just leave it hidden since viewMode is now hardcoded to 'predictor'.
// Leaving it hidden is safer.

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Removed Live Nodes toggle and defaulted to Predictor");
