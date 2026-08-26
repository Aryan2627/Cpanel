const fs = require('fs');
let content = fs.readFileSync('src/app/client/events/page.tsx', 'utf8');

const oldCalc = `  // KPI calculations
  const totalEvents = allEvents.length;
  const liveEvents = allEvents.filter(e => e.stages.some((s: any) => s.timeText.includes('Live') || s.timeText.includes('Ends in'))).length;
  
  // Historical Events definition is exactly what goes into the HISTORY tab
  const historicalEvents = allEvents.filter(e => {
    if (e.endTime) {
      return new Date() > new Date(e.endTime);
    }
    return e.stages.every((s: any) => s.timeText && (s.timeText.includes('Ended') || s.timeText.includes('History') || s.timeText.includes('Overdue')));
  }).length;`;

const newCalc = `  // KPI calculations
  const totalEvents = allEvents.length;
  
  // Historical Events definition exactly matches what goes into the HISTORY tab
  const historicalEvents = allEvents.filter(e => {
    if (e.endTime) {
      return new Date() > new Date(e.endTime);
    }
    return e.stages.every((s: any) => s.timeText && (s.timeText.includes('Ended') || s.timeText.includes('History') || s.timeText.includes('Overdue')));
  }).length;

  const liveEvents = totalEvents - historicalEvents;`;

content = content.replace(oldCalc, newCalc);
fs.writeFileSync('src/app/client/events/page.tsx', content, 'utf8');
console.log('Fixed KPI calculations');
