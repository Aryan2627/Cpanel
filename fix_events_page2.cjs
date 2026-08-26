const fs = require('fs');
let content = fs.readFileSync('src/app/client/events/page.tsx', 'utf8');

// 1. Remove activeStageFilter state
content = content.replace(/const \[activeStageFilter, setActiveStageFilter\] = useState\('All Stages'\);\n/, '');

// 2. Remove the filter logic (this part usually works)
const filterLogicRegex = /\s*if \(activeStageFilter === 'Live'\) \{[\s\S]*?return isLive;\n\s*\}/g;
content = content.replace(filterLogicRegex, '');

// 3. Update useEffect dependencies
content = content.replace(/\[searchQuery, activeStageFilter, activeTab, allEvents\]/, '[searchQuery, activeTab, allEvents]');

// 4. Update UI using string split and replace
const parts = content.split('{/* Filters Area */}');
if (parts.length > 1) {
  const afterFilters = parts[1].split('{/* Events List */}');
  if (afterFilters.length > 1) {
    const newFiltersArea = `
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
        </div>

        `;
    content = parts[0] + '{/* Filters Area */}' + newFiltersArea + '{/* Events List */}' + afterFilters[1];
  }
}

fs.writeFileSync('src/app/client/events/page.tsx', content, 'utf8');
console.log('Fixed Event page UI via split');
