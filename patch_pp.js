const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

const ppRegex = /[\s]*const parsedParticipants = useMemo\(\(\) => \{\s*if \(\!event \|\| \!event\.participants\) return \[\];\s*try \{ return JSON\.parse\(event\.participants\); \} catch\(e\) \{ return \[\]; \}\s*\}, \[event\]\);/g;

code = code.replace(ppRegex, '');

const ppStr = `  const parsedParticipants = useMemo(() => {
    if (!event || !event.participants) return [];
    try { return JSON.parse(event.participants); } catch(e) { return []; }
  }, [event]);`;

const insertPoint = `  const templateFields = useMemo(() => {`;
code = code.replace(insertPoint, ppStr + '\n' + insertPoint);

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log("Moved parsedParticipants to top!");
