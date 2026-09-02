'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Clock, TrendingDown, ArrowLeft, Send, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function VendorLiveBidding() {
  const router = useRouter();
  const params = useParams();
  const [timeLeft, setTimeLeft] = useState('00:14:59');
  const [hasAcceptedNDA, setHasAcceptedNDA] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(`nda_accepted_${params.id}`)) {
      setHasAcceptedNDA(true);
    }
  }, [params.id]);

  const acceptNDA = () => {
    localStorage.setItem(`nda_accepted_${params.id}`, 'true');
    setHasAcceptedNDA(true);
  };

  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Field Data State mapped by key
  const [fieldData, setFieldData] = useState<Record<string, any>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load event');
        return res.json();
      })
      .then(data => {
        setEvent(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  const templateFields = useMemo(() => {
    if (!event?.stages) return [];
    try {
      const parsedStages = typeof event.stages === 'string' ? JSON.parse(event.stages) : event.stages;
      if (parsedStages.length > 0 && parsedStages[0].templateFields) {
        return parsedStages[0].templateFields;
      }
    } catch(e) {}
    return [];
  }, [event]);

  useEffect(() => {
    if (templateFields.length > 0 && Object.keys(fieldData).length === 0) {
      const initData: any = {};
      let hasCalc = false;
      templateFields.forEach((f: any) => {
        if (f.role?.toLowerCase() === 'calculation' && f.formula) {
           hasCalc = true;
           const groupId = f._sourceItemId || 'default';
           const groupFields = templateFields.filter((tf: any) => (tf._sourceItemId || 'default') === groupId);
           try {
             let expr = f.formula;
             const sortedFields = [...groupFields].sort((a, b) => (b.originalKey || b.key).length - (a.originalKey || a.key).length);
             sortedFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
                 expr = expr.replace(new RegExp(`\\b${vName}\\b`, 'g'), v.toString());
               }
             });
             // eslint-disable-next-line no-new-func
             const result = new Function('return ' + expr)();
             initData[f.key] = (Number(result) || 0).toString();
           } catch(e) {}
        }
      });
      if (hasCalc) setFieldData(initData);
    }
  }, [templateFields]);

  const calculateTotal = () => {
    let total = 0;
    
    // Group fields by line item
    const groupedFields = new Map<any, any[]>();
    templateFields.forEach((f: any) => {
        const g = f._sourceItemId || 'default';
        if (!groupedFields.has(g)) groupedFields.set(g, []);
        groupedFields.get(g)!.push(f);
    });
    
    // For each group, sum ONLY Calculation fields if they exist. Otherwise sum Participant numeric fields.
    groupedFields.forEach(fields => {
      const calcFields = fields.filter(f => f.role?.toLowerCase() === 'calculation' && f.type === 'number');
      const targetFields = calcFields.length > 0 ? calcFields : fields.filter(f => f.role?.toLowerCase() === 'participant' && f.type === 'number');
      
      targetFields.forEach(f => {
        if (fieldData[f.key]) {
          total += parseFloat(fieldData[f.key]) || 0;
        }
      });
    });
    
    return total;
  };

  useEffect(() => {
    let minutes = 14;
    let seconds = 59;
    
    const interval = setInterval(() => {
      seconds--;
      if (seconds < 0) {
        seconds = 59;
        minutes--;
      }
      setTimeLeft(`00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    // Validation for Mandatory Fields
    const missingFields: string[] = [];
    templateFields.forEach((f: any) => {
      if (f.required) {
        if (fieldData[f.key] === undefined || fieldData[f.key] === '' || fieldData[f.key] === null) {
          missingFields.push(f.name);
        }
      }
    });

    if (missingFields.length > 0) {
      alert(`Please fill out the following mandatory fields:\n- ${missingFields.join('\n- ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id, // Using DB UUID
          vendorId: 'vendor-123',
          vendorName: 'Acme Corporation',
          amount: calculateTotal(),
          currency: event.baseCurrency || 'INR',
          status: 'Submitted',
          templateData: fieldData
        })
      });
      if (res.ok) {
        setLastSubmitted(calculateTotal());
        // notify buyer portal if on same machine for demo
        window.dispatchEvent(new Event('storage')); 
        alert('Bid successfully submitted and broadcasted to the Buyer Portal!');
      } else {
        alert('Failed to submit bid');
      }
    } catch(e) {
      alert('Error submitting bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (key: string, val: string) => {
    setFieldData(prev => {
      const next = { ...prev, [key]: val };
      
      // Auto-calculate formula fields
      templateFields.forEach((f: any) => {
        if (f.role?.toLowerCase() === 'calculation' && f.formula) {
           const groupId = f._sourceItemId || 'default';
           const groupFields = templateFields.filter((tf: any) => (tf._sourceItemId || 'default') === groupId);
           
           try {
             let expr = f.formula;
             groupFields.forEach((gf: any) => {
               const vName = gf.originalKey || gf.key;
               if (expr.includes(vName)) {
                 let v = 0;
                 if (gf.role?.toLowerCase() === 'creator') v = Number(gf.defaultValue) || 0;
                 else v = Number(next[gf.key]) || 0;
                 expr = expr.replace(new RegExp(`\\b${vName}\\b`, 'g'), v.toString());
               }
             });
             // eslint-disable-next-line no-new-func
             const result = new Function('return ' + expr)();
             next[f.key] = (Number(result) || 0).toString();
           } catch(e) {}
        }
      });
      
      return next;
    });
  };

  if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Loading Live Auction...</div>;
  if (error) return <div style={{ color: '#ef4444', padding: '40px' }}>Error: {error}</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      {!hasAcceptedNDA && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2, 6, 23, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div style={{ background: '#0f172a', padding: '48px', borderRadius: '24px', border: '1px solid #1e293b', maxWidth: '600px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <ShieldCheck size={64} color="#3b82f6" style={{ margin: '0 auto 24px auto' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 16px 0', color: '#f8fafc' }}>Non-Disclosure Agreement</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '32px' }}>
              This sourcing event contains strictly confidential and proprietary information. By proceeding, you legally agree to keep all pricing, specifications, and buyer details confidential as per the standard Master NDA.
            </p>
            <button onClick={acceptNDA} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer', width: '100%', transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              I Agree & Accept NDA
            </button>
          </div>
        </div>
      )}

      <div style={{ pointerEvents: hasAcceptedNDA ? 'auto' : 'none', height: '100%' }}>
      
      {/* Live Header */}
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => router.push('/vendor/events')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Events
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#1e293b' }}></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', letterSpacing: '1px' }}>LIVE AUCTION</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' }}>{event.refId}: {event.title}</h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px', textAlign: 'right' }}>Your Rank</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: lastSubmitted !== null ? '#10b981' : '#f59e0b', textAlign: 'right' }}>
              {lastSubmitted !== null ? '#1' : '-'}
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
            <Clock color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Time Remaining</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Trading Floor */}
      <main style={{ display: 'flex', height: 'calc(100vh - 85px)' }}>
        
        {/* Left Side: Bidding Grid */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>Quote Submission</h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Enter your most competitive responses. Values are monitored in real-time.</p>
            </div>
            {lastSubmitted !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
                <ShieldCheck size={16} /> Last bid submitted with total numeric value: ${lastSubmitted.toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
            {(() => {
              const groupedFields = new Map<any, any[]>();
              templateFields.forEach((f: any) => {
                  const g = f._sourceItemId || 'default';
                  if (!groupedFields.has(g)) groupedFields.set(g, []);
                  groupedFields.get(g)!.push(f);
              });
              
              if (groupedFields.size === 0) {
                return (
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#64748b' }}>
                    No template fields found for this event.
                  </div>
                );
              }

              return Array.from(groupedFields.entries()).map(([groupId, groupFields]: any, gIdx: number) => {
                let groupName = `Line Item ${gIdx + 1}`;
                if (groupedFields.size > 1 && groupFields.length > 0) {
                  const firstField = groupFields[0];
                  if (firstField.name && firstField.name.includes(' - ')) {
                    groupName = firstField.name.split(' - ')[0];
                  }
                }
                if (groupId === 'default' && groupedFields.size === 1) groupName = 'Bidding Requirements';
                
                const isMulti = groupedFields.size > 1;

                return (
                  <div key={groupId} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                    {isMulti && (
                      <div style={{ backgroundColor: '#1e293b', padding: '16px 24px', borderBottom: '1px solid #334155', color: '#f8fafc', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                        {groupName}
                      </div>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#020617', borderBottom: '1px solid #1e293b' }}>
                          <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Field Name</th>
                          <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '350px' }}>Your Response</th>
                          <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Type / Requirement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupFields.map((f: any) => (
                          <tr key={f.key} style={{ borderBottom: '1px solid #1e293b' }}>
                            <td style={{ padding: '20px 24px' }}>
                              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {isMulti ? (f.originalName || f.name.replace(groupName + ' - ', '')) : f.name}
                        {f.required && <span style={{ color: '#ef4444', fontSize: '1.2rem', lineHeight: 0 }}>*</span>}
                      </div>
                      {f.tooltip && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.tooltip}</div>}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      {f.type === 'dropdown' ? (
                        <select
                          value={fieldData[f.key] || ''}
                          onChange={(e) => handleFieldChange(f.key, e.target.value)}
                          style={{ width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                        >
                          <option value="">Select an option...</option>
                          {f.dropdownOptions?.split(',').map((opt: string) => (
                            <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      ) : f.role?.toLowerCase() === 'creator' ? (
                        <div style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8', fontSize: '1rem', fontWeight: 500, cursor: 'not-allowed' }}>
                          {f.type === 'number' ? Number(f.defaultValue || 0).toLocaleString() : (f.defaultValue || '-')}
                        </div>
                      ) : f.role?.toLowerCase() === 'calculation' ? (
                        <div style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#38bdf8', fontSize: '1rem', fontWeight: 700 }}>
                          {Number(fieldData[f.key] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      ) : f.type === 'boolean' ? (
                          <select
                            value={fieldData[f.key] || ''}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                          >
                            <option value="">Select...</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        ) : f.type === 'file' ? (
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="file"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  handleFieldChange(f.key, e.target.files[0].name);
                                }
                              }}
                              style={{ width: '100%', padding: '9px 12px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
                            />
                            {fieldData[f.key] && (
                               <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                 <ShieldCheck size={14} /> Uploaded: {fieldData[f.key]}
                               </div>
                            )}
                          </div>
                        ) : (
                          <input 
                            type={f.type === 'number' ? 'number' : 'text'}
                            value={fieldData[f.key] || ''}
                            onChange={(e) => handleFieldChange(f.key, e.target.value)}
                            placeholder={`Enter ${f.type}...`}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '1rem', fontWeight: 500, outline: 'none', transition: 'border-color 0.2s' }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#334155'}
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          />
                        )}
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: 'rgba(51, 65, 85, 0.4)', color: '#94a3b8', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        {f.type}
                      </span>
                      {f.required && (
                        <span style={{ display: 'inline-block', padding: '4px 10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginLeft: '8px' }}>
                          Required
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                
              </tbody>
                    </table>
                  </div>
                );
              });
            })()}
          </div>
            
            {/* Total Footer */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
            <div style={{ padding: '24px', backgroundColor: '#020617', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                Ensure all mandatory fields <span style={{color: '#ef4444'}}>*</span> are filled before submitting.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Total Numeric Fields</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8' }}>${calculateTotal().toLocaleString()}</div>
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ 
                    padding: '16px 32px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', 
                    fontSize: '1.1rem', fontWeight: 700, cursor: isSubmitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)', transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  {isSubmitting ? 'PROCESSING...' : <><Zap size={20} /> SUBMIT LIVE BID</>}
                </button>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', color: '#fbbf24', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Binding Offer Notice</strong>
              By clicking "Submit Live Bid", you are extending a legally binding offer to the buyer under the terms and conditions set forth in the RFQ document. Retractions are not permitted during a live auction.
            </div>
          </div>

        </div>

        {/* Right Side: Buyer Comms (Live Chat) */}
        <div style={{ width: '350px', backgroundColor: '#0f172a', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span> Live Buyer Comms
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>Buyer • 10:41 AM</div>
              <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px 8px 8px 0', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                Welcome to the live floor. We're looking to close this today.
              </div>
            </div>
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Message buyer..."
                style={{ width: '100%', padding: '12px 40px 12px 16px', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '24px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
              <button style={{ position: 'absolute', right: '4px', top: '4px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

      </main>

      <style>
        {`
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}
      </style>
      </div>
    </div>
  );
}
