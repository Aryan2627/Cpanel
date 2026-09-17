
'use client';
import { useState, useEffect, useRef } from 'react';
import { BrainCircuit, X, Zap, Loader2, Database, Send, Terminal, CheckCircle2, AlertTriangle, CheckCircle, MessageSquare, Menu, FileText, Settings, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Counterparty Name</label>
            <input type="text" placeholder="e.g. Acme Corp" onChange={e => setFormData({...formData, partyName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Governing Law State</label>
            <input type="text" placeholder="e.g. California" onChange={e => setFormData({...formData, state: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
        </div>
      )}
      
      {docType === 'SOW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Project Name</label>
            <input type="text" placeholder="e.g. Phase 1 Implementation" onChange={e => setFormData({...formData, projectName: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Total Compensation ($)</label>
            <input type="number" placeholder="50000" onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
          </div>
        </div>
      )}
      
      <button 
        onClick={() => onSubmit({ type: docType, ...formData })}
        style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
      >
        <Zap size={16} /> Generate Document
      </button>
    </div>
  );
};

const AgentSwarm = ({ data }: { data: any }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500); 
    const t2 = setTimeout(() => setStep(2), 3000); 
    const t3 = setTimeout(() => setStep(3), 4500); 
    const t4 = setTimeout(() => setStep(4), 5200); 
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

export default function CortexPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [userName, setUserName] = useState('Admin');
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string, uiComponent?: string, uiData?: any}[]>([
    { role: 'agent', content: 'Hello. I am ProcGen Cortex, your advanced multi-agent system. How can I assist you today?' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [registeredVendors, setRegisteredVendors] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({ title: '', budget: '', vendorId: '', duration: '' });
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', category: '' });
  const [poForm, setPoForm] = useState({ poNumber: '', amount: '', desc: '' });
  const [productForm, setProductForm] = useState({ name: '', sku: '', price: '' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      const uName = (data && data.name) ? data.name : '';
      if (uName) setUserName(uName);
    }).catch(() => {});
      
    fetch('/api/vendors').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setRegisteredVendors(data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

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

    try {
      const res = await fetch('/api/ai/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, userName, history: messages.slice(-5) })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'agent', content: data.final_response, uiComponent: data.ui_component, uiData: data.ui_data }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: 'Connection to Cortex Core failed.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let fLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} dangerouslySetInnerHTML={{ __html: fLine }} style={{ marginBottom: '8px', lineHeight: '1.5' }} />;
    });
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#fff', overflow: 'hidden', width: '100%' }}>
      
      {/* LEFT SIDEBAR - ChatGPT Style History */}
      <div style={{ width: '280px', background: '#f9f9f9', borderRight: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '16px' }}>
          <button onClick={() => { setMessages([]); setInputText(''); }} style={{ width: '100%', background: '#fff', border: '1px solid #e5e5e5', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#171717', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Plus size={16} /> New Chat
          </button>
        </div>
        
        <div style={{ padding: '0 16px', fontSize: '0.75rem', fontWeight: 600, color: '#888', marginTop: '12px', marginBottom: '8px' }}>Today</div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          <div style={{ padding: '10px 12px', background: '#e5e5e5', borderRadius: '8px', fontSize: '0.85rem', color: '#171717', cursor: 'pointer', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Advanced Multi-Agent Swarm
          </div>
          <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#555', cursor: 'pointer', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Drafting Legal Document SOW
          </div>
          <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#555', cursor: 'pointer', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Adding "MacBook Pro" to Catalog
          </div>
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid #e5e5e5', fontSize: '0.85rem', color: '#555', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
          <Settings size={16} /> Settings
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#fff' }}>
        
        {/* Messages List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 0' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', background: msg.role === 'agent' ? '#10a37f' : '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  {msg.role === 'agent' ? <BrainCircuit size={20} /> : <div style={{ fontSize: '1rem', fontWeight: 600 }}>{userName.charAt(0)}</div>}
                </div>
                
                <div style={{ flex: 1, paddingTop: '6px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', color: '#171717' }}>
                    {msg.role === 'agent' ? 'Cortex AI' : 'You'}
                  </div>
                  <div style={{ color: '#333', fontSize: '1rem', lineHeight: '1.6' }}>
                    {formatText(msg.content)}
                  </div>
                  
                  {msg.uiComponent === 'agent_swarm' && msg.uiData && (
                    <div style={{ marginTop: '16px', width: '100%' }}>
                      <AgentSwarm data={msg.uiData} />
                    </div>
                  )}

                  {msg.uiComponent === 'document_generator_form' && (
                    <DocumentGeneratorForm onSubmit={(data) => executeCommand('/execute-draft-document ' + JSON.stringify(data))} />
                  )}

                  {msg.uiComponent === 'drafted_document' && msg.uiData && (
                    <div style={{ marginTop: '16px', width: '100%', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      <div style={{ background: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} color="#3b82f6"/> {msg.uiData.title}</div>
                        <button onClick={() => {
                          const docWindow = window.open('', '_blank');
                          docWindow?.document.write('<html><head><title>Document</title></head><body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">' + msg.uiData.htmlContent + '</body></html>');
                          docWindow?.document.close();
                          setTimeout(() => docWindow?.print(), 500);
                        }} style={{ padding: '6px 12px', background: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', border: 'none' }}>Download PDF</button>
                      </div>
                      <div 
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        style={{ padding: '30px', maxHeight: '500px', overflowY: 'auto', background: '#fff', fontSize: '0.9rem', lineHeight: '1.8', outline: 'none' }}
                        dangerouslySetInnerHTML={{ __html: msg.uiData.htmlContent }}
                      />
                    </div>
                  )}

                  
                  {msg.uiComponent === 'event_creation_form' && (
                    <div style={{ marginTop: '16px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', width: '100%' }}>
                      <div style={{ marginBottom: '16px', fontWeight: 600 }}>Create Sourcing Event</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><input type="text" placeholder="Event Title" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}><input type="number" placeholder="Budget ($)" value={eventForm.budget} onChange={e => setEventForm({...eventForm, budget: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                          <div style={{ flex: 1 }}><input type="text" placeholder="Duration (Days)" value={eventForm.duration} onChange={e => setEventForm({...eventForm, duration: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        </div>
                        <button onClick={() => executeCommand('/execute-create-event ' + JSON.stringify(eventForm))} style={{ width: '100%', padding: '10px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Publish Event</button>
                      </div>
                    </div>
                  )}

                  {msg.uiComponent === 'vendor_creation_form' && (
                    <div style={{ marginTop: '16px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', width: '100%' }}>
                      <div style={{ marginBottom: '16px', fontWeight: 600 }}>Onboard New Supplier</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><input type="text" placeholder="Company Name" value={vendorForm?.name || ''} onChange={e => setVendorForm({...vendorForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}><input type="email" placeholder="Contact Email" value={vendorForm?.email || ''} onChange={e => setVendorForm({...vendorForm, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                          <div style={{ flex: 1 }}><input type="text" placeholder="Category (e.g. IT, Legal)" value={vendorForm?.category || ''} onChange={e => setVendorForm({...vendorForm, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        </div>
                        <button onClick={() => executeCommand('/execute-create-vendor ' + JSON.stringify(vendorForm))} style={{ width: '100%', padding: '10px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Register Vendor</button>
                      </div>
                    </div>
                  )}

                  {msg.uiComponent === 'po_creation_form' && (
                    <div style={{ marginTop: '16px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', width: '100%' }}>
                      <div style={{ marginBottom: '16px', fontWeight: 600 }}>Draft Purchase Order</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><input type="text" placeholder="Description / Purpose" value={poForm?.desc || ''} onChange={e => setPoForm({...poForm, desc: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}><input type="text" placeholder="PO Number (Optional)" value={poForm?.poNumber || ''} onChange={e => setPoForm({...poForm, poNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                          <div style={{ flex: 1 }}><input type="number" placeholder="Total Amount ($)" value={poForm?.amount || ''} onChange={e => setPoForm({...poForm, amount: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        </div>
                        <button onClick={() => executeCommand('/execute-draft-po ' + JSON.stringify(poForm))} style={{ width: '100%', padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Generate PO</button>
                      </div>
                    </div>
                  )}

                  {msg.uiComponent === 'product_creation_form' && (
                    <div style={{ marginTop: '16px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', width: '100%' }}>
                      <div style={{ marginBottom: '16px', fontWeight: 600 }}>Create New Product</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div><input type="text" placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}><input type="text" placeholder="SKU" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                          <div style={{ flex: 1 }}><input type="number" placeholder="Price" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
                        </div>
                        <button onClick={() => executeCommand('/execute-add-product ' + JSON.stringify(productForm))} style={{ width: '100%', padding: '10px', background: '#10a37f', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Add to Catalog</button>
                      </div>
                    </div>
                  )}

                  {msg.uiComponent === 'product_list' && msg.uiData && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {msg.uiData.map((prod: any) => (
                        <div key={prod.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', fontSize: '0.9rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.name}</div>
                          <div style={{ color: '#64748b', marginTop: '4px' }}>Category: {prod.category || 'General'} | Code: {prod.articleCode || prod.code}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {msg.uiComponent === 'vendor_list' && msg.uiData && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {msg.uiData.map((vendor: any) => (
                        <div key={vendor.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#3b82f6', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {vendor.name.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{vendor.name}</div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Code: {vendor.vendorCode || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '50%', background: '#10a37f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Loader2 size={20} className="animate-spin" />
                </div>
                <div style={{ flex: 1, paddingTop: '8px' }}>
                  <style>{`
                    @keyframes cortexGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                  `}</style>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(270deg, #f8fafc, #f1f5f9, #f8fafc)', backgroundSize: '200% 200%', animation: 'cortexGradient 2s ease infinite', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Cortex is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: '180px', flexShrink: 0 }} />
          </div>
        </div>

        {/* BOTTOM INPUT AREA */}
        <div style={{ padding: '24px 40px 40px', background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)', position: 'absolute', bottom: 0, width: '100%' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            
            {showSlashMenu && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '12px', zIndex: 10 }}>
                <div style={{ padding: '8px 16px', background: '#f9f9f9', fontSize: '0.75rem', fontWeight: 700, color: '#888' }}>ADVANCED WORKFLOWS</div>
                <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}>
                  {[

                    { cmd: '/analyze-risk', desc: 'Multi-Agent Risk Swarm', icon: <AlertTriangle size={16}/>, color: '#e11d48', bg: '#fee2e2' },
                    { cmd: '/draft-contract', desc: 'Dynamic Legal Document Generator', icon: <Terminal size={16}/>, color: '#9333ea', bg: '#f3e8ff' },
                    { cmd: '/create-event', desc: 'Create a new sourcing event/auction', icon: <Zap size={16}/>, color: '#ea580c', bg: '#ffedd5' },
                    { cmd: '/create-vendor', desc: 'Onboard a new supplier', icon: <CheckCircle size={16}/>, color: '#0284c7', bg: '#e0f2fe' },
                    { cmd: '/draft-po', desc: 'Draft a new Purchase Order', icon: <FileText size={16}/>, color: '#059669', bg: '#d1fae5' },
                    { cmd: '/add-product', desc: 'Add a new item to catalog', icon: <Database size={16}/>, color: '#4f46e5', bg: '#e0e7ff' },
                    { cmd: '/approve-all', desc: 'Instantly approve all pending requests', icon: <CheckCircle2 size={16}/>, color: '#16a34a', bg: '#dcfce7' },
                    { cmd: '/analyze-bids', desc: 'AI recommendation for active auctions', icon: <BrainCircuit size={16}/>, color: '#4f46e5', bg: '#e0e7ff' },
                    { cmd: '/find-savings', desc: 'AI scans history for savings', icon: <Zap size={16}/>, color: '#db2777', bg: '#fce7f3' },
                    { cmd: '/export-csv', desc: 'Download recent data as CSV', icon: <Database size={16}/>, color: '#0284c7', bg: '#e0f2fe' },
                    { cmd: '/generate-mock-data', desc: 'Inject test data into the DB', icon: <Terminal size={16}/>, color: '#4b5563', bg: '#f3f4f6' },
                    { cmd: '/remind-approvers', desc: 'Send nudge emails', icon: <AlertTriangle size={16}/>, color: '#dc2626', bg: '#fee2e2' },
                    { cmd: '/clear', desc: 'Clear the chat history', icon: <X size={16}/>, color: '#64748b', bg: '#f1f5f9' }
                  ].map((item, i) => (
                    <button key={i} onClick={() => { 
                      const autoExec = ['/analyze-risk', '/analyze-bids', '/approve-all', '/export-csv', '/generate-mock-data', '/remind-approvers', '/clear', '/find-savings'];
                      if(autoExec.includes(item.cmd)) {
                        executeCommand(item.cmd); 
                      } else {
                        setInputText(item.cmd); 
                      }
                      setShowSlashMenu(false); 
                    }} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: '1px solid #f1f1f1', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ background: item.bg, color: item.color, padding: '8px', borderRadius: '8px' }}>{item.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#171717', fontSize: '0.9rem' }}>{item.cmd}</div>
                        <div style={{ color: '#555', fontSize: '0.8rem' }}>{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
              <input 
                type="text" 
                value={inputText}
                onChange={e => {
                  const val = e.target.value;
                  setInputText(val);
                  setShowSlashMenu(val === '/');
                }}
                placeholder="Message Cortex..."
                style={{ width: '100%', padding: '16px 56px 16px 24px', borderRadius: '24px', border: '1px solid #e5e5e5', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                disabled={isProcessing}
              />
              <button 
                type="submit" 
                disabled={isProcessing || !inputText.trim()}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: inputText.trim() && !isProcessing ? '#171717' : '#e5e5e5', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputText.trim() && !isProcessing ? 'pointer' : 'default', transition: 'all 0.2s' }}
              >
                <Send size={16} />
              </button>
            </form>
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.75rem', marginTop: '12px' }}>
              Cortex AI can make mistakes. Consider verifying critical compliance and pricing data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
