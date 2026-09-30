'use client';
import React, { useState, useEffect } from 'react';
import { X, Search, Activity, Handshake, Shield, Bot, Send, ArrowRight } from 'lucide-react';

interface AgentPanelProps {
  agentName: string | null;
  onClose: () => void;
}

export default function AgentPanel({ agentName, onClose }: AgentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (agentName) {
      setIsOpen(true);
      setMessages([
        { role: 'ai', content: `Hello! I am your ${agentName}. How can I assist you with your procurement tasks today?` }
      ]);
    } else {
      setIsOpen(false);
    }
  }, [agentName]);

  const getAgentColor = () => {
    switch (agentName) {
      case 'Procurement Agent': return '#3b82f6';
      case 'Sourcing Agent': return '#6366f1';
      case 'Negotiation Agent': return '#10b981';
      case 'Operations Agent': return '#f59e0b';
      default: return '#334155';
    }
  };

  const getAgentIcon = () => {
    switch (agentName) {
      case 'Procurement Agent': return <Search size={20} />;
      case 'Sourcing Agent': return <Activity size={20} />;
      case 'Negotiation Agent': return <Handshake size={20} />;
      case 'Operations Agent': return <Shield size={20} />;
      default: return <Bot size={20} />;
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: `I have received your request regarding "${input}". I am processing it now...` }]);
    }, 800);
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
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px', maxWidth: '100vw',
        backgroundColor: '#fff', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 100000, display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ 
          padding: '24px', borderBottom: '1px solid #e2e8f0', 
          backgroundColor: getAgentColor(), color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getAgentIcon()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{agentName}</h2>
              <div style={{ fontSize: '0.85rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span> Online & Ready
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex' }} onMouseOver={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.backgroundColor='transparent'}>
            <X size={24} />
          </button>
        </div>
        {agentName === 'Negotiation Agent' && isOpen && (
          <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Context</div>
            <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>Vendor: Acme Corp (PO-9921)</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Current Quote: $45,000</div>
              </div>
              <button style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>View Contract</button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#f8fafc' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ 
                maxWidth: '85%', padding: '16px', borderRadius: '16px',
                backgroundColor: m.role === 'user' ? getAgentColor() : '#fff',
                color: m.role === 'user' ? '#fff' : '#334155',
                border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                borderTopRightRadius: m.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: m.role === 'user' ? '16px' : '4px',
                lineHeight: '1.5', fontSize: '0.95rem'
              }}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask your agent..." 
              style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', backgroundColor: '#f8fafc' }} 
            />
            <button type="submit" style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: getAgentColor(), color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <Send size={20} />
            </button>
          </form>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '20px', whiteSpace: 'nowrap', cursor: 'pointer' }}>Generate savings report</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '20px', whiteSpace: 'nowrap', cursor: 'pointer' }}>Suggest counter-offer</span>
          </div>
        </div>
      </div>
    </>
  );
}
