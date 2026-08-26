const fs = require('fs');
let content = fs.readFileSync('src/app/client/events/page.tsx', 'utf8');

content = content.replace(/const \[activeStageFilter, setActiveStageFilter\] = useState\('All Stages'\);\r?\n/, '');

const filterBlockRegex = /\s*let matchesStage = true;[\s\S]*?if \(activeStageFilter === 'Live'\) \{[\s\S]*?\}\r?\n/g;
content = content.replace(filterBlockRegex, (match) => {
  // We still need isHistorical logic, so we will just remove the matchesStage part
  return '\n      let isHistorical = false;\n      if (event.endTime) {\n        isHistorical = new Date() > new Date(event.endTime);\n      } else {\n        isHistorical = event.stages.every((s: any) => s.timeText && (s.timeText.includes(\'Ended\') || s.timeText.includes(\'History\') || s.timeText.includes(\'Overdue\')));\n      }\n';
});

content = content.replace(/return matchesSearch && matchesStage && matchesTab;/, 'return matchesSearch && matchesTab;');

fs.writeFileSync('src/app/client/events/page.tsx', content, 'utf8');
console.log('Removed activeStageFilter logic');
