
'use client';
import React, { useState, useEffect } from 'react';
import { Zap, Play, CheckCircle2, Loader2, Database, Search, ShieldAlert, Cpu, Globe, ArrowRight, Activity, Mail, MapPin, Building, AlertTriangle, TrendingUp } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function FullScreenAgentPage() {
  const params = useParams();
  const rawType = params.type as string; 
  
  const [activeTab, setActiveTab] = useState('Active Tasks');
  const [realItems, setRealItems] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});
  const [itemProgress, setItemProgress] = useState<Record<string, string>>({});
  const [taskSteps, setTaskSteps] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 });
  const [taskResults, setTaskResults] = useState<Record<string, any>>({});
  const [scanLogs, setScanLogs] = useState<Record<string, string[]>>({});

  // New Search & Location State
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('Global');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [riskReports, setRiskReports] = useState<Record<string, any>>({});

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
        const formatted = data.map((d: any) => {
          let title = '';
          if (agent === 'Procurement Agent') title = d.title || `Intake Request #${d.id.substring(0,6)}`;
          else if (agent === 'Sourcing Agent') title = d.supplierName ? `Quote_${d.supplierName}.pdf` : `Bid_${d.id.substring(0,6)}.pdf`;
          else if (agent === 'Negotiation Agent') title = d.name || d.companyName || `Vendor_${d.id.substring(0,6)}`;
          else if (agent === 'Operations Agent') title = d.poNumber ? `PO-${d.poNumber}` : `Order_${d.id.substring(0,6)}`;

          return { 
            id: d.id, title, metric: 'Awaiting Run', progress: '0%', type: d.type || 'STANDARD',
            date: new Date(d.createdAt || Date.now()).toLocaleDateString()
          };
        });
        if (formatted.length === 0) formatted.push({ id: 'demo-1', title: 'demo laptop', type: 'URGENT', date: new Date().toLocaleDateString() });
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
        purpose: 'Autonomous semantic discovery. Connects to global endpoints (Alibaba, IndiaMART) to source exact matches.',
        tasks: [
          { title: 'Semantic Extraction', desc: 'Parsing requirements into NLP vectors' },
          { title: 'Global Web Scrape', desc: 'Live cross-referencing on B2B platforms' },
          { title: 'RFI Generation', desc: 'Drafting structured capability requests' }
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

  const handleAnalyzeRisk = async (supplier: any, loc: string, title: string) => {
    setSelectedSupplier(supplier);
    setActiveTab('Risk Reports');
    if (riskReports[supplier.name]) return;
    setLoadingRisk(true);
    try {
      const res = await fetch('/api/agents/risk-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierName: supplier.name, location: loc, product: title })
      });
      const data = await res.json();
      if (data.success) {
        setRiskReports(prev => ({ ...prev, [supplier.name]: data.report }));
      }
    } catch (e) { console.error(e); } 
    finally { setLoadingRisk(false); }
  };

  const handleRunTask = async (itemId: string) => {
    if (processingItems[itemId]) return;
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    setItemProgress(prev => ({ ...prev, [itemId]: '10%' }));
    setTaskSteps({ 0: 1, 1: 0, 2: 0 }); 
    setScanLogs(prev => ({ ...prev, [itemId]: ['Initializing Anveshan cognitive engine...'] }));

    try {
      setTimeout(() => setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Parsing NLP intent from intake title...'] })), 400);
      setTimeout(() => {
        setItemProgress(prev => ({ ...prev, [itemId]: '40%' }));
        setTaskSteps({ 0: 2, 1: 1, 2: 0 });
        setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), `Connecting to ${location} scraping endpoints...`, 'Locating direct company profiles...'] }));
      }, 1000);
      setTimeout(() => setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Analyzing historical lead times via vector DB...'] })), 2500);

      const res = await fetch('/api/agents/anveshan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeId: itemId, location }) // Passing location to backend!
      });
      
      if (res.status === 402) {
        alert("Insufficient AI tokens. Please upgrade your license to run Anveshan.");
        throw new Error("Insufficient AI tokens");
      }
      
      const responseData = await res.json();
      
      setItemProgress(prev => ({ ...prev, [itemId]: '75%' }));
      setTaskSteps({ 0: 2, 1: 2, 2: 1 });
      setScanLogs(prev => ({ ...prev, [itemId]: [...(prev[itemId]||[]), 'Drafting professional RFI payloads...'] }));

      setTimeout(() => {
        setItemProgress(prev => ({ ...prev, [itemId]: '100%' }));
        setTaskSteps({ 0: 2, 1: 2, 2: 2 });
        if (responseData.success) setTaskResults(prev => ({ ...prev, [itemId]: responseData }));
      }, 800);
    } catch (err) {
      setItemProgress(prev => ({ ...prev, [itemId]: '0%' }));
      setTaskSteps({ 0: 0, 1: 0, 2: 0 }); 
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const displayItems = searchTerm.length > 0 ? realItems.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes scan-line { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ray-sweep { 0% { left: -100%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 200%; opacity: 0; } }
        @keyframes ambient-pulse { 0% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.1); opacity: 0.6; } 100% { transform: scale(1); opacity: 0.4; } }
        .cyber-header {
          position: relative;
          background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
          border-bottom: 1px solid #27272a;
          padding: 40px 48px;
          overflow: hidden;
        }
        .light-ray {
          position: absolute;
          top: -50%;
          width: 200px;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), rgba(255, 255, 255, 0.8), rgba(56, 189, 248, 0.3), transparent);
          transform: skewX(-35deg);
          animation: ray-sweep 4s infinite linear;
          filter: blur(4px);
        }
        .light-ray.delay {
          animation-delay: 2s;
          width: 100px;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.2), rgba(255, 255, 255, 0.5), rgba(139, 92, 246, 0.2), transparent);
        }
        .ambient-glow-1 {
          position: absolute; top: -50px; right: 10%; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 60%);
          border-radius: 50%; filter: blur(40px); animation: ambient-pulse 6s infinite ease-in-out;
        }
        .ambient-glow-2 {
          position: absolute; bottom: -100px; left: 15%; width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
          border-radius: 50%; filter: blur(40px); animation: ambient-pulse 5s infinite ease-in-out reverse;
        }
        .atlan-card { background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.8); border-radius: 16px; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .atlan-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); border-color: #cbd5e1; }
        .scanning-active { border-color: #60a5fa !important; box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.15) !important; }
        .log-entry { animation: fade-in-up 0.4s ease-out forwards; }
      `}} />

      {/* Advanced Cyber Header */}
      <div className="cyber-header">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <div className="light-ray" />
        <div className="light-ray delay" />
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '16px', backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)', fontSize: '36px', overflow: 'hidden' }}>
              {data.name === 'Anveshan' ? <img src="/anveshan-avatar.png" alt="Anveshan" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : data.name === 'Niti' ? <img src="/niti-avatar.jpg" alt="Niti" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : data.name === 'Tark' ? <img src="/tark-avatar.jpg" alt="Tark" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : data.name === 'Garuda' ? <img src="/garuda-avatar.png" alt="Garuda" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🤖'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}>{data.name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)' }}><Cpu size={12} /> LEVEL 4 AUTONOMY</div>
              </div>
              <p style={{ fontSize: '1rem', color: '#94a3b8', margin: 0, fontWeight: 500, maxWidth: '600px', lineHeight: 1.5 }}>{data.purpose}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', backdropFilter: 'blur(10px)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399', animation: 'pulse-ring 2s infinite', boxShadow: '0 0 10px #34d399' }} /> Live Endpoints Active
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Sidebar */}
        <div style={{ width: '380px', borderRight: '1px solid #e2e8f0', padding: '32px', backgroundColor: '#f8fafc', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '24px', textTransform: 'uppercase' }}>Execution Graph</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '15px', top: '24px', bottom: '24px', width: '2px', backgroundColor: '#e2e8f0' }} />
            {data.tasks.map((task, idx) => {
              const status = taskSteps[idx] || 0; 
              return (
                <div key={idx} style={{ display: 'flex', gap: '20px', position: 'relative', zIndex: 2 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: status === 2 ? '#10b981' : status === 1 ? '#3b82f6' : '#fff', border: `2px solid ${status === 2 ? '#10b981' : status === 1 ? '#3b82f6' : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: status > 0 ? '#fff' : '#94a3b8', transition: 'all 0.3s', boxShadow: status === 1 ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none' }}>
                    {status === 2 ? <CheckCircle2 size={16} /> : status === 1 ? <Loader2 size={16} className="animate-spin" /> : <div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#cbd5e1'}}/>}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: status === 1 ? '#0f172a' : status === 2 ? '#334155' : '#94a3b8', marginBottom: '4px' }}>{task.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>{task.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Area */}
        <div style={{ flex: 1, padding: '32px', backgroundColor: '#f1f5f9', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {data.tabs.map((tab, i) => (
                <button key={i} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeTab === tab ? '#0f172a' : 'transparent', color: activeTab === tab ? '#fff' : '#64748b', border: 'none' }}>
                  {tab}
                </button>
              ))}
            </div>
            {selectedSupplier && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
                <Building size={14} /> Analyzing: {selectedSupplier.name}
              </div>
            )}
          </div>

          {activeTab === 'Active Tasks' && (
            <>
              {/* SEARCH BAR & LOCATION FILTER */}
              <div style={{ marginBottom: '32px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a product requirement to source..." 
                    style={{ width: '100%', padding: '18px 18px 18px 48px', borderRadius: '100px', border: 'none', fontSize: '1rem', outline: 'none', backgroundColor: '#ffffff', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  />
                </div>
                <div style={{ position: 'relative', width: '200px' }}>
                  <MapPin size={20} color="#64748b" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%', padding: '18px 18px 18px 48px', borderRadius: '100px', border: 'none', fontSize: '1rem', outline: 'none', backgroundColor: '#ffffff', cursor: 'pointer', appearance: 'none', fontWeight: 700, color: '#0f172a', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  >
                    <option value="Global">Global Search</option>
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="China">China</option>
                    <option value="Europe">Europe</option>
                  </select>
                </div>
              </div>

              {searchTerm.length === 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                   <Search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                   <h3 style={{ margin: '0 0 8px 0', color: '#475569' }}>Search your database</h3>
                   <p style={{ margin: 0, fontSize: '0.9rem' }}>Type a product name (e.g. "Laptop", "Furniture") to locate the intake record.</p>
                 </div>
              ) : displayItems.length === 0 ? (
                 <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                   No intake records found for "{searchTerm}".
                 </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {displayItems.map((item) => {
                    const isProcessing = processingItems[item.id];
                    const progress = itemProgress[item.id] || item.progress;
                    const isDone = progress === '100%';

                    return (
                      <div key={item.id} className={`atlan-card ${isProcessing ? 'scanning-active' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                        
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
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)', transition: 'transform 0.2s', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                                >
                                  <Play size={14} /> Run Sourcing in {location}
                                </button>
                              )}
                              {isProcessing && !isDone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600 }}><Loader2 size={16} className="animate-spin" /> Scanning {location}...</div>}
                              {isDone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.85rem', fontWeight: 700 }}><CheckCircle2 size={16} /> Asset Enriched</div>}
                            </div>
                          </div>

                          {isProcessing && !isDone && scanLogs[item.id] && (
                            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8' }}>
                              {scanLogs[item.id].map((log, i) => <div key={i} className="log-entry" style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}><span style={{ color: '#10b981' }}>→</span> {log}</div>)}
                              <div style={{ marginTop: '4px', color: '#94a3b8', animation: 'pulse-ring 1.5s infinite' }}>_</div>
                            </div>
                          )}
                        </div>

                        {/* AI RESULTS */}
                        {isDone && taskResults[item.id] && (
                          <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Search size={14} /> Semantic Extraction
                                  </div>
                                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {taskResults[item.id].extractedSpecs?.map((spec: string, i: number) => <span key={i} style={{ padding: '4px 10px', backgroundColor: '#f1f5f9', color: '#0f172a', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>{spec}</span>)}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #3b82f6' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Globe size={14} /> Direct Supplier Profiles ({location})
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {taskResults[item.id].webDiscoveries?.map((web: any, i: number) => (
                                      <div key={i} style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1, paddingRight: '16px' }}>
                                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '4px' }}>{web.name}</div>
                                          <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{web.reason}</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                          <a href={web.url?.startsWith('http') ? web.url : `https://${web.url}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#0f172a', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '4px', textDecoration: 'none', fontWeight: 600, border: '1px solid #cbd5e1' }}>
                                            Visit Direct Profile <ArrowRight size={12} />
                                          </a>
                                          <button 
                                            onClick={() => handleAnalyzeRisk(web, location, item.title)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#fff', background: 'linear-gradient(135deg, #059669, #10b981)', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                                            Analyze Risk & Market
                                          </button>
                                        </div>
                                      </div>
                                    ))}
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
            </>
          )}

          {activeTab === 'Risk Reports' && (
            <div style={{ animation: 'fade-in-up 0.3s ease-out' }}>
              {!selectedSupplier ? (
                <div style={{ textAlign: 'center', padding: '64px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <ShieldAlert size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                  <h3>No Supplier Selected</h3>
                  <p>Run a sourcing task and click "Analyze Risk & Market" on a discovered supplier.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {loadingRisk || !riskReports[selectedSupplier.name] ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', color: '#3b82f6' }}>
                      <Loader2 size={48} className="animate-spin" style={{ marginBottom: '16px' }} />
                      <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Live AI Risk Analysis...</h3>
                      <p style={{ margin: 0, color: '#64748b' }}>Scraping global registries and B2B reviews for {selectedSupplier.name}</p>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: `4px solid ${riskReports[selectedSupplier.name].riskScore > 70 ? '#ef4444' : riskReports[selectedSupplier.name].riskScore > 30 ? '#f59e0b' : '#10b981'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div>
                          <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Compliance & Risk Profile</h2>
                          <p style={{ margin: 0, color: '#64748b' }}>Live AI Generation for <strong>{selectedSupplier.name}</strong></p>
                        </div>
                        <span style={{ 
                          backgroundColor: riskReports[selectedSupplier.name].riskScore > 70 ? '#fef2f2' : riskReports[selectedSupplier.name].riskScore > 30 ? '#fef3c7' : '#ecfdf5', 
                          color: riskReports[selectedSupplier.name].riskScore > 70 ? '#ef4444' : riskReports[selectedSupplier.name].riskScore > 30 ? '#d97706' : '#10b981', 
                          padding: '8px 16px', borderRadius: '24px', fontSize: '0.85rem', fontWeight: 700, 
                          border: `1px solid ${riskReports[selectedSupplier.name].riskScore > 70 ? '#fee2e2' : riskReports[selectedSupplier.name].riskScore > 30 ? '#fde68a' : '#a7f3d0'}`
                        }}>
                          {riskReports[selectedSupplier.name].riskLevel} (Score: {riskReports[selectedSupplier.name].riskScore}/100)
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, marginBottom: '8px' }}><Building size={16} color="#3b82f6"/> Entity Verification</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{riskReports[selectedSupplier.name].entityVerification}</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600, marginBottom: '8px' }}><Globe size={16} color="#10b981"/> Geo-Political Risk</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{riskReports[selectedSupplier.name].geoRisk}</div>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: riskReports[selectedSupplier.name].riskScore > 50 ? '#fef2f2' : '#f8fafc', borderRadius: '8px', border: `1px solid ${riskReports[selectedSupplier.name].riskScore > 50 ? '#fee2e2' : '#e2e8f0'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: riskReports[selectedSupplier.name].riskScore > 50 ? '#991b1b' : '#0f172a', fontWeight: 600, marginBottom: '8px' }}><AlertTriangle size={16} color={riskReports[selectedSupplier.name].riskScore > 50 ? '#ef4444' : '#f59e0b'}/> Financial & Web Alert</div>
                          <div style={{ fontSize: '0.85rem', color: riskReports[selectedSupplier.name].riskScore > 50 ? '#991b1b' : '#64748b', lineHeight: 1.5 }}>{riskReports[selectedSupplier.name].financialRisk}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Market Intelligence' && (
            <div style={{ animation: 'fade-in-up 0.3s ease-out' }}>
              {!selectedSupplier ? (
                <div style={{ textAlign: 'center', padding: '64px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <TrendingUp size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                  <h3>No Supplier Selected</h3>
                  <p>Run a sourcing task and click "Analyze Risk & Market" on a discovered supplier.</p>
                </div>
              ) : (
                <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
                  <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Market Competitiveness</h2>
                  <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>Pricing and capabilities for <strong>{selectedSupplier.name}</strong></p>
                  
                  <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Supplier Context</h4>
                    <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{selectedSupplier.reason}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e40af', marginBottom: '4px' }}>Top 15%</div>
                      <div style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600 }}>Estimated Price Competitiveness in {location}</div>
                    </div>
                    <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>Net-30 or LC</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Standard Payment Terms</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
