const fs = require('fs');
const file = 'src/app/client/events/create/auction/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const searchStr = "return (\n                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>\n                        {creatorFields.map((f: any) => (";

const replacement = `
                    const groupedFields = new Map<any, any[]>();
                    creatorFields.forEach((f: any) => {
                        const g = f._sourceItemId || 'default';
                        if (!groupedFields.has(g)) groupedFields.set(g, []);
                        groupedFields.get(g)!.push(f);
                    });

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {Array.from(groupedFields.entries()).map(([groupId, groupFields]: any, gIdx: number) => {
                          const item = lineItems.find(i => i.id === groupId);
                          const groupName = item ? (item.values['Item Name'] || \`Item \${gIdx + 1}\`) : 'General Requirements';
                          const isMulti = groupedFields.size > 1 || fromPR;
                          
                          return (
                            <div key={groupId} style={{ backgroundColor: isMulti ? '#f8fafc' : 'transparent', padding: isMulti ? '20px' : '0', borderRadius: '8px', border: isMulti ? '1px solid #e2e8f0' : 'none' }}>
                              {isMulti && (
                                <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #cbd5e1', color: '#1e293b', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '6px', height: '18px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                                  {groupName}
                                </div>
                              )}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {groupFields.map((f: any) => (
                                  <div key={f.key}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '8px' }}>
                                      {isMulti ? (f.originalName || f.name.replace(groupName + ' - ', '')) : f.name}
                                    </label>
                                    {f.type === 'product' ? (
                                      <React.Fragment>
                                        <input
                                          type="text"
                                          list={!fromPR ? \`products-list-\${f.key}\` : undefined}
                                          readOnly={fromPR}
                                          placeholder={fromPR ? "Auto-filled from PR" : "Type to search products..."}
                                          value={creatorData[f.key] || ''}
                                          onChange={(e) => {
                                            const selectedName = e.target.value;
                                            const prod = products.find(p => p.name === selectedName);
                                            
                                            if (prod) {
                                              const newData: Record<string, string> = { ...creatorData, [f.key]: selectedName };
                                              creatorFields.forEach((otherField: any) => {
                                                if (otherField.key === f.key || otherField._sourceItemId !== f._sourceItemId) return;
                                                const n = (otherField.originalKey || otherField.name).toLowerCase();
                                                if (n.includes('uom') || n.includes('unit')) { 
                                                  newData[otherField.key as string] = prod.uom || '';
                                                } else if (n.includes('category')) { 
                                                  newData[otherField.key as string] = prod.category || '';
                                                } else if (n.includes('desc')) { 
                                                  newData[otherField.key as string] = prod.description || '';
                                                } else if (n.includes('code')) { 
                                                  newData[otherField.key as string] = prod.code || '';
                                                }
                                              });
                                              setCreatorData(newData);
                                            } else {
                                              setCreatorData({ ...creatorData, [f.key]: selectedName });
                                            }
                                          }}
                                          style={fromPR ? { ...glassInputStyle, background: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : glassInputStyle}
                                          onFocus={e => !fromPR && (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)')}
                                          onBlur={e => !fromPR && (e.currentTarget.style.boxShadow = 'none')}
                                        />
                                        <datalist id={\`products-list-\${f.key}\`}>
                                          {products.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                          ))}
                                        </datalist>
                                      </React.Fragment>
                                    ) : f.type === 'location' ? (
                                      <LocationAutocomplete
                                        value={creatorData[f.key] || ''}
                                        onChange={(val) => setCreatorData({ ...creatorData, [f.key]: val })}
                                        placeholder={\`Search for \${f.name}\`}
                                        style={glassInputStyle}
                                      />
                                    ) : f.type === 'date' ? (
                                      <input 
                                        type="date" value={creatorData[f.key] || ''} onChange={(e) => setCreatorData({ ...creatorData, [f.key]: e.target.value })}
                                        style={glassInputStyle} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)'} onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                                      />
                                    ) : (
                                      <input 
                                        type="text" placeholder={\`Enter \${f.name}\`} value={creatorData[f.key] || ''} onChange={(e) => setCreatorData({ ...creatorData, [f.key]: e.target.value })}
                                        style={glassInputStyle} onFocus={e => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)'} onBlur={e => e.currentTarget.style.boxShadow = 'none'}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );`;

const startIdx = code.indexOf(searchStr);
if (startIdx === -1) {
    console.log("Could not find start str in " + file);
} else {
    const endStr = "</div>\n                    );";
    const endIdx = code.indexOf(endStr, startIdx);
    if (endIdx === -1) {
        console.log("Could not find end str in " + file);
    } else {
        code = code.substring(0, startIdx) + replacement + code.substring(endIdx + endStr.length);
        fs.writeFileSync(file, code, 'utf8');
        console.log('Updated auction render block');
    }
}
