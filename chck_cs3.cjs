const fs = require('fs');
const lines = fs.readFileSync('../Csupplier/src/pages/EventDetails.tsx', 'utf8').split('\n');
lines.forEach((l, i) => { if(l.includes('onChange=')) console.log(i + ': ' + l.trim()); });
