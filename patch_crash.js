const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

// We need to move parsedStages and templateFields up.
// Let's first remove them from their current location.

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

// Regex to remove them
const removeRegex1 = /  const parsedStages = useMemo\(\(\) => \{\s+if \(\!event \|\| \!event\.stages\) return \[\];\s+try \{ return JSON\.parse\(event\.stages\); \} catch\(e\) \{ return \[\]; \}\s+\}, \[event\]\);\s+/;
const removeRegex2 = /  const templateFields = useMemo\(\(\) => \{\s+if \(parsedStages\.length > 0 && parsedStages\[activeTabIndex\] && parsedStages\[activeTabIndex\]\.templateFields\) \{\s+return parsedStages\[activeTabIndex\]\.templateFields;\s+\}\s+return \[\];\s+\}, \[parsedStages, activeTabIndex\]\);\s+/;

if (removeRegex1.test(code) && removeRegex2.test(code)) {
    code = code.replace(removeRegex1, '');
    code = code.replace(removeRegex2, '');
    
    // Now insert them right after activeTabIndex
    const insertPoint = `  const [activeTabIndex, setActiveTabIndex] = useState(0);`;
    const toInsert = `\n\n${parsedStagesStr}\n\n${templateFieldsStr}\n`;
    
    code = code.replace(insertPoint, insertPoint + toInsert);
    fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
    console.log("Success! Moved parsedStages and templateFields");
} else {
    console.log("Could not find blocks to remove.");
}
