'use client';
import { useState, useEffect, useRef } from 'react';
import { BrainCircuit, X, Zap, Loader2, Database, Send, Terminal, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ToolCall {
  step: number;
  action: string;
  message?: string;
  tool?: string;
  args?: any;
  result?: string;
}

export default function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string}[]>([
    { role: 'agent', content: 'Hello. I am ProcGen Cortex, your autonomous AI agent. Try asking me to "check laptop inventory and reorder".' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user info on mount to customize responses
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) {
          setUserName(data.name);
          // Update the initial greeting if desired, or just pass it in requests
          setMessages([
            { role: 'agent', content: `Hello ${data.name.split(' ')[0]}. I am ProcGen Cortex, your autonomous AI agent. Try asking me to "check laptop inventory and reorder".` }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolCalls]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userPrompt = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsProcessing(true);
    setToolCalls([]);

    try {
      const res = await fetch('/api/ai/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, userName })
      });
      
      const data = await res.json();
      
      if (data.agentic_loop && data.agentic_loop.length > 0) {
        // Simulate execution delay for each step
        for (let i = 0; i < data.agentic_loop.length; i++) {
          await new Promise(r => setTimeout(r, 1200));
          setToolCalls(prev => [...prev, data.agentic_loop[i]]);
        }
      }
      
      await new Promise(r => setTimeout(r, 1000));
      setMessages(prev => [...prev, { role: 'agent', content: data.final_response }]);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Connection to Cortex Core failed.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '30px', right: '30px',
          width: '64px', height: '64px',
          backgroundColor: '#0f172a',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 999999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.3), inset 0 0 0 2px #38bdf8',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        <BrainCircuit color="#38bdf8" size={32} />
      </div>

      {/* Cortex Panel */}
      <div style={{
        position: 'fixed',
        bottom: isOpen ? '110px' : '-800px',
        right: '30px',
        width: '400px',
        height: '600px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999998,
        transition: 'bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, letterSpacing: '0.5px' }}>ProcGen Cortex</span>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Chat / Tool Output Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ 
                background: msg.role === 'user' ? '#0f172a' : '#ffffff', 
                color: msg.role === 'user' ? '#fff' : '#1e293b',
                padding: '12px 16px', 
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
                boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                fontSize: '0.9rem', lineHeight: '1.5'
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Active Tool Calls Visualization */}
          {toolCalls.length > 0 && (
            <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'flex-start', width: '100%' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={12} /> Agentic Execution Trace
              </div>
              
              {toolCalls.map((tc, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', fontFamily: 'monospace', background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {tc.action === 'THINKING' ? (
                    <div style={{ color: '#64748b' }}>{tc.message}</div>
                  ) : (
                    <div>
                      <div style={{ color: '#0284c7', fontWeight: 'bold' }}>&gt; {tc.tool}({JSON.stringify(tc.args)})</div>
                      <div style={{ color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <CheckCircle2 size={12} style={{ marginTop: '2px', flexShrink: 0 }} /> {tc.result}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b', padding: '4px' }}>
                  <Loader2 size={14} className="animate-spin" /> Cortex is working...
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask Cortex to execute a workflow..."
              disabled={isProcessing}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.9rem', background: isProcessing ? '#f8fafc' : '#fff' }}
            />
            <button 
              type="submit" 
              disabled={isProcessing || !inputText.trim()}
              style={{ width: '42px', height: '42px', borderRadius: '50%', background: inputText.trim() && !isProcessing ? '#0f172a' : '#cbd5e1', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() && !isProcessing ? 'pointer' : 'default', transition: 'background 0.2s' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}