const fs = require('fs');
let code = fs.readFileSync('src/app/client/events/[id]/page.tsx', 'utf8');

// Add states
const stateInjection = `const [isSplitAwardOpen, setIsSplitAwardOpen] = useState(false);
  const [splitSelections, setSplitSelections] = useState<Record<string, string>>({});
  
  const [isSurrogateOpen, setIsSurrogateOpen] = useState(false);
  const [surrogateVendor, setSurrogateVendor] = useState('');
  const [surrogateData, setSurrogateData] = useState<Record<string, string>>({});
  const [isSubmittingSurrogate, setIsSubmittingSurrogate] = useState(false);

  const parsedParticipants = useMemo(() => {
    if (!event || !event.participants) return [];
    try { return JSON.parse(event.participants); } catch(e) { return []; }
  }, [event]);
  
  const handleSurrogateSubmit = async () => {
    if (!surrogateVendor) return alert("Please select a vendor.");
    setIsSubmittingSurrogate(true);
    try {
      const vendorDetail = parsedParticipants.find((p: any) => p.email === surrogateVendor) || { name: surrogateVendor.split('@')[0] };
      
      let calculatedAmount = 0;
      templateFields.forEach((f: any) => {
        if (f.type === 'number') {
          calculatedAmount += parseFloat(surrogateData[f.key]) || 0;
        }
      });

      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          vendorId: surrogateVendor,
          vendorName: vendorDetail.name + " (Surrogate)",
          amount: calculatedAmount,
          currency: event.baseCurrency || 'INR',
          status: 'Submitted (Surrogate)',
          templateData: surrogateData
        })
      });

      if (res.ok) {
        alert("Proxy bid successfully submitted!");
        setIsSurrogateOpen(false);
        setSurrogateData({});
        // Reload bids
        fetch(\`/api/bids?eventId=\${event.id}\`)
          .then(r => r.json())
          .then(data => setBids(data));
      } else {
        alert("Failed to submit proxy bid.");
      }
    } catch(err) {
      alert("Error submitting proxy bid.");
    }
    setIsSubmittingSurrogate(false);
  };`;

code = code.replace(/const \[isSplitAwardOpen, setIsSplitAwardOpen\] = useState\(false\);\s*const \[splitSelections, setSplitSelections\] = useState<Record<string, string>>\(\{\}\);/g, stateInjection);

// Add button
const buttonInjection = `<Layers size={16} /> Split Award
                  </button>
                  <button onClick={() => setIsSurrogateOpen(true)} style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 1px 2px rgba(245, 158, 11, 0.2)' }}>
                    <User size={16} /> Proxy Bid
                  </button>`;
code = code.replace(/<Layers size=\{16\} \/> Split Award\s*<\/button>/g, buttonInjection);

// Add Modal
const surrogateModalUI = `
      {/* Surrogate/Proxy Bid Modal */}
      {isSurrogateOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#f59e0b" /> Submit Proxy Bid
              </h2>
              <button onClick={() => setIsSurrogateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                As a buyer, you can legally submit a bid on behalf of a vendor who is unable to access the portal. This bid will be marked as "(Surrogate)" for compliance and audit purposes.
              </p>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>Select Vendor</label>
                <select 
                  value={surrogateVendor}
                  onChange={(e) => setSurrogateVendor(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                >
                  <option value="">-- Choose an Invited Vendor --</option>
                  {parsedParticipants.map((p: any, idx: number) => (
                    <option key={idx} value={p.email}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Template Fields</h3>
                {templateFields.map((f: any, idx: number) => (
                  <div key={idx}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                      {f.name} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea 
                        value={surrogateData[f.key] || ''}
                        onChange={(e) => setSurrogateData({...surrogateData, [f.key]: e.target.value})}
                        placeholder={f.description}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', minHeight: '60px' }}
                      />
                    ) : (
                      <input 
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={surrogateData[f.key] || ''}
                        onChange={(e) => setSurrogateData({...surrogateData, [f.key]: e.target.value})}
                        placeholder={f.description}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setIsSurrogateOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSurrogateSubmit} disabled={isSubmittingSurrogate} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.4)' }}>
                {isSubmittingSurrogate ? 'Submitting...' : 'Submit Proxy Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace('{isSplitAwardOpen && (', surrogateModalUI + '\n      {isSplitAwardOpen && (');

fs.writeFileSync('src/app/client/events/[id]/page.tsx', code, 'utf8');
console.log('Fixed Surrogate UI');
