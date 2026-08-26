const fs = require('fs');
// Check what cookies / session strategy nextauth uses
const auth = fs.readFileSync('src/lib/auth.ts', 'utf8');
console.log(auth.substring(0, 500));
