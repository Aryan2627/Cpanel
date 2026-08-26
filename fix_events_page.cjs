const fs = require('fs');
let content = fs.readFileSync('src/app/client/events/page.tsx', 'utf8');

// 1. Remove activeStageFilter state
content = content.replace(/const \[activeStageFilter, setActiveStageFilter\] = useState\('All Stages'\);\n/, '');

// 2. Remove the filter logic
const filterLogicRegex = /\s*if \(activeStageFilter === 'Live'\) \{[\s\S]*?return isLive;\n\s*\}/g;
content = content.replace(filterLogicRegex, '');

// 3. Update useEffect dependencies
content = content.replace(/\[searchQuery, activeStageFilter, activeTab, allEvents\]/, '[searchQuery, activeTab, allEvents]');

// 4. Update UI: Replace the search bar and remove the Stage Filters section
const uiRegex = /\{\/\* Filters Area \*\/\}\n\s*<div style=\{\{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' \}\}>\s*\{\/\* Search \*\/\}\n\s*<div style=\{\{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden', width: '300px' \}\}>\n\s*<div style=\{\{ padding: '0 12px' \}\}>\s*<Search size=\{16\} color="#94a3b8" \/>\s*<\/div>\n\s*<input \n\s*type="text" \n\s*placeholder="Search by Title, Ref ID, or Account\.\.\." \n\s*value=\{searchQuery\}\n\s*onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}\n\s*style=\{\{ border: 'none', padding: '8px 12px 8px 0', outline: 'none', width: '100%', fontSize: '0\.875rem', backgroundColor: 'transparent' \}\} \n\s*\/>\n\s*<\/div>\n\n\s*\{\/\* Stage Filters \*\/\}\n\s*<div style=\{\{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '4px', padding: '4px' \}\}>\n\s*\{(?:\['All Stages', 'Live'\]|\[\\])\.map\(filter => \(\n\s*<button\n\s*key=\{filter\}\n\s*onClick=\{\(\) => setActiveStageFilter\(filter\)\}\n\s*style=\{\{\n\s*padding: '6px 12px', border: 'none', borderRadius: '4px', fontSize: '0\.8125rem', fontWeight: 500, cursor: 'pointer',\n\s*backgroundColor: activeStageFilter === filter \? '#fff' : 'transparent',\n\s*color: activeStageFilter === filter \? '#0f172a' : '#64748b',\n\s*boxShadow: activeStageFilter === filter \? '0 1px 2px rgba\(0,0,0,0\.05\)' : 'none',\n\s*transition: 'all 0\.2s'\n\s*\}\}\n\s*>\n\s*\{filter\}\n\s*<\/button>\n\s*\)\)\}\n\s*<\/div>\n\s*<\/div>/g;

const newUI = `{/* Filters Area */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
          {/* Enhanced Search */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', width: '100%', maxWidth: '500px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}>
            <div style={{ padding: '0 14px' }}><Search size={18} color="#64748b" /></div>
            <input 
              type="text" 
              placeholder="Search events by Title, Ref ID, or Account..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', padding: '12px 16px 12px 0', outline: 'none', width: '100%', fontSize: '0.95rem', backgroundColor: 'transparent', color: '#0f172a' }} 
            />
          </div>
        </div>`;

content = content.replace(uiRegex, newUI);

fs.writeFileSync('src/app/client/events/page.tsx', content, 'utf8');
console.log('Fixed Event page UI');
