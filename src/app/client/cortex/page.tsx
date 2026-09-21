'use client';
import { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit, X, Zap, Loader2, Database, Send, Terminal,
  CheckCircle2, AlertTriangle, CheckCircle, FileText, Settings, Eye,
  Plus, Sparkles, Shield, ChevronRight, BarChart3, Bot
, Sun, Moon, FileUp, Cpu, Search, Monitor, Download } from 'lucide-react';

/* ───────────────────────── Utility sub-components ───────────────────────── */


const launchPiP = async () => {
  if (!('documentPictureInPicture' in window)) {
    alert('Your browser does not support Document Picture-in-Picture. Please use Google Chrome or Microsoft Edge (version 116+).');
    return;
  }
  try {
    // @ts-ignore
    const pipWindow = await window.documentPictureInPicture.requestWindow({ width: 380, height: 600 });
    
    const style = document.createElement('style');
    style.textContent = `
      body { margin: 0; background: #0f172a; color: #f1f5f9; font-family: system-ui, sans-serif; overflow: hidden; }
      .container { display: flex; flex-direction: column; height: 100vh; padding: 20px; box-sizing: border-box; }
      .btn { background: linear-gradient(135deg, #00c6ff, #0072ff); border: none; padding: 14px; border-radius: 12px; color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; width: 100%; margin-top: auto; box-shadow: 0 4px 15px rgba(0, 114, 255, 0.3); transition: transform 0.1s; }
      .btn:active { transform: scale(0.98); }
      .msg { background: rgba(255,255,255,0.05); padding: 14px 16px; border-radius: 12px; font-size: 0.85rem; line-height: 1.5; margin-bottom: 12px; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.05); }
    `;
    pipWindow.document.head.appendChild(style);

    pipWindow.document.body.innerHTML = `
      <div class="container">
        <h3 style="margin: 0 0 5px 0; color: #00c6ff; display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.1rem; letter-spacing: -0.5px;">
          <div style="width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg, #00c6ff, #0072ff); display:flex; align-items:center; justify-content:center; box-shadow:0 4px 15px rgba(0,114,255,0.4);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          Cortex Anywhere
        </h3>
        <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 24px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Zero-Install Web Copilot</p>
        
        <div id="chatArea" style="flex: 1; overflow-y: auto;">
          <div class="msg" style="background: linear-gradient(135deg, rgba(0, 198, 255, 0.1), rgba(0, 114, 255, 0.1)); border-color: rgba(0, 114, 255, 0.2);">
            <strong style="color: #fff; display: block; margin-bottom: 6px;">Hi there!</strong>
            Click "Analyze Screen" to grant screen-share permission. I will read your open <strong>Excel spreadsheets</strong> and automatically extract Bills of Materials (BOM).
          </div>
        </div>

        <button id="scanBtn" class="btn">
          👁️ Analyze Screen
        </button>
      </div>
    `;

    pipWindow.document.getElementById('scanBtn').onclick = async () => {
       const btn = pipWindow.document.getElementById('scanBtn');
       const chat = pipWindow.document.getElementById('chatArea');
       btn.innerText = 'Requesting permission...';
       
       try {
         const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
         btn.innerText = 'Analyzing stream...';
         
         setTimeout(() => {
           stream.getTracks().forEach(track => track.stop());
           chat.innerHTML += `<div class="msg" style="border-color: rgba(0,198,255,0.3); background: rgba(0,198,255,0.05);">
            <strong style="color: #00c6ff; display: block; margin-bottom: 6px;">Context Detected: Microsoft Excel</strong>
            I see you are looking at an Excel spreadsheet containing a <strong>Bill of Materials</strong> for IT Infrastructure.<br/><br/>
            💡 <strong>Cortex Insights:</strong><br/>
            I have instantly cross-referenced the hardware rows visible on your screen against our internal catalog. I can procure the entire list for <strong>$23,200</strong> through our preferred vendors.<br/><br/>
            <button style="background: #00c6ff; border: none; padding: 8px 12px; border-radius: 6px; color: #fff; font-weight: bold; cursor: pointer; margin-top: 8px; width: 100%;">Generate PR from Excel Data</button>
            </div>`;
           chat.scrollTop = chat.scrollHeight;
           btn.innerText = '👁️ Analyze Screen';
         }, 2500);

       } catch(e) {
         btn.innerText = '👁️ Analyze Screen';
         chat.innerHTML += '<div class="msg" style="color: #f87171;">Screen capture cancelled or blocked.</div>';
       }
    };
  } catch(e) {
    console.error(e);
    alert('Failed to launch PiP window.');
  }
};

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
          <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} onWheel={(e) => (e.target as any).blur()} placeholder="Total Compensation ($)" onChange={e=>setFd({...fd, amount:e.target.value})} style={inp}/>
        </div>
      )}
      <button onClick={()=>onSubmit({ type:docType, ...fd })} style={{ width:'100%', marginTop:'16px', padding:'11px', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', display:'flex', justifyContent:'center', alignItems:'center', gap:'8px', fontSize:'0.85rem' }}>
        <Zap size={15}/> Generate Document
      </button>
      
      
    </div>
  );
};


const S2PProgressAndEvent = ({ data, execute }: { data: any, execute: (c:string)=>void }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: data.defaultTitle || '', quantity: 1, duration: '7', durationUnit: 'days' });
  
  useEffect(() => {
    const ts = [
      setTimeout(()=>setStep(1), 1000),
      setTimeout(()=>setStep(2), 2200),
      setTimeout(()=>setStep(3), 3400)
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const inp = { width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' };

  return (
    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(15,23,42,0.95)', border:'1px solid rgba(16,185,129,0.3)', boxShadow:'0 8px 30px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#10b981', marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}>
        <Database size={18}/> S2P Pipeline Active
      </div>
      
      {/* Branching UI */}
      <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'24px', position:'relative', marginLeft:'8px' }}>
        <div style={{ position:'absolute', left:'11px', top:'10px', bottom:'10px', width:'2px', background:'rgba(16,185,129,0.2)', zIndex:0 }}/>
        
        {[{t:'Intake Created', d:data.intakeRef}, {t:'Routed to PR', d:data.poRef}, {t:'Ready for Sourcing', d:'Awaiting Event Creation'}].map((s, i) => (
           <div key={i} style={{ display:'flex', gap:'16px', alignItems:'center', position:'relative', zIndex:1, opacity: step>=i ? 1 : 0.3, transform: step>=i ? 'translateX(0)' : 'translateX(-10px)', transition:'all 0.5s' }}>
             <div style={{ width:'24px', height:'24px', borderRadius:'50%', background: step>i ? '#10b981' : step===i ? '#818cf8' : '#1e293b', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid #0f172a', flexShrink:0 }}>
                {step>i ? <CheckCircle2 size={12} color="#fff"/> : <div style={{width:'6px',height:'6px',background:'#fff',borderRadius:'50%'}}/>}
             </div>
             <div>
               <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#f1f5f9' }}>{s.t}</div>
               <div style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{s.d}</div>
             </div>
           </div>
        ))}
      </div>

      
                    {/* Event Form */}
      {step >= 3 && (
        <div style={{ animation:'fadeSlideIn 0.5s ease-out forwards', paddingTop:'18px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ marginBottom:'12px', fontSize:'0.82rem', fontWeight:600, color:'#e2e8f0' }}>Convert PR to Sourcing Event</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <input type="text" placeholder="Event Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} style={inp}/>
            <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} onWheel={(e) => (e.target as any).blur()} placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form, quantity:parseInt(e.target.value)||1})} style={inp}/>
            <div style={{ display:'flex', gap:'10px' }}>
              <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} onWheel={(e) => (e.target as any).blur()} placeholder="Duration" value={form.duration} onChange={e=>setForm({...form, duration:e.target.value})} style={{ ...inp, flex:1 }}/>
              <select value={form.durationUnit} onChange={e=>setForm({...form, durationUnit:e.target.value})} style={{ ...inp, width:'120px', cursor:'pointer' }}>
                <option value="minutes" style={{background:'#0f172a'}}>Minutes</option>
                <option value="days" style={{background:'#0f172a'}}>Days</option>
              </select>
            </div>
            <button onClick={()=>{ if(!form.title || !form.duration) return alert('Please fill all mandatory fields.'); execute('/execute-s2p-event '+JSON.stringify({...form, intakeRef: data.intakeRef, poRef: data.poRef}))}} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#3b82f6,#2563eb)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem', marginTop:'4px' }}>Launch Sourcing Event</button>
          </div>
        </div>
      )}
    </div>
  );
};

const AgentSwarm = ({ data }: { data: any }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    // 5 steps now
    const ts = [
      setTimeout(()=>setStep(1), 1200), 
      setTimeout(()=>setStep(2), 2400), 
      setTimeout(()=>setStep(3), 3600), 
      setTimeout(()=>setStep(4), 4800),
      setTimeout(()=>setStep(5), 5500)
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  const getRiskColor = (level: string) => {
    if(level==='HIGH' || level==='CRITICAL') return '#ef4444';
    if(level==='MEDIUM') return '#f59e0b';
    return '#10b981';
  };

  const riskColor = data.riskLevel ? getRiskColor(data.riskLevel) : '#ef4444';

  return (
    <div style={{ background:'linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.9))', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'16px', overflow:'hidden', width:'100%', backdropFilter:'blur(20px)' }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', padding:'8px', borderRadius:'10px', display:'flex' }}><Sparkles size={16} color="#fff"/></div>
        <div>
          <div style={{ fontSize:'0.65rem', fontWeight:700, color:'#6366f1', textTransform:'uppercase', letterSpacing:'2px' }}>Enterprise Risk Swarm</div>
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
                {active && <div style={{ fontSize:'0.78rem', color:'#818cf8', marginTop:'5px' }}>Scanning datalakes and running models...</div>}
                {done && <div style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:'5px', paddingLeft:'8px', borderLeft:'2px solid rgba(16,185,129,0.4)' }}>{agent.finding}</div>}
              </div>
            </div>
          );
        })}

        {step >= data.agents.length && (
          <div style={{ marginTop:'10px', animation:'fadeSlideIn 0.5s ease-out forwards' }}>
            <div style={{ display:'flex', gap:'16px', background:'rgba(0,0,0,0.3)', padding:'20px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)' }}>
              
              {/* Risk Score Circle */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minWidth:'120px' }}>
                <div style={{ position:'relative', width:'90px', height:'90px', borderRadius:'50%', background:`conic-gradient(${riskColor} ${(data.score || 85)}%, rgba(255,255,255,0.05) 0)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 30px ${riskColor}33` }}>
                  <div style={{ position:'absolute', width:'74px', height:'74px', borderRadius:'50%', background:'#0f172a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:'1.6rem', fontWeight:800, color:'#fff', lineHeight:'1' }}>{data.score || 85}</span>
                    <span style={{ fontSize:'0.55rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', marginTop:'2px' }}>/ 100</span>
                  </div>
                </div>
                <div style={{ marginTop:'12px', fontSize:'0.75rem', fontWeight:700, color:riskColor, textTransform:'uppercase', letterSpacing:'1px', background:`${riskColor}1a`, padding:'4px 12px', borderRadius:'20px', border:`1px solid ${riskColor}40` }}>
                  {data.riskLevel || 'HIGH RISK'}
                </div>
              </div>

              {/* Executive Summary */}
              <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'8px' }}>Executive Synthesis</div>
                <div style={{ fontSize:'0.85rem', color:'#e2e8f0', lineHeight:'1.6', marginBottom:'12px' }}>
                  {data.summary}
                </div>
                {data.mitigations && data.mitigations.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:'#818cf8', textTransform:'uppercase' }}>Recommended Actions:</div>
                    {data.mitigations.map((m:string, idx:number) => (
                       <div key={idx} style={{ display:'flex', alignItems:'flex-start', gap:'8px', fontSize:'0.78rem', color:'#cbd5e1' }}>
                         <Shield size={14} color="#818cf8" style={{ marginTop:'2px', flexShrink:0 }}/>
                         <span>{m}</span>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px', marginTop:'16px' }}>
              <button style={{ flex:1, padding:'10px', background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <FileText size={14}/> Download Full Risk Dossier (PDF)
              </button>
              <button style={{ flex:1, padding:'10px', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <CheckCircle2 size={14}/> Auto-Draft Mitigation Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CortexPage() {
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('Admin');
  const [messages, setMessages] = useState<Message[]>([
    { role:'agent', content:'Cortex is online. I am your advanced multi-agent procurement intelligence system, powered by enterprise RAG. How can I assist you today?' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [slashCategory, setSlashCategory] = useState('All');
  const [chats, setChats] = useState<{id: string, title: string, messages: Message[]}[]>([
    { id: 'c1', title: 'Risk Swarm — Vendor Contract Q3', messages: [{ role: 'agent', content: 'Multi-Agent Swarm analysis completed for Vendor Contract Q3.' }] },
    { id: 'c2', title: 'Legal Review — NDA Acme Corp', messages: [{ role: 'agent', content: 'Legal clause review completed for Acme Corp NDA.' }] },
    { id: 'c3', title: 'Procurement Savings Analysis', messages: [{ role: 'agent', content: 'Savings analysis: Found 12% cost reduction opportunities.' }] },
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [eventForm, setEventForm] = useState({ title:'', budget:'', vendorId:'', duration:'', durationUnit:'days' });
  const [s2pForm, setS2pForm] = useState({ title: '', category: 'IT', department: 'Engineering', budget: '', description: '', quantity: 1, requiredDate: '', address: '' });
  const [vendorForm, setVendorForm] = useState({ name:'', email:'', category:'' });
  const [poForm, setPoForm] = useState({ poNumber:'', amount:'', desc:'' });
  const [productForm, setProductForm] = useState({ name:'', sku:'', price:'', imageUrl:'', isGenerating:false });
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [tutorialVideo, setTutorialVideo] = useState<string | null>(null);
    const [isDark, setIsDark] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const playGreeting = () => {
        if (!sessionStorage.getItem('cortex_greeted_v2')) {
          try {
            const audio = new Audio('/greeting.mp3');
            audio.volume = 1.0;
            audio.play().then(() => {
              sessionStorage.setItem('cortex_greeted_v2', 'true');
              document.removeEventListener('click', playGreeting);
              document.removeEventListener('keydown', playGreeting);
            }).catch(e => {
              // Autoplay still blocked, keep listeners active
            });
          } catch(e) {}
        }
      };

      // Try playing immediately
      setTimeout(playGreeting, 500);

      // Fallback: If autoplay blocked, play on first interaction
      document.addEventListener('click', playGreeting);
      document.addEventListener('keydown', playGreeting);
      
      return () => {
        document.removeEventListener('click', playGreeting);
        document.removeEventListener('keydown', playGreeting);
      };
    }
  }, []);

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
    if(cmd.startsWith('/execute-bom-upload')) display = 'Processing Bill of Materials...';
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

  
  const handleScreenScan = async () => {
    setShowSlash(false);
    const msgId = 'scan-' + Date.now();
    setMessages(p => [...p, 
      { role: 'user', content: 'Scan my current screen and analyze it.' },
      { id: msgId, role: 'agent', content: 'Requesting permission to read screen...', isLoading: true }
    ]);
    setIsProcessing(true);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'window' } });
      setMessages(p => p.map(m => m.id === msgId ? { ...m, content: 'Analyzing live video frame with Local OCR...' } : m));

      // @ts-ignore
      if (!(window as any).Tesseract) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      stream.getTracks().forEach(t => t.stop());

      // @ts-ignore
      const { data: { text } } = await (window as any).Tesseract.recognize(canvas, 'eng');

      if (!text || text.trim().length === 0) {
        setMessages(p => p.map(m => m.id === msgId ? { ...m, content: 'Could not detect clear text on that screen.', isLoading: false } : m));
      } else {
        const cleanText = text.substring(0, 1500) + (text.length > 1500 ? '... [TRUNCATED]' : '');
        setMessages(p => p.map(m => m.id === msgId ? { ...m, content: `**Screen Analysis Complete.**\n\nI successfully scanned your screen using an advanced in-browser local OCR engine. Here is the raw text extracted directly from the pixels:\n\n\`\`\`text\n${cleanText}\n\`\`\``, isLoading: false } : m));
      }
    } catch (err) {
      console.error(err);
      setMessages(p => p.map(m => m.id === msgId ? { ...m, content: 'Screen capture cancelled or failed.', isLoading: false } : m));
    }
    
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
      { category:'Sourcing', cmd:'/bom', label:'BOM to Purchase Request (AI Matcher)', icon:<FileUp size={14}/>, color:'#2dd4bf', bg:'rgba(45,212,191,0.12)', auto:true, hasTutorial: false },
      { category:'Sourcing', cmd:'/analyze-bids', label:'Compare Vendor Bids & Export', icon:<BarChart3 size={14}/>, color:'#f43f5e', bg:'rgba(244,63,94,0.12)', auto:true, hasTutorial: false },
      { category:'System', cmd:'/analyze-risk', label:'Multi-Agent Risk Swarm', icon:<AlertTriangle size={14}/>, color:'#f87171', bg:'rgba(239,68,68,0.12)', auto:true },
      { category:'Legal', cmd:'/analyze-contract', label:'Deep Legal Clause Review', icon:<Shield size={14}/>, color:'#c084fc', bg:'rgba(168,85,247,0.12)', auto:true },
      { category:'Legal', cmd:'/draft-contract', label:'Generate Legal Document', icon:<FileText size={14}/>, color:'#818cf8', bg:'rgba(99,102,241,0.12)', auto:false, hasTutorial: true },
      { category:'Legal', cmd:'/review-clause', label:'AI Legal Risk Analysis', icon:<Shield size={14}/>, color:'#f43f5e', bg:'rgba(244,63,94,0.12)', auto:true },
      { category:'Logistics', cmd:'/track-shipments', label:'Live ASN/GRN Tracking', icon:<Zap size={14}/>, color:'#eab308', bg:'rgba(234,179,8,0.12)', auto:true },
      { category:'Logistics', cmd:'/predict-stockout', label:'Inventory Shortage Alerts', icon:<AlertTriangle size={14}/>, color:'#ef4444', bg:'rgba(239,68,68,0.12)', auto:true },
      { category:'Finance', cmd:'/3way-match', label:'Invoice Reconciliation', icon:<Database size={14}/>, color:'#10b981', bg:'rgba(16,185,129,0.12)', auto:true },
      { category:'Vendors', cmd:'/esg-audit', label:'Vendor Sustainability Score', icon:<CheckCircle2 size={14}/>, color:'#14b8a6', bg:'rgba(20,184,166,0.12)', auto:true },
      { category:'System', cmd:'/market-intel', label:'Live Commodity Pricing Trends', icon:<BarChart3 size={14}/>, color:'#6366f1', bg:'rgba(99,102,241,0.12)', auto:true },
      { category:'Vendors', cmd:'/vendor-scorecard', label:'Vendor Performance Grades', icon:<CheckCircle size={14}/>, color:'#3b82f6', bg:'rgba(59,130,246,0.12)', auto:true },
      { category:'Sourcing', cmd:'/s2p', label:'End-to-End Source to Pay', icon:<Database size={14}/>, color:'#10b981', bg:'rgba(16,185,129,0.12)', auto:true },
      { category:'Sourcing', cmd:'/create-event', label:'Create Sourcing Event / Auction', icon:<Zap size={14}/>, color:'#fb923c', bg:'rgba(249,115,22,0.12)', auto:false },
      { category:'Vendors', cmd:'/create-vendor', label:'Onboard New Supplier', icon:<CheckCircle2 size={14}/>, color:'#34d399', bg:'rgba(16,185,129,0.12)', auto:false },
      { category:'Finance', cmd:'/draft-po', label:'Draft Purchase Order', icon:<Database size={14}/>, color:'#38bdf8', bg:'rgba(14,165,233,0.12)', auto:false },
      { category:'System', cmd:'/add-product', label:'Add Item to Catalog', icon:<Plus size={14}/>, color:'#a3e635', bg:'rgba(132,204,22,0.12)', auto:false },
      { category:'System', cmd:'/scan', label:'Analyze Current Screen (OCR)', icon:<Monitor size={14}/>, color:'#00c6ff', bg:'rgba(0,198,255,0.12)', auto:true },
      { category:'System', cmd:'/clear', label:'Clear Conversation', icon:<X size={14}/>, color:'#94a3b8', bg:'rgba(148,163,184,0.08)', auto:true },
    ];

  return (
    <div className={(isDark ? "cortex-dark" : "cortex-light") + " cx-wrapper"} style={{ display:'flex', height:'100%', width:'100%', background: isDark ? '#040810' : '#f0f4f8', overflow:'hidden', fontFamily:'system-ui,sans-serif', position:'relative' }}>
      
      {/* Animated Background */}
      <style>{`
        /* ══ DRAKE DARK THEME ══ */
        .cortex-dark { color-scheme: dark; }
        .cortex-dark input, .cortex-dark textarea, .cortex-dark select { color-scheme: dark; }
        .cortex-dark input::placeholder, .cortex-dark textarea::placeholder { color: rgba(100,116,139,0.4) !important; }

        /* ══ LIGHT THEME — COMPREHENSIVE ══ */
        .cortex-light { color-scheme: light; }

        /* Sidebar */
        .cortex-light .cx-sidebar { background: #ffffff !important; border-right-color: #e2e8f0 !important; }
        .cortex-light .cx-sidebar > div { border-color: #e2e8f0 !important; }
        .cortex-light .cx-sidebar span { color: #475569 !important; }
        .cortex-light .cx-sidebar div[style*="color:'#334155'"] { color: #94a3b8 !important; }
        .cortex-light .hist-item:hover { background: #f1f5f9 !important; }
        .cortex-light .hist-item[style*="rgba(99,102,241"] { background: #eff6ff !important; border-color: #bfdbfe !important; }
        
        /* Main chat background */
        .cortex-light .cx-main { background: #f0f4f8 !important; }

        /* Message text */
        .cortex-light .cortex-msg div[style*="color: msg.role==='agent'?'#e2e8f0"] { color: #1e293b !important; }

        /* Slash menu */
        .cortex-light div[style*="rgba(7,13,28"] { background: #ffffff !important; border-color: #e2e8f0 !important; box-shadow: 0 -20px 60px rgba(0,0,0,0.1) !important; }
        .cortex-light div[style*="rgba(7,13,28"] span { color: #94a3b8 !important; }
        .cortex-light .slash-btn:hover { background: #f8fafc !important; }
        .cortex-light .slash-btn div[style*="color:'#e2e8f0'"] { color: #1e293b !important; }
        .cortex-light .slash-btn div[style*="color:'#475569'"] { color: #64748b !important; }
        .cortex-light .slash-btn { border-bottom-color: #f1f5f9 !important; }

        /* Thinking dots */
        .cortex-light div[style*="rgba(99,102,241,0.08)"][style*="border"] { background: #eff6ff !important; border-color: #bfdbfe !important; }
        .cortex-light div[style*="rgba(99,102,241,0.08)"][style*="border"] span { color: #4f46e5 !important; }

        /* FORM CARDS - light backgrounds */
        .cortex-light .cx-form-card { background: #ffffff !important; border-color: #e0e7ff !important; box-shadow: 0 4px 24px rgba(99,102,241,0.1) !important; }
        .cortex-light .cx-event-card { border-color: #fed7aa !important; box-shadow: 0 4px 24px rgba(234,88,12,0.1) !important; }

        /* Form card header bands */
        .cortex-light .cx-form-card div[style*="padding:'16px 20px 14px'"] { background: rgba(99,102,241,0.06) !important; border-bottom-color: #e0e7ff !important; }
        .cortex-light .cx-event-card div[style*="padding:'16px 20px 14px'"] { background: rgba(234,88,12,0.05) !important; border-bottom-color: #fed7aa !important; }

        /* Form card text */
        .cortex-light .cx-form-card div[style*="color:'#f1f5f9'"] { color: #0f172a !important; }
        .cortex-light .cx-form-card div[style*="color:'rgba(148,163,184,0.5)'"] { color: #64748b !important; }
        .cortex-light .cx-form-card label { color: #475569 !important; }
        .cortex-light .cx-form-card span[style*="color:'rgba(148,163,184"] { color: #94a3b8 !important; }

        /* Form inner dividers */
        .cortex-light .cx-form-card div[style*="borderTop:'1px solid rgba(255,255,255,0.05)'"] { border-top-color: #e2e8f0 !important; }

        /* ALL FORM INPUTS, TEXTAREAS, SELECTS */
        .cortex-light input, .cortex-light textarea, .cortex-light select {
          background: #f8fafc !important;
          color: #0f172a !important;
          border-color: #e2e8f0 !important;
          color-scheme: light !important;
        }
        .cortex-light input::placeholder, .cortex-light textarea::placeholder { color: #94a3b8 !important; }
        .cortex-light input:focus, .cortex-light textarea:focus { border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important; }

        /* Main chat input bar */
        .cortex-light .cx-input-bar input { background: #ffffff !important; color: #0f172a !important; border-color: #e2e8f0 !important; box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important; }
        .cortex-light .cx-input-bar input:focus { border-color: rgba(99,102,241,0.4) !important; }

        /* Footer tagline */
        .cortex-light div[style*="color:'#1e293b'"][style*="0.7rem"] { color: #94a3b8 !important; }

        /* Scrollbar */
        .cortex-light ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15) !important; }

        /* ── ANIMATIONS (shared) ── */
        @keyframes bgFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.05)} }
        @keyframes pulse2 { 0%,100%{opacity:0.4} 50%{opacity:0.7} }
        @keyframes cortexSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .cortex-msg { animation: fadeSlideIn 0.35s ease forwards; }
        .slash-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .bom-row { transition: all 0.2s; }
        .cortex-dark .bom-row:hover { background: rgba(255,255,255,0.04) !important; }
        .cortex-light .bom-row:hover { background: rgba(0,0,0,0.02) !important; }
        .hist-item:hover { background: rgba(255,255,255,0.05) !important; } .hist-item:hover .dots-btn { opacity: 1 !important; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.2); border-radius:4px; }
        ::-webkit-scrollbar-thumb:hover { background:rgba(99,102,241,0.35); }
        /* ══ MOBILE RESPONSIVENESS ══ */
        @media (max-width: 768px) {
          .cx-wrapper { flex-direction: column !important; }
          .cx-sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; flex-shrink: 0 !important; }
          .cx-sidebar-history { display: none !important; /* Hide chat history on mobile to save space */ }
          .cx-main { height: calc(100vh - 120px) !important; /* Approximate available height */ }
          
          /* Form stacking */
          .cx-form-grid-2 { grid-template-columns: 1fr !important; }
          .cx-form-grid-2-1 { grid-template-columns: 1fr !important; }
          
          /* Chat area spacing */
          .cx-chat-area { padding: 16px 12px !important; }
          .cx-msg-bubble { gap: 10px !important; }
          
          /* Input bar */
          .cx-input-bar { padding: 10px 12px 16px !important; }
          .cx-input-field { padding-left: 40px !important; font-size: 16px !important; /* 16px prevents iOS zoom */ }
          
          /* Slash menu */
          .cx-slash-menu { bottom: 70px !important; width: calc(100% - 24px) !important; left: 12px !important; }
        }
      `}</style>
      <div style={{ position:'fixed', top:'-200px', left:'30%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', animation:'bgFloat 8s ease-in-out infinite', pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'fixed', bottom:'-100px', right:'10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)', animation:'bgFloat 12s ease-in-out infinite reverse', pointerEvents:'none', zIndex:0 }}/>

      {/* ── LEFT SIDEBAR ── */}
      <div className="cx-sidebar" style={{ width:'270px', background:'rgba(255,255,255,0.02)', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', flexShrink:0, backdropFilter:'blur(20px)' }}>
        
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
        <div className="cx-sidebar-history" style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
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

        {/* Desktop App Download */}
        <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
          <div onClick={launchPiP} style={{ background:'linear-gradient(135deg, rgba(0,198,255,0.1), rgba(0,114,255,0.1))', border:'1px solid rgba(0,114,255,0.3)', padding:'12px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', transition:'all 0.2s' }} className="slash-btn">
               <div style={{ width:'28px', height:'28px', borderRadius:'6px', background:'linear-gradient(135deg, #00c6ff, #0072ff)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, animation: 'shimmer 3s infinite', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', transform: 'skewX(-20deg)', animation: 'shimmer 3s infinite' }} />
                 <Monitor size={14} color="#fff" style={{ position: 'relative', zIndex: 1 }} />
               </div>
               <div>
                 <div style={{ fontSize:'0.8rem', fontWeight:800, color: isDark ? '#e2e8f0' : '#1e293b' }}>Launch Web Copilot</div>
                 <div style={{ fontSize:'0.65rem', color: isDark ? '#94a3b8' : '#64748b' }}>Zero-Install Floating Widget</div>
               </div>
            </div>
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
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(245,158,11,0.12)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(245,158,11,0.3)', color: isDark ? '#94a3b8' : '#f59e0b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'5px 10px', borderRadius:'8px', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.05em', flexShrink:0, transition:'all 0.25s', fontFamily:'inherit' }}
          >
            {isDark ? <><Sun size={12}/>&nbsp;LIGHT</> : <><Moon size={12}/>&nbsp;DARK</>}
          </button>
            <Settings size={15} color="#334155" style={{ cursor:'pointer', flexShrink:0 }}/>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="cx-main" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        
        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'32px 0 0', minHeight:0 }}>
          <div className="cx-chat-area" style={{ maxWidth:'780px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'28px', padding:'0 28px 24px' }}>
            {messages.map((msg, idx)=>(
              <div key={idx} className="cortex-msg cx-msg-bubble" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                
                {/* Avatar */}
                <div style={{ width:'34px', height:'34px', flexShrink:0, borderRadius:'10px', background: msg.role==='agent'?'linear-gradient(135deg,#6366f1,#8b5cf6)':'rgba(255,255,255,0.07)', border: msg.role==='agent'?'none':'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow: msg.role==='agent'?'0 0 16px rgba(99,102,241,0.3)':'none' }}>
                  {msg.role==='agent' ? <BrainCircuit size={18}/> : <span style={{ fontSize:'0.85rem', fontWeight:700 }}>{userName.charAt(0)}</span>}
                </div>

                <div style={{ flex:1, paddingTop:'4px', minWidth:0 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, marginBottom:'8px', color: msg.role==='agent'?'#818cf8': isDark ? '#94a3b8' : '#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    {msg.role==='agent' ? 'Cortex AI' : 'You'}
                  </div>
                  <div style={{ color: msg.role==='agent'? (isDark ? '#e2e8f0' : '#1e293b') : (isDark ? '#94a3b8' : '#475569'), fontSize:'0.95rem', lineHeight:'1.7' }}>
                    {fmt(msg.content)}
                  </div>

                  {/* Chain of Thought */}
                  {msg.thoughtProcess && (
                    <details style={{ marginTop:'12px' }}>
                      <summary style={{ fontSize:'0.73rem', fontWeight:700, color:'#4f6072', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', userSelect:'none', listStyle:'none', marginBottom:'0' }}>
                        <ChevronRight size={12}/> Agentic Chain of Thought · {msg.thoughtProcess.length} steps
                      </summary>
                      <div style={{ marginTop:'8px', padding:'12px 14px', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'8px', fontFamily:'monospace', fontSize:'0.72rem', lineHeight:'1.7', color:'#38bdf8' }}>
                        {msg.thoughtProcess.map((s: string, i: number)=>(<div key={i} style={{ opacity:0.8 }}><span style={{ color:'#334155', marginRight:'8px' }}>[{String(i+1).padStart(2,'0')}]</span>{s}</div>))}
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

                                    {/* BOM Upload UI */}
                  {msg.uiComponent==='bom_upload' && (
                    <label className="cx-form-card" style={{ marginTop:'14px', borderRadius:'16px', border:'1px dashed rgba(45,212,191,0.4)', background: isDark ? 'rgba(45,212,191,0.03)' : 'rgba(45,212,191,0.05)', padding:'32px 24px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', transition:'all 0.2s', cursor:'pointer' }}>
                      <input type="file" style={{ display: 'none' }} accept=".csv,.xlsx" onChange={(e) => { if(e.target.files && e.target.files.length > 0) execute('/execute-bom-upload'); }} />
                      <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(20,184,166,0.2))', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px', boxShadow:'0 0 20px rgba(45,212,191,0.1)' }}>
                        <FileUp size={28} color="#2dd4bf" />
                      </div>
                      <div style={{ fontSize:'1.05rem', fontWeight:700, color: isDark ? '#f1f5f9' : '#0f172a', marginBottom:'8px' }}>Upload Bill of Materials (BOM)</div>
                      <div style={{ fontSize:'0.85rem', color: isDark ? '#94a3b8' : '#64748b', maxWidth:'300px', marginBottom:'20px', lineHeight:1.5 }}>Drag and drop your Excel (.xlsx) or CSV file here, or click to browse.</div>
                      <div style={{ background:'linear-gradient(135deg, #2dd4bf, #0d9488)', border:'none', padding:'10px 24px', borderRadius:'24px', color:'#fff', fontWeight:600, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 15px rgba(13,148,136,0.3)', display:'flex', alignItems:'center', gap:'8px', pointerEvents:'none' }}>
                         Browse Files
                      </div>
                    </label>
                  )}

                  
                  {/* PR Success UI */}
                  {msg.uiComponent==='pr_success' && msg.uiData && (
                    <div className="cx-form-card" style={{ marginTop:'14px', borderRadius:'16px', border:'1px solid rgba(34,197,94,0.3)', background: isDark ? 'rgba(34,197,94,0.05)' : '#f0fdf4', padding:'24px', display:'flex', alignItems:'center', gap:'20px', animation: 'fadeSlideIn 0.4s ease forwards' }}>
                      <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg, #22c55e, #16a34a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 20px rgba(34,197,94,0.3)' }}>
                        <CheckCircle size={28} color="#fff" />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'1.1rem', fontWeight:800, color: isDark ? '#4ade80' : '#15803d', marginBottom:'4px' }}>Purchase Request Generated!</div>
                        <div style={{ fontSize:'0.85rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight:1.5 }}>
                          <strong>{msg.uiData.prNumber}</strong> for <strong>${msg.uiData.total.toLocaleString()}</strong> has been successfully created and routed to the IT Manager for financial approval.
                        </div>
                      </div>
                      <button style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', padding:'10px 20px', borderRadius:'8px', color: isDark ? '#fff' : '#0f172a', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s' }}>
                        View PR Details
                      </button>
                    </div>
                  )}

                  {/* BOM Results UI */}
                  {msg.uiComponent==='bom_results' && msg.uiData && (
                    <div className="cx-form-card" style={{ marginTop:'16px', borderRadius:'16px', overflow:'hidden', border:'1px solid rgba(45,212,191,0.2)', background: isDark ? 'rgba(15,23,42,0.8)' : '#ffffff', boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 30px rgba(45,212,191,0.1)' }}>
                      
                      <div style={{ padding:'16px 20px', background: isDark ? 'rgba(45,212,191,0.1)' : 'rgba(45,212,191,0.05)', borderBottom: isDark ? '1px solid rgba(45,212,191,0.15)' : '1px solid rgba(45,212,191,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <Cpu size={18} color="#2dd4bf" />
                          <div>
                            <div style={{ fontSize:'0.9rem', fontWeight:700, color: isDark ? '#f1f5f9' : '#0f172a' }}>BOM Match Results</div>
                            <div style={{ fontSize:'0.7rem', color: isDark ? '#94a3b8' : '#64748b', marginTop:'2px' }}>{msg.uiData.items.length} line items processed successfully</div>
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                           <div style={{ fontSize:'0.7rem', color: isDark ? '#94a3b8' : '#64748b', textTransform:'uppercase', fontWeight:700, letterSpacing:'0.5px' }}>Total Est. Cost</div>
                           <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#2dd4bf' }}>${msg.uiData.totalEstimatedCost.toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem', textAlign:'left' }}>
                          <thead>
                            <tr style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e2e8f0' }}>
                              <th style={{ padding:'12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight:600 }}>Part #</th>
                              <th style={{ padding:'12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight:600 }}>Description</th>
                              <th style={{ padding:'12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight:600 }}>Status</th>
                              <th style={{ padding:'12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight:600 }}>Vendor / Source</th>
                              <th style={{ padding:'12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight:600, textAlign:'right' }}>Unit Cost</th>
                              <th style={{ padding:'12px 16px', color: isDark ? '#94a3b8' : '#64748b', fontWeight:600, textAlign:'right' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.uiData.items.map((item: any) => (
                              <tr className="bom-row" key={item.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid #f1f5f9' }}>
                                <td style={{ padding:'12px 16px', fontWeight:600, color: isDark ? '#e2e8f0' : '#1e293b' }}>{item.part}</td>
                                <td style={{ padding:'12px 16px', color: isDark ? '#cbd5e1' : '#475569' }}>{item.desc}<br/><span style={{ fontSize:'0.7rem', color: isDark ? '#64748b' : '#94a3b8' }}>Qty: {item.qty}</span></td>
                                <td style={{ padding:'12px 16px' }}>
                                  {item.status === 'IN CATALOG' ? (
                                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 8px', borderRadius:'6px', background: isDark ? 'rgba(34,197,94,0.1)' : '#dcfce7', color: isDark ? '#4ade80' : '#15803d', fontSize:'0.7rem', fontWeight:700 }}>
                                      <CheckCircle size={10}/> CATALOG MATCH
                                    </span>
                                  ) : (
                                    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'4px 8px', borderRadius:'6px', background: isDark ? 'rgba(245,158,11,0.1)' : '#fef3c7', color: isDark ? '#fbbf24' : '#b45309', fontSize:'0.7rem', fontWeight:700 }}>
                                      <Search size={10}/> AI SOURCED
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding:'12px 16px', color: isDark ? '#cbd5e1' : '#475569' }}>{item.vendor}</td>
                                <td style={{ padding:'12px 16px', textAlign:'right', fontWeight:700, color: isDark ? '#94a3b8' : '#64748b' }}>${item.unitCost.toLocaleString()}</td>
                                <td style={{ padding:'12px 16px', textAlign:'right', fontWeight:800, color: isDark ? '#e2e8f0' : '#1e293b' }}>${(item.qty * item.unitCost).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={{ padding:'16px 20px', background: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', display:'flex', justifyContent:'flex-end' }}>
                        <button onClick={() => setMessages(p => [...p, { role:'agent', content:'', uiComponent:'pr_success', uiData: { prNumber: 'PR-2026-0842', total: msg.uiData.totalEstimatedCost } }])} style={{ background:'linear-gradient(135deg, #2dd4bf, #0d9488)', border:'none', padding:'12px 24px', borderRadius:'8px', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 15px rgba(13,148,136,0.3)', display:'flex', alignItems:'center', gap:'8px', transition:'transform 0.1s' }}>
                          <CheckCircle2 size={16}/> Generate Purchase Request
                        </button>
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


                    {/* S2P Intake Form */}
                    {msg.uiComponent==='s2p_intake_form' && (
                      <div className="cx-form-card" style={{ marginTop:'16px', borderRadius:'18px', overflow:'hidden', border:'1px solid rgba(99,102,241,0.15)', background: isDark ? 'linear-gradient(145deg,rgba(15,12,35,0.97),rgba(10,8,25,0.98))' : '#ffffff', boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.05)' : '0 8px 40px rgba(99,102,241,0.1),inset 0 1px 0 rgba(99,102,241,0.1)' }}>
                        <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(99,102,241,0.07)', display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', boxShadow:'0 4px 10px rgba(99,102,241,0.4)', flexShrink:0 }}>📋</div>
                          <div>
                            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.88rem' }}>Source-to-Pay Intake</div>
                            <div style={{ color:'rgba(148,163,184,0.5)', fontSize:'0.7rem', marginTop:'1px' }}>Fill in the procurement request details</div>
                          </div>
                        </div>
                        <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:'13px' }}>
                          <div>
                            <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Request Title <span style={{color:'#f87171'}}>*</span></label>
                            <input type="text" placeholder="e.g. Q4 Marketing Software Licenses" value={s2pForm.title} onChange={e=>setS2pForm({...s2pForm, title:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', boxSizing:'border-box' }} onFocus={e=>{e.target.style.border='1px solid rgba(99,102,241,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)';}} onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}/>
                          </div>
                          <div className="cx-form-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                            <div>
                              <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Category <span style={{color:'#f87171'}}>*</span></label>
                              <select value={s2pForm.category} onChange={e=>setS2pForm({...s2pForm, category:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,12,35,0.95)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', cursor:'pointer', boxSizing:'border-box' }}>
                                <option value="IT" style={{background:'#0f0c23'}}>IT</option>
                                <option value="HR" style={{background:'#0f0c23'}}>HR</option>
                                <option value="Marketing" style={{background:'#0f0c23'}}>Marketing</option>
                                <option value="Operations" style={{background:'#0f0c23'}}>Operations</option>
                                <option value="Finance" style={{background:'#0f0c23'}}>Finance</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Department <span style={{color:'#f87171'}}>*</span></label>
                              <select value={s2pForm.department} onChange={e=>setS2pForm({...s2pForm, department:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(15,12,35,0.95)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', cursor:'pointer', boxSizing:'border-box' }}>
                                <option value="Engineering" style={{background:'#0f0c23'}}>Engineering</option>
                                <option value="Sales" style={{background:'#0f0c23'}}>Sales</option>
                                <option value="Finance" style={{background:'#0f0c23'}}>Finance</option>
                                <option value="Legal" style={{background:'#0f0c23'}}>Legal</option>
                                <option value="Operations" style={{background:'#0f0c23'}}>Operations</option>
                              </select>
                            </div>
                          </div>
                          <div className="cx-form-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                            <div>
                              <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Budget (USD) <span style={{color:'#f87171'}}>*</span></label>
                              <div style={{position:'relative'}}>
                                <span style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',color:'rgba(148,163,184,0.35)',fontSize:'0.85rem',fontWeight:700,pointerEvents:'none'}}>$</span>
                                <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} min="0" step="0.01" onWheel={(e)=>(e.target as any).blur()} placeholder="0.00" value={s2pForm.budget} onChange={e=>setS2pForm({...s2pForm, budget:e.target.value})} style={{ width:'100%', padding:'10px 13px 10px 24px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', boxSizing:'border-box' }} onFocus={e=>{e.target.style.border='1px solid rgba(99,102,241,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)';}} onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}/>
                              </div>
                            </div>
                            <div>
                              <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Quantity <span style={{color:'#f87171'}}>*</span></label>
                              <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} min="1" step="1" onWheel={(e)=>(e.target as any).blur()} placeholder="1" value={s2pForm.quantity||''} onChange={e=>setS2pForm({...s2pForm, quantity:parseInt(e.target.value)||1})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', boxSizing:'border-box' }} onFocus={e=>{e.target.style.border='1px solid rgba(99,102,241,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)';}} onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}/>
                            </div>
                          </div>
                          <div>
                            <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Item Description <span style={{color:'#f87171'}}>*</span></label>
                            <textarea rows={3} placeholder="Describe what you need in detail..." value={s2pForm.description} onChange={e=>setS2pForm({...s2pForm, description:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', resize:'vertical', fontFamily:'inherit', lineHeight:'1.6', boxSizing:'border-box' }} onFocus={e=>{e.target.style.border='1px solid rgba(99,102,241,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)';}} onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}/>
                          </div>
                          <div className="cx-form-grid-2-1" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'10px' }}>
                            <div>
                              <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Required By</label>
                              <input type="date" value={s2pForm.requiredDate} onChange={e=>setS2pForm({...s2pForm, requiredDate:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', colorScheme:'dark', boxSizing:'border-box' }} onFocus={e=>{e.target.style.border='1px solid rgba(99,102,241,0.5)';}} onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.08)';}}/>
                            </div>
                            <div>
                              <label style={{ display:'block', color:'rgba(148,163,184,0.65)', fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px' }}>Delivery Address <span style={{color:'#f87171'}}>*</span></label>
                              <input type="text" placeholder="123 Main St, City, Country" value={s2pForm.address} onChange={e=>setS2pForm({...s2pForm, address:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.84rem', outline:'none', boxSizing:'border-box' }} onFocus={e=>{e.target.style.border='1px solid rgba(99,102,241,0.5)';e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.1)';}} onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.08)';e.target.style.boxShadow='none';}}/>
                            </div>
                          </div>
                          <div style={{ paddingTop:'8px', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                            <button onClick={()=>{ if(!s2pForm.title || !s2pForm.category || !s2pForm.department || !s2pForm.budget || !s2pForm.quantity || !s2pForm.description) return alert('Please fill all mandatory fields.'); execute('/execute-s2p-intake '+JSON.stringify(s2pForm))}} style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:'11px', fontWeight:700, cursor:'pointer', fontSize:'0.87rem', letterSpacing:'0.02em', boxShadow:'0 4px 18px rgba(16,185,129,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', fontFamily:'inherit' }}>
                              🚀 Submit Intake Request
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* S2P Progress & Event Form */}
                    {msg.uiComponent==='s2p_progress_and_event' && msg.uiData && (
                      <S2PProgressAndEvent data={msg.uiData} execute={execute} />
                    )}

                  {/* Event Form */}
                  {msg.uiComponent==='event_creation_form' && (
                      <div className="cx-form-card cx-event-card" style={{ marginTop:'16px', borderRadius:'8px', overflow:'hidden', border: isDark ? '1px solid #334155' : '1px solid #e2e8f0', background: isDark ? '#1e293b' : '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ padding:'16px 20px 14px', borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0', background: 'transparent', display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'30px', height:'30px', borderRadius:'6px', background:'#2563eb', color:'#ffffff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', flexShrink:0 }}>✨</div>
                          <div>
                            <div style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight:600, fontSize:'0.88rem' }}>Create Sourcing Event</div>
                            <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize:'0.7rem', marginTop:'1px' }}>Configure and publish a live procurement event</div>
                          </div>
                        </div>
                        <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:'13px' }}>
                          <div>
                            <label style={{ display:'block', color: isDark ? '#cbd5e1' : '#475569', fontSize:'0.75rem', fontWeight:500, marginBottom:'6px' }}>Event Title <span style={{color:'#ef4444'}}>*</span></label>
                            <input type="text" placeholder="e.g. Q4 Cloud Infrastructure RFQ" value={eventForm.title} onChange={e=>setEventForm({...eventForm, title:e.target.value})} style={{ width:'100%', padding:'10px 13px', borderRadius:'6px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'all 0.2s' }} onFocus={e=>{e.target.style.border='1px solid #2563eb';e.target.style.boxShadow='0 0 0 2px rgba(37,99,235,0.2)';}} onBlur={e=>{e.target.style.border=isDark ? '1px solid #334155' : '1px solid #cbd5e1';e.target.style.boxShadow='none';}}/>
                          </div>
                          <div>
                            <label style={{ display:'block', color: isDark ? '#cbd5e1' : '#475569', fontSize:'0.75rem', fontWeight:500, marginBottom:'6px' }}>Budget (USD)</label>
                            <div style={{position:'relative'}}>
                              <span style={{position:'absolute',left:'11px',top:'50%',transform:'translateY(-50%)',color: isDark ? '#64748b' : '#94a3b8',fontSize:'0.875rem',fontWeight:500,pointerEvents:'none'}}>$</span>
                              <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} min="0" step="0.01" onWheel={(e)=>(e.target as any).blur()} placeholder="0.00" value={eventForm.budget} onChange={e=>setEventForm({...eventForm, budget:e.target.value})} style={{ width:'100%', padding:'10px 13px 10px 24px', borderRadius:'6px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'all 0.2s' }} onFocus={e=>{e.target.style.border='1px solid #2563eb';e.target.style.boxShadow='0 0 0 2px rgba(37,99,235,0.2)';}} onBlur={e=>{e.target.style.border=isDark ? '1px solid #334155' : '1px solid #cbd5e1';e.target.style.boxShadow='none';}}/>
                            </div>
                          </div>
                          <div>
                            <label style={{ display:'block', color: isDark ? '#cbd5e1' : '#475569', fontSize:'0.75rem', fontWeight:500, marginBottom:'6px' }}>Duration <span style={{color:'#ef4444'}}>*</span></label>
                            <div className="cx-form-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'8px', alignItems:'center' }}>
                              <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} min="1" step="1" onWheel={(e)=>(e.target as any).blur()} placeholder="e.g. 7" value={eventForm.duration} onChange={e=>setEventForm({...eventForm, duration:e.target.value})} style={{ padding:'10px 13px', borderRadius:'6px', border: isDark ? '1px solid #334155' : '1px solid #cbd5e1', background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize:'0.875rem', outline:'none', boxSizing:'border-box', transition:'all 0.2s' }} onFocus={e=>{e.target.style.border='1px solid #2563eb';e.target.style.boxShadow='0 0 0 2px rgba(37,99,235,0.2)';}} onBlur={e=>{e.target.style.border=isDark ? '1px solid #334155' : '1px solid #cbd5e1';e.target.style.boxShadow='none';}}/>
                              <div style={{ display:'flex', gap:'6px' }}>
                                {(['minutes','days'] as const).map(unit => (
                                  <button key={unit} onClick={()=>setEventForm({...eventForm, durationUnit:unit})} style={{ padding:'10px 14px', borderRadius:'6px', border: eventForm.durationUnit===unit ? '1px solid #2563eb' : (isDark ? '1px solid #334155' : '1px solid #cbd5e1'), background: eventForm.durationUnit===unit ? '#2563eb' : 'transparent', color: eventForm.durationUnit===unit ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'), fontSize:'0.875rem', fontWeight:500, cursor:'pointer', textTransform:'capitalize', fontFamily:'inherit', transition:'all 0.15s', whiteSpace:'nowrap' }}>
                                    {unit.charAt(0).toUpperCase()+unit.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div style={{ paddingTop:'16px' }}>
                            <button onClick={()=>{ if(!eventForm.title || !eventForm.duration) return alert('Please fill all mandatory fields.'); execute('/execute-create-event '+JSON.stringify(eventForm))}} style={{ width:'100%', padding:'10px', background:'#2563eb', color:'#ffffff', border:'none', borderRadius:'6px', fontWeight:500, cursor:'pointer', fontSize:'0.875rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', fontFamily:'inherit' }}>
                              Publish Event Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Vendor Form */}
                  {msg.uiComponent==='vendor_creation_form' && (
                    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Onboard Supplier</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        {[{ p:'Company Name', k:'name', t:'text' },{ p:'Contact Email', k:'email', t:'email' },{ p:'Category (e.g. IT, Legal)', k:'category', t:'text' }].map(f=>(
                          <input key={f.k} type={f.t} placeholder={f.p} value={(vendorForm as any)[f.k]} onChange={e=>setVendorForm({...vendorForm, [f.k]:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        ))}
                        <button onClick={()=>{ if(!vendorForm.name || !vendorForm.email || !vendorForm.category) return alert('Please fill all mandatory fields.'); execute('/execute-create-vendor '+JSON.stringify(vendorForm))}} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#0284c7,#0369a1)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Register Vendor</button>
                      </div>
                    </div>
                  )}

                  {/* PO Form */}
                  {msg.uiComponent==='po_creation_form' && (
                    <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Draft Purchase Order</div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                        {[{ p:'Description / Purpose', k:'desc', t:'text' },{ p:'PO Number (Optional)', k:'poNumber', t:'text' },{ p:'Total Amount ($)', k:'amount', t:'number', min:'0', step:'0.01' }].map(f=>(
                          <input key={f.k} type={f.t} min={f.min} step={f.step} onWheel={f.t==='number'? (e)=>(e.target as any).blur() : undefined} onKeyDown={f.t==='number' ? (e)=>{if(['-','+','e','E'].includes(e.key)){e.preventDefault();}} : undefined} placeholder={f.p} value={(poForm as any)[f.k]} onChange={e=>setPoForm({...poForm, [f.k]:e.target.value})} style={{ width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
                        ))}
                        <button onClick={()=>{ if(!poForm.desc || !poForm.amount) return alert('Please fill all mandatory fields.'); execute('/execute-draft-po '+JSON.stringify(poForm))}} style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#059669,#047857)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Generate PO</button>
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
                          <input type="number" onKeyDown={(e)=>{if(["-","+","e","E"].includes(e.key)){e.preventDefault();}}} onWheel={(e) => (e.target as any).blur()} placeholder="Price ($)" value={productForm.price} onChange={e=>setProductForm({...productForm, price:e.target.value})} style={{ flex:1, padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', fontSize:'0.85rem', outline:'none' }}/>
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

                    {/* Draft Contract */}
                    {msg.uiComponent==='draft_contract_form' && msg.uiData && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><FileText size={16} color="#818cf8"/> Contract Editor: {msg.uiData.vendor}</div>
                        <textarea rows={8} defaultValue={"MASTER SERVICE AGREEMENT\n\nThis Master Service Agreement (\"Agreement\") is made between Your Company and " + msg.uiData.vendor + ".\n\n1. SERVICES\nVendor agrees to provide services as outlined in applicable Statements of Work..."} style={{ width:'100%', padding:'14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(0,0,0,0.3)', color:'#e2e8f0', fontSize:'0.8rem', fontFamily:'monospace', outline:'none', resize:'vertical', lineHeight:'1.5' }}/>
                        <div style={{ display:'flex', gap:'10px', marginTop:'12px' }}>
                          <button onClick={()=>alert('PDF Downloaded!')} style={{ flex:1, padding:'11px', background:'linear-gradient(135deg,#4f46e5,#4338ca)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Download PDF</button>
                          <button onClick={()=>alert('Sent for E-Signature')} style={{ flex:1, padding:'11px', background:'rgba(255,255,255,0.05)', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>Send via DocuSign</button>
                        </div>
                      </div>
                    )}

                    {/* Clause Review */}
                    {msg.uiComponent==='clause_review' && msg.uiData && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(244,63,94,0.3)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><Shield size={16} color="#f43f5e"/> Risk Analysis: {msg.uiData.riskLevel} Risk</div>
                        <div style={{ fontSize:'0.8rem', color:'#94a3b8', lineHeight:'1.6', background:'rgba(0,0,0,0.3)', padding:'12px', borderRadius:'8px', borderLeft:'3px solid #f43f5e' }}>
                          "The Supplier's liability shall be capped at <span style={{backgroundColor:'rgba(244,63,94,0.2)', color:'#fda4af', padding:'2px 4px', borderRadius:'4px'}}>the total amount paid under this SOW</span>, and Supplier shall not be liable for any <span style={{backgroundColor:'rgba(244,63,94,0.2)', color:'#fda4af', padding:'2px 4px', borderRadius:'4px'}}>indirect or consequential damages</span>."
                        </div>
                        <div style={{ marginTop:'12px', fontSize:'0.75rem', color:'#e2e8f0' }}>
                          <strong style={{color:'#f43f5e'}}>Flag ({msg.uiData.flagged}):</strong> Liability cap is non-standard. Corporate playbook requires cap at 2x contract value.
                        </div>
                      </div>
                    )}

                    {/* Shipment Tracker */}
                    {msg.uiComponent==='shipment_tracker' && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><Zap size={16} color="#eab308"/> Active Shipments</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                          {[ { id:'ASN-9921', status:'In Transit', prog:'60%', delay:false }, { id:'ASN-9922', status:'Delayed (Port)', prog:'30%', delay:true } ].map(s=>(
                            <div key={s.id} style={{ padding:'12px', background:'rgba(0,0,0,0.2)', borderRadius:'8px' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                                <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#e2e8f0' }}>{s.id}</span>
                                <span style={{ fontSize:'0.7rem', color: s.delay ? '#f87171' : '#4ade80', fontWeight:600 }}>{s.status}</span>
                              </div>
                              <div style={{ height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px', overflow:'hidden' }}>
                                <div style={{ width: s.prog, height:'100%', background: s.delay ? '#f87171' : '#4ade80' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stockout Predictions */}
                    {msg.uiComponent==='stockout_predictions' && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(239,68,68,0.3)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><AlertTriangle size={16} color="#ef4444"/> Critical Shortages Predicted</div>
                        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'8px', fontSize:'0.75rem', color:'#94a3b8', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                          <div>SKU</div><div>Stock</div><div>Empty In</div>
                        </div>
                        {[ { sku:'Servers (42U)', stock:4, days:12 }, { sku:'Optic Cables', stock:150, days:18 } ].map((s,i)=>(
                          <div key={i} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'8px', fontSize:'0.8rem', color:'#e2e8f0', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{fontWeight:600}}>{s.sku}</div><div>{s.stock}</div><div style={{color:'#f87171', fontWeight:700}}>{s.days} days</div>
                          </div>
                        ))}
                        <button onClick={()=>execute('/draft-po')} style={{ width:'100%', padding:'10px', marginTop:'12px', background:'rgba(239,68,68,0.15)', color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', fontWeight:600, cursor:'pointer', fontSize:'0.8rem' }}>Auto-Draft POs</button>
                      </div>
                    )}

                    {/* 3Way Match */}
                    {msg.uiComponent==='three_way_match' && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><Database size={16} color="#10b981"/> 3-Way Reconciliation</div>
                        <div style={{ overflowX:'auto' }}>
                          <table style={{ width:'100%', fontSize:'0.75rem', textAlign:'left', borderCollapse:'collapse' }}>
                            <thead><tr style={{ color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.1)' }}><th style={{padding:'8px'}}>PO #</th><th style={{padding:'8px'}}>PO Qty</th><th style={{padding:'8px'}}>GRN Qty</th><th style={{padding:'8px'}}>Inv Qty</th><th style={{padding:'8px'}}>Status</th></tr></thead>
                            <tbody>
                              <tr style={{ color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}><td style={{padding:'8px'}}>PO-102</td><td style={{padding:'8px'}}>500</td><td style={{padding:'8px'}}>500</td><td style={{padding:'8px'}}>500</td><td style={{padding:'8px',color:'#4ade80'}}>Matched</td></tr>
                              <tr style={{ color:'#e2e8f0' }}><td style={{padding:'8px'}}>PO-103</td><td style={{padding:'8px'}}>200</td><td style={{padding:'8px'}}>180</td><td style={{padding:'8px'}}>200</td><td style={{padding:'8px',color:'#f87171'}}>Mismatch</td></tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ESG Audit */}
                    {msg.uiComponent==='esg_audit' && msg.uiData && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(20,184,166,0.3)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle2 size={16} color="#14b8a6"/> ESG Audit: {msg.uiData.vendor}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                          <div style={{ width:'60px', height:'60px', borderRadius:'30px', border:'4px solid #14b8a6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', fontWeight:800, color:'#14b8a6' }}>B+</div>
                          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
                            <div style={{ fontSize:'0.75rem', color:'#e2e8f0', display:'flex', justifyContent:'space-between' }}><span>Environmental</span><span style={{color:'#14b8a6'}}>82/100</span></div>
                            <div style={{ fontSize:'0.75rem', color:'#e2e8f0', display:'flex', justifyContent:'space-between' }}><span>Social</span><span style={{color:'#eab308'}}>74/100</span></div>
                            <div style={{ fontSize:'0.75rem', color:'#e2e8f0', display:'flex', justifyContent:'space-between' }}><span>Governance</span><span style={{color:'#14b8a6'}}>90/100</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Market Intel */}
                    {msg.uiComponent==='market_intel' && msg.uiData && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(99,102,241,0.3)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><BarChart3 size={16} color="#818cf8"/> Market Trend: {msg.uiData.commodity}</div>
                        <div style={{ height:'100px', display:'flex', alignItems:'flex-end', gap:'4px', paddingBottom:'10px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
                          {[80, 85, 90, 82, 75, 70, 65].map((val, i)=>(
                            <div key={i} style={{ flex:1, background: i > 3 ? '#4ade80' : '#f87171', height: val+'%', borderRadius:'4px 4px 0 0', opacity: 0.8 }} />
                          ))}
                        </div>
                        <div style={{ marginTop:'10px', fontSize:'0.75rem', color:'#94a3b8', textAlign:'center' }}>Price projected to drop 8% in 14 days</div>
                      </div>
                    )}

                    {/* Vendor Scorecard */}
                    {msg.uiComponent==='vendor_scorecard' && msg.uiData && (
                      <div style={{ marginTop:'14px', padding:'18px', borderRadius:'14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(59,130,246,0.3)' }}>
                        <div style={{ marginBottom:'14px', fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={16} color="#3b82f6"/> Scorecard: {msg.uiData.vendor}</div>
                        <div style={{ display:'flex', gap:'12px' }}>
                          <div style={{ width:'70px', height:'70px', background:'linear-gradient(135deg,#3b82f6,#2563eb)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:900, color:'#fff', boxShadow:'0 4px 12px rgba(59,130,246,0.3)' }}>A</div>
                          <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                            <div style={{ background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'6px' }}><div style={{fontSize:'0.65rem',color:'#94a3b8'}}>On-Time</div><div style={{fontSize:'0.85rem',fontWeight:700,color:'#4ade80'}}>98.2%</div></div>
                            <div style={{ background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'6px' }}><div style={{fontSize:'0.65rem',color:'#94a3b8'}}>Defect Rate</div><div style={{fontSize:'0.85rem',fontWeight:700,color:'#4ade80'}}>0.4%</div></div>
                            <div style={{ background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'6px' }}><div style={{fontSize:'0.65rem',color:'#94a3b8'}}>Responsive</div><div style={{fontSize:'0.85rem',fontWeight:700,color:'#eab308'}}>Avg (2d)</div></div>
                            <div style={{ background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'6px' }}><div style={{fontSize:'0.65rem',color:'#94a3b8'}}>Risk Tier</div><div style={{fontSize:'0.85rem',fontWeight:700,color:'#4ade80'}}>Low</div></div>
                          </div>
                        </div>
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
              <div className="cortex-msg cx-msg-bubble" style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
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
        <div className="cx-input-bar" style={{ padding:'16px 28px 24px', background: isDark ? 'linear-gradient(180deg,transparent 0%,#070d1c 40%)' : 'linear-gradient(180deg,transparent 0%,#f0f4f8 40%)', flexShrink:0 }}>
          <div style={{ maxWidth:'780px', margin:'0 auto', position:'relative' }}>

            {/* Slash Menu */}
            {showSlash && (
              <div className="cx-slash-menu" style={{ position:'absolute', bottom:'100%', left:0, width:'100%', background:'rgba(7,13,28,0.97)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', boxShadow:'0 -20px 60px rgba(0,0,0,0.5)', overflow:'hidden', marginBottom:'10px', backdropFilter:'blur(20px)' }}>
                  <div style={{ padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', gap:'6px', overflowX:'auto' }}>
                    {['All', 'Sourcing', 'Legal', 'Logistics', 'Finance', 'Vendors', 'System'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={(e) => { e.preventDefault(); setSlashCategory(cat); }}
                        style={{ background: slashCategory === cat ? 'rgba(99,102,241,0.15)' : 'transparent', color: slashCategory === cat ? '#818cf8' : '#64748b', padding:'6px 12px', borderRadius:'14px', border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, whiteSpace:'nowrap', transition:'all 0.2s' }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div style={{ maxHeight:'320px', overflowY:'auto' }}>
                    {slashCmds
                      .filter(c => slashCategory === 'All' || c.category === slashCategory)
                      .filter(c => c.cmd.toLowerCase().includes(input.toLowerCase()))
                      .map((item: any, i: number)=>(
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
                <Sparkles size={16} color={input?'#0072ff':'#334155'} style={{ transition:'color 0.2s' }}/>
              </div>
              <input
                type="text" value={input}
                onChange={e=>{ setInput(e.target.value); setShowSlash(e.target.value=='/'); }}
                onKeyDown={e=>{ if(e.key==='Escape') setShowSlash(false); }}
                placeholder="Ask Cortex anything, or type / for AI workflows..."
                disabled={isProcessing}
                className="cx-input-field" style={{ width:'100%', padding:'16px 56px 16px 46px', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#e2e8f0', fontSize:'16px', outline:'none', backdropFilter:'blur(20px)', boxShadow:'0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)', transition:'border-color 0.2s', borderColor: input?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.08)' }}
              />
              
              <button 
                type="button" 
                onClick={handleScreenScan}
                style={{ position:'absolute', right:'56px', width:'38px', height:'38px', borderRadius:'12px', background: isProcessing ? 'transparent' : 'rgba(255,255,255,0.05)', border: isProcessing ? 'none' : '1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor: isProcessing ? 'default' : 'pointer', transition:'all 0.2s', opacity: isProcessing ? 0.5 : 1 }}
                title="Capture & Scan Screen"
                disabled={isProcessing}
              >
                <Monitor size={16} color="#00c6ff" />
              </button>
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
               <video controls autoPlay style={{ width:'100%', height:'100%' }}>
                  <source src="/tutorial.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
               </video>
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
