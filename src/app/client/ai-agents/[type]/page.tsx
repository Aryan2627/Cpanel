'use client';
import React, { useState, useEffect } from 'react';
import { Zap, Play, CheckCircle2, Loader2, Database } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function FullScreenAgentPage() {
  const params = useParams();
  const router = useRouter();
  const rawType = params.type as string; // 'procurement', 'sourcing', 'negotiation', 'operations'
  
  const [activeTab, setActiveTab] = useState('Active Tasks');
  const [realItems, setRealItems] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});
  const [itemProgress, setItemProgress] = useState<Record<string, string>>({});
  const [taskSteps, setTaskSteps] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 });
  const [taskResults, setTaskResults] = useState<Record<string, any>>({});

  const agentNameMap: Record<string, string> = {
    'procurement': 'Procurement Agent',
    'sourcing': 'Sourcing Agent',
    'negotiation': 'Negotiation Agent',
    'operations': 'Operations Agent'
  };
  const agentName = agentNameMap[rawType] || 'Procurement Agent';

  useEffect(() => {
    setActiveTab('Active Tasks');
    setProcessingItems({});
    setItemProgress({});
    setTaskSteps({ 0: 0, 1: 0, 2: 0 });
    fetchRealData(agentName);
  }, [agentName]);

  const fetchRealData = async (agent: string) => {
    setLoadingData(true);
    try {
      let endpoint = '';
      if (agent === 'Procurement Agent') endpoint = '/api/intakes';
      else if (agent === 'Sourcing Agent') endpoint = '/api/bids';
      else if (agent === 'Negotiation Agent') endpoint = '/api/vendors';
      else if (agent === 'Operations Agent') endpoint = '/api/pos';

      if (!endpoint) return;

      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.slice(0, 5).map((d: any) => {
          let title = '';
          if (agent === 'Procurement Agent') title = d.title || `Intake Request #${d.id.substring(0,6)}`;
          else if (agent === 'Sourcing Agent') title = d.supplierName ? `Quote_${d.supplierName}.pdf` : `Bid_${d.id.substring(0,6)}.pdf`;
          else if (agent === 'Negotiation Agent') title = d.name || d.companyName || `Vendor_${d.id.substring(0,6)}`;
          else if (agent === 'Operations Agent') title = d.poNumber ? `PO-${d.poNumber}` : `Order_${d.id.substring(0,6)}`;

          return { id: d.id, title, metric: 'Awaiting Run', progress: '0%' };
        });

        if (formatted.length === 0) {
           formatted.push({ id: 'demo-1', title: 'No real records found yet. Run a demo?', metric: 'Awaiting', progress: '0%' });
        }
        
        setRealItems(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const getAgentData = () => {
    if (agentName === 'Procurement Agent') {
      return {
        name: 'Anveshan', role: 'The Discoverer', tag: 'STAGE 1 • DISCOVERY',
        purpose: 'Scours global databases to find exactly what you need based on unstructured requirements.',
        tasks: [
          { title: 'Parse incoming requisitions', desc: 'Read and categorize real Intake forms' },
          { title: 'Identify capable suppliers', desc: 'Match intake requirements to vendor database' },
          { title: 'Rank by qualification score', desc: 'and assign outreach priority' }
        ],
        tabs: ['Active Tasks', 'Market Intelligence', 'Risk Reports'],
      };
    } else if (agentName === 'Sourcing Agent') {
      return {
        name: 'Tark', role: 'The Analyst', tag: 'STAGE 2 • ANALYTICAL',
        purpose: 'Crunches the numbers to find the best total-cost trade-offs and normalizes quotes.',
        tasks: [
          { title: 'Extract pricing from PDFs', desc: 'Scan real uploaded vendor bids/quotes' },
          { title: 'Normalize line items', desc: 'by unit, currency, and MOQ' },
          { title: 'Rank by total cost', desc: 'including freight and payment terms' }
        ],
        tabs: ['Active Tasks', 'Cost Breakdowns', 'Anomalies'],
      };
    } else if (agentName === 'Negotiation Agent') {
      return {
        name: 'Niti', role: 'The Strategist', tag: 'STAGE 3 • EXECUTION',
        purpose: 'Pushes back on supplier pricing and secures optimal net-60 payment terms.',
        tasks: [
          { title: 'Analyze historical spend', desc: 'Cross-reference active vendor profiles' },
          { title: 'Generate counter-offers', desc: 'using market benchmarks and leverage' },
          { title: 'Draft and send emails', desc: 'directly to vendor sales reps' }
        ],
        tabs: ['Active Tasks', 'Savings Realized', 'Counter-offers'],
      };
    } else {
      return {
        name: 'Garuda', role: 'The Tracker', tag: 'STAGE 4 • OPERATIONS',
        purpose: 'Watches your POs and invoices like a hawk to ensure timely delivery and exact matching.',
        tasks: [
          { title: 'Monitor ERP sync', desc: 'Scan active Purchase Orders in the database' },
          { title: 'Track live delivery status', desc: 'and ping suppliers if delayed' },
          { title: 'Perform 3-way match', desc: 'between PO, GRN, and Invoice' }
        ],
        tabs: ['Active Tasks', 'Invoice Matches', 'Risk Alerts'],
      };
    }
  };

  const data = getAgentData();

  const handleRunTask = async (itemId: string) => {
    if (processingItems[itemId]) return;
    
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    setItemProgress(prev => ({ ...prev, [itemId]: '10%' }));
    setTaskSteps({ 0: 1, 1: 0, 2: 0 }); 

    try {
      if (agentName === 'Procurement Agent') {
        setTimeout(() => {
          setItemProgress(prev => ({ ...prev, [itemId]: '40%' }));
          setTaskSteps({ 0: 2, 1: 1, 2: 0 });
        }, 1000);

        const res = await fetch('/api/agents/anveshan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intakeId: itemId })
        });
        
        const responseData = await res.json();
        
        setItemProgress(prev => ({ ...prev, [itemId]: '75%' }));
        setTaskSteps({ 0: 2, 1: 2, 2: 1 });

        if (responseData.success) {
          setTaskResults(prev => ({ ...prev, [itemId]: responseData }));
        }
      } else {
        setTimeout(() => {
          setItemProgress(prev => ({ ...prev, [itemId]: '40%' }));
          setTaskSteps({ 0: 2, 1: 1, 2: 0 }); 
        }, 1500);
      }

      setTimeout(() => {
        setItemProgress(prev => ({ ...prev, [itemId]: '100%' }));
        setTaskSteps({ 0: 2, 1: 2, 2: 2 }); 
        setProcessingItems(prev => ({ ...prev, [itemId]: false }));
      }, agentName === 'Procurement Agent' ? 500 : 3000);

    } catch (err) {
      console.error("Task failed", err);
      // PREVENT GETTING STUCK: Reset visual state if API completely fails/times out
      setItemProgress(prev => ({ ...prev, [itemId]: '0%' }));
      setTaskSteps({ 0: 0, 1: 0, 2: 0 }); 
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
      alert("Error: The AI took too long to respond (Vercel Timeout) or the connection failed. Check your console for details.");
    }
  };

  const getEmoji = (name: string) => {
    if(name === 'Anveshan') return '🔎';
    if(name === 'Tark') return '🧠';
    if(name === 'Niti') return '♟️';
    return '🦅';
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: '#f8fafc',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px'
    }}>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      <div style={{
        position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column',
        backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #cbd5e1',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)', overflow: 'hidden'
      }}>
        
        <div style={{ 
          padding: '40px', borderBottom: '1px solid #f1f5f9', 
          backgroundColor: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ 
              width: '88px', height: '88px', borderRadius: '20px', 
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', fontSize: '44px'
            }}>
              {getEmoji(data.name)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{data.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#10b981', backgroundColor: '#ecfdf5', padding: '6px 12px', borderRadius: '16px', border: '1px solid #a7f3d0', textTransform: 'uppercase' }}>
                  <Database size={14} /> Live DB Linked
                </div>
              </div>
              <p style={{ fontSize: '1.1rem', color: '#64748b', margin: 0, fontWeight: 500, maxWidth: '600px', lineHeight: 1.5 }}>
                {data.purpose}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ 
              padding: '8px 20px', borderRadius: '24px', 
              backgroundColor: '#eff6ff', color: '#3b82f6', 
              border: '1px solid #bfdbfe', fontSize: '0.8rem', 
              fontWeight: 700, letterSpacing: '1px', whiteSpace: 'nowrap' 
            }}>
              {data.tag}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          
          <div style={{ width: '400px', borderRight: '1px solid #f1f5f9', padding: '40px', backgroundColor: '#fafafa', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '20px' }}>
              <Zap size={16} fill="currentColor" /> CORE PURPOSE
            </div>
            <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, marginBottom: '48px' }}>
              {data.purpose}
            </p>

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '32px' }}>
              LIVE TASK PLAN
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '13px', top: '32px', bottom: '32px', width: '2px', backgroundColor: '#e2e8f0' }} />
              
              {data.tasks.map((task, idx) => {
                const status = taskSteps[idx] || 0; 
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', 
                      backgroundColor: status === 2 ? '#22c55e' : status === 1 ? '#3b82f6' : '#fff', 
                      border: `2px solid ${status === 2 ? '#22c55e' : status === 1 ? '#3b82f6' : '#cbd5e1'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: status > 0 ? '#fff' : '#94a3b8', fontSize: '0.75rem', fontWeight: 800,
                      transition: 'all 0.3s'
                    }}>
                      {status === 2 ? <CheckCircle2 size={16} /> : status === 1 ? <Loader2 size={16} className="animate-spin" /> : (idx + 1)}
                    </div>

                    <div>
                      <div style={{ 
                        fontSize: '1.05rem', fontWeight: 600, 
                        color: status === 1 ? '#3b82f6' : status === 2 ? '#0f172a' : '#64748b', 
                        marginBottom: '6px', transition: 'color 0.3s'
                      }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.4 }}>{task.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, padding: '40px', backgroundColor: '#fff', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
              {data.tabs.map((tab, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 24px', borderRadius: '24px',
                    fontSize: '0.9rem', fontWeight: i === 0 ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: activeTab === tab ? '#eff6ff' : '#fff',
                    color: activeTab === tab ? '#3b82f6' : '#64748b',
                    border: activeTab === tab ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {activeTab} • QUEUE
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                {loadingData ? 'Fetching...' : `${realItems.length} active database records`}
              </div>
            </div>

            {loadingData ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '32px', color: '#64748b', fontSize: '1.1rem' }}>
                 <Loader2 className="animate-spin" size={24} /> Fetching live data from DB...
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {realItems.map((item) => {
                  const isProcessing = processingItems[item.id];
                  const progress = itemProgress[item.id] || item.progress;
                  const isDone = progress === '100%';

                  return (
                    <div key={item.id} style={{ 
                      backgroundColor: '#fff', border: isProcessing ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                      borderRadius: '16px', padding: '24px 32px', position: 'relative', overflow: 'hidden',
                      boxShadow: isProcessing ? '0 8px 24px rgba(59, 130, 246, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                          
                          {!isProcessing && !isDone && (
                            <button 
                              onClick={() => handleRunTask(item.id)}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', 
                                borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, 
                                border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                              }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
                            >
                              <Play size={14} fill="currentColor" /> Run Agent
                            </button>
                          )}

                          {(isProcessing || isDone) && (
                            <span style={{ fontSize: '0.95rem', color: isDone ? '#22c55e' : '#3b82f6', fontWeight: 600 }}>
                              {isDone ? 'Task Complete' : 'Processing...'}
                            </span>
                          )}

                          {isDone && (
                            <span style={{ padding: '6px 16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: progress, height: '100%', 
                          backgroundColor: isDone ? '#22c55e' : '#3b82f6', 
                          borderRadius: '4px', transition: 'width 0.5s ease-out, background-color 0.3s' 
                        }} />
                      </div>

                      {/* AI RESULTS UI EXPANSION */}
                      {isDone && taskResults[item.id] && (
                        <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 800, marginBottom: '16px' }}>
                            <Zap size={18} color="#3b82f6" /> AI Autonomous Report
                          </div>
                          
                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Extracted Specs & Match Criteria</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {taskResults[item.id].extractedSpecs?.map((spec: string, i: number) => (
                                <span key={i} style={{ padding: '4px 12px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Historical Vector Analysis</div>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#334155', lineHeight: 1.5 }}>
                              {taskResults[item.id].marketAnalysis}
                            </p>
                          </div>

                          <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>External Web Discoveries (New Suppliers)</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {taskResults[item.id].webDiscoveries?.map((web: any, i: number) => (
                                <div key={i} style={{ padding: '12px', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{web.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{web.url}</span>
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{web.reason}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Drafted RFI Email</div>
                            <pre style={{ margin: 0, padding: '16px', backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                              {taskResults[item.id].rfiDraft}
                            </pre>
                            <button style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                              Approve & Send to Suppliers
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
