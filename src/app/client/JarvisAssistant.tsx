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


const DocumentGeneratorForm = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [docType, setDocType] = useState('NDA');
  const [formData, setFormData] = useState<any>({});

  return (
    <div style={{ marginTop: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Select Document Type</label>
        <select value={docType} onChange={e => { setDocType(e.target.value); setFormData({}); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
          <option value="NDA">Non-Disclosure Agreement (NDA)</option>
          <option value="SOW">Statement of Work (SOW)</option>
          <option value="RFP">Request for Proposal (RFP)</option>
        </select>
      </div>
      
      {docType === 'NDA' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Vendor Legal Name</label>
            <input type="text" placeholder="e.g. Acme Corp LLC" onChange={e => setFormData({...formData, vendorName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Governing State / Jurisdiction</label>
            <input type="text" placeholder="e.g. Delaware" onChange={e => setFormData({...formData, jurisdiction: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
        </div>
      )}

      {docType === 'SOW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Project Name</label>
            <input type="text" placeholder="e.g. Q4 Cloud Migration" onChange={e => setFormData({...formData, projectName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Vendor</label>
              <input type="text" placeholder="e.g. TechFlow" onChange={e => setFormData({...formData, vendorName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Total Cost ($)</label>
              <input type="number" placeholder="e.g. 50000" onChange={e => setFormData({...formData, cost: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
            </div>
          </div>
        </div>
      )}

      {docType === 'RFP' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Project / RFP Title</label>
            <input type="text" placeholder="e.g. Global ERP Replacement" onChange={e => setFormData({...formData, projectName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>High-Level Requirements</label>
            <textarea rows={2} placeholder="Briefly describe what vendors need to supply..." onChange={e => setFormData({...formData, requirements: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', resize: 'none' }} />
          </div>
        </div>
      )}

      <button type="button" onClick={() => onSubmit({ type: docType, ...formData })} style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
        <Zap size={16} /> Generate Official Document
      </button>
    </div>
  );
};


const AgentSwarm = ({ data }: { data: any }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500); // Legal finishes
    const t2 = setTimeout(() => setStep(2), 3000); // Finance finishes
    const t3 = setTimeout(() => setStep(3), 4500); // Risk finishes
    const t4 = setTimeout(() => setStep(4), 5200); // Summary shows
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', width: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '16px', color: '#fff' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Multi-Agent Swarm</div>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{data.target}</div>
      </div>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.agents.map((agent: any, index: number) => {
          const isProcessing = step === index;
          const isDone = step > index;
          
          return (
            <div key={agent.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px', background: isDone ? '#f8fafc' : '#ffffff', border: '1px solid', borderColor: isDone ? '#e2e8f0' : (isProcessing ? '#3b82f6' : '#f1f5f9'), borderRadius: '8px', transition: 'all 0.3s' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isDone ? '#10b981' : (isProcessing ? '#3b82f6' : '#cbd5e1'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                {isDone ? <CheckCircle size={14} /> : (isProcessing ? <Loader2 size={14} className="animate-spin" /> : <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#fff'}} />)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{agent.name}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{agent.role}</div>
                </div>
                {isProcessing && <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '4px', animation: 'pulse 2s infinite' }}>Analyzing data...</div>}
                {isDone && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', borderLeft: '2px solid #cbd5e1', paddingLeft: '8px' }}>{agent.finding}</div>}
              </div>
            </div>
          );
        })}

        {step >= 4 && (
          <div style={{ marginTop: '8px', padding: '12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
            <AlertTriangle size={20} color="#e11d48" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9f1239' }}>{data.summary}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function JarvisAssistant() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', type: 'RFQ', quantity: '1', duration: '7', participants: 'all' });
    const [vendorForm, setVendorForm] = useState({ name: '', email: '', type: 'Supplier', city: '' });
    const [poForm, setPoForm] = useState({ title: '', amount: '' });
    const [productForm, setProductForm] = useState({ name: '', sku: '', price: '', category: '' });
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string, uiComponent?: string, uiData?: any}[]>([
    { role: 'agent', content: 'Hello. I am ProcGen Cortex, your autonomous AI agent. Try asking me to "check laptop inventory and reorder".' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [registeredVendors, setRegisteredVendors] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user info on mount to customize responses
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        const uName = (data && data.name) ? data.name : '';
        if (uName) setUserName(uName);
        
        // Fire Proactive Check in the background
        fetch('/api/ai/cortex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '/proactive-check', userName: uName, history: [] })
        })
        .then(res => res.json())
        .then(aiData => {
           setMessages([
             { role: 'agent', content: aiData.final_response }
           ]);
        })
        .catch(() => {});
      })
      .catch(() => {});
      
    fetch('/api/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRegisteredVendors(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolCalls]);

  
  const executeCommand = async (command: string) => {
    if (isProcessing) return;
    if (command.trim().toLowerCase() === '/clear') {
      setMessages([]);
      setInputText('');
      setShowSlashMenu(false);
      return;
    }
    
    let displayMessage = command;
    if (command.startsWith('/execute-create-event')) displayMessage = "Create this event for me.";
    if (command.startsWith('/execute-create-vendor')) displayMessage = "Onboard this new vendor.";
    if (command.startsWith('/execute-draft-po')) displayMessage = "Draft this purchase order.";
    if (command.startsWith('/execute-add-product')) displayMessage = "Add this product to the catalog.";
    if (command.startsWith('/execute-draft-document')) displayMessage = "Generate this document for me.";
      if (command.startsWith('/analyze-risk')) displayMessage = "Deploy an AI swarm to analyze this contract's risk profile.";
    
    setMessages(prev => [...prev, { role: 'user', content: displayMessage }]);

    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: command, userName, history: messages.slice(-5) })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'agent', content: data.final_response, uiComponent: data.ui_component, uiData: data.ui_data }]);
    } catch(err) {}
    setIsProcessing(false);
  };

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
          background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)',
          borderRadius: '50%',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.5)',
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
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', gap: '8px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : 'linear-gradient(135deg, #0f172a, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  {msg.role === 'user' ? 'ME' : 'AI'}
                </div>
                <div style={{ 
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : '#ffffff', 
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  padding: '12px 16px', 
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: msg.role === 'user' ? '0 4px 15px -3px rgba(37, 99, 235, 0.3)' : '0 4px 15px -3px rgba(0,0,0,0.05)',
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

                
                
                {msg.uiComponent === 'vendor_creation_form' && (
                  <div style={{ marginTop: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Vendor Name</label>
                      <input type="text" value={vendorForm.name} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Email</label>
                        <input type="email" value={vendorForm.email} onChange={e => setVendorForm({...vendorForm, email: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>City</label>
                        <input type="text" value={vendorForm.city} onChange={e => setVendorForm({...vendorForm, city: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                    <button onClick={() => executeCommand('/execute-create-vendor ' + JSON.stringify(vendorForm))} style={{ width: '100%', padding: '10px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} /> Onboard Vendor
                    </button>
                  </div>
                )}

                {msg.uiComponent === 'po_creation_form' && (
                  <div style={{ marginTop: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>PO Title / Description</label>
                      <input type="text" value={poForm.title} onChange={e => setPoForm({...poForm, title: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Total Amount</label>
                      <input type="number" value={poForm.amount} onChange={e => setPoForm({...poForm, amount: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    </div>
                    <button onClick={() => executeCommand('/execute-draft-po ' + JSON.stringify(poForm))} style={{ width: '100%', padding: '10px', background: '#ca8a04', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} /> Draft PO
                    </button>
                  </div>
                )}

                {msg.uiComponent === 'product_creation_form' && (
                  <div style={{ marginTop: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Product Name</label>
                      <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>SKU</label>
                        <input type="text" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Price</label>
                        <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      </div>
                    </div>
                    <button onClick={() => executeCommand('/execute-add-product ' + JSON.stringify(productForm))} style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} /> Add to Catalog
                    </button>
                  </div>
                )}

                
                
                {msg.uiComponent === 'agent_swarm' && msg.uiData && (
                    <div style={{ marginTop: '12px', width: '100%' }}>
                      <AgentSwarm data={msg.uiData} />
                    </div>
                  )}

                  {msg.uiComponent === 'document_generator_form' && (
                  <DocumentGeneratorForm onSubmit={(data) => executeCommand('/execute-draft-document ' + JSON.stringify(data))} />
                )}

                {msg.uiComponent === 'pdf_viewer' && msg.uiData && (
                  <div style={{ marginTop: '16px', width: '100%' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} color="#f59e0b" /> LIVE EDIT ENABLED: Click anywhere on the text below to edit
                    </div>
                    <div style={{ padding: '30px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', fontFamily: '"Times New Roman", Times, serif', color: '#000', fontSize: '0.95rem', lineHeight: '1.6', position: 'relative' }}>
                      <div 
                        id={`doc-edit-${i}`}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        style={{ outline: 'none', minHeight: '200px' }}
                        dangerouslySetInnerHTML={{ __html: msg.uiData.html }} 
                      />
                    </div>
                    <button type="button" onClick={() => {
                      const liveHtml = document.getElementById(`doc-edit-${i}`)?.innerHTML || msg.uiData.html;
                      const printWindow = window.open('', '', 'height=800,width=800');
                      if (printWindow) {
                        printWindow.document.write('<html><head><title>Legal Document</title>');
                        printWindow.document.write('<style>body { font-family: "Times New Roman", Times, serif; padding: 40px; color: #000; line-height: 1.6; }</style>');
                        printWindow.document.write('</head><body>');
                        printWindow.document.write(liveHtml);
                        printWindow.document.write('</body></html>');
                        printWindow.document.close();
                        printWindow.focus();
                        setTimeout(() => {
                          printWindow.print();
                          printWindow.close();
                        }, 250);
                      }
                    }} style={{ marginTop: '12px', width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} /> Download as PDF
                    </button>
                  </div>
                )}

                {msg.uiComponent === 'spend_report' && msg.uiData && (
                  <div style={{ marginTop: '12px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 600, letterSpacing: '1px' }}>ENTERPRISE SPEND DASHBOARD</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
                      ${(msg.uiData.totalSpend || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ACTIVE POS</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{msg.uiData.activePos}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ONBOARDED VENDORS</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{msg.uiData.activeVendors}</div>
                      </div>
                    </div>
                  </div>
                )}

                {msg.uiComponent === 'event_creation_form' && (
                    <div style={{ marginTop: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Product & Title</label>
                        <input type="text" placeholder="e.g. 50 Dell XPS Laptops" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Event Type</label>
                          <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                            <option>RFQ</option><option>Auction</option>
                          </select>
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Duration (Days)</label>
                          <input type="number" value={eventForm.duration} onChange={e => setEventForm({...eventForm, duration: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Quantity</label>
                          <input type="number" value={eventForm.quantity} onChange={e => setEventForm({...eventForm, quantity: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Vendors</label>
                          <select value={eventForm.participants} onChange={e => setEventForm({...eventForm, participants: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
                            <option value="all">Invite All Active</option>
                            <option value="top_rated">Top Rated Only</option>
                            {registeredVendors.map((v: any) => (
                              <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button type="button" onClick={() => executeCommand('/execute-create-event ' + JSON.stringify(eventForm))} style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} /> Launch Event Autonomously
                      </button>
                    </div>
                  )}

                {msg.uiComponent === 'event_list' && msg.uiData && (

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((ev: any) => (
                      <div key={ev.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{ev.refId}</div>
                        <div style={{ color: '#64748b', marginBottom: '8px' }}>{ev.title || 'Sourcing Event'}</div>
                        <span style={{ padding: '2px 8px', background: '#e0e7ff', color: '#3730a3', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>{ev.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'product_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((prod: any) => (
                      <div key={prod.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</div>
                        <div style={{ color: '#64748b' }}>Category: {prod.category || 'General'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'user_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((u: any) => (
                      <div key={u.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', background: '#cbd5e1', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.name}</div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{u.role || 'User'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'location_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((loc: any) => (
                      <div key={loc.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{loc.name || 'Location'}</div>
                        <div style={{ color: '#64748b' }}>{loc.city || 'N/A'} • {loc.type || 'Office'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'category_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((cat: any) => (
                      <div key={cat.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{cat.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Code: {cat.code || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'template_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((tpl: any) => (
                      <div key={tpl.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{tpl.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Type: {tpl.type || 'Form'}</div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'workflow_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((wf: any) => (
                      <div key={wf.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{wf.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Category: {wf.category || 'General'}</div>
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ padding: '2px 8px', background: wf.isActive ? '#dcfce7' : '#fee2e2', color: wf.isActive ? '#166534' : '#991b1b', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                            {wf.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'contract_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((c: any) => (
                      <div key={c.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{c.title || 'Software License Agreement'}</div>
                        <div style={{ color: '#64748b', marginBottom: '8px' }}>Vendor: {c.vendorName || 'N/A'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>
                            {c.status}
                          </span>
                          <span style={{ fontWeight: 700, color: '#64748b' }}>
                            ${(c.total || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'approval_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((app: any) => (
                      <div key={app.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fffbeb', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>Approval Required</div>
                        <div style={{ color: '#b45309', marginBottom: '8px' }}>Workflow ID: {app.workflowId}</div>
                        <button style={{ padding: '4px 12px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>Review Now</button>
                      </div>
                    ))}
                  </div>
                )}

                {msg.uiComponent === 'inventory_reorder' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{msg.uiData.productName}</div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem' }}>SKU: {msg.uiData.sku} • Category: Hardware</div>
                        </div>
                        <span style={{ padding: '2px 8px', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 700 }}>
                          {msg.uiData.stockAlert}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CURRENT STOCK</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>{msg.uiData.currentStock} Units</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>RECOMMENDED RESTOCK</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>+{msg.uiData.reorderQuantity} Units</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setMessages(prev => [...prev, { role: 'user', content: `Auto-reorder ${msg.uiData.reorderQuantity} units of ${msg.uiData.productName}` }]);
                          setIsProcessing(true);
                          fetch('/api/ai/cortex', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: 'reorder now', userName, history: messages.slice(-5) })
                          })
                          .then(r => r.json())
                          .then(d => {
                            setMessages(prev => [...prev, { role: 'agent', content: d.final_response }]);
                          })
                          .catch(() => {
                            setMessages(prev => [...prev, { role: 'agent', content: 'Reorder triggered. Redirecting to Purchase Request studio...' }]);
                            setTimeout(() => router.push('/client/intake/create'), 1200);
                          })
                          .finally(() => setIsProcessing(false));
                        }}
                        style={{ width: '100%', padding: '9px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(15,23,42,0.15)' }}
                      >
                        <Zap size={14} color="#38bdf8" /> Auto-Create Reorder Request
                      </button>
                    </div>
                  </div>
                )}

                {msg.uiComponent === 'vendor_list' && msg.uiData && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.uiData.map((vendor: any) => {
                      const isGood = ['Approved', 'Active', 'Onboarded'].includes(vendor.status);
                      return (
                        <div key={vendor.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', background: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            {vendor.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{vendor.name}</div>
                            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>Code: {vendor.vendorCode || 'N/A'}</div>
                          </div>
                          <span style={{ 
                            padding: '3px 8px', 
                            background: isGood ? '#dcfce7' : '#fef3c7', 
                            color: isGood ? '#16a34a' : '#d97706', 
                            borderRadius: '12px', 
                            fontSize: '0.68rem', 
                            fontWeight: 700 
                          }}>
                            {vendor.status}
                          </span>
                        </div>
                      );
                    })}
                    <button 
                      onClick={() => router.push('/client/vendors')}
                      style={{ width: '100%', padding: '8px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}
                    >
                      View All Vendors in Directory
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
            {isProcessing && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', display: 'flex', gap: '8px', flexDirection: 'row' }}>
                <style>{`
                  @keyframes cortexPulse {
                    0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
                  }
                  @keyframes cortexBlink {
                    0%, 100% { opacity: 0.3; transform: scale(0.8) translateY(0); }
                    50% { opacity: 1; transform: scale(1.2) translateY(-2px); }
                  }
                  @keyframes cortexGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
                <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  AI
                </div>
                <div style={{ 
                  background: 'linear-gradient(270deg, #ffffff, #f3e8ff, #ffffff)',
                  backgroundSize: '200% 200%',
                  animation: 'cortexGradient 3s ease infinite',
                  padding: '12px 18px', 
                  borderRadius: '4px 16px 16px 16px', border: '1px solid rgba(226, 232, 240, 0.8)',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  boxShadow: '0 4px 15px -3px rgba(139, 92, 246, 0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', animation: 'cortexPulse 2s infinite' }}></div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.5px' }}>
                      CORTEX IS THINKING
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', animation: 'cortexBlink 1.4s infinite 0s' }}></div>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', animation: 'cortexBlink 1.4s infinite 0.2s' }}></div>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', animation: 'cortexBlink 1.4s infinite 0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
          
            {/* Slash Command Menu */}
            {showSlashMenu && (
              <div style={{ position: 'absolute', bottom: '80px', left: '16px', right: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '400px', zIndex: 60 }}>
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>COMMANDS</div>
                <button type="button" onClick={() => { setInputText('/create-event'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px', borderRadius: '6px' }}><Zap size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/create-event</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Autonomously draft a new Sourcing Event</div></div>
                </button>
                <button type="button" onClick={() => { setInputText('/new-vendor'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px', borderRadius: '6px' }}><Zap size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/new-vendor</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Onboard a new supplier</div></div>
                </button>
                <button type="button" onClick={() => { setInputText('/draft-po'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#fef08a', color: '#ca8a04', padding: '6px', borderRadius: '6px' }}><Zap size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/draft-po</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Instantly generate a PO</div></div>
                </button>
                <button type="button" onClick={() => { setInputText('/add-product'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px', borderRadius: '6px' }}><Zap size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/add-product</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Add a new item to catalog</div></div>
                </button>
                <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', borderTop: '1px solid #e2e8f0' }}>ADVANCED & AI COMMANDS</div>
                <button type="button" onClick={() => { setInputText('/draft-contract'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '6px', borderRadius: '6px' }}><Terminal size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/draft-contract</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Dynamic Legal Document Generator</div></div>
                </button>

                <button type="button" onClick={() => { executeCommand('/approve-all'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#dcfce7', color: '#16a34a', padding: '6px', borderRadius: '6px' }}><CheckCircle2 size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/approve-all</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Instantly approve all pending requests</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/spend-report'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#fef08a', color: '#ca8a04', padding: '6px', borderRadius: '6px' }}><Database size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/spend-report</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Generate a quick analytics card</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/analyze-bids'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px', borderRadius: '6px' }}><BrainCircuit size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/analyze-bids</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>AI recommendation for active auctions</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/find-savings'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#fce7f3', color: '#db2777', padding: '6px', borderRadius: '6px' }}><Zap size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/find-savings</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>AI scans history for savings</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/generate-mock-data'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f3f4f6', color: '#4b5563', padding: '6px', borderRadius: '6px' }}><Terminal size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/generate-mock-data</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Inject test data into the DB</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/remind-approvers'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px', borderRadius: '6px' }}><Zap size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/remind-approvers</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Send nudge emails</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/export-csv'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px', borderRadius: '6px' }}><Database size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/export-csv</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Download recent data as CSV</div></div>
                </button>
                <button type="button" onClick={() => { executeCommand('/clear'); setShowSlashMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f1f5f9', color: '#64748b', padding: '6px', borderRadius: '6px' }}><X size={16} /></div>
                  <div><div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>/clear</div><div style={{ color: '#64748b', fontSize: '0.75rem' }}>Clear the chat history</div></div>
                </button>
              </div>
            )}
<form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={inputText}
              onChange={e => {
                  const val = e.target.value;
                  setInputText(val);
                  if (val === '/') setShowSlashMenu(true);
                  else setShowSlashMenu(false);
                }}
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