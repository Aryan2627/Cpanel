const fs = require('fs');
let content = fs.readFileSync('src/app/client/events/page.tsx', 'utf8');

const regex = /\/\/ KPI calculations[\s\S]*?const historicalEvents = allEvents\.filter\(e => \{[\s\S]*?\}\)\.length;/;

const newCalc = `// KPI calculations
  const totalEvents = allEvents.length;
  
  // Historical Events definition exactly matches what goes into the HISTORY tab
  const historicalEvents = allEvents.filter(e => {
    if (e.endTime) {
      return new Date() > new Date(e.endTime);
    }
    return e.stages.every((s: any) => s.timeText && (s.timeText.includes('Ended') || s.timeText.includes('History') || s.timeText.includes('Overdue')));
  }).length;

  const liveEvents = totalEvents - historicalEvents;`;

content = content.replace(regex, newCalc);
fs.writeFileSync('src/app/client/events/page.tsx', content, 'utf8');
console.log('Fixed KPI via regex');
