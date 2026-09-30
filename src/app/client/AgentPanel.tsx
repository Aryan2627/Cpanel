
'use client';
import React, { useState, useEffect } from 'react';
import { X, Zap, Play, CheckCircle2, Loader2 } from 'lucide-react';

interface AgentPanelProps {
  agentName: string | null;
  onClose: () => void;
}

export default function AgentPanel({ agentName, onClose }: AgentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Active Tasks');
  const [processingItems, setProcessingItems] = useState<Record<number, boolean>>({});
  const [itemProgress, setItemProgress] = useState<Record<number, string>>({});
  const [taskSteps, setTaskSteps] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0 }); // 0: pending, 1: running, 2: done

  useEffect(() => {
    if (agentName) {
      setIsOpen(true);
      setActiveTab('Active Tasks');
      setProcessingItems({});
      setItemProgress({});
      setTaskSteps({ 0: 0, 1: 0, 2: 0 });
    } else {
      setIsOpen(false);
    }
  }, [agentName]);

  const getAgentData = () => {
    if (agentName === 'Procurement Agent') {
      return {
        name: 'Anveshan', role: 'The Discoverer', tag: 'STAGE 1 • DISCOVERY',
        purpose: 'Scours global databases to find exactly what you need based on unstructured requirements.',
        tasks: [
          { title: 'Parse incoming requisitions', desc: 'across all departments and cost centers' },
          { title: 'Identify capable suppliers', desc: 'by category, compliance score, and region' },
          { title: 'Rank by qualification score', desc: 'and assign outreach priority' }
        ],
        tabs: ['Active Tasks', 'Market Intelligence', 'Risk Reports'],
        items: [
          { id: 1, title: 'req_hardware_q4.pdf', metric: 'Waiting...', progress: '0%' },
          { id: 2, title: 'req_office_supplies.docx', metric: 'Waiting...', progress: '0%' },
          { id: 3, title: 'req_software_licenses.msg', metric: 'Waiting...', progress: '0%' }
        ]
      };
    } else if (agentName === 'Sourcing Agent') {
      return {
        name: 'Tark', role: 'The Analyst', tag: 'STAGE 2 • ANALYTICAL',
        purpose: 'Crunches the numbers to find the best total-cost trade-offs and normalizes quotes.',
        tasks: [
          { title: 'Extract pricing from PDFs', desc: 'across all incoming vendor quotes' },
          { title: 'Normalize line items', desc: 'by unit, currency, and MOQ' },
          { title: 'Rank by total cost', desc: 'including freight and payment terms' }
        ],
        tabs: ['Active Tasks', 'Cost Breakdowns', 'Anomalies'],
        items: [
          { id: 1, title: 'quote_acme_v2.pdf', metric: 'Waiting...', progress: '0%' },
          { id: 2, title: 'globex_pricing_2026.xlsx', metric: 'Waiting...', progress: '0%' },
          { id: 3, title: 'stark_initial_bid.pdf', metric: 'Waiting...', progress: '0%' }
        ]
      };
    } else if (agentName === 'Negotiation Agent') {
      return {
        name: 'Niti', role: 'The Strategist', tag: 'STAGE 3 • EXECUTION',
        purpose: 'Pushes back on supplier pricing and secures optimal net-60 payment terms.',
        tasks: [
          { title: 'Analyze historical spend', desc: 'to establish baseline target pricing' },
          { title: 'Generate counter-offers', desc: 'using market benchmarks and leverage' },
          { title: 'Draft and send emails', desc: 'directly to vendor sales reps' }
        ],
        tabs: ['Active Tasks', 'Savings Realized', 'Counter-offers'],
        items: [
          { id: 1, title: 'Acme Corp Renewal', metric: 'Waiting...', progress: '0%' },
          { id: 2, title: 'Globex Bulk Order', metric: 'Waiting...', progress: '0%' },
          { id: 3, title: 'Stark Logistics SLA', metric: 'Waiting...', progress: '0%' }
        ]
      };
    } else {
      return {
        name: 'Garuda', role: 'The Tracker', tag: 'STAGE 4 • OPERATIONS',
        purpose: 'Watches your POs and invoices like a hawk to ensure timely delivery and exact matching.',
        tasks: [
          { title: 'Monitor ERP sync', desc: 'for all approved Purchase Orders' },
          { title: 'Track live delivery status', desc: 'and ping suppliers if delayed' },
          { title: 'Perform 3-way match', desc: 'between PO, GRN, and Invoice' }
        ],
        tabs: ['Active Tasks', 'Invoice Matches', 'Risk Alerts'],
        items: [
          { id: 1, title: 'PO-9921 (Acme)', metric: 'Waiting...', progress: '0%' },
          { id: 2, title: 'PO-9922 (Globex)', metric: 'Waiting...', progress: '0%' },
          { id: 3, title: 'PO-9925 (Stark)', metric: 'Waiting...', progress: '0%' }
        ]
      };
    }
  };

  const data = getAgentData();

  const handleRunTask = (itemId: number) => {
    if (processingItems[itemId]) return;
    
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    setItemProgress(prev => ({ ...prev, [itemId]: '10%' }));
    setTaskSteps({ 0: 1, 1: 0, 2: 0 }); // Task 0 is running

    setTimeout(() => {
      setItemProgress(prev => ({ ...prev, [itemId]: '40%' }));
      setTaskSteps({ 0: 2, 1: 1, 2: 0 }); // Task 0 done, Task 1 running
      
      setTimeout(() => {
        setItemProgress(prev => ({ ...prev, [itemId]: '75%' }));
        setTaskSteps({ 0: 2, 1: 2, 2: 1 }); // Task 1 done, Task 2 running
        
        setTimeout(() => {
          setItemProgress(prev => ({ ...prev, [itemId]: '100%' }));
          setTaskSteps({ 0: 2, 1: 2, 2: 2 }); // All done
          setProcessingItems(prev => ({ ...prev, [itemId]: false }));
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const getEmoji = (name: string) => {
    if(name === 'Anveshan') return '🔎';
    if(name === 'Tark') return '🧠';
    if(name === 'Niti') return '♟️';
    return '🦅';
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.3s ease', zIndex: 99999
        }}
      />
      
      <div style={{
        position: 'fixed', top: '5%', left: '50%', transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 40px)',
        width: '90%', maxWidth: '1100px', height: '90%', 
        backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        borderRadius: '16px', border: '1px solid #e2e8f0',
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100000, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div style={{ 
          padding: '32px 40px', borderBottom: '1px solid #f1f5f9', 
          backgroundColor: '#fff', position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '16px', 
              backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', fontSize: '40px'
            }}>
              {getEmoji(data.name)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{data.name}</h1>
              </div>
              <p style={{ fontSize: '1.05rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                {data.purpose}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <button onClick={onClose} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
              <X size={20} />
            </button>
            <div style={{ 
              padding: '6px 16px', borderRadius: '20px', 
              backgroundColor: '#eff6ff', color: '#3b82f6', 
              border: '1px solid #bfdbfe', fontSize: '0.75rem', 
              fontWeight: 700, letterSpacing: '1px', whiteSpace: 'nowrap' 
            }}>
              {data.tag}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          
          <div style={{ width: '340px', borderRight: '1px solid #f1f5f9', padding: '40px', backgroundColor: '#fff', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '16px' }}>
              <Zap size={14} fill="currentColor" /> PURPOSE
            </div>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6, marginBottom: '40px' }}>
              {data.purpose}
            </p>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '24px' }}>
              LIVE TASK PLAN
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '24px', width: '2px', backgroundColor: '#f1f5f9' }} />
              
              {data.tasks.map((task, idx) => {
                const status = taskSteps[idx] || 0; // 0=pending, 1=running, 2=done
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                    
                    {/* Status Icon */}
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      backgroundColor: status === 2 ? '#22c55e' : status === 1 ? '#3b82f6' : '#fff', 
                      border: `2px solid ${status === 2 ? '#22c55e' : status === 1 ? '#3b82f6' : '#cbd5e1'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: status > 0 ? '#fff' : '#94a3b8', fontSize: '0.6rem', fontWeight: 800, marginTop: '0px',
                      transition: 'all 0.3s'
                    }}>
                      {status === 2 ? <CheckCircle2 size={14} /> : status === 1 ? <Loader2 size={14} className="animate-spin" /> : (idx + 1)}
                    </div>

                    <div>
                      <div style={{ 
                        fontSize: '0.95rem', fontWeight: 600, 
                        color: status === 1 ? '#3b82f6' : status === 2 ? '#0f172a' : '#64748b', 
                        marginBottom: '4px', transition: 'color 0.3s'
                      }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{task.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, padding: '40px', backgroundColor: 'transparent', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
              {data.tabs.map((tab, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 20px', borderRadius: '24px',
                    fontSize: '0.85rem', fontWeight: i === 0 ? 600 : 500,
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {activeTab} • QUEUE
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                {data.items.length} assets
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.items.map((item) => {
                const isProcessing = processingItems[item.id];
                const progress = itemProgress[item.id] || item.progress;
                const isDone = progress === '100%';

                return (
                  <div key={item.id} style={{ 
                    backgroundColor: '#fff', border: isProcessing ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                    borderRadius: '12px', padding: '20px 24px', position: 'relative', overflow: 'hidden',
                    boxShadow: isProcessing ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        
                        {!isProcessing && !isDone && (
                          <button 
                            onClick={() => handleRunTask(item.id)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', 
                              borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, 
                              border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseOut={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
                          >
                            <Play size={12} fill="currentColor" /> Run Agent
                          </button>
                        )}

                        {(isProcessing || isDone) && (
                          <span style={{ fontSize: '0.85rem', color: isDone ? '#22c55e' : '#3b82f6', fontWeight: 600 }}>
                            {isDone ? 'Task Complete' : 'Processing...'}
                          </span>
                        )}

                        {isDone && (
                          <span style={{ padding: '4px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: progress, height: '100%', 
                        backgroundColor: isDone ? '#22c55e' : '#3b82f6', 
                        borderRadius: '3px', transition: 'width 0.5s ease-out, background-color 0.3s' 
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
