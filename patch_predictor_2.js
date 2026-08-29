const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

code = code.replace(
  `<select style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none' }}>`,
  `<select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '16px', outline: 'none' }}>`
);

// We also need to hide the lower sections if isPredicting is true
const searchStr = `{/* Historical Cycle Analysis */}`;
const replacementStr = `{/* Historical Cycle Analysis */}\n            {isPredicting ? (<div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-secondary)' }}><Sparkles size={48} className="pulse-anim" color="#8b5cf6" style={{ margin: '0 auto 16px' }}/><p>Scraping past POs, parsing macroeconomic signals, and calculating PR guardrails...</p></div>) : (<>`;

code = code.replace(searchStr, replacementStr);

const endStr = `              <button onClick={() => window.location.href = '/client/events/create/auction?pr=' + activeSession?.id} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  Apply & Float New Event <Zap size={16} fill="#eab308" color="#eab308" />
                </button>
            </div>

          </div>`;

const endReplacement = `              <button onClick={() => window.location.href = '/client/events/create/auction?pr=' + activeSession?.id} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#0f172a', color: '#fff', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                  Apply & Float New Event <Zap size={16} fill="#eab308" color="#eab308" />
                </button>
            </div>

          </div>
          </>)}`;

code = code.replace(endStr, endReplacement);


fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
console.log("Patched Predictor logic properly");
