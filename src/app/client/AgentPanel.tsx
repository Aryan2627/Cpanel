'use client';
import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';

interface AgentPanelProps {
  agentName: string | null;
  onClose: () => void;
}

export default function AgentPanel({ agentName, onClose }: AgentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Active Tasks');

  useEffect(() => {
    if (agentName) {
      setIsOpen(true);
      setActiveTab('Active Tasks');
    } else {
      setIsOpen(false);
    }
  }, [agentName]);

  // Mock Data based on the agent
  const getAgentData = () => {
    if (agentName === 'Procurement Agent') {
      return {
        name: 'Anveshan',
        role: 'The Discoverer',
        tag: 'STAGE 1 • DISCOVERY',
        purpose: 'Scours global databases to find exactly what you need based on unstructured requirements.',
        tasks: [
          { title: 'Parse incoming requisitions', desc: 'across all departments and cost centers' },
          { title: 'Identify capable suppliers', desc: 'by category, compliance score, and region' },
          { title: 'Rank by qualification score', desc: 'and assign outreach priority' }
        ],
        tabs: ['Active Tasks', 'Market Intelligence', 'Risk Reports'],
        items: [
          { title: 'Acme Corp Profile', metric: '94% Match', pill: 'Gold Tier ↑', progress: '85%' },
          { title: 'Globex Industrial', metric: '88% Match', progress: '69%' },
          { title: 'Stark Manufacturing', metric: '82% Match', progress: '54%' },
          { title: 'Wayne Enterprises', metric: '76% Match', progress: '41%' }
        ]
      };
    } else if (agentName === 'Sourcing Agent') {
      return {
        name: 'Tark',
        role: 'The Analyst',
        tag: 'STAGE 2 • ANALYTICAL',
        purpose: 'Crunches the numbers to find the best total-cost trade-offs and normalizes quotes.',
        tasks: [
          { title: 'Extract pricing from PDFs', desc: 'across all incoming vendor quotes' },
          { title: 'Normalize line items', desc: 'by unit, currency, and MOQ' },
          { title: 'Rank by total cost', desc: 'including freight and payment terms' }
        ],
        tabs: ['Active Tasks', 'Cost Breakdowns', 'Anomalies'],
        items: [
          { title: 'quote_acme_v2.pdf', metric: '100% Extracted', pill: 'Verified', progress: '100%' },
          { title: 'globex_pricing_2026.xlsx', metric: '98% Extracted', progress: '98%' },
          { title: 'stark_initial_bid.pdf', metric: '92% Extracted', progress: '92%' },
          { title: 'email_wayne_offer.msg', metric: '85% Extracted', progress: '85%' }
        ]
      };
    } else if (agentName === 'Negotiation Agent') {
      return {
        name: 'Niti',
        role: 'The Strategist',
        tag: 'STAGE 3 • EXECUTION',
        purpose: 'Pushes back on supplier pricing and secures optimal net-60 payment terms.',
        tasks: [
          { title: 'Analyze historical spend', desc: 'to establish baseline target pricing' },
          { title: 'Generate counter-offers', desc: 'using market benchmarks and leverage' },
          { title: 'Draft and send emails', desc: 'directly to vendor sales reps' }
        ],
        tabs: ['Active Tasks', 'Savings Realized', 'Counter-offers'],
        items: [
          { title: 'Acme Corp Renewal', metric: '₹1.2M Saved', pill: 'Closed Won', progress: '100%' },
          { title: 'Globex Bulk Order', metric: '₹450K Pending', progress: '70%' },
          { title: 'Stark Logistics SLA', metric: 'In Review', progress: '50%' }
        ]
      };
    } else {
      return {
        name: 'Garuda',
        role: 'The Tracker',
        tag: 'STAGE 4 • OPERATIONS',
        purpose: 'Watches your POs and invoices like a hawk to ensure timely delivery and exact matching.',
        tasks: [
          { title: 'Monitor ERP sync', desc: 'for all approved Purchase Orders' },
          { title: 'Track live delivery status', desc: 'and ping suppliers if delayed' },
          { title: 'Perform 3-way match', desc: 'between PO, GRN, and Invoice' }
        ],
        tabs: ['Active Tasks', 'Invoice Matches', 'Risk Alerts'],
        items: [
          { title: 'PO-9921 (Acme)', metric: 'On Time', pill: 'Matched', progress: '100%' },
          { title: 'PO-9922 (Globex)', metric: 'Delayed 2 Days', progress: '60%' },
          { title: 'PO-9925 (Stark)', metric: 'Invoice Mismatch', progress: '30%' }
        ]
      };
    }
  };

  const data = getAgentData();

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
      
      {/* Massive Centered Modal instead of Side Panel */}
      <div style={{
        position: 'fixed', top: '5%', left: '50%', transform: isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 40px)',
        width: '90%', maxWidth: '1100px', height: '90%', 
        backgroundColor: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        borderRadius: '16px', border: '1px solid #e2e8f0',
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100000, display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        
        {/* Subtle grid background applied to whole modal */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Header */}
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
              {data.name === 'Anveshan' ? '🔎' : data.name === 'Tark' ? '🧠' : data.name === 'Niti' ? '♟️' : '🦅'}
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

        {/* Body Split */}
        <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          
          {/* Left Panel */}
          <div style={{ width: '340px', borderRight: '1px solid #f1f5f9', padding: '40px', backgroundColor: '#fff', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '16px' }}>
              <Zap size={14} fill="currentColor" /> PURPOSE
            </div>
            <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.6, marginBottom: '40px' }}>
              {data.purpose}
            </p>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1.5px', marginBottom: '24px' }}>
              TASK PLAN
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '8px', top: '24px', bottom: '24px', width: '2px', backgroundColor: '#f1f5f9' }} />
              
              {data.tasks.map((task, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', 
                    backgroundColor: '#fff', border: '2px solid #3b82f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3b82f6', fontSize: '0.6rem', fontWeight: 800, marginTop: '2px'
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{task.title}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{task.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ flex: 1, padding: '40px', backgroundColor: 'transparent', overflowY: 'auto' }}>
            
            {/* Nav Pills */}
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

            {/* List Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.items.map((item, i) => (
                <div key={i} style={{ 
                  backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '20px 24px', position: 'relative', overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{item.metric}</span>
                      {item.pill && (
                        <span style={{ padding: '4px 12px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #fde68a' }}>
                          {item.pill}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: item.progress, height: '100%', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
