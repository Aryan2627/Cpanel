"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Zap, CheckCircle2, Sparkles, Activity, Cpu, Plus, X, ArrowUpRight, ArrowDownRight, Brain } from 'lucide-react';

type Message = { sender: 'ai' | 'vendor', text: string, time: string };
type Session = { id: string; name: string; status: 'Live'|'Closed'; model: string; target: number; limit: number; vendorInitial: number; concessions: string[]; messages: Message[]; closed: boolean; logs: string[]; sentiment: string; sentimentColor: string; prevVendor?: string; prevAmount?: number; insight?: string; trend?: number; };

const INITIAL_SESSIONS: Session[] = [
  { id:'n1', name:'Q4 Raw Steel', status:'Live', model:'α-Strike v4 (Nemotron)', target:40000, limit:42000, vendorInitial:45000, concessions:['Net-15 Payment Terms'], messages:[{sender:'vendor',text:"We've reviewed the specs. We can do $45,000 for the Q4 shipment.",time:'10:01 AM'}], closed:false, logs:[], sentiment:'Softening (-4.2%)', sentimentColor:'#16a34a' },
  { id:'n2', name:'Enterprise Laptops (x500)', status:'Live', model:'β-Logic v2', target:800000, limit:850000, vendorInitial:950000, concessions:['Flexible Delivery','Bulk Shipping'], messages:[{sender:'vendor',text:"For 500 ThinkPads, our best price is $950,000 including priority shipping.",time:'10:05 AM'}], closed:false, logs:[], sentiment:'High Demand (+2.1%)', sentimentColor:'#d97706' },
  { id:'n3', name:'Office Hardware', status:'Closed', model:'γ-Rapid v1', target:13000, limit:15000, vendorInitial:16000, concessions:[], messages:[{sender:'ai',text:"CONTRACT SECURED",time:'Yesterday'}], closed:true, logs:[], sentiment:'Stable', sentimentColor:'#64748b' },
];

export default function AIAgentsPage() {
  const [viewMode, setViewMode] = useState<'negotiator'|'predictor'>('predictor');
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [activeId, setActiveId] = useState('n1');
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [started, setStarted] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions.find(s => s.id === activeId)!;

  useEffect(() => { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [activeSession?.messages, analyzing]);

  useEffect(() => {
    Promise.all([fetch('/api/intakes').then(r=>r.json()), fetch('/api/pos').then(r=>r.json())])
      .then(([intakes, pos]) => {
        if(!intakes||intakes.length===0) return;
        const dbSessions: Session[] = intakes.map((p:any, i:number) => {
          const hPO = Array.isArray(pos)?pos.find((po:any)=>po.details&&po.details.includes(p.refId)):null;
          const prevVendor = hPO ? (hPO.vendorId||'Unknown') : 'No Historical Vendor';
          const prevAmount = hPO ? (parseFloat(hPO.total)||0) : 0;
          const combined = ((p.title||'')+(p.description||'')).toLowerCase();
          let trend=-2.0, insight="Baseline analysis. Stable supply chains; recommend 2% cost reduction.", sentiment="Stable (-2.0%)", sentimentColor="#16a34a";
          if(combined.includes('laptop')||combined.includes('hardware')){trend=-5.2;insight="Semiconductor oversupply detected. AI predicts -5.2% deflation on compute hardware.";sentiment="Deflationary (-5.2%)";}
          else if(combined.includes('software')||combined.includes('saas')){trend=4.5;insight="SaaS vendors driving +4.5% price hikes. Lock in multi-year agreements immediately.";sentiment="Inflationary (+4.5%)";sentimentColor="#dc2626";}
          else if(combined.includes('steel')||combined.includes('copper')){trend=8.5;insight="Supply chain threats: Copper/Steel +8.5% volatility. Secure spot pricing now.";sentiment="Highly Volatile (+8.5%)";sentimentColor="#dc2626";}
          const base = prevAmount>0?prevAmount:1000;
          const target = base*(1+trend/100), limit = target*1.05, vInit = base*1.15;
          return { id:p.id||`n${i}`, name:(p.refId?p.refId+' - ':'')+( p.title||'Unknown PR'), status:'Live' as const, model:'I3-Strike v4', target, limit, vendorInitial:vInit, prevVendor, prevAmount, insight, trend, concessions:['Net-15 Payment Terms','Volume Discount'], messages:[{sender:'vendor' as const, text:`Reviewed specs for ${p.refId||p.title}. Our offer is Rs${vInit.toLocaleString('en-IN',{maximumFractionDigits:0})}.`, time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}], closed:false, logs:[], sentiment, sentimentColor };
        });
        setSessions(dbSessions); setActiveId(dbSessions[0].id);
      }).catch(()=>{});
  }, []);

  useEffect(() => {
    if(viewMode!=='negotiator') return;
    const s = sessions.find(x=>x.id===activeId);
    if(s&&!s.closed&&s.messages.length===1&&!analyzing&&!started){ setStarted(true); handleAgentTurn(s.messages, s); }
  }, [activeId, viewMode, started]);

  const updateSession = (id:string, u:Partial<Session>) => setSessions(prev=>prev.map(s=>s.id===id?{...s,...u}:s));

  const handleAgentTurn = async (msgs: Message[], session: Session) => {
    setAnalyzing(true);
    updateSession(session.id, {logs:['> INITIALIZING STRATEGY ENGINE...','> ANALYZING VENDOR MARGIN HISTORY...','> EXECUTING LLM INFERENCE...']});
    try {
      const apiMsgs = msgs.map(m=>({role:m.sender==='ai'?'assistant':'user', content:m.text}));
      const ctx = {productName:session.name, targetPrice:session.target, maxPrice:session.limit, concessions:session.concessions, vendorInitialOffer:session.vendorInitial};
      const res = await fetch('/api/ai/negotiate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:apiMsgs,context:ctx})});
      const data = await res.json();
      if(data.reply){
        let rt=data.reply; let isClosed=false;
        if(rt.includes('CONTRACT SECURED')){isClosed=true;rt=rt.replace('CONTRACT SECURED','').trim();}
        const aiMsg:Message={sender:'ai',text:rt,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})};
        setSessions(prev=>prev.map(s=>s.id===session.id?{...s,messages:[...s.messages,aiMsg],closed:isClosed,status:isClosed?'Closed':'Live'}:s));
      }
    } catch { updateSession(session.id,{messages:[...session.messages,{sender:'ai',text:'Error connecting to AI.',time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}]}); }
    setAnalyzing(false);
  };

  const handleSend = (e:React.FormEvent) => {
    e.preventDefault();
    if(!inputText.trim()||analyzing||activeSession?.closed) return;
    const newMsg:Message={sender:'vendor',text:inputText,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})};
    const updated = [...activeSession.messages, newMsg];
    updateSession(activeId,{messages:updated}); setInputText('');
    handleAgentTurn(updated, activeSession);
  };

  const liveCount = sessions.filter(s=>s.status==='Live').length;
  const closedCount = sessions.filter(s=>s.status==='Closed').length;

  return (
    <div style={{backgroundColor:'#f0f4f8',minHeight:'100%',fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)',padding:'28px 32px 40px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}><Brain size={18} color="rgba(255,255,255,0.55)"/><p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>AI Platform</p></div>
            <h1 style={{color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px'}}>AI Negotiator</h1>
            <p style={{color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem'}}>Autonomous AI agents negotiating procurement contracts in real-time.</p>
          </div>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <div style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',padding:'10px 18px',display:'flex',gap:'18px'}}>
              {[{val:liveCount,label:'Live',color:'#4ade80'},{val:closedCount,label:'Closed',color:'#94a3b8'},{val:'12.4%',label:'Avg Savings',color:'#60a5fa'}].map((m,i)=>(
                <div key={i} style={{textAlign:'center'}}><div style={{fontSize:'1.2rem',fontWeight:800,color:m.color}}>{m.val}</div><div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.4)',fontWeight:600,textTransform:'uppercase'}}>{m.label}</div></div>
              ))}
            </div>
            <button onClick={()=>setShowDeployModal(true)} style={{display:'flex',alignItems:'center',gap:'7px',padding:'10px 18px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'10px',color:'#fff',fontWeight:600,fontSize:'0.82rem',cursor:'pointer'}}><Plus size={15}/> Deploy Agent</button>
          </div>
        </div>
      </div>

      <div style={{padding:'0 32px 40px',marginTop:'-24px',position:'relative',zIndex:10}}>
        <div style={{display:'flex',gap:'10px',marginBottom:'20px'}}>
          {[{key:'predictor',label:'Market Intelligence'},{key:'negotiator',label:'Live Negotiator'}].map(v=>{
            const active=viewMode===v.key;
            return(<button key={v.key} onClick={()=>{setViewMode(v.key as any);setStarted(false);}}
              style={{display:'flex',alignItems:'center',gap:'8px',padding:'11px 20px',borderRadius:'12px',border:active?'none':'1px solid #e2e8f0',background:active?'linear-gradient(135deg,#0d1f4f,#1a2f6b)':'#fff',color:active?'#fff':'#64748b',fontWeight:700,fontSize:'0.875rem',cursor:'pointer',boxShadow:active?'0 4px 12px rgba(13,31,79,0.3)':'0 2px 6px rgba(0,0,0,0.04)',transition:'all 0.2s'}}>
              {v.key==='predictor'?<Activity size={16}/>:<Bot size={16}/>} {v.label}
            </button>);
          })}
        </div>

        {viewMode==='predictor' ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:'16px'}}>
            {sessions.map(s=>{
              const tUp=(s.trend||0)>0;
              return(
                <div key={s.id} style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',transition:'all 0.2s'}}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.05)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
                  <div style={{background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)',padding:'16px 20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><Brain size={19} color="#93c5fd"/></div>
                        <div><div style={{color:'#fff',fontWeight:800,fontSize:'0.92rem'}}>{s.name}</div><div style={{color:'rgba(255,255,255,0.4)',fontSize:'0.7rem',marginTop:'2px'}}>{s.model}</div></div>
                      </div>
                      <span style={{padding:'3px 9px',borderRadius:'12px',fontSize:'0.68rem',fontWeight:700,background:s.status==='Live'?'rgba(74,222,128,0.15)':'rgba(148,163,184,0.15)',color:s.status==='Live'?'#4ade80':'#94a3b8'}}>{s.status==='Live'&&<span style={{display:'inline-block',width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',marginRight:'5px',verticalAlign:'middle'}}/>}{s.status}</span>
                    </div>
                    <div style={{display:'flex',gap:'10px'}}>
                      {[{l:'Target',v:`Rs${s.target.toLocaleString('en-IN',{maximumFractionDigits:0})}`,c:'#93c5fd'},{l:'Vendor Ask',v:`Rs${s.vendorInitial.toLocaleString('en-IN',{maximumFractionDigits:0})}`,c:'#fca5a5'}].map((r,i)=>(
                        <div key={i} style={{flex:1,background:'rgba(255,255,255,0.06)',borderRadius:'8px',padding:'10px 12px'}}>
                          <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',fontWeight:700,textTransform:'uppercase',marginBottom:'4px'}}>{r.l}</div>
                          <div style={{fontSize:'0.95rem',fontWeight:800,color:r.c}}>{r.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{padding:'16px 20px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <span style={{fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.04em'}}>Market Sentiment</span>
                      <div style={{display:'flex',alignItems:'center',gap:'5px',padding:'3px 9px',borderRadius:'12px',background:tUp?'#fef2f2':'#dcfce7',border:`1px solid ${tUp?'#fca5a5':'#86efac'}`}}>
                        {tUp?<ArrowUpRight size={12} color="#dc2626"/>:<ArrowDownRight size={12} color="#16a34a"/>}
                        <span style={{fontSize:'0.7rem',fontWeight:700,color:tUp?'#dc2626':'#16a34a'}}>{s.sentiment}</span>
                      </div>
                    </div>
                    {s.insight&&<div style={{background:'linear-gradient(135deg,#f0f7ff,#eff6ff)',border:'1px solid #bfdbfe',borderRadius:'10px',padding:'12px',fontSize:'0.78rem',color:'#1e3a8a',lineHeight:1.6,marginBottom:'12px'}}><div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'5px',fontWeight:700,fontSize:'0.65rem',color:'#2563eb',textTransform:'uppercase'}}><Sparkles size={11}/>AI Insight</div>{s.insight}</div>}
                    <button onClick={()=>{setViewMode('negotiator');setActiveId(s.id);setStarted(false);}} style={{width:'100%',padding:'9px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'9px',color:'#2563eb',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Bot size={14}/> Launch Negotiator</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'270px 1fr 290px',gap:'16px',height:'calc(100vh - 260px)',minHeight:'500px'}}>
            <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 4px 12px rgba(0,0,0,0.05)'}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid #f1f5f9',background:'#fafbfc'}}><div style={{fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'}}>Active Sessions</div></div>
              <div style={{flex:1,overflowY:'auto'}}>
                {sessions.map(s=>(
                  <div key={s.id} onClick={()=>{setActiveId(s.id);setStarted(false);}}
                    style={{padding:'12px 16px',borderBottom:'1px solid #f8fafc',cursor:'pointer',borderLeft:activeId===s.id?'3px solid #2563eb':'3px solid transparent',background:activeId===s.id?'#eff6ff':'transparent',transition:'all 0.12s'}}
                    onMouseOver={e=>{if(activeId!==s.id)(e.currentTarget as HTMLElement).style.background='#f8fafc';}}
                    onMouseOut={e=>{if(activeId!==s.id)(e.currentTarget as HTMLElement).style.background='transparent';}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                      <div style={{fontWeight:700,color:activeId===s.id?'#1e3a8a':'#0f172a',fontSize:'0.8rem',flex:1,paddingRight:'6px',lineHeight:1.3}}>{s.name}</div>
                      <span style={{padding:'2px 6px',borderRadius:'8px',fontSize:'0.62rem',fontWeight:700,flexShrink:0,background:s.status==='Live'?'#dcfce7':'#f1f5f9',color:s.status==='Live'?'#15803d':'#64748b'}}>{s.status}</span>
                    </div>
                    <div style={{fontSize:'0.68rem',color:'#94a3b8',marginBottom:'6px'}}>{s.model}</div>
                    <div style={{height:'3px',borderRadius:'2px',background:'#f1f5f9'}}><div style={{height:'100%',width:`${Math.min(100,((s.vendorInitial-s.target)/s.vendorInitial)*100+30)}%`,background:'linear-gradient(90deg,#2563eb,#0d1f4f)',borderRadius:'2px'}}/></div>
                  </div>
                ))}
              </div>
              <div style={{padding:'12px',borderTop:'1px solid #f1f5f9'}}><button onClick={()=>setShowDeployModal(true)} style={{width:'100%',padding:'9px',background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)',border:'none',borderRadius:'9px',color:'#fff',fontWeight:700,fontSize:'0.78rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><Plus size={13}/> New Session</button></div>
            </div>

            <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,0.05)'}}>
              <div style={{padding:'13px 18px',borderBottom:'1px solid #f1f5f9',background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'9px',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}><Bot size={16} color="#93c5fd"/></div>
                  <div><div style={{color:'#fff',fontWeight:800,fontSize:'0.88rem'}}>{activeSession?.name}</div><div style={{color:'rgba(255,255,255,0.45)',fontSize:'0.68rem'}}>{activeSession?.model}</div></div>
                </div>
                <span style={{padding:'3px 9px',borderRadius:'10px',fontSize:'0.68rem',fontWeight:700,background:activeSession?.status==='Live'?'rgba(74,222,128,0.15)':'rgba(148,163,184,0.15)',color:activeSession?.status==='Live'?'#4ade80':'#94a3b8'}}>{activeSession?.status==='Live'&&<span style={{display:'inline-block',width:'6px',height:'6px',borderRadius:'50%',background:'#4ade80',marginRight:'4px',verticalAlign:'middle'}}/>}{activeSession?.status}</span>
              </div>
              <div ref={chatRef} style={{flex:1,padding:'16px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'12px',background:'#f8fafc',backgroundImage:'radial-gradient(#e2e8f0 1px,transparent 1px)',backgroundSize:'24px 24px'}}>
                {activeSession?.messages.map((msg,i)=>(
                  <div key={i} style={{display:'flex',flexDirection:'column',alignItems:msg.sender==='vendor'?'flex-start':'flex-end'}}>
                    <div style={{fontSize:'0.62rem',color:'#94a3b8',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'4px',display:'flex',alignItems:'center',gap:'5px'}}>
                      {msg.sender==='ai'&&<><div style={{width:'18px',height:'18px',borderRadius:'5px',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center'}}><Bot size={10} color="#fff"/></div>AI Negotiator</>}
                      {msg.sender==='vendor'&&<><div style={{width:'18px',height:'18px',borderRadius:'5px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center'}}><Zap size={10} color="#64748b"/></div>Vendor</>}
                    </div>
                    <div style={{maxWidth:'78%',padding:'10px 14px',borderRadius:msg.sender==='ai'?'14px 14px 2px 14px':'14px 14px 14px 2px',background:msg.sender==='ai'?'linear-gradient(135deg,#1e3a8a,#2563eb)':msg.text==='CONTRACT SECURED'?'linear-gradient(135deg,#14532d,#16a34a)':'#fff',color:msg.sender==='ai'||msg.text==='CONTRACT SECURED'?'#fff':'#0f172a',fontSize:'0.875rem',lineHeight:1.6,border:msg.sender==='vendor'?'1px solid #e2e8f0':'none',boxShadow:'0 2px 6px rgba(0,0,0,0.06)',display:'flex',alignItems:'center',gap:'8px'}}>
                      {msg.text==='CONTRACT SECURED'&&<CheckCircle2 size={15}/>}{msg.text}
                    </div>
                    <div style={{marginTop:'3px',fontSize:'0.62rem',color:'#94a3b8'}}>{msg.time}</div>
                  </div>
                ))}
                {analyzing&&(
                  <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0'}}>
                    <div style={{width:'26px',height:'26px',borderRadius:'8px',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center'}}><Cpu size={13} color="#fff"/></div>
                    <div><div style={{fontSize:'0.75rem',fontWeight:700,color:'#1e3a8a',marginBottom:'3px'}}>AI Processing...</div><div style={{display:'flex',gap:'4px'}}>{[0,1,2].map(i=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:'#2563eb',animation:`bounce 1.2s ${i*0.2}s infinite`}}/>)}</div></div>
                  </div>
                )}
              </div>
              <div style={{padding:'12px 16px',borderTop:'1px solid #f1f5f9',background:'#fff'}}>
                {activeSession?.closed
                  ?<div style={{textAlign:'center',padding:'10px',background:'#dcfce7',borderRadius:'10px',color:'#15803d',fontWeight:700,fontSize:'0.82rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px'}}><CheckCircle2 size={15}/>Contract Secured</div>
                  :<form onSubmit={handleSend} style={{display:'flex',gap:'8px',alignItems:'center',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'10px',padding:'5px 5px 5px 12px'}}>
                    <input value={inputText} onChange={e=>setInputText(e.target.value)} placeholder="Simulate a vendor message..." style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:'0.875rem',color:'#0f172a'}}/>
                    <button type="submit" disabled={!inputText.trim()||analyzing} style={{padding:'7px 14px',background:inputText.trim()&&!analyzing?'linear-gradient(135deg,#1e3a8a,#2563eb)':'#e2e8f0',color:inputText.trim()&&!analyzing?'#fff':'#94a3b8',border:'none',borderRadius:'8px',fontWeight:700,fontSize:'0.78rem',cursor:inputText.trim()&&!analyzing?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:'5px'}}><Zap size={13}/>Send</button>
                  </form>
                }
              </div>
            </div>

            <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,0.05)'}}>
              <div style={{padding:'13px 16px',borderBottom:'1px solid #f1f5f9',background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)',display:'flex',alignItems:'center',gap:'7px'}}><Activity size={14} color="rgba(255,255,255,0.6)"/><span style={{color:'#fff',fontWeight:800,fontSize:'0.85rem'}}>Intelligence Feed</span></div>
              <div style={{flex:1,padding:'14px',overflowY:'auto'}}>
                <div style={{fontSize:'0.65rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px'}}>Pricing Targets</div>
                {[{label:'Target',val:`Rs${activeSession?.target.toLocaleString('en-IN',{maximumFractionDigits:0})}`,color:'#16a34a'},{label:'Max Limit',val:`Rs${activeSession?.limit.toLocaleString('en-IN',{maximumFractionDigits:0})}`,color:'#d97706'},{label:'Vendor Ask',val:`Rs${activeSession?.vendorInitial.toLocaleString('en-IN',{maximumFractionDigits:0})}`,color:'#dc2626'}].map((r,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 10px',borderRadius:'7px',background:i%2===0?'#f8fafc':'#fff',border:'1px solid #f1f5f9',marginBottom:'5px'}}>
                    <span style={{fontSize:'0.75rem',color:'#64748b'}}>{r.label}</span><span style={{fontWeight:800,color:r.color,fontSize:'0.8rem'}}>{r.val}</span>
                  </div>
                ))}
                {activeSession?.insight&&<><div style={{fontSize:'0.65rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginTop:'14px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'5px'}}><Sparkles size={11}/>Market Intel</div>
                <div style={{background:'linear-gradient(135deg,#f0f7ff,#eff6ff)',border:'1px solid #bfdbfe',borderRadius:'10px',padding:'12px',fontSize:'0.76rem',color:'#1e3a8a',lineHeight:1.6}}>{activeSession.insight}</div></>}
                {activeSession?.concessions?.length>0&&<><div style={{fontSize:'0.65rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginTop:'14px',marginBottom:'8px'}}>Levers</div>
                {activeSession.concessions.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'7px',padding:'7px 10px',borderRadius:'8px',background:'#faf5ff',border:'1px solid #c4b5fd',marginBottom:'5px'}}><CheckCircle2 size={12} color="#7c3aed"/><span style={{fontSize:'0.76rem',color:'#5b21b6',fontWeight:600}}>{c}</span></div>)}</>}
                {analyzing&&activeSession?.logs?.length>0&&<><div style={{fontSize:'0.65rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginTop:'14px',marginBottom:'8px',display:'flex',alignItems:'center',gap:'5px'}}><Cpu size={11}/>Logs</div>
                <div style={{background:'#0f172a',borderRadius:'10px',padding:'12px',fontFamily:'monospace',fontSize:'0.68rem',color:'#4ade80',lineHeight:1.8}}>{activeSession.logs.map((l,i)=><div key={i}>{l}</div>)}<div>_</div></div></>}
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeployModal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDeployModal(false)}>
          <div style={{background:'#fff',borderRadius:'20px',width:'440px',maxWidth:'92vw',boxShadow:'0 30px 60px rgba(0,0,0,0.25)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:'linear-gradient(135deg,#071330,#0d1f4f)',padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Brain size={19} color="#93c5fd"/><h2 style={{margin:0,fontSize:'1rem',fontWeight:800,color:'#fff'}}>Deploy AI Agent</h2></div>
              <button onClick={()=>setShowDeployModal(false)} style={{background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'#fff',width:'30px',height:'30px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={15}/></button>
            </div>
            <div style={{padding:'20px',display:'flex',flexDirection:'column',gap:'12px'}}>
              <p style={{color:'#64748b',fontSize:'0.875rem',margin:0,lineHeight:1.6}}>Configure and deploy an autonomous AI negotiation agent for a purchase request.</p>
              {[['PR Name','e.g. Q4 Steel Procurement'],['Target Price','e.g. 40000'],['Max Limit','e.g. 45000']].map(([l,p])=>(
                <div key={l}><label style={{display:'block',fontSize:'0.72rem',fontWeight:700,color:'#64748b',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.04em'}}>{l}</label>
                <input placeholder={p} style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{display:'block',fontSize:'0.72rem',fontWeight:700,color:'#64748b',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.04em'}}>AI Model</label>
              <select style={{width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',background:'#fff'}}>
                {['α-Strike v4 — Aggressive','β-Logic v2 — Balanced','γ-Rapid v1 — Fast Deals'].map(o=><option key={o}>{o}</option>)}
              </select></div>
              <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
                <button onClick={()=>setShowDeployModal(false)} style={{flex:1,padding:'10px',border:'1px solid #e2e8f0',borderRadius:'10px',background:'#fff',color:'#475569',fontWeight:600,fontSize:'0.875rem',cursor:'pointer'}}>Cancel</button>
                <button onClick={()=>setShowDeployModal(false)} style={{flex:2,padding:'10px',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'0.875rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'7px'}}><Bot size={14}/>Deploy Agent</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}
