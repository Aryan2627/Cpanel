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
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string, uiComponent?: string, uiData?: any}[]>([
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
        body: JSON.stringify({ prompt: userPrompt, userName, history: messages.slice(-5) })
      });
      
      const data = await res.json();
      
      // Simulate brief thinking delay for UX
      await new Promise(r => setTimeout(r, 600));
      
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: data.final_response,
        uiComponent: data.ui_component,
        uiData: data.ui_data 
      }]);

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
                
                {msg.uiComponent === 'po_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((po: any) => (
                      <div key={po.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{po.poNumber}</div>
                        <div style={{ color: '#64748b', marginBottom: '8px' }}>{po.title || 'Standard Purchase Order'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ padding: '2px 8px', background: '#e0e7ff', color: '#3730a3', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                            {po.status}
                          </span>
                          <span style={{ fontWeight: 700, color: '#16a34a' }}>
                            ${po.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                      View All Orders
                    </button>
                  </div>
                )}

                {msg.uiComponent === 'pr_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((pr: any) => (
                      <div key={pr.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{pr.refId}</div>
                        <div style={{ color: '#64748b', marginBottom: '8px' }}>{pr.title || 'Purchase Request'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ padding: '2px 8px', background: '#fef3c7', color: '#d97706', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                            {pr.status}
                          </span>
                          <span style={{ fontWeight: 700, color: '#64748b' }}>
                            Qty: {pr.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                      View All Requests
                    </button>
                  </div>
                )}

                {msg.uiComponent === 'vendor_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((vendor: any) => (
                      <div key={vendor.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {vendor.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>{vendor.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Code: {vendor.vendorCode || 'N/A'}</div>
                        </div>
                        <span style={{ padding: '2px 8px', background: vendor.status === 'Approved' ? '#dcfce7' : '#fef3c7', color: vendor.status === 'Approved' ? '#16a34a' : '#d97706', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600 }}>
                          {vendor.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isProcessing && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ 
                background: '#ffffff', color: '#64748b', padding: '12px 16px', 
                borderRadius: '16px 16px 16px 4px', border: '1px solid #e2e8f0',
                fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Loader2 size={16} className="animate-spin" /> Cortex is thinking...
              </div>
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