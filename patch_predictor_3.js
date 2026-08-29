const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

if (!code.includes('const [isPredicting, setIsPredicting] = useState(false);')) {
  code = code.replace(
    'const [analyzing, setAnalyzing] = useState(false);',
    'const [analyzing, setAnalyzing] = useState(false);\n  const [isPredicting, setIsPredicting] = useState(false);'
  );
}

// 1. Fix select
code = code.replace(
  `<select style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none' }}>`,
  `<select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none' }}>`
);

// 2. Fix Analyze Product button
code = code.replace(
  /<button style={{ padding: '12px 24px'([^>]*)>\s*<Sparkles size=\{18\} \/> Analyze Product\s*<\/button>/m,
  `<button onClick={() => { setIsPredicting(true); setTimeout(() => setIsPredicting(false), 2000); }} style={{ padding: '12px 24px'$1>
                    {isPredicting ? <Sparkles size={18} className="pulse-anim" /> : <Sparkles size={18} />} {isPredicting ? 'Analyzing Market...' : 'Analyze PR'}
                  </button>`
);

// 3. Fix Apply Float Event button
code = code.replace(
  /<button style={{ width: '100%', padding: '16px'([^>]*)>\s*Apply & Float New Event <Zap size=\{16\} fill="#eab308" color="#eab308" \/>\s*<\/button>/m,
  `<button onClick={() => window.location.href = '/client/events/create/auction?pr=' + activeSession?.id} style={{ width: '100%', padding: '16px'$1>
                  Apply & Float New Event <Zap size={16} fill="#eab308" color="#eab308" />
                </button>`
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched Predictor interactivity");
