'use client';
import { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit, X, Zap, Loader2, Database, Send, Terminal,
  CheckCircle2, AlertTriangle, CheckCircle, FileText, Settings, Eye,
  Plus, Sparkles, Shield, ChevronRight, BarChart3, Bot
} from 'lucide-react';

/* ───────────────────────── Utility sub-components ───────────────────────── */

const DocumentGeneratorForm = ({ onSubmit }: { onSubmit: (d: any) => void }) => {
  const [docType, setDocType] = useState('NDA');
  const [fd, setFd] = useState<any>({});
  const inp = { width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.07)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' };
  return (
    <div style={{ marginTop:'12px', padding:'20px', borderRadius:'14px', background:'rgba(15,23,42,0.9)', border:'1px solid rgba(99,102,241,0.3)', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ marginBottom:'14px' }}>
        <label style={{ display:'block', fontSize:'0.7rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px' }}>Document Type</label>
        <select value={docType} onChange={e=>{ setDocType(e.target.value); setFd({}); }} style={{ ...inp, cursor:'pointer', backgroundColor:'#1e293b', color:'#f1f5f9', border:'1px solid rgba(99,102,241,0.3)' }}>
          <option value="NDA" style={{ backgroundColor:'#1e293b', color:'#f1f5f9' }}>Non-Disclosure Agreement (NDA)</option>
          <option value="SOW" style={{ backgroundColor:'#1e293b', color:'#f1f5f9' }}>Statement of Work (SOW)</option>
          <option value="RFP" style={{ backgroundColor:'#1e293b', color:'#f1f5f9' }}>Request for Proposal (RFP)</option>
        </select>
      </div>
      {docType==='NDA' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <input type="text" placeholder="Counterparty Name" onChange={e=>setFd({...fd, partyName:e.target.value})} style={inp}/>
          <input type="text" placeholder="Governing Law State" onChange={e=>setFd({...fd, state:e.target.value})} style={inp}/>
        </div>
      )}
      {docType==='SOW' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <input type="text" placeholder="Project Name" onChange={e=>setFd({...fd, projectName:e.target.value})} style={inp}/>
          <input type="number" placeholder="Total Compensation ($)" onChange={e=>setFd({...fd, amount:e.target.value})} style={inp}/>
        </div>
      )}
      <button onClick={()=>onSubmit({ type:docType, ...fd })} style={{ width:'100%', marginTop:'16px', padding:'11px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px', fontSize:'0.85rem' }}>
        <Zap size={15}/> Generate Document
      </button>
      
      
    </div>
  );
};

const AgentSwarm = ({ data }: { data: any }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const ts = [setTimeout(()=>setStep(1),1400), setTimeout(()=>setStep(2),2800), setTimeout(()=>setStep(3),4200), setTimeout(()=>setStep(4),5000)];
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ background:'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9))', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'16px', overflow:'hidden', width:'100%', backdropFilter:'blur(20px)' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', padding:'8px', borderRadius:'10px', display:'flex' }}><Sparkles size={16} color="#fff"/></div>
        <div>
          <div style={{ fontSize:'0.65rem', fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'2px' }}>Multi-Agent Swarm</div>
          <div style={{ fontSize:'0.95rem', fontWeight:700, color:'#f1f5f9', marginTop:'1px' }}>{data.target}</div>
        </div>
      </div>
      <div style={{ padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {data.agents.map((agent: any, i: number) => {
          const active = step===i, done = step>i;
          return (
            <div key={agent.id} style={{ display:'flex', gap:'12px', alignItems:'flex-start', padding:'12px', background: done?'rgba(16,185,129,0.06)':active?'rgba(99,102,241,0.08)':'rgba(255,255,255,0.02)', border:'1px solid', borderColor: done?'rgba(16,185,129,0.2)':active?'rgba(99,102,241,0.3)':'rgba(255,255,255,0.05)', borderRadius:'10px', transition:'all 0.4s' }}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: done?'linear-gradient(135deg,#10b981,#059669)':active?'linear-gradient(135deg,#6366f1,#4f46e5)':'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {done ? <CheckCircle size={14} color="#fff"/> : active ? <Loader2 size={14} color="#fff" className="animate-spin"/> : <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#475569'}}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, color:'#e2e8f0' }}>{agent.name}</div>
                  <div style={{ fontSize:'0.65rem', fontWeight:700, color: done?'#10b981':active?'#818cf8':'#475569', background: done?'rgba(16,185,129,0.1)':active?'rgba(99,102,241,0.15)':'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:'20px' }}>{agent.role}</div>
                </div>
                {active && <div style={{ fontSize:'0.78rem', color:'#818cf8', marginTop:'5px' }}>Scanning data streams...</div>}
                {done && <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:'5px', paddingLeft:'8px', borderLeft:'2px solid rgba(16,185,129,0.4)' }}>{agent.finding}</div>}
              </div>
            </div>
          );
        })}
        {step>=4 && (
          <div style={{ padding:'14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', display:'flex', gap:'12px', alignItems:'center' }}>
            <AlertTriangle size={18} color="#f87171"/>
            <div style={{ fontSize:'0.83rem', fontWeight:600, color:'#fca5a5' }}>{data.summary}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── Main Page ──────────────────────────── */

type Message = { role:'user'|'agent'; content:string; uiComponent?:string; uiData?:any; thoughtProcess?:string[] };

export default function CortexPage() {
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('Admin');
  const [messages, setMessages] = useState<Message[]>([
    { role:'agent', content:'Cortex is online. I am your advanced multi-agent procurement intelligence system, powered by enterprise RAG. How can I assist you today?' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [chats, setChats] = useState<{id: string, title: string, messages: Message[]}[]>([
    { id: 'c1', title: 'Risk Swarm — Vendor Contract Q3', messages: [{ role: 'agent', content: 'Multi-Agent Swarm analysis completed for Vendor Contract Q3.' }] },
    { id: 'c2', title: 'Legal Review — NDA Acme Corp', messages: [{ role: 'agent', content: 'Legal clause review completed for Acme Corp NDA.' }] },
    { id: 'c3', title: 'Procurement Savings Analysis', messages: [{ role: 'agent', content: 'Savings analysis: Found 12% cost reduction opportunities.' }] },
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [eventForm, setEventForm] = useState({ title:'', budget:'', vendorId:'', duration:'' });
  const [vendorForm, setVendorForm] = useState({ name:'', email:'', category:'' });
  const [poForm, setPoForm] = useState({ poNumber:'', amount:'', desc:'' });
  const [productForm, setProductForm] = useState({ name:'', sku:'', price:'', imageUrl:'', isGenerating:false });
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [tutorialVideo, setTutorialVideo] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem('cortex_chats_v2');
      if (stored) {
        const { chatsData, timestamp, activeId } = JSON.parse(stored);
        if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
          if (chatsData && chatsData.length > 0) setChats(chatsData);
          if (activeId) {
            setActiveChatId(activeId);
            const activeChat = chatsData.find((c: any) => c.id === activeId);
            if (activeChat && activeChat.messages && activeChat.messages.length > 0) {
              setMessages(activeChat.messages);
            }
          }
        } else {
          localStorage.removeItem('cortex_chats_v2');
        }
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('cortex_chats_v2', JSON.stringify({
      chatsData: chats,
      activeId: activeChatId,
      timestamp: Date.now()
    }));
  }, [chats, activeChatId, isClient]);

  // Keep chats synced with current messages
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages } : c));
    }
  }, [messages, activeChatId]);

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{ if(d?.name) setUserName(d.name); }).catch(()=>{});
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, isProcessing]);

  const execute = async (cmd: string) => {
    if(isProcessing) return;
    let display = cmd;
    if(cmd.startsWith('/execute-')) display = 'Executing action...';
    if(cmd.startsWith('/analyze-risk')) display = 'Deploy AI swarm to analyze this contract\'s risk profile.';
    if(cmd.startsWith('/analyze-contract')) display = 'Run deep legal clause analysis.';
    setMessages(p=>[...p, { role:'user', content:display }]);
    const newId = 'c_' + Date.now();
    if(messages.length===1) {
      const title = display.substring(0, 40);
      setChats(p=>[{ id: newId, title, messages: [] }, ...p]);
      setActiveChatId(newId);
    }
    setIsProcessing(true);
    try {
      const r = await fetch('/api/ai/cortex',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt:cmd, userName, history:messages.slice(-5) }) });
      const d = await r.json();
      setMessages(p=>[...p,{ role:'agent', content:d.final_response, uiComponent:d.ui_component, uiData:d.ui_data, thoughtProcess:d.thought_process }]);
    } catch(e) { setMessages(p=>[...p,{ role:'agent', content:'Connection error.' }]); }
    setIsProcessing(false);
  };

  const send = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if(!input.trim()||isProcessing) return;
    const q = input.trim(); setInput('');
    setMessages(p=>[...p,{ role:'user', content:q }]);
    const newId2 = 'c_' + Date.now();
    if(messages.length===1) {
      const title2 = q.substring(0, 40);
      setChats(p=>[{ id: newId2, title: title2, messages: [] }, ...p]);
      setActiveChatId(newId2);
    }
    setIsProcessing(true);
    try {
      const r = await fetch('/api/ai/cortex',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ prompt:q, userName, history:messages.slice(-5) }) });
      const d = await r.json();
      setMessages(p=>[...p,{ role:'agent', content:d.final_response, uiComponent:d.ui_component, uiData:d.ui_data, thoughtProcess:d.thought_process }]);
    } catch(e) { setMessages(p=>[...p,{ role:'agent', content:'Connection to Cortex Core failed.' }]); }
    setIsProcessing(false);
  };

  const fmt = (txt: string) => txt.split('\n').map((l,i)=>(
    <div key={i} dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>') }} style={{ marginBottom:'6px', lineHeight:'1.7' }}/>
  ));

  const slashCmds = [
    { cmd:'/analyze-risk',    label:'Multi-Agent Risk Swarm',          icon:<AlertTriangle size={14}/>,  color:'#f87171', bg:'rgba(239,68,68,0.12)',    auto:true },
    { cmd:'/analyze-contract',label:'Deep Legal Clause Review (CUAD)',  icon:<Shield size={14}/>,         color:'#c084fc', bg:'rgba(168,85,247,0.12)',   auto:true },
    { cmd:'/draft-contract',  label:'Generate Legal Document',          icon:<FileText size={14}/>,       color:'#818cf8', bg:'rgba(99,102,241,0.12)',   auto:false, hasTutorial: true },
    { cmd:'/create-event',    label:'Create Sourcing Event / Auction',  icon:<Zap size={14}/>,            color:'#fb923c', bg:'rgba(249,115,22,0.12)',   auto:false },
    { cmd:'/create-vendor',   label:'Onboard New Supplier',             icon:<CheckCircle2 size={14}/>,   color:'#34d399', bg:'rgba(16,185,129,0.12)',   auto:false },
    { cmd:'/draft-po',        label:'Draft Purchase Order',             icon:<Database size={14}/>,       color:'#38bdf8', bg:'rgba(14,165,233,0.12)',   auto:false },
    { cmd:'/add-product',     label:'Add Item to Catalog',              icon:<Plus size={14}/>,           color:'#a3e635', bg:'rgba(132,204,22,0.12)',   auto:false },
    { cmd:'/approve-all',     label:'Approve All Pending Requests',     icon:<CheckCircle size={14}/>,    color:'#4ade80', bg:'rgba(74,222,128,0.12)',   auto:true  },
    { cmd:'/analyze-bids',    label:'AI Bid Recommendation Engine',     icon:<BarChart3 size={14}/>,      color:'#818cf8', bg:'rgba(99,102,241,0.12)',   auto:true  },
    { cmd:'/find-savings',    label:'Scan History for Savings',         icon:<Sparkles size={14}/>,       color:'#f472b6', bg:'rgba(244,114,182,0.12)',  auto:true  },
    { cmd:'/remind-approvers',label:'Nudge Approvers via Email',        icon:<Terminal size={14}/>,       color:'#fb923c', bg:'rgba(249,115,22,0.12)',   auto:true  },
    { cmd:'/clear',           label:'Clear Conversation',               icon:<X size={14}/>,              color:'#94a3b8', bg:'rgba(148,163,184,0.08)',  auto:true  },
  ];

  return (
    <div style={{ display:'flex', height:'100%', width:'100%', background:'#070d1c', overflow:'hidden', fontFamily:'system-ui,sans-serif', position:'relative' }}>
      
      {/* Animated Background */}
      <style>{`
        @keyframes bgFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        @keyframes pulse2 { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes cortexSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .cortex-msg { animation: fadeSlideIn 0.35s ease forwards; }
        .slash-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .hist-item:hover { background: rgba(255,255,255,0.05) !important; } .hist-item:hover .dots-btn { opacity: 1 !important; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
      `}</style>
      <div style={{ position:'fixed', top:'-200px', left:'30%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', animation:'bgFloat 8s ease-in-out infinite', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', bottom:'-100px', right:'10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', animation:'bgFloat 12s ease-in-out infinite reverse', pointerEvents:'none', zIndex:0 }}/>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{ width:'270px', background:'rgba(255,255,255,0.02)', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', flexShrink:0, backdropFilter:'blur(20px)' }}>
        
        {/* Brand */}
        <div style={{ padding:'20px 18px 14px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
            <div style={{ width:'32px', height:'32px', borderRadius:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.4)' }}>
              <BrainCircuit size={18} color="#fff"/>
            </div>
            <div>
              <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.5px' }}>Cortex AI</div>
              <div style={{ fontSize:'0.65rem', color:'#4ade80', fontWeight:600, display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#4ade80', display:'inline-block', animation:'pulse2 2s infinite' }}/>Online · RAG Active
              </div>
            </div>
          </div>
          <button onClick={()=>{ setMessages([{ role:'agent', content:'Cortex is online. I am your advanced multi-agent procurement intelligence system, powered by enterprise RAG. How can I assist you today?' }]); setInput(''); setActiveChatId(null); setMenuOpenId(null); }} style={{ width:'100%', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', padding:'9px 14px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.82rem', color:'#a5b4fc', transition:'all 0.2s' }}>
            <Plus size={15}/> New Chat
          </button>
        </div>

        {/* History */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
          <div style={{ fontSize:'0.63rem', fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'1.5px', padding:'0 8px', marginBottom:'8px' }}>Recent</div>
          {chats.map((chat)=>{
            const isActive = activeChatId===chat.id;
            const menuOpen = menuOpenId===chat.id;
            const isEditing = editingId===chat.id;
            return (
              <div key={chat.id} className="hist-item" style={{ padding:'9px 12px', paddingRight:'8px', background: isActive?'rgba(99,102,241,0.12)':'transparent', border: isActive?'1px solid rgba(99,102,241,0.25)':'1px solid transparent', borderRadius:'8px', fontSize:'0.8rem', cursor:'pointer', marginBottom:'3px', transition:'all 0.2s', position:'relative', display:'flex', alignItems:'center', gap:'6px' }}
                onClick={()=>{ if(!isEditing){ setActiveChatId(chat.id); setMessages(chat.messages.length>0?chat.messages:[{ role:'agent', content:'Cortex is online. I am your advanced multi-agent procurement intelligence system, powered by enterprise RAG. How can I assist you today?' }]); setMenuOpenId(null); } }}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e=>setEditTitle(e.target.value)}
                    onBlur={()=>{ setChats(p=>p.map(c=>c.id===chat.id?{...c,title:editTitle}:c)); setEditingId(null); }}
                    onKeyDown={e=>{ if(e.key==='Enter'){ setChats(p=>p.map(c=>c.id===chat.id?{...c,title:editTitle}:c)); setEditingId(null); } if(e.key==='Escape') setEditingId(null); }}
                    onClick={e=>e.stopPropagation()}
                    style={{ flex:1, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(99,102,241,0.4)', borderRadius:'4px', padding:'2px 6px', color:'#e2e8f0', fontSize:'0.8rem', outline:'none' }}
                  />
                ) : (
                  <span style={{ flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color: isActive?'#a5b4fc':'#475569' }}>{chat.title}</span>
                )}
                <button
                  onClick={e=>{ e.stopPropagation(); setMenuOpenId(menuOpen?null:chat.id); }}
                  style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', padding:'2px 4px', borderRadius:'4px', flexShrink:0, opacity: isActive||menuOpen?1:0, transition:'opacity 0.2s', fontSize:'1rem', lineHeight:'1', display:'flex', alignItems:'center' }}
                  className="dots-btn"
                >⋯</button>
                {menuOpen && (
                  <div onClick={e=>e.stopPropagation()} style={{ position:'absolute', right:'4px', top:'100%', zIndex:100, background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)', overflow:'hidden', minWidth:'140px', marginTop:'4px' }}>
                    <button onClick={()=>{ setEditTitle(chat.title); setEditingId(chat.id); setMenuOpenId(null); }} style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'10px 14px', background:'none', border:'none', color:'#e2e8f0', fontSize:'0.82rem', cursor:'pointer', textAlign:'left' }}>
                      ✏️ Rename
                    </button>
                    <button onClick={()=>{ setChats(p=>p.filter(c=>c.id!==chat.id)); if(activeChatId===chat.id){ setActiveChatId(null); setMessages([{ role:'agent', content:'Cortex is online. I am your advanced multi-agent procurement intelligence system, powered by enterprise RAG. How can I assist you today?' }]); } setMenuOpenId(null); }} style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'10px 14px', background:'none', border:'none', color:'#f87171', fontSize:'0.82rem', cursor:'pointer', textAlign:'left' }}>
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User / Settings */}
        <div style={{ padding:'14px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#334155,#1e293b)', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
            {userName.charAt(0)}
          </div>
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:600, color:'#e2e8f0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{userName}</div>
            <div style={{ fontSize:'0.7rem', color:'#475569' }}>Enterprise Plan</div>
          </div>
          <Settings size={15} color="#334155" style={{ cursor:'pointer', flexShrink:0 }}/>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        
        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'32px 0 0', minHeight:0 }}>
          <div style={{ maxWidth:'780px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'28px', padding:'0 28px 24px' }}>
            {messages.map((msg, idx)=>(
              <div key={idx} className="cortex-msg" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                
                {/* Avatar */}
                <div style={{ width:'34px', height:'34px', flexShrink:0, borderRadius:'10px', background: msg.role==='agent'?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.07)', border: msg.role==='agent'?'none':'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow: msg.role==='agent'?'0 0 16px rgba(99,102,241,0.3)':'none' }}>
                  {msg.role==='agent' ? <BrainCircuit size={18}/> : <span style={{ fontSize:'0.85rem', fontWeight:700 }}>{userName.charAt(0)}</span>}
                </div>

                <div style={{ flex:1, paddingTop:'4px', minWidth:0 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, marginBottom:'8px', color: msg.role==='agent'?'#818cf8':'#94a3b8', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {msg.role==='agent' ? 'Cortex AI' : 'You'}
                  </div>
                  <div style={{ color: msg.role==='agent'?'#e2e8f0':'#94a3b8', fontSize:'0.95rem', lineHeight:'1.7' }}>
                    {fmt(msg.content)}
                  </div>

                  {/* Chain of Thought */}
                  {msg.thoughtProcess && (
                    <details style={{ marginTop:'12px' }}>
                      <summary style={{ fontSize:'0.73rem', fontWeight:700, color:'#4f6072', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', userSelect:'none', listStyle:'none', marginBottom:'0' }}>
                        <ChevronRight size={12}/> Agentic Chain of Thought · {msg.thoughtProcess.length} steps
                      </summary>
                      <div style={{ marginTop:'8px', padding:'12px 14px', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'8px', fontFamily:'monospace', fontSize:'0.72rem', lineHeight:'1.7', color:'#38bdf8' }}>
                        {msg.thoughtProcess.map((s,i)=>(<div key={i} style={{ opacity:0.8 }}><span style={{ color:'#334155', marginRight:'8px' }}>[{String(i+1).padStart(2,'0')}]</span>{s}</div>))}
                      </div>
                    </details>
                  )}

                  {/* Legal Analysis */}
                  {msg.uiComponent==='legal_analysis' && msg.uiData && (
                    <div style={{ marginTop:'14px', borderRadius:'14px', overflow:'hidden', border:'1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ background:'linear-gradient(135deg,rgba(127,29,29,0.7),rgba(153,27,27,0.6))', padding:'14px 18px', display:'flex', alignItems:'center', gap:'12px', backdropFilter:'blur(10px)' }}>
                        <Shield size={18} color="#f87171"/>
                        <div>
                          <div style={{ fontSize:'0.65rem', fontWeight:700, color:'#f87171', textTransform:'uppercase', letterSpacing:'1px' }}>Legal AI · CUAD Analysis</div>
                          <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginTop:'1px' }}>Contract Clause Risk Report</div>
                        </div>
                      </div>
                      <div style={{ padding:'14px', display:'flex', flexDirection:'column', gap:'10px', background:'rgba(0,0,0,0.3)' }}>
                        {msg.uiData.risks.map((r:any, i:number)=>(
                          <div key={i} style={{ padding:'13px 15px', background: r.type==='Critical'?'rgba(239,68,68,0.08)':'rgba(245,158,11,0.07)', border:'1px solid', borderColor: r.type==='Critical'?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)', borderRadius:'10px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'7px' }}>
                              <div style={{ fontWeight:700, color: r.type==='Critical'?'#fca5a5':'#fcd34d', fontSize:'0.85rem' }}>{r.clause}</div>
                              <div style={{ fontSize:'0.65rem', fontWeight:800, padding:'3px 8px', borderRadius:'20px', background: r.type==='Critical'?'rgba(239,68,68,0.2)':'rgba(245,158,11,0.2)', color: r.type==='Critical'?'#f87171':'#fbbf24' }}>{r.type.toUpperCase()}</div>
                            </div>
                            <div style={{ fontSize:'0.8rem', color:'#94a3b8', lineHeight:'1.5' }}>{r.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Swarm */}
                  {msg.uiComponent==='agent_swarm' && msg.uiData && (
                    <div style={{ marginTop:'14px' }}><AgentSwarm data={msg.uiData}/></div>
                  )}

                  {/* Document Generator Form */}
                  {msg.uiComponent==='document_generator_form' && (
                    <DocumentGeneratorForm onSubmit={d=>execute('/execute-draft-document '+JSON.stringify(d))}/>
                  )}

                  {/* Drafted Document */}
                  {msg.uiComponent==='drafted_document' && msg.uiData && (
                    <div style={{ marginTop:'14px', borderRadius:'14px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ background:'rgba(15,23,42,0.9)', padding:'14px 18px', borderBottom:'1px solid rgba(99,102,241,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontWeight:700, color:'#e2e8f0', display:'flex', alignItems:'center', gap:'8px' }}><FileText size={16} color="#818cf8"/>{msg.uiData.title}</div>
                        <button onClick={()=>{ const w=window.open('','_blank'); w?.document.write('<html><body style="font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;">'+msg.uiData.htmlContent+'</body></html>'); w?.document.close(); setTimeout(()=>w?.print(),500); }} style={{ padding:'6px 12px', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', borderRadius:'6px', fontSize:'0.78rem', cursor:'pointer', border:'1px solid rgba(99,102,241,0.3)', fontWeight:600 }}>Download PDF</button>
                      </div>
                      <div contentEditable suppressContentEditableWarning style={{ padding:'24px', maxHeight:'400px', overflowY:'auto', background:'rgba(15,23,42,0.95)', fontSize:'0.9rem', lineHeight:'1.9', color:'#e2e8f0', outline:'none', minHeight:'200px' }} dangerouslySetInnerHTML={{ __html:msg.uiData.htmlContent }}/>
                    </div>
                  )}

                  {/* Event Form */}
                  {msg.uiComponent==='event_creation_form' && (
                    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Create Sourcing Event</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        {[{ p:'Event Title', k:'title' },{ p:'Budget ($)', k:'budget' },{ p:'Duration (Days)', k:'duration' }].map(f=>(
                          <input key={f.k} type="text" placeholder={f.p} value={(eventForm as any)[f.k]} onChange={e=>setEventForm({...eventForm, [f.k]:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        ))}
                        <button onClick={()=>execute('/execute-create-event '+JSON.stringify(eventForm))} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#ea580c,#c2410c)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Publish Event</button>
                      </div>
                    </div>
                  )}

                  {/* Vendor Form */}
                  {msg.uiComponent==='vendor_creation_form' && (
                    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Onboard Supplier</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        {[{ p:'Company Name', k:'name' },{ p:'Contact Email', k:'email' },{ p:'Category (e.g. IT, Legal)', k:'category' }].map(f=>(
                          <input key={f.k} type="text" placeholder={f.p} value={(vendorForm as any)[f.k]} onChange={e=>setVendorForm({...vendorForm, [f.k]:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        ))}
                        <button onClick={()=>execute('/execute-create-vendor '+JSON.stringify(vendorForm))} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#0284c7,#0369a1)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Register Vendor</button>
                      </div>
                    </div>
                  )}

                  {/* PO Form */}
                  {msg.uiComponent==='po_creation_form' && (
                    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Draft Purchase Order</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        {[{ p:'Description / Purpose', k:'desc' },{ p:'PO Number (Optional)', k:'poNumber' },{ p:'Total Amount ($)', k:'amount' }].map(f=>(
                          <input key={f.k} type="text" placeholder={f.p} value={(poForm as any)[f.k]} onChange={e=>setPoForm({...poForm, [f.k]:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        ))}
                        <button onClick={()=>execute('/execute-draft-po '+JSON.stringify(poForm))} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#059669,#047857)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Generate PO</button>
                      </div>
                    </div>
                  )}

                  {/* Product Form */}
                  {msg.uiComponent==='product_creation_form' && (
                    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Add to Catalog</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        <input type="text" placeholder="Product Name" value={productForm.name} onChange={e=>setProductForm({...productForm, name:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        
                        <div style={{ display:'flex', gap:'10px' }}>
                          <button onClick={() => {
                            if(!productForm.name) return alert('Enter a product name first!');
                            const safePrompt = encodeURIComponent('high quality professional product photography of ' + productForm.name + ', studio lighting, clean minimal background');
                            const seed = Math.floor(Math.random() * 100000);
                            setProductForm({...productForm, imageUrl: `https://image.pollinations.ai/prompt/${safePrompt}?width=800&height=500&nologo=1&seed=${seed}`});
                          }} style={{ flex:1, padding:'8px', background:'rgba(99,102,241,0.15)', color:'#818cf8', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'8px', fontSize:'0.75rem', cursor:'pointer' }}>
                            ✨ Generate AI Image
                          </button>
                          <button onClick={(e) => { e.preventDefault(); alert('Gallery upload simulation active! In production, this opens a file picker.'); }} style={{ flex:1, padding:'8px', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontSize:'0.75rem', cursor:'pointer' }}>
                            📁 Upload from Gallery
                          </button>
                        </div>

                        {productForm.isGenerating && (
                            <div style={{ position:'relative', width:'100%', aspectRatio:'8/5', borderRadius:'12px', border:'1px solid rgba(99,102,241,0.5)', overflow:'hidden', background:'#070d1c', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', marginTop: '10px', marginBottom: '10px', boxShadow:'0 0 40px rgba(99,102,241,0.15)' }}>
                               <style>{`@keyframes scanline { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }`}</style>
                               <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'4px', background:'linear-gradient(90deg, transparent, #818cf8, transparent)', animation:'scanline 2s ease-in-out infinite', boxShadow:'0 0 15px #818cf8' }} />
                               <Loader2 className="animate-spin" size={36} color="#818cf8" style={{ marginBottom:'20px' }} />
                               <div style={{ color:'#a5b4fc', fontWeight:700, fontSize:'0.9rem', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>Synthesizing Latent Space</div>
                               <div style={{ color:'#64748b', fontSize:'0.75rem', fontFamily:'monospace' }}>Applying 8K Textures & Studio Lighting...</div>
                               <div style={{ color:'#475569', fontSize:'0.65rem', fontFamily:'monospace', marginTop:'4px' }}>Model: SDXL-Turbo-v2 &middot; Seed: Randomized</div>
                            </div>
                          )}
                          {!productForm.isGenerating && productForm.imageUrl && (
                            <div style={{ position:'relative', width:'100%', aspectRatio:'8/5', borderRadius:'12px', border:'1px solid rgba(99,102,241,0.3)', overflow:'hidden', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-start', justifyContent:'center', marginTop: '10px', marginBottom: '10px', boxShadow:'0 10px 30px rgba(0,0,0,0.3)' }}>
                               <img 
                                 src={productForm.imageUrl} 
                                 onError={(e) => { 
                                   // High-end fallback if pollinations fails or rate-limits
                                   e.currentTarget.src = `https://loremflickr.com/800/500/${encodeURIComponent(productForm.name)}?lock=${Math.floor(Math.random()*1000)}`; 
                                 }}
                                 style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', clipPath:'inset(0px 0px 8% 0px)', transition:'opacity 0.5s ease-in' }} 
                                 alt="Product Preview" 
                               />
                               
                               <button onClick={(e) => { e.preventDefault(); setViewImage(productForm.imageUrl); }} style={{ position:'absolute', top:'12px', right:'12px', background:'rgba(15,23,42,0.7)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'8px 14px', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', fontWeight:600, backdropFilter:'blur(8px)', transition:'all 0.2s' }}>
                                 <Eye size={16}/> View 4K
                               </button>
                            </div>
                          )}
                          
                          <div style={{ display:'flex', gap:'10px' }}>
                          <input type="text" placeholder="SKU" value={productForm.sku} onChange={e=>setProductForm({...productForm, sku:e.target.value})} style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                          <input type="number" placeholder="Price ($)" value={productForm.price} onChange={e=>setProductForm({...productForm, price:e.target.value})} style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        </div>
                        <button onClick={(e)=>{ e.preventDefault(); execute('/execute-add-product '+JSON.stringify(productForm)); }} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Add to Catalog</button>
                      </div>
                    </div>
                  )}

                  {/* Product List */}
                  {msg.uiComponent==='product_list' && msg.uiData && (
                    <div style={{ marginTop:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                      {msg.uiData.map((p:any)=>(
                        <div key={p.id} style={{ padding:'13px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', display:'flex', gap:'12px', alignItems:'center' }}>
                          {p.imageUrl ? (
                             <div style={{ width:'44px', height:'44px', borderRadius:'8px', overflow:'hidden', flexShrink:0 }}>
                               <img src={p.imageUrl} style={{ width:'100%', height:'52px', objectFit:'cover', objectPosition:'top' }} alt={p.name} />
                             </div>
                          ) : (
                             <div style={{ width:'44px', height:'44px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'#475569', flexShrink:0 }}>No Img</div>
                          )}
                          <div>
                            <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.88rem' }}>{p.name}</div>
                            <div style={{ color:'#475569', fontSize:'0.75rem', marginTop:'3px' }}>SKU: {p.articleCode||p.code||p.sku||'N/A'} &middot; Price: ${p.price||0}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Vendor List */}
                  {msg.uiComponent==='vendor_list' && msg.uiData && (
                    <div style={{ marginTop:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                      {msg.uiData.map((v:any)=>(
                        <div key={v.id} style={{ padding:'13px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', display:'flex', alignItems:'center', gap:'12px' }}>
                          <div style={{ width:'36px', height:'36px', background:'linear-gradient(135deg,#3b82f6,#1d4ed8)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'1rem' }}>{v.name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.88rem' }}>{v.name}</div>
                            <div style={{ color:'#475569', fontSize:'0.75rem', marginTop:'2px' }}>Code: {v.vendorCode||'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PO List */}
                  {msg.uiComponent==='po_list' && msg.uiData && (
                    <div style={{ marginTop:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                      {msg.uiData.map((po:any)=>(
                        <div key={po.id} style={{ padding:'13px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div>
                            <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.88rem' }}>{po.poNumber || 'PO'}</div>
                            <div style={{ color:'#475569', fontSize:'0.75rem', marginTop:'2px' }}>{po.title || 'Purchase Order'} &middot; {new Date(po.createdAt || Date.now()).toLocaleDateString()}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontWeight:800, color:'#10b981', fontSize:'0.88rem' }}>${Number(po.total || 0).toLocaleString()}</div>
                            <div style={{ fontSize:'0.65rem', fontWeight:700, color:'#e2e8f0', background:'rgba(255,255,255,0.1)', padding:'2px 6px', borderRadius:'10px', display:'inline-block', marginTop:'4px' }}>{po.status || 'Draft'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Event List */}
                  {msg.uiComponent==='event_list' && msg.uiData && (
                    <div style={{ marginTop:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                      {msg.uiData.map((ev:any)=>(
                        <div key={ev.id} style={{ padding:'13px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px' }}>
                          <div style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.88rem' }}>{ev.title || 'Sourcing Event'}</div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px' }}>
                            <div style={{ color:'#475569', fontSize:'0.75rem' }}>Budget: <span style={{color:'#94a3b8'}}>${Number(ev.budget || 0).toLocaleString()}</span></div>
                            <div style={{ fontSize:'0.65rem', fontWeight:700, background:'rgba(249,115,22,0.2)', color:'#fb923c', padding:'2px 6px', borderRadius:'10px' }}>{ev.status || 'Active'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Generated Image */}
                  {msg.uiComponent==='generated_image' && msg.uiData && (
                    <div style={{ marginTop:'14px', borderRadius:'14px', overflow:'hidden', border:'1px solid rgba(99,102,241,0.3)', background:'rgba(15,23,42,0.9)', boxShadow:'0 8px 30px rgba(0,0,0,0.4)' }}>
                      <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(99,102,241,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:700, color:'#e2e8f0', fontSize:'0.85rem' }}>
                          <Sparkles size={16} color="#818cf8"/> AI Generation Complete
                        </div>
                        <button onClick={()=>{ const a = document.createElement('a'); a.href = msg.uiData.url; a.download = 'cortex-generation.jpg'; a.target = '_blank'; a.click(); }} style={{ padding:'6px 12px', background:'rgba(99,102,241,0.2)', color:'#a5b4fc', borderRadius:'6px', fontSize:'0.75rem', cursor:'pointer', border:'1px solid rgba(99,102,241,0.3)', fontWeight:600 }}>Open Image</button>
                      </div>
                      <div style={{ position:'relative', width:'100%', minHeight:'300px', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center' }}>
                        {/* The image takes time to load from pollinations, so we show it directly. It streams down. */}
                        <img src={msg.uiData.url} alt={msg.uiData.prompt} style={{ width:'100%', height:'auto', display:'block', clipPath:'inset(0px 0px 40px 0px)', marginBottom:'-40px' }} />
                      </div>
                      <div style={{ padding:'12px 18px', background:'rgba(0,0,0,0.3)', fontSize:'0.75rem', color:'#94a3b8', fontStyle:'italic' }}>
                        Prompt: "{msg.uiData.prompt}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isProcessing && (
              <div className="cortex-msg" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                <div style={{ width:'34px', height:'34px', flexShrink:0, borderRadius:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 16px rgba(99,102,241,0.4)' }}>
                  <Loader2 size={18} color="#fff" className="animate-spin"/>
                </div>
                <div style={{ paddingTop:'8px' }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>Cortex AI</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.15)', padding:'10px 16px', borderRadius:'12px' }}>
                    <div style={{ display:'flex', gap:'4px' }}>
                      {[0,1,2].map(i=><div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#6366f1', animation:`pulse2 1.4s ease-in-out ${i*0.2}s infinite` }}/>)}
                    </div>
                    <span style={{ fontSize:'0.83rem', color:'#818cf8', fontWeight:500 }}>Cortex is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} style={{ height:'10px' }}/>
          </div>
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{ padding:'16px 28px 24px', background:'linear-gradient(180deg,transparent 0%,#070d1c 40%)', flexShrink:0 }}>
          <div style={{ maxWidth:'780px', margin:'0 auto', position:'relative' }}>

            {/* Slash Menu */}
            {showSlash && (
              <div style={{ position:'absolute', bottom:'100%', left:0, width:'100%', background:'rgba(7,13,28,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', boxShadow:'0 -20px 60px rgba(0,0,0,0.5)', overflow:'hidden', marginBottom:'10px', backdropFilter:'blur(20px)' }}>
                <div style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'8px' }}>
                  <Sparkles size={13} color="#6366f1"/>
                  <span style={{ fontSize:'0.68rem', fontWeight:800, color:'#475569', textTransform:'uppercase', letterSpacing:'1.5px' }}>Advanced Workflows</span>
                </div>
                <div style={{ maxHeight:'320px', overflowY:'auto' }}>
                  {slashCmds.map((item: any, i: number)=>(
                      <div key={i} className="slash-btn" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'all 0.15s' }}>
                        <button onClick={()=>{ item.auto ? execute(item.cmd) : setInput(item.cmd); setShowSlash(false); }} style={{ flex: 1, display:'flex', alignItems:'center', gap:'14px', padding:'11px 16px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
                          <div style={{ background:item.bg, color:item.color, padding:'7px', borderRadius:'8px', display:'flex', flexShrink:0 }}>{item.icon}</div>
                          <div>
                            <div style={{ fontWeight:600, color:'#e2e8f0', fontSize:'0.85rem' }}>{item.cmd}</div>
                            <div style={{ color:'#475569', fontSize:'0.75rem', marginTop:'1px' }}>{item.label}</div>
                          </div>
                        </button>
                        {item.hasTutorial && (
                           <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTutorialVideo(item.cmd); setShowSlash(false); }} style={{ position:'absolute', right:'16px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.4)', color:'#a5b4fc', borderRadius:'6px', padding:'5px 8px', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.65rem', fontWeight:600, cursor:'pointer', zIndex: 10, transition:'all 0.2s', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                             <Eye size={12}/> Tutorial
                           </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Input Box */}
            <form onSubmit={send} style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <div style={{ position:'absolute', left:'18px', zIndex:2, display:'flex', alignItems:'center' }}>
                <Bot size={16} color={input?'#6366f1':'#334155'} style={{ transition:'color 0.2s' }}/>
              </div>
              <input
                type="text" value={input}
                onChange={e=>{ setInput(e.target.value); setShowSlash(e.target.value=='/'); }}
                onKeyDown={e=>{ if(e.key==='Escape') setShowSlash(false); }}
                placeholder="Ask Cortex anything, or type / for AI workflows..."
                disabled={isProcessing}
                style={{ width:'100%', padding:'16px 56px 16px 46px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#e2e8f0', fontSize:'0.95rem', outline:'none', backdropFilter:'blur(20px)', boxShadow:'0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)', transition:'border-color 0.2s', borderColor: input?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.08)' }}
              />
              <button type="submit" disabled={!input.trim()||isProcessing} style={{ position:'absolute', right:'10px', width:'38px', height:'38px', borderRadius:'12px', background: input.trim()&&!isProcessing?'linear-gradient(135deg,#6366f1,#4f46e5)':'rgba(255,255,255,0.05)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor: input.trim()&&!isProcessing?'pointer':'default', transition:'all 0.2s', boxShadow: input.trim()&&!isProcessing?'0 0 16px rgba(99,102,241,0.4)':'none' }}>
                <Send size={15} color={input.trim()&&!isProcessing?'#fff':'#334155'}/>
              </button>
            </form>
            <div style={{ textAlign:'center', color:'#1e293b', fontSize:'0.7rem', marginTop:'10px' }}>
              Cortex · Enterprise RAG · Multi-Agent Swarm · Legal AI · Chain of Thought
            </div>
          </div>
        </div>
      </div>

{/* Video Tutorial Modal */}
      {tutorialVideo && (
        <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
          <div style={{ position:'relative', width:'800px', maxWidth:'95vw', background:'#070d1c', padding:'8px', borderRadius:'16px', border:'1px solid rgba(99,102,241,0.3)', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={()=>setTutorialVideo(null)} style={{ position:'absolute', top:'-40px', right:0, background:'transparent', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.9rem', fontWeight:600 }}>
              <X size={20}/> Close
            </button>
            <div style={{ overflow:'hidden', borderRadius:'10px', aspectRatio:'16/9', background:'#000', position: 'relative' }}>
               <iframe 
                  src="https://drive.google.com/file/d/1PCzvVNfOPVQzJLEk8kJFg2Y_pfnau2K2/preview" 
                  style={{ width:'100%', height:'100%', border:'none' }}
                  allow="autoplay"
                  allowFullScreen
               ></iframe>
            </div>
            <div style={{ padding:'12px 16px', color:'#a5b4fc', fontSize:'0.75rem', textAlign:'center', background:'rgba(99,102,241,0.05)' }}>
              <strong>Video Tutorial Loaded!</strong> Your AI tutorial is now fully integrated.
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.85)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(10px)' }}>
          <div style={{ position:'relative', maxWidth:'90vw', maxHeight:'90vh', background:'#070d1c', padding:'8px', borderRadius:'16px', border:'1px solid rgba(99,102,241,0.3)', boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <button onClick={()=>setViewImage(null)} style={{ position:'absolute', top:'-40px', right:0, background:'transparent', border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'0.9rem', fontWeight:600 }}>
              <X size={20}/> Close
            </button>
            <div style={{ overflow:'hidden', borderRadius:'10px' }}>
              <img src={viewImage} style={{ maxWidth:'100%', maxHeight:'85vh', display:'block', clipPath:'inset(0px 0px 8% 0px)' }} alt="Full View" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
