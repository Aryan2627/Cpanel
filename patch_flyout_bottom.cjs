const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// Replace top: 0 with bottom: '-10px' or bottom: 0 to make it expand upwards
code = code.replace(/top: 0, left: '100%'/g, "bottom: 0, left: '100%'");

fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Patched layout flyout positioning");
