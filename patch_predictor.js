const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// 1. Add state for predictor analysis
if (!code.includes('const [isPredicting, setIsPredicting] = useState(false);')) {
  code = code.replace(
    'const [analyzing, setAnalyzing] = useState(false);',
    'const [analyzing, setAnalyzing] = useState(false);\n  const [isPredicting, setIsPredicting] = useState(false);\n  const [predictorData, setPredictorData] = useState<any>(null);'
  );
}

// 2. Fix the select dropdown
code = code.replace(
  /<select style={{ flex: 1([^>]*)>>\s*\{sessions\.map\(s => <option key=\{s\.id\} value=\{s\.id\}>\{s\.name\}<\/option>\)\}\s*<\/select>/m,
  `<select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ flex: 1$1>>
                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>`
);

// 3. Fix the "Analyze Product" button
code = code.replace(
  /<button style={{ padding: '12px 24px'([^>]*)>\s*<Sparkles size=\{18\} \/> Analyze Product\s*<\/button>/m,
  `<button onClick={() => { setIsPredicting(true); setTimeout(() => setIsPredicting(false), 2000); }} style={{ padding: '12px 24px'$1>
                    {isPredicting ? <Sparkles size={18} className="pulse-anim" /> : <Sparkles size={18} />} {isPredicting ? 'Analyzing Market...' : 'Analyze PR'}
                  </button>`
);

// 4. Wrap the data view in isPredicting check and fix float event button
code = code.replace(
  /<button style={{ width: '100%', padding: '16px'([^>]*)>\s*Apply & Float New Event <Zap size=\{16\} fill="#eab308" color="#eab308" \/>\s*<\/button>/m,
  `<button onClick={() => window.location.href = '/client/events/create/auction?pr=' + activeSession?.id} style={{ width: '100%', padding: '16px'$1>
                  Apply & Float New Event <Zap size={16} fill="#eab308" color="#eab308" />
                </button>`
);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched Predictor logic");
