const fs = require('fs');
// Check the signup page signIn call
const code = fs.readFileSync('src/app/signup/page.tsx', 'utf8');
const idx = code.indexOf('signIn(');
console.log(code.substring(idx - 200, idx + 300));
