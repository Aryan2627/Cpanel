const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

// 1. Update imports
code = code.replace(/ArrowLeft, Clock, CheckCircle2, AlertCircle, BarChart3, FileText, User, Leaf, AlertTriangle, Target, Globe, BrainCircuit, Hammer, X/, 'ArrowLeft, Clock, CheckCircle2, AlertCircle, BarChart3, FileText, User, Leaf, AlertTriangle, Target, Globe, BrainCircuit, Hammer, X, Layers, SplitSquareHorizontal');

// 2. Add State for Split Award
const stateHook = `  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');`;

const splitState = `  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');
  
  const [isSplitAwardOpen, setIsSplitAwardOpen] = useState(false);
  const [splitSelections, setSplitSelections] = useState<Record<string, string>>({}); // fieldKey -> vendorName
`;
code = code.replace(stateHook, splitState);

// 3. Add handleSplitAward method right before `const parsedStages`
const handleSplitAwardCode = `
  const handleSplitAward = async () => {
    try {
      const itemsByVendor: Record<string, string[]> = {};
      Object.keys(splitSelections).forEach(fieldKey => {
        const vendorName = splitSelections[fieldKey];
        if (!itemsByVendor[vendorName]) itemsByVendor[vendorName] = [];
        itemsByVendor[vendorName].push(fieldKey);
      });

      const vendorNames = Object.keys(itemsByVendor);
      if (vendorNames.length === 0) {
        alert("Please select at least one item to award.");
        return;
      }

      for (const vendorName of vendorNames) {
        const vendorBid = processedBids.find(b => (b.vendorName || "Unknown") === vendorName);
        if (!vendorBid) continue;
        
        const wonFieldKeys = itemsByVendor[vendorName];
        const vendorTemplateFields = templateFields.filter((f: any) => wonFieldKeys.includes(f.key));
        
        let splitTotal = 0;
        let bidTemplateData: any = {};
        try { bidTemplateData = JSON.parse(vendorBid.templateData); } catch(e) {}
        
        vendorTemplateFields.forEach((f: any) => {
          if (f.type === 'number') {
             const val = parseFloat(bidTemplateData[f.key]) || 0;
             splitTotal += val;
          }
        });

        const poDetails = { 
           templateFields: vendorTemplateFields, 
           bidData: bidTemplateData, 
           vendorEmail: vendorBid.vendorId || 'vendor@example.com' 
        };

        await fetch('/api/pos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: \`Split PO for Event \${event.refId}\`,
            vendorId: vendorName,
            total: splitTotal,
            eventId: event.id,
            status: 'Pending Vendor',
            poNumber: \`PO-\${Date.now()}-\${Math.floor(Math.random() * 1000)}\`,
            details: JSON.stringify(poDetails)
          })
        });
      }
      
      alert('Successfully generated Purchase Orders for the Split Award!');
      setIsSplitAwardOpen(false);
      router.push('/client/po');
    } catch(err) {
      alert('Error during Split Award process.');
      console.error(err);
    }
  };

  const parsedStages`;

code = code.replace('  const parsedStages', handleSplitAwardCode);

// 4. Add "Split Award" button to UI
const compareBtnRegex = /(<button onClick=\{\(\) => setIsCompareModalOpen\(true\)\}[\s\S]*?Compare Matrix\s*<\/button>)/;
const splitBtnUI = `
$1
                  <button onClick={() => {
                      // Auto-pre-select lowest bid for each field
                      const initialSelections: Record<string, string> = {};
                      templateFields.forEach((f: any) => {
                        if (f.type === 'number') {
                          // Find lowest bid for this field
                          let lowestVal = Infinity;
                          let lowestVendor = '';
                          processedBids.forEach((b: any) => {
                            const val = parseFloat(b.parsedData?.[f.key]);
                            if (!isNaN(val) && val < lowestVal) {
                              lowestVal = val;
                              lowestVendor = b.vendorName || "Unknown";
                            }
                          });
                          if (lowestVendor) {
                            initialSelections[f.key] = lowestVendor;
                          }
                        }
                      });
                      setSplitSelections(initialSelections);
                      setIsSplitAwardOpen(true);
                    }} 
                    style={{ backgroundColor: '#6366f1', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(99, 102, 241, 0.2)' }}
                  >
                    <Layers size={16} /> Split Award
                  </button>
`;
code = code.replace(compareBtnRegex, splitBtnUI);


// 5. Add Split Award Modal UI
const modalRegex = /\{isCompareModalOpen && \([\s\S]*?\{isChatOpen && \(/;

const splitModalUI = `{isCompareModalOpen && (
  ... /* skipped in replace, handled via split & join below */
`;

fs.writeFileSync('rewrite_events.cjs', 'console.log("Ready");', 'utf8');
