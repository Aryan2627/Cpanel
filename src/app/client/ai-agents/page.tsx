"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Zap, CheckCircle2, AlertCircle, Sparkles, User, ShieldCheck, Terminal, Target, TrendingDown, Settings2, Plus, X, Activity, Cpu } from 'lucide-react';

type Message = { sender: 'ai' | 'vendor', text: string, time: string };

type Session = {
  id: string;
  name: string;
  status: 'Live' | 'Closed';
  model: string;
  target: number;
  limit: number;
  vendorInitial: number;
  concessions: string[];
  messages: Message[];
  closed: boolean;
  logs: string[];
  sentiment: string;
  sentimentColor: string;
};

export default function AIAgentsPage() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'n1',
      name: 'Q4 Raw Steel',
      status: 'Live',
      model: 'α-Strike v4 (Nemotron)',
      target: 40000,
      limit: 42000,
      vendorInitial: 45000,
      concessions: ['Net-15 Payment Terms'],
      messages: [
        { sender: 'vendor', text: "We've reviewed the specs. We can do $45,000 for the Q4 shipment, but that's our bottom line.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ],
      closed: false,
      logs: [],
      sentiment: 'Softening (-4.2%)',
      sentimentColor: 'var(--success-color)'
    },
    {
      id: 'n2',
      name: 'Enterprise Laptops (x500)',
      status: 'Live',
      model: 'β-Logic v2 (Nemotron)',
      target: 800000,
      limit: 850000,
      vendorInitial: 950000,
      concessions: ['Flexible Delivery Date', 'Bulk Shipping'],
      messages: [
        { sender: 'vendor', text: "For 500 ThinkPads, our best price is $950,000 including priority shipping.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ],
      closed: false,
      logs: [],
      sentiment: 'High Demand (+2.1%)',
      sentimentColor: 'var(--warning-color)'
    },
    {
      id: 'n3',
      name: 'Office Hardware',
      status: 'Closed',
      model: 'γ-Rapid v1',
      target: 13000,
      limit: 15000,
      vendorInitial: 16000,
      concessions: [],
      messages: [{ sender: 'ai', text: "CONTRACT SECURED", time: 'Yesterday' }],
      closed: true,
      logs: [],
      sentiment: 'Stable',
      sentimentColor: 'var(--text-secondary)'
    }
  ]);

  const [activeId, setActiveId] = useState('n1');
  const [inputText, setInputText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  
  const activeSession = sessions.find(s => s.id === activeId)!;

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [activeSession.messages, activeSession.logs, analyzing]);

  // Initial trigger for live sessions that only have 1 message
  useEffect(() => {
    const session = sessions.find(s => s.id === activeId);
    if (session && !session.closed && session.messages.length === 1 && !analyzing) {
      handleAgentTurn(session.messages, session);
    }
  }, [activeId]);

  const updateSession = (id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleAgentTurn = async (currentMessages: Message[], session: Session) => {
    setAnalyzing(true);
    updateSession(session.id, { logs: ["> INITIALIZING STRATEGY ENGINE...", "> ANALYZING VENDOR MARGIN HISTORY...", "> EXECUTING LLM INFERENCE..."] });
    
    try {
      const apiMessages = currentMessages.map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));
      
      const context = {
        productName: session.name,
        targetPrice: session.target,
        maxPrice: session.limit,
        concessions: session.concessions,
        vendorInitialOffer: session.vendorInitial
      };
      
      const res = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        let replyText = data.reply;
        let isClosed = false;
        
        if (replyText.includes("CONTRACT SECURED")) {
          isClosed = true;
          replyText = replyText.replace("CONTRACT SECURED", "").trim();
        }
        
        const aiMessage = { sender: 'ai' as const, text: replyText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
        
        setSessions(prev => prev.map(s => {
          if (s.id === session.id) {
            return { 
              ...s, 
              messages: [...s.messages, aiMessage], 
              closed: isClosed, 
              status: isClosed ? 'Closed' : 'Live' 
            };
          }
          return s;
        }));
      }
    } catch (err) {
      console.error(err);
      const errMsg = { sender: 'ai' as const, text: "Error connecting to AI.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      updateSession(session.id, { messages: [...session.messages, errMsg] });
    }
    setAnalyzing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || analyzing || activeSession.closed) return;
    
    const newMsg = { sender: 'vendor' as const, text: inputText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const updatedMessages = [...activeSession.messages, newMsg];
    
    updateSession(activeId, { messages: updatedMessages });
    setInputText("");
    
    handleAgentTurn(updatedMessages, activeSession);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Cpanel Native Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Bot size={24} />
          </div>
          <div>
            <h1 className="page-title">AI Negotiators</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Monitor and deploy autonomous negotiation agents.</p>
          </div>
        </div>
        <button onClick={() => setShowDeployModal(true)} style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s' }}>
          <Plus size={18} /> Deploy Agent
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginTop: '24px' }}>
        
        {/* Left Sidebar: Active Nodes */}
        <div className="surface" style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', height: '700px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px' }}>
            <Activity size={16} color="var(--success-color)" /> Active Nodes
          </h3>
          
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map(s => (
              <div 
                key={s.id}
                onClick={() => setActiveId(s.id)}
                style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: activeId === s.id ? (s.closed ? 'rgba(16,185,129,0.05)' : 'rgba(139, 92, 246, 0.05)') : 'var(--bg-color)', 
                  border: activeId === s.id ? (s.closed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(139, 92, 246, 0.2)') : '1px solid var(--surface-border)', 
                  borderLeft: activeId === s.id ? (s.closed ? '4px solid var(--success-color)' : '4px solid #8b5cf6') : '4px solid transparent', 
                  cursor: 'pointer',
                  opacity: s.closed && activeId !== s.id ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>{s.name}</h4>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase', 
                    background: s.closed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)', 
                    color: s.closed ? 'var(--success-color)' : '#8b5cf6', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}>
                    {!s.closed && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', animation: 'pulse 2s infinite' }}></div>}
                    {s.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '12px' }}>
                  <Cpu size={12} /> Model: {s.model}
                </div>
                {s.closed ? (
                  <div style={{ background: '#fff', borderRadius: '6px', padding: '8px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Final Status</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>Secured</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div style={{ background: '#fff', borderRadius: '6px', padding: '8px', border: '1px solid var(--surface-border)' }}>
                      <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px' }}>Limit</span>
                      <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-primary)' }}>${s.limit.toLocaleString()}</span>
                    </div>
                    <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: '6px', padding: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                      <span style={{ display: 'block', color: '#8b5cf6', marginBottom: '4px' }}>Rounds</span>
                      <span style={{ fontWeight: 'bold', color: '#6d28d9' }}>{Math.floor(s.messages.length / 2) + 1}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Live Negotiation View */}
        <div style={{ gridColumn: 'span 6', display: 'flex', flexDirection: 'column', height: '700px', borderRadius: '16px', border: '1px solid #1e293b', background: '#0f172a', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          
          {/* Terminal Header */}
          <div style={{ background: '#020617', padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Bot size={20} />
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: activeSession.closed ? '#64748b' : 'var(--success-color)', borderRadius: '50%', border: '2px solid #020617' }}></div>
              </div>
              <div>
                <h3 style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ProcGen Agent {activeSession.id === 'n1' ? 'α' : activeSession.id === 'n2' ? 'β' : 'γ'} ({activeSession.name})
                  {analyzing && <Sparkles size={14} color="#8b5cf6" className="pulse-anim" />}
                </h3>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={12} color="var(--success-color)" /> Authorized Limit: <span style={{ color: 'var(--success-color)' }}>${activeSession.limit.toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div ref={chatRef} style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            
            {activeSession.messages.map((m, i) => (
              <div key={i} className="animate-fade-in" style={{ display: 'flex', gap: '16px', flexDirection: m.sender === 'ai' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', background: m.sender === 'ai' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : '#334155', border: m.sender === 'ai' ? 'none' : '1px solid #475569' }}>
                  {m.sender === 'ai' ? <Bot size={18} /> : <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#cbd5e1' }}>V</span>}
                </div>
                <div style={{ maxWidth: '80%', padding: '16px', borderRadius: '16px', borderTopLeftRadius: m.sender === 'ai' ? '16px' : '4px', borderTopRightRadius: m.sender === 'ai' ? '4px' : '16px', background: m.sender === 'ai' ? '#1e1b4b' : '#1e293b', border: m.sender === 'ai' ? '1px solid rgba(139,92,246,0.3)' : '1px solid #334155', color: '#f1f5f9', boxShadow: m.sender === 'ai' ? '0 10px 15px -3px rgba(139,92,246,0.1)' : 'none' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                  <p style={{ fontSize: '10px', marginTop: '12px', fontFamily: 'monospace', textAlign: m.sender === 'ai' ? 'right' : 'left', color: m.sender === 'ai' ? '#c4b5fd' : '#94a3b8' }}>{m.time}</p>
                </div>
              </div>
            ))}

            {/* Hacker Terminal Logs */}
            {analyzing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '52px', paddingLeft: '52px' }}>
                <div style={{ background: '#020617', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', width: '100%', maxWidth: '90%', boxShadow: '0 0 20px rgba(16,185,129,0.05)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, var(--success-color), transparent)', opacity: 0.5 }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '8px', color: 'rgba(16,185,129,0.7)', fontSize: '11px', fontFamily: 'monospace' }}>
                    <Terminal size={12} /> {activeSession.id}_execution_trace.log
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--success-color)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {activeSession.logs.map((log, i) => (
                       <div key={i} className="animate-fade-in">{log}</div>
                    ))}
                    <div className="pulse-anim">_</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div style={{ padding: '20px', background: '#020617', borderTop: '1px solid #1e293b', zIndex: 10 }}>
             {activeSession.closed ? (
                <div className="animate-fade-in" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <CheckCircle2 size={20} color="var(--success-color)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: 'var(--success-color)', fontSize: '14px', letterSpacing: '0.05em', margin: 0 }}>CONTRACT SECURED</p>
                      <p style={{ color: 'rgba(16,185,129,0.7)', fontSize: '12px', fontFamily: 'monospace', margin: '4px 0 0 0' }}>Autonomously locked via NVIDIA Nemotron.</p>
                    </div>
                  </div>
                  <button style={{ background: 'var(--success-color)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}>
                    Review PO
                  </button>
                </div>
             ) : (
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Type as the Vendor for ${activeSession.name}...`}
                    disabled={analyzing}
                    style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                  />
                  <button type="submit" disabled={analyzing} style={{ background: analyzing ? '#334155' : 'var(--accent-color)', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                    {analyzing ? 'Thinking...' : 'Send'}
                  </button>
                </form>
             )}
          </div>
        </div>

        {/* Right Sidebar: Telemetry */}
        <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {/* Telemetry Card */}
           <div className="surface" style={{ position: 'relative', overflow: 'hidden' }}>
             <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px' }}>
               <Target size={14} color="var(--success-color)" /> Telemetry Data
             </h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10 }}>
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', border: '1px solid var(--surface-border)' }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Target Price</p>
                  <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>${activeSession.target.toLocaleString()}</p>
                </div>
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', border: '1px solid var(--surface-border)' }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Authorized Limit</p>
                  <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: '900', color: '#94a3b8', margin: 0 }}>${activeSession.limit.toLocaleString()}</p>
                </div>
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Market Sentiment</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: activeSession.sentimentColor, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingDown size={14} /> {activeSession.sentiment}
                    </p>
                  </div>
                </div>
             </div>
           </div>

           {/* Settings Card */}
           <div className="surface" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
             <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px' }}>
               <Settings2 size={14} color="#8b5cf6" /> Guardrails
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '10px', letterSpacing: '0.05em' }}>Aggression</span>
                    <span style={{ color: '#8b5cf6', fontFamily: 'monospace', fontWeight: 'bold' }}>{activeSession.id === 'n2' ? 'AGGRESSIVE' : 'COLLABORATIVE'}</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                    <div style={{ height: '100%', background: activeSession.id === 'n2' ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #8b5cf6, #d946ef)', width: activeSession.id === 'n2' ? '90%' : '40%' }}></div>
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
                   <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px' }}>Allowed Concessions</p>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                     {activeSession.concessions.map((c, idx) => (
                        <span key={idx} style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', border: '1px solid rgba(16,185,129,0.2)' }}>{c}</span>
                     ))}
                     {activeSession.concessions.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>None permitted.</span>}
                   </div>
                </div>
             </div>
           </div>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-anim {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse-anim { animation: pulse-anim 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
    </div>
  );
}
