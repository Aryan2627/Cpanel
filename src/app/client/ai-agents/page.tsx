"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Zap, CheckCircle2, AlertCircle, Sparkles, User, ShieldCheck, Terminal, Target, TrendingDown, Settings2, Plus, X, Activity, Cpu } from 'lucide-react';

export default function AIAgentsPage() {
  const [messages, setMessages] = useState([
    { sender: 'vendor', text: "We've reviewed the specs. We can do $45,000 for the Q4 shipment, but that's our bottom line.", time: '10:42:04 AM' }
  ]);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [vendorTyping, setVendorTyping] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, logs, analyzing, vendorTyping]);


  const [inputText, setInputText] = useState("");
  const [started, setStarted] = useState(false);

  // Trigger the AI to respond to the very first vendor message on load
  useEffect(() => {
    if (!started && messages.length === 1) {
      setStarted(true);
      handleAgentTurn(messages);
    }
  }, [messages, started]);

  const handleAgentTurn = async (currentMessages: any[]) => {
    setAnalyzing(true);
    setLogs(["> INITIALIZING STRATEGY ENGINE...", "> ANALYZING VENDOR MARGIN HISTORY...", "> EXECUTING LLM INFERENCE..."]);
    
    try {
      const apiMessages = currentMessages.map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));
      
      const res = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        let replyText = data.reply;
        let isClosed = false;
        
        if (replyText.includes("CONTRACT SECURED")) {
          isClosed = true;
          replyText = replyText.replace("CONTRACT SECURED", "").trim();
        }
        
        setMessages(prev => [...prev, { sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        if (isClosed) setClosed(true);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }
    setAnalyzing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || analyzing || closed) return;
    
    const newMsg = { sender: 'vendor', text: inputText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");
    
    handleAgentTurn(updatedMessages);
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
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderLeft: '4px solid #8b5cf6', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>Q4 Raw Steel</h4>
                <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6', animation: 'pulse 2s infinite' }}></div> Live
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '12px' }}>
                <Cpu size={12} /> Model: &alpha;-Strike v4
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                <div style={{ background: '#fff', borderRadius: '6px', padding: '8px', border: '1px solid var(--surface-border)' }}>
                  <span style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target</span>
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-primary)' }}>$40,000</span>
                </div>
                <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: '6px', padding: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <span style={{ display: 'block', color: '#8b5cf6', marginBottom: '4px' }}>Status</span>
                  <span style={{ fontWeight: 'bold', color: '#6d28d9' }}>Round 2</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', opacity: 0.6, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>Office Hardware</h4>
                <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '4px 8px', borderRadius: '12px' }}>Closed</span>
              </div>
              <div style={{ background: '#fff', borderRadius: '6px', padding: '8px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Secured</span>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--success-color)' }}>$12,400</span>
              </div>
            </div>
            
            <div style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', opacity: 0.6, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h4 style={{ fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, fontSize: '14px' }}>Logistics Contract</h4>
                <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '4px 8px', borderRadius: '12px' }}>Closed</span>
              </div>
              <div style={{ background: '#fff', borderRadius: '6px', padding: '8px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Secured</span>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--success-color)' }}>$1.11M</span>
              </div>
            </div>
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
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: 'var(--success-color)', borderRadius: '50%', border: '2px solid #020617' }}></div>
              </div>
              <div>
                <h3 style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ProcGen Agent &alpha;
                  {analyzing && <Sparkles size={14} color="#8b5cf6" className="pulse-anim" />}
                </h3>
                <p style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={12} color="var(--success-color)" /> Authorized Limit: <span style={{ color: 'var(--success-color)' }}>$42,000</span>
                </p>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div ref={chatRef} style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', flexDirection: m.sender === 'ai' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', background: m.sender === 'ai' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : '#334155', border: m.sender === 'ai' ? 'none' : '1px solid #475569' }}>
                  {m.sender === 'ai' ? <Bot size={18} /> : <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#cbd5e1' }}>V</span>}
                </div>
                <div style={{ maxWidth: '80%', padding: '16px', borderRadius: '16px', borderTopLeftRadius: m.sender === 'ai' ? '16px' : '4px', borderTopRightRadius: m.sender === 'ai' ? '4px' : '16px', background: m.sender === 'ai' ? '#1e1b4b' : '#1e293b', border: m.sender === 'ai' ? '1px solid rgba(139,92,246,0.3)' : '1px solid #334155', color: '#f1f5f9', boxShadow: m.sender === 'ai' ? '0 10px 15px -3px rgba(139,92,246,0.1)' : 'none' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{m.text}</p>
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
                    <Terminal size={12} /> execution_trace.log
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--success-color)', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {logs.map((log, i) => (
                       <div key={i} className="animate-fade-in">{log}</div>
                    ))}
                    <div className="pulse-anim">_</div>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Typing Indicator */}
            {vendorTyping && (
               <div style={{ display: 'flex', gap: '16px' }}>
                 <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#334155', border: '1px solid #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                   <span style={{ fontWeight: 'bold', fontSize: '14px' }}>V</span>
                 </div>
                 <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', borderTopLeftRadius: '4px', padding: '16px', display: 'flex', alignItems: 'center', gap: '6px', width: '70px' }}>
                   <div style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></div>
                   <div style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></div>
                   <div style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                 </div>
               </div>
            )}
          </div>

          {/* Footer Controls */}
          <div style={{ padding: '20px', background: '#020617', borderTop: '1px solid #1e293b', zIndex: 10 }}>
             {closed ? (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    placeholder="Type as the Vendor..." 
                    disabled={analyzing}
                    style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                  />
                  <button type="submit" disabled={analyzing} style={{ background: analyzing ? '#334155' : 'var(--accent-color)', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                    {analyzing ? 'AI Thinking...' : 'Send'}
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
                  <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>$40,000</p>
                </div>
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', border: '1px solid var(--surface-border)' }}>
                  <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Authorized Limit</p>
                  <p style={{ fontSize: '24px', fontFamily: 'monospace', fontWeight: '900', color: '#94a3b8', margin: 0 }}>$42,000</p>
                </div>
                <div style={{ background: 'var(--bg-color)', borderRadius: '12px', padding: '16px', border: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>Market Sentiment</p>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--success-color)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingDown size={14} /> Softening (-4.2%)
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
                    <span style={{ color: '#8b5cf6', fontFamily: 'monospace', fontWeight: 'bold' }}>COLLABORATIVE</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', width: '40%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', fontSize: '10px', letterSpacing: '0.05em' }}>Patience Limit</span>
                    <span style={{ color: '#8b5cf6', fontFamily: 'monospace', fontWeight: 'bold' }}>HIGH (24H)</span>
                  </div>
                  <div style={{ height: '6px', width: '100%', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', width: '80%' }}></div>
                  </div>
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--surface-border)' }}>
                   <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px' }}>Allowed Concessions</p>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                     <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', border: '1px solid rgba(16,185,129,0.2)' }}>PAYMENT_TERMS</span>
                     <span style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success-color)', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', border: '1px solid rgba(16,185,129,0.2)' }}>DELIVERY_DATE</span>
                     <span style={{ background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.5)', padding: '6px 12px', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', border: '1px solid rgba(239,68,68,0.2)', textDecoration: 'line-through' }}>QTY_LIMITS</span>
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
        @keyframes bounce {
          0%, 100% { transform: scale(0); }
          50% { transform: scale(1); }
        }
      `}} />
    </div>
  );
}
