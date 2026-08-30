const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// The arrow span code is roughly:
// <span style={{ fontSize: '0.8rem', transform: (openMenu === item.name || hoverMenu === item.name) ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
// We can use a regex to match and remove it.

const regex = /<span style=\{\{ fontSize: '0\.8rem', transform:[^>]+>.*?<\/span>/g;
code = code.replace(regex, '');

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Removed arrows");
