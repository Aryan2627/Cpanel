const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

// The block ends with "}, [parsedStages, activeTabIndex]);"
// So we match the start and the end.
const templateFieldsRegex = /[\s]*const templateFields = useMemo\(\(\) => \{\s*if \(parsedStages\.length > 0 && parsedStages\[activeTabIndex\] && parsedStages\[activeTabIndex\]\.templateFields\) \{\s*return parsedStages\[activeTabIndex\]\.templateFields;\s*\}\s*return \[\];\s*\}, \[parsedStages, activeTabIndex\]\);/g;

// Same for parsedStages
const parsedStagesRegex = /[\s]*const parsedStages = useMemo\(\(\) => \{\s*if \(\!event \|\| \!event\.stages\) return \[\];\s*try \{ return JSON\.parse\(event\.stages\); \} catch\(e\) \{ return \[\]; \}\s*\}, \[event\]\);/g;

code = code.replace(templateFieldsRegex, '');
code = code.replace(parsedStagesRegex, '');

const parsedStagesStr = `  const parsedStages = useMemo(() => {
    if (!event || !event.stages) return [];
    try { return JSON.parse(event.stages); } catch(e) { return []; }
  }, [event]);`;

const templateFieldsStr = `  const templateFields = useMemo(() => {
    if (parsedStages.length > 0 && parsedStages[activeTabIndex] && parsedStages[activeTabIndex].templateFields) {
      return parsedStages[activeTabIndex].templateFields;
    }
    return [];
  }, [parsedStages, activeTabIndex]);`;

const insertPoint = `  const [activeTabIndex, setActiveTabIndex] = useState(0);`;
const toInsert = `\n\n${parsedStagesStr}\n\n${templateFieldsStr}\n`;

code = code.replace(insertPoint, insertPoint + toInsert);
fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log("Cleaned up perfectly!");
