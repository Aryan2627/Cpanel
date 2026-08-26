const fs = require('fs');
// Check nextauth version installed
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log("next-auth version:", pkg.dependencies['next-auth']);
