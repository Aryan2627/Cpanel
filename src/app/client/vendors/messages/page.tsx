'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, FileText, IndianRupee, Clock, CheckCircle2, Building2, MessageSquare, X } from 'lucide-react';

type Message = { id: string; sender: 'me'|'vendor'; text: string; timestamp: string; isFile?: boolean; fileName?: string; };

export default function VendorMessagesPage() {
  const [activeVendor, setActiveVendor] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [vendorBid, setVendorBid] = useState<any>(null);
  const [allBids, setAllBids] = useState<any[]>([]);
  const [eventIdFilter, setEventIdFilter] = useState('');
  const [debouncedEventId, setDebouncedEventId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t=setTimeout(()=>setDebouncedEventId(eventIdFilter),500); return ()=>clearTimeout(t); }, [eventIdFilter]);

  useEffect(() => {
    const fetch_ = async () => {
      if (!debouncedEventId.trim()) { setVendors([]); setActiveVendor(''); setActiveEvent(null); setAllBids([]); return; }
      try {
        const er = await fetch(`/api/events/${debouncedEventId}`); if(!er.ok) throw new Error('Not found');
        const ed = await er.json(); setActiveEvent(ed);
        const vr = await fetch(`/api/vendors?eventId=${debouncedEventId}`);
        let vd:any[]=[]; if(vr.ok){vd=await vr.json();setVendors(vd);}
        const br = await fetch(`/api/bids?eventId=${ed.id}`); if(br.ok){setAllBids(await br.json());}
        if(vd.length>0) setActiveVendor(vd[0].name); else setActiveVendor('');
      } catch { setVendors([]); setActiveEvent(null); setAllBids([]); }
    }; fetch_();
  }, [debouncedEventId]);

  useEffect(() => {
    if(activeVendor&&allBids.length>0) setVendorBid(allBids.find(b=>b.vendorName===activeVendor)||null);
    else setVendorBid(null);
  }, [activeVendor, allBids]);

  useEffect(() => {
    if(!activeVendor) return;
    const load=()=>{const s=localStorage.getItem(`chat_${activeVendor}`);if(s){try{setMessages(JSON.parse(s));}catch{}}else{const d:Message[]=[{id:'1',sender:'vendor',text:'Hi there! We reviewed your latest RFQ.',timestamp:'10:00 AM'},{id:'2',sender:'me',text:'Great. Are you able to hit the target price?',timestamp:'10:15 AM'}];setMessages(d);localStorage.setItem(`chat_${activeVendor}`,JSON.stringify(d));}};
    load();
    const h=(e:StorageEvent)=>{if(e.key===`chat_${activeVendor}`)load();};
    window.addEventListener('storage',h);
    const iv=setInterval(load,1000);
    return ()=>{ window.removeEventListener('storage',h); clearInterval(iv); };
  }, [activeVendor]);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const handleSend=(text:string=newMessage,isFile=false,fileName?:string)=>{
    if(!text.trim()&&!isFile) return;
    const m:Message={id:Date.now().toString(),sender:'me',text:text.trim(),timestamp:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),isFile,fileName};
    const u=[...messages,m]; setMessages(u); setNewMessage(''); localStorage.setItem(`chat_${activeVendor}`,JSON.stringify(u));
  };

  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(f) handleSend(`Sent: ${f.name}`,true,f.name); if(fileInputRef.current) fileInputRef.current.value=''; };

  return (
    <div style={{backgroundColor:'#f0f4f8',minHeight:'100%',fontFamily:'system-ui,sans-serif'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)',padding:'28px 32px 40px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}><MessageSquare size={18} color="rgba(255,255,255,0.55)"/><p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Vendors</p></div>
          <h1 style={{color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px'}}>Secure Messaging</h1>
          <p style={{color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem'}}>Communicate privately with invited suppliers for an active event.</p>
        </div>
      </div>

      <div style={{padding:'0 32px 40px',marginTop:'-24px',position:'relative',zIndex:10}}>
        <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',overflow:'hidden',display:'flex',height:'calc(100vh - 220px)',minHeight:'560px'}}>

          {/* Left Sidebar */}
          <div style={{width:'300px',borderRight:'1px solid #f1f5f9',display:'flex',flexDirection:'column',flexShrink:0}}>
            <div style={{padding:'16px',borderBottom:'1px solid #f1f5f9',background:'#fafbfc'}}>
              <div style={{fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'10px'}}>Event ID</div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'0 12px',background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:'8px'}}>
                <Search size={14} color="#94a3b8"/>
                <input type="text" placeholder="Enter Event ID..." value={eventIdFilter} onChange={e=>setEventIdFilter(e.target.value)}
                  style={{border:'none',outline:'none',background:'transparent',fontSize:'0.82rem',color:'#0f172a',padding:'9px 0',width:'100%'}}/>
                {eventIdFilter&&<button onClick={()=>setEventIdFilter('')} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:0}}><X size={12}/></button>}
              </div>
            </div>
            <div style={{padding:'10px 16px',borderBottom:'1px solid #f1f5f9',background:'#fafbfc'}}>
              <div style={{fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em'}}>Invited Suppliers</div>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              {vendors.map(v=>(
                <div key={v.id} onClick={()=>setActiveVendor(v.name)}
                  style={{padding:'14px 16px',borderBottom:'1px solid #f8fafc',cursor:'pointer',borderLeft:activeVendor===v.name?'3px solid #2563eb':'3px solid transparent',background:activeVendor===v.name?'#eff6ff':'transparent',transition:'all 0.15s'}}
                  onMouseOver={e=>{if(activeVendor!==v.name)(e.currentTarget as HTMLElement).style.background='#f8fafc';}}
                  onMouseOut={e=>{if(activeVendor!==v.name)(e.currentTarget as HTMLElement).style.background='transparent';}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',background:activeVendor===v.name?'linear-gradient(135deg,#0d1f4f,#2563eb)':'linear-gradient(135deg,#94a3b8,#64748b)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.8rem',flexShrink:0,transition:'all 0.15s'}}>
                      {v.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{flex:1,overflow:'hidden'}}>
                      <div style={{fontWeight:700,color:activeVendor===v.name?'#1e3a8a':'#0f172a',fontSize:'0.85rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.name}</div>
                      <div style={{fontSize:'0.72rem',color:'#94a3b8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.email}</div>
                    </div>
                    {activeVendor===v.name&&<div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#16a34a',flexShrink:0}}/>}
                  </div>
                </div>
              ))}
              {debouncedEventId&&vendors.length===0&&(
                <div style={{padding:'32px',textAlign:'center',color:'#94a3b8',fontSize:'0.82rem'}}>No suppliers found for this event.</div>
              )}
              {!debouncedEventId&&(
                <div style={{padding:'32px',textAlign:'center'}}>
                  <MessageSquare size={28} color="#e2e8f0" style={{margin:'0 auto 8px'}}/>
                  <div style={{color:'#94a3b8',fontSize:'0.8rem'}}>Enter an event ID to load suppliers</div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {activeEvent ? (
            <>
              <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
                {activeVendor ? (
                  <>
                    {/* Chat Header */}
                    <div style={{padding:'14px 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'12px',background:'#fff',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                      <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.85rem'}}>{activeVendor.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight:800,color:'#0f172a',fontSize:'0.95rem'}}>{activeVendor}</div>
                        <div style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'7px',height:'7px',borderRadius:'50%',background:'#16a34a'}}/><span style={{fontSize:'0.72rem',color:'#64748b'}}>Active Now</span></div>
                      </div>
                    </div>
                    {/* Messages */}
                    <div style={{flex:1,padding:'20px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'16px',background:'#f8fafc',backgroundImage:'radial-gradient(#e2e8f0 1px,transparent 1px)',backgroundSize:'24px 24px'}}>
                      {messages.map(msg=>(
                        <div key={msg.id} style={{display:'flex',flexDirection:'column',alignItems:msg.sender==='me'?'flex-end':'flex-start'}}>
                          <div style={{maxWidth:'72%',padding:'10px 14px',borderRadius:msg.sender==='me'?'16px 16px 2px 16px':'16px 16px 16px 2px',background:msg.sender==='me'?'linear-gradient(135deg,#1e3a8a,#2563eb)':'#fff',color:msg.sender==='me'?'#fff':'#0f172a',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',fontSize:'0.875rem',lineHeight:1.5,display:'flex',alignItems:'center',gap:'7px',border:msg.sender==='me'?'none':'1px solid #e2e8f0'}}>
                            {msg.isFile&&<FileText size={16} color={msg.sender==='me'?'rgba(255,255,255,0.7)':'#2563eb'}/>}{msg.text}
                          </div>
                          <div style={{marginTop:'4px',fontSize:'0.68rem',color:'#94a3b8'}}>{msg.timestamp}</div>
                        </div>
                      ))}
                      <div ref={messagesEndRef}/>
                    </div>
                    {/* Input */}
                    <div style={{padding:'14px 20px',borderTop:'1px solid #f1f5f9',background:'#fff'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'6px 6px 6px 14px',transition:'all 0.15s'}}
                        onFocus={e=>(e.currentTarget as HTMLElement).style.borderColor='#2563eb'} onBlur={e=>(e.currentTarget as HTMLElement).style.borderColor='#e2e8f0'}>
                        <input ref={fileInputRef} type="file" style={{display:'none'}} onChange={handleFile}/>
                        <button onClick={()=>fileInputRef.current?.click()} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',padding:'4px',display:'flex',flexShrink:0}}><Paperclip size={18}/></button>
                        <input type="text" value={newMessage} onChange={e=>setNewMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Type your message..."
                          style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:'0.875rem',color:'#0f172a'}}/>
                        <button onClick={()=>handleSend()} disabled={!newMessage.trim()}
                          style={{width:'36px',height:'36px',borderRadius:'9px',border:'none',background:newMessage.trim()?'#1e3a8a':'#e2e8f0',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:newMessage.trim()?'pointer':'not-allowed',flexShrink:0,transition:'all 0.15s'}}>
                          <Send size={15}/>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'12px',background:'#f8fafc'}}>
                    <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center'}}><MessageSquare size={24} color="#cbd5e1"/></div>
                    <div style={{fontWeight:700,color:'#0f172a'}}>Select a supplier</div>
                    <div style={{color:'#64748b',fontSize:'0.82rem'}}>Choose a vendor from the list to start messaging.</div>
                  </div>
                )}
              </div>

              {/* Right Panel */}
              <div style={{width:'300px',borderLeft:'1px solid #f1f5f9',display:'flex',flexDirection:'column',flexShrink:0}}>
                <div style={{padding:'16px',borderBottom:'1px solid #f1f5f9',background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}><FileText size={15} color="rgba(255,255,255,0.6)"/><span style={{fontSize:'0.68rem',fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Event</span></div>
                  <div style={{fontWeight:800,color:'#fff',fontSize:'0.95rem',marginBottom:'3px'}}>{activeEvent.title||activeEvent.refId}</div>
                  <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)'}}>{activeEvent.refId}</div>
                </div>
                <div style={{flex:1,padding:'16px',overflowY:'auto'}}>
                  <div style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}><IndianRupee size={13}/>Quotation</div>
                  {vendorBid ? (
                    <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                        <span style={{fontSize:'0.78rem',color:'#64748b'}}>Status</span>
                        <span style={{background:'#dcfce7',color:'#166534',padding:'3px 9px',borderRadius:'12px',fontSize:'0.7rem',fontWeight:700}}>{vendorBid.status}</span>
                      </div>
                      <div style={{marginBottom:'16px'}}>
                        <div style={{fontSize:'0.75rem',color:'#64748b',marginBottom:'4px'}}>Total Bid</div>
                        <div style={{fontSize:'1.5rem',fontWeight:800,color:'#0f172a'}}>{vendorBid.currency} {vendorBid.amount?.toLocaleString()}</div>
                      </div>
                      {vendorBid.templateData&&(()=>{try{const items=typeof vendorBid.templateData==='string'?JSON.parse(vendorBid.templateData):vendorBid.templateData;if(Array.isArray(items))return(<div style={{borderTop:'1px solid #f1f5f9',paddingTop:'12px'}}><div style={{fontSize:'0.72rem',fontWeight:700,color:'#64748b',marginBottom:'8px'}}>Item Breakdown</div>{items.map((it:any,i:number)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px',fontSize:'0.8rem'}}><span style={{color:'#64748b'}}>{it.itemName||it.name||`Item ${i+1}`}</span><span style={{fontWeight:600,color:'#0f172a'}}>{it.price||it.total||'—'}</span></div>)}</div>);}catch{return null;}})()||null}
                    </div>
                  ) : (
                    <div style={{background:'#f8fafc',borderRadius:'12px',border:'1px solid #e2e8f0',padding:'24px',textAlign:'center'}}>
                      <Clock size={24} color="#cbd5e1" style={{margin:'0 auto 8px',display:'block'}}/>
                      <div style={{fontWeight:600,color:'#64748b',fontSize:'0.82rem'}}>No bid submitted yet</div>
                      <div style={{fontSize:'0.72rem',color:'#94a3b8',marginTop:'4px'}}>Waiting for this vendor to place a bid.</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px',background:'#f8fafc'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center'}}><Search size={30} color="#cbd5e1"/></div>
              <div style={{fontWeight:800,color:'#0f172a',fontSize:'1.1rem'}}>Search Secure Events</div>
              <div style={{color:'#64748b',fontSize:'0.875rem',maxWidth:'340px',textAlign:'center',lineHeight:1.6}}>Enter an Event ID on the left to securely message invited suppliers and review their quotations.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
