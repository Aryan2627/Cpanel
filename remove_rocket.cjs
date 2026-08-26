const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the Rocket icon div
  content = content.replace(/<div style=\{\{ background: '#3b82f6', color: '#fff', padding: '8px', borderRadius: '8px', display: 'flex' \}\}\><Rocket size=\{20\} \/><\/div>\s*/g, '');
  
  // Remove the Rocket import
  content = content.replace(/,\s*Rocket/g, '');
  content = content.replace(/Rocket,\s*/g, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ' + filePath);
}

processFile('src/app/client/events/create/auction/page.tsx');
processFile('src/app/client/events/create/single-stage/page.tsx');
