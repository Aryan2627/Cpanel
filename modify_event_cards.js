const fs = require('fs');

const modifyFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove box shadow from cards and use standard gray border
  content = content.replace(
    /boxShadow: '0 10px 25px -5px rgba\(0,0,0,0\.05\), 0 1px 3px -1px rgba\(0,0,0,0\.02\)', border: '1px solid rgba\(226, 232, 240, 0\.8\)'/g,
    "boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'"
  );
  
  // Make icons inside headers standard blue instead of different colors
  content = content.replace(/color="#3b82f6"/g, 'color="#1e3a8a"');
  content = content.replace(/color="#10b981"/g, 'color="#1e3a8a"');
  content = content.replace(/color="#8b5cf6"/g, 'color="#1e3a8a"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Modified cards in ' + filePath);
};

modifyFile('src/app/client/events/create/single-stage/page.tsx');
modifyFile('src/app/client/events/create/auction/page.tsx');

