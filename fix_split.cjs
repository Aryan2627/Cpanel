const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

// Add icons
code = code.replace(/ArrowLeft, Clock, CheckCircle2, AlertCircle, BarChart3, FileText, User, Leaf, AlertTriangle, Target, Globe, BrainCircuit, Hammer, X/, 'ArrowLeft, Clock, CheckCircle2, AlertCircle, BarChart3, FileText, User, Leaf, AlertTriangle, Target, Globe, BrainCircuit, Hammer, X, Layers, SplitSquareHorizontal');

// Add states
code = code.replace(/const \[isEditingTime, setIsEditingTime\] = useState\(false\);\r?\n  const \[newEndTime, setNewEndTime\] = useState\(''\);/, 
`const [isEditingTime, setIsEditingTime] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');
  const [isSplitAwardOpen, setIsSplitAwardOpen] = useState(false);
  const [splitSelections, setSplitSelections] = useState<Record<string, string>>({});`);

// Add function
code = code.replace('const parsedStages', `const handleSplitAward = async () => {
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

  const parsedStages`);

// Add button
const matchBtn = `<button onClick={() => setIsCompareModalOpen(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)' }}>
                    <BarChart3 size={16} /> Compare Matrix
                  </button>`;
const newBtns = `<button onClick={() => setIsCompareModalOpen(true)} style={{ backgroundColor: '#10b981', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)' }}>
                    <BarChart3 size={16} /> Compare Matrix
                  </button>
                  <button onClick={() => {
                      const initialSelections: Record<string, string> = {};
                      templateFields.forEach((f: any) => {
                        if (f.type === 'number') {
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
                  </button>`;
code = code.replace(matchBtn, newBtns);

// Add Modal
const splitAwardModal = `
      {/* Split Award Modal */}
      {isSplitAwardOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SplitSquareHorizontal size={20} color="#6366f1" /> Split Award Lines
              </h2>
              <button onClick={() => setIsSplitAwardOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                Select which vendor will be awarded each specific line item. We have automatically pre-selected the lowest-priced vendor for each line. Clicking "Award Split" will generate separate Purchase Orders for each selected vendor.
              </p>
              
              <div style={{ borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Line Item</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Item Type</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>Award To Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateFields.filter((f:any) => f.type === 'number').map((field: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontWeight: 500, color: '#0f172a' }}>{field.name}</td>
                        <td style={{ padding: '16px', color: '#64748b' }}>Number/Price</td>
                        <td style={{ padding: '16px' }}>
                          <select 
                            value={splitSelections[field.key] || ''}
                            onChange={(e) => setSplitSelections({ ...splitSelections, [field.key]: e.target.value })}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                          >
                            <option value="">-- Do Not Award --</option>
                            {processedBids.map((b: any) => {
                              const val = parseFloat(b.parsedData?.[field.key]);
                              const isLowest = splitSelections[field.key] === b.vendorName;
                              return (
                                <option key={b.id} value={b.vendorName || 'Unknown'}>
                                  {b.vendorName || 'Unknown'} - {b.currency} {isNaN(val) ? 'N/A' : val}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setIsSplitAwardOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSplitAward} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#6366f1', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)' }}>
                Confirm & Award Split
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace('{isChatOpen && (', splitAwardModal + '\n      {isChatOpen && (');

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log('Done');
