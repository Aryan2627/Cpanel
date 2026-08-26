const fs = require('fs');

function fixDropdownPosition(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{/* Event Type */}')) {
      if (lines[i+1].includes("position: 'relative'")) {
        lines[i+1] = lines[i+1].replace("position: 'relative'", "display: 'flex', flexDirection: 'column'");
        lines.splice(i+3, 0, "                <div style={{ position: 'relative' }}>");
        // find the closing tag
        for (let j = i + 3; j < lines.length; j++) {
          if (lines[j].includes('{/* Multi-Stage')) {
            // go back two lines and add closing div
            lines.splice(j - 1, 0, "                </div>");
            break;
          }
        }
      }
    }
  }
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('Fixed ' + filePath);
}

fixDropdownPosition('src/app/client/events/create/auction/page.tsx');
fixDropdownPosition('src/app/client/events/create/single-stage/page.tsx');
