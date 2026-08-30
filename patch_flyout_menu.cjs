const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// 1. Fix sidebar overflow
code = code.replace(/overflow: "hidden"/g, 'overflow: isSidebarOpen ? "visible" : "hidden"');

// 2. Add position: relative to <li>
code = code.replace(
  /<li key=\{item\.name\} onMouseEnter=\{\(\) => setHoverMenu\(item\.name\)\} onMouseLeave=\{\(\) => setHoverMenu\(null\)\}>/g,
  '<li key={item.name} onMouseEnter={() => setHoverMenu(item.name)} onMouseLeave={() => setHoverMenu(null)} style={{ position: "relative" }}>'
);

// 3. Update the <ul> styling for flyout
const oldUl = `<ul style={{ listStyle: 'none', padding: '4px 0 4px 16px', margin: 0 }}>`;
const newUl = `<ul style={{ position: 'absolute', top: 0, left: '100%', minWidth: '280px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', padding: '12px', zIndex: 9999, listStyle: 'none', margin: '0 0 0 10px', maxHeight: '80vh', overflowY: 'auto' }}>`;

code = code.replace(oldUl, newUl);

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Patched flyout menu");
