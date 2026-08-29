const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

const stateRegex = /  const \[activeTabIndex, setActiveTabIndex\] = useState\(0\);/;
const parsedStagesRegex = /[\s]*const parsedStages = useMemo\(\(\) => \{\s*if \(\!event \|\| \!event\.stages\) return \[\];\s*try \{ return JSON\.parse\(event\.stages\); \} catch\(e\) \{ return \[\]; \}\s*\}, \[event\]\);/g;
const templateFieldsRegex = /[\s]*const templateFields = useMemo\(\(\) => \{\s*if \(parsedStages\.length > 0 && parsedStages\[activeTabIndex\] && parsedStages\[activeTabIndex\]\.templateFields\) \{\s*return parsedStages\[activeTabIndex\]\.templateFields;\s*\}\s*return \[\];\s*\}, \[parsedStages, activeTabIndex\]\);/g;

code = code.replace(stateRegex, '');
code = code.replace(parsedStagesRegex, '');
code = code.replace(templateFieldsRegex, '');

const toInsert = `
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const parsedStages = useMemo(() => {
    if (!event || !event.stages) return [];
    try { return JSON.parse(event.stages); } catch(e) { return []; }
  }, [event]);
  const templateFields = useMemo(() => {
    if (parsedStages.length > 0 && parsedStages[activeTabIndex] && parsedStages[activeTabIndex].templateFields) {
      return parsedStages[activeTabIndex].templateFields;
    }
    return [];
  }, [parsedStages, activeTabIndex]);
`;

// Find where to insert it: right after `const [bids, setBids] = useState<any[]>([]);`
const insertPoint = `  const [bids, setBids] = useState<any[]>([]);`;
code = code.replace(insertPoint, insertPoint + toInsert);

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log("Moved to top!");
