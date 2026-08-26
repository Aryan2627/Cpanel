const fs = require('fs');

function fixDropdownPosition(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const searchString = `              {/* Event Type */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Evaluation Type</label>
                <div `;

  const replaceString = `              {/* Event Type */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Evaluation Type</label>
                <div style={{ position: 'relative' }}>
                  <div `;

  if (content.includes(searchString)) {
    content = content.replace(searchString, replaceString);
    
    const closingRegex = /                \)}\n              <\/div>\n              \n              \{\/\* Multi-Stage (Configuration|Toggle) \*\/\}/g;
    content = content.replace(closingRegex, (match, p1) => {
      return `                )}\n                </div>\n              </div>\n              \n              {/* Multi-Stage ${p1} */}`;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed ' + filePath);
  } else {
    console.log('Search string not found in ' + filePath);
  }
}

fixDropdownPosition('src/app/client/events/create/auction/page.tsx');
fixDropdownPosition('src/app/client/events/create/single-stage/page.tsx');
