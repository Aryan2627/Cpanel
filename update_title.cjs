const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');
code = code.replace(
  'title: "Procurement Portal",',
  'title: "ProcGen | Enterprise Sourcing",'
);
fs.writeFileSync('src/app/layout.tsx', code, 'utf8');
console.log("Updated title");
