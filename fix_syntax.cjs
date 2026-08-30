const fs = require('fs');
let code = fs.readFileSync('src/app/client/layout.tsx', 'utf8');

// The broken snippet is:
//     { 
//       
//       { 
//         name: 'License Management', 

const brokenSnippet = `    { 
      
      { 
        name: 'License Management',`;

const fixedSnippet = `    { 
        name: 'License Management',`;

code = code.replace(brokenSnippet, fixedSnippet);
fs.writeFileSync('src/app/client/layout.tsx', code, 'utf8');
console.log("Fixed syntax error");
