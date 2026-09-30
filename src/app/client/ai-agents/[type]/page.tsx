
'use client';
import React, { useState, useEffect } from 'react';
import { Zap, Play, CheckCircle2, Loader2, Database, Search, ShieldAlert, Cpu, Globe, ArrowRight, Activity, Mail } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function FullScreenAgentPage() {
  const params = useParams();
  const router = useRouter();
  const rawType = params.type as string; 
  
  const [activeTab, setActiveTab] = useState('Active Tasks');
  const [realItems, setRealItems] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});
  const [itemProgress, setItemProgress] = useState<Record<string, string>>({});
  const [taskSteps, setTaskSteps] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 });
  const [taskResults, setTaskResults] = useState<Record<string, any>>({});
  const [scanLogs, setScanLogs] = useState<Record<string, string[]>>({});

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

          return { 
            id: d.id, 
            title, 
            metric: 'Awaiting Run', 
            progress: '0%',
            type: d.type || 'STANDARD',
            date: new Date(d.createdAt || Date.now()).toLocaleDateString()
          };
        });

        if (formatted.length === 0) {
           formatted.push({ id: 'demo-1', title: 'No real records found yet. Run a demo?', metric: 'Awaiting', progress: '0%', type: 'URGENT', date: new Date().toLocaleDateString() });
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
        purpose: 'Autonomous semantic discovery. Connects to global endpoints (Alibaba, IndiaMART, ThomasNet) to source exact matches.',
        tasks: [
          { title: 'Semantic Extraction', desc: 'Parsing requirements into NLP vectors' },
          { title: 'Global Web Scrape', desc: 'Live cross-referencing on B2B platforms' },
          { title: 'RFI Generation', desc: 'Drafting structured capability requests' }
        ],
        tabs: ['Active Tasks', 'Market Intelligence', 'Risk Reports'],
      };
    }
    return { name: 'Agent', role: '...', tag: '...', purpose: '...', tasks: [], tabs: [] };
  };

  const data = getAgentData();

  const handleRunTask = async (itemId: string) => {
    if (processingItems[itemId]) return;
    
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    setItemProgress(prev => ({ ...prev, [itemId]: '10%' }));
    setTaskSteps({ 0: 1, 1: 0, 2: 0 }); 
    setScanLogs(prev => ({ ...prev, [itemId]: ['Initializing Anveshan cognitive engine...'] }));

    try {
      setTimeout(() => {
        setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Parsing NLP intent from intake title...'] }));
      }, 400);

      if (agentName === 'Procurement Agent') {
        setTimeout(() => {
          setItemProgress(prev => ({ ...prev, [itemId]: '40%' }));
          setTaskSteps({ 0: 2, 1: 1, 2: 0 });
          setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Connecting to Tavily global scraping endpoints...', 'Pinging Alibaba.com & IndiaMART databases...'] }));
        }, 1000);

        setTimeout(() => {
          setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Analyzing historical lead times via vector DB...'] }));
        }, 2500);

        const res = await fetch('/api/agents/anveshan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intakeId: itemId })
        });
        
        const responseData = await res.json();
        
        setItemProgress(prev => ({ ...prev, [itemId]: '75%' }));
        setTaskSteps({ 0: 2, 1: 2, 2: 1 });
        setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Drafting professional RFI payloads...'] }));

        setTimeout(() => {
          setItemProgress(prev => ({ ...prev, [itemId]: '100%' }));
          setTaskSteps({ 0: 2, 1: 2, 2: 2 });
          if (responseData.success) {
            setTaskResults(prev => ({ ...prev, [itemId]: responseData }));
          }
        }, 800);
      }
    } catch (err) {
      console.error("Task failed", err);
      setItemProgress(prev => ({ ...prev, [itemId]: '0%' }));
      setTaskSteps({ 0: 0, 1: 0, 2: 0 }); 
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
      alert("Error: The AI connection failed. Check your console for details.");
    }
  };

  const getEmoji = (name: string) => {
    switch (name) {
      case 'Anveshan': return '🔎';
      case 'Tark': return '⚖️';
      case 'Niti': return '🤝';
      case 'Garuda': return '🦅';
      default: return '🤖';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        @keyframes scan-line {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .atlan-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .atlan-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: #cbd5e1;
        }
        .scanning-active {
          border-color: #60a5fa !important;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15) !important;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .log-entry {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}} />

      {/* Header */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0', zIndex: 10 }}>
        <div style={{ padding: '32px 48px', backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(241, 245, 249, 0.8) 0%, transparent 40%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div style={{ 
                width: '72px', height: '72px', borderRadius: '16px', 
                backgroundColor: '#fff', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '36px'
              }}>
                {getEmoji(data.name)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>{data.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                    <Cpu size={12} /> LEVEL 4 AUTONOMY
                  </div>
                </div>
                <p style={{ fontSize: '1rem', color: '#64748b', margin: 0, fontWeight: 500, maxWidth: '600px', lineHeight: 1.5 }}>
                  {data.purpose}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#10b981', backgroundColor: '#ecfdf5', padding: '8px 16px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'pulse-ring 2s infinite' }} />
              Live Endpoints Active
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar - Agent Plan */}
        <div style={{ width: '380px', borderRight: '1px solid #e2e8f0', padding: '32px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '24px', textTransform: 'uppercase' }}>
            Execution Graph
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '15px', top: '24px', bottom: '24px', width: '2px', backgroundColor: '#e2e8f0' }} />
            
            {data.tasks.map((task, idx) => {
              const status = taskSteps[idx] || 0; 
              return (
                <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 2 }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    backgroundColor: status === 2 ? '#10b981' : status === 1 ? '#3b82f6' : '#fff', 
                    border: `2px solid ${status === 2 ? '#10b981' : status === 1 ? '#3b82f6' : '#cbd5e1'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: status > 0 ? '#fff' : '#94a3b8', transition: 'all 0.3s',
                    boxShadow: status === 1 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none'
                  }}>
                    {status === 2 ? <CheckCircle2 size={16} /> : status === 1 ? <Loader2 size={16} className="animate-spin" /> : <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#cbd5e1'}}/>}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <div style={{ 
                      fontSize: '0.95rem', fontWeight: 700, 
                      color: status === 1 ? '#0f172a' : status === 2 ? '#334155' : '#94a3b8', 
                      marginBottom: '4px', transition: 'color 0.3s'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>{task.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Area - Assets Table */}
        <div style={{ flex: 1, padding: '32px', backgroundColor: '#fff', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {data.tabs.map((tab, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px', borderRadius: '6px',
                    fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: activeTab === tab ? '#0f172a' : 'transparent',
                    color: activeTab === tab ? '#fff' : '#64748b',
                    border: 'none'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={14} /> {realItems.length} Records found
            </div>
          </div>

          {loadingData ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94a3b8', gap: '16px' }}>
               <Loader2 className="animate-spin" size={32} />
               <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Syncing with Data Warehouse...</span>
             </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {realItems.map((item) => {
                const isProcessing = processingItems[item.id];
                const progress = itemProgress[item.id] || item.progress;
                const isDone = progress === '100%';

                return (
                  <div key={item.id} className={`atlan-card ${isProcessing ? 'scanning-active' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Scanning Animation Overlay */}
                    {isProcessing && !isDone && (
                      <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', animation: 'scan-line 2s linear infinite', zIndex: 10 }} />
                    )}

                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                            {item.type === 'URGENT' ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fee2e2' }}>URGENT</span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#f8fafc', color: '#64748b', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>STANDARD</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span>ID: <span style={{ fontFamily: 'monospace' }}>{item.id.substring(0,8)}</span></span>
                            <span>Created: {item.date}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          {!isProcessing && !isDone && (
                            <button 
                              onClick={() => handleRunTask(item.id)}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '8px 16px', backgroundColor: '#fff', color: '#0f172a', 
                                borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, 
                                border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                              onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                              onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#fff'; }}
                            >
                              <Play size={14} /> Run Auto-Sourcing
                            </button>
                          )}

                          {isProcessing && !isDone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600 }}>
                              <Loader2 size={16} className="animate-spin" /> Deep Scanning...
                            </div>
                          )}

                          {isDone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}>
                              <CheckCircle2 size={16} /> Asset Enriched
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Live Terminal Logs during processing */}
                      {isProcessing && !isDone && scanLogs[item.id] && (
                        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8' }}>
                          <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '0.7rem' }}>LIVE TERMINAL</div>
                          {scanLogs[item.id].map((log, i) => (
                            <div key={i} className="log-entry" style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}>
                              <span style={{ color: '#10b981' }}>→</span> {log}
                            </div>
                          ))}
                          <div style={{ marginTop: '4px', color: '#94a3b8', animation: 'pulse-ring 1.5s infinite' }}>_</div>
                        </div>
                      )}
                    </div>

                    {/* AI RESULTS UI EXPANSION (Atlan Style) */}
                    {isDone && taskResults[item.id] && (
                      <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '24px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                          
                          {/* Left Column: Metadata & Risk */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Search size={14} /> Semantic Extraction
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {taskResults[item.id].extractedSpecs?.map((spec: string, i: number) => (
                                  <span key={i} style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '3px solid #f59e0b' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Activity size={14} /> Market Intelligence
                              </div>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                                {taskResults[item.id].marketAnalysis}
                              </p>
                            </div>

                          </div>

                          {/* Right Column: Discoveries & Action */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Globe size={14} /> Live Global Sourcing Results
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {taskResults[item.id].webDiscoveries?.map((web: any, i: number) => (
                                  <div key={i} style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '2px' }}>{web.name}</div>
                                      <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{web.reason}</div>
                                    </div>
                                    <a
                                      href={web.url?.startsWith('http') ? web.url : `https://${web.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        fontSize: '0.75rem', color: '#0f172a', backgroundColor: '#fff',
                                        padding: '6px 12px', borderRadius: '4px', textDecoration: 'none',
                                        fontWeight: 600, border: '1px solid #cbd5e1', whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Visit Site <ArrowRight size={12} />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mail size={14} /> Auto-Generated RFI Draft
                              </div>
                              <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '6px', color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '150px', overflowY: 'auto' }}>
                                {taskResults[item.id].rfiDraft}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                  Approve & Send Emails
                                </button>
                              </div>
                            </div>

                          </div>
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
  );
}
