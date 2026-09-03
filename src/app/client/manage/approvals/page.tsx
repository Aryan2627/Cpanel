'use client';
import { useState, useEffect } from 'react';
import { Plus, X, GitBranch, ArrowRight, CheckCircle2, ShieldAlert, ShieldCheck, Users, Settings, Trash2 } from 'lucide-react';

export default function ApprovalFlowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({ name: '', category: '' });
  const [approvers, setApprovers] = useState<string[]>(['']);
  const [categories] = useState(['IT Hardware', 'Marketing', 'Office Supplies', 'General', 'Finance', 'Operations']);

  useEffect(() => {
    Promise.all([fetch('/api/workflows').then(r=>r.json()), fetch('/api/users').then(r=>r.json())])
      .then(([wf, us]) => { setWorkflows(Array.isArray(wf)?wf:[]); setSystemUsers(Array.isArray(us)?us:[]); })
      .catch(()=>{}).finally(()=>setIsLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newWorkflow.name||!newWorkflow.category) { alert('Name and Category required'); return; }
    const validApprovers = approvers.filter(a=>a.trim());
    if (validApprovers.length===0) { alert('Add at least one approver'); return; }
    const res = await fetch('/api/workflows', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:newWorkflow.name, category:newWorkflow.category, approvers:validApprovers }) });
    if (res.ok) { const d=await res.json(); setWorkflows(prev=>[...prev,d]); setIsModalOpen(false); setNewWorkflow({name:'',category:''}); setApprovers(['']); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this approval flow?')) return;
    await fetch(`/api/workflows?id=${id}`,{method:'DELETE'});
    setWorkflows(prev=>prev.filter(w=>w.id!==id));
  };

  const kpis = [
    { label:'Total Flows', value:workflows.length, icon:GitBranch, color:'#2563eb', bg:'#eff6ff' },
    { label:'Categories', value:new Set(workflows.map(w=>w.category).filter(Boolean)).size, icon:Settings, color:'#7c3aed', bg:'#faf5ff' },
    { label:'Approvers', value:systemUsers.length, icon:Users, color:'#16a34a', bg:'#dcfce7' },
    { label:'Active', value:workflows.filter(w=>w.status!=='Inactive').length, icon:ShieldCheck, color:'#d97706', bg:'#fef3c7' },
  ];

  return (
    <div style={{ backgroundColor:'#f0f4f8',minHeight:'100%',fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)',padding:'28px 32px 40px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px' }}><ShieldCheck size={18} color="rgba(255,255,255,0.55)" /><p style={{ color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Master Data</p></div>
            <h1 style={{ color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px' }}>Approval Flows</h1>
            <p style={{ color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem' }}>Configure multi-tier approval chains for procurement categories.</p>
          </div>
          <button onClick={()=>setIsModalOpen(true)} style={{ display:'flex',alignItems:'center',gap:'7px',padding:'10px 20px',background:'#2563eb',border:'none',borderRadius:'10px',color:'#fff',fontWeight:700,fontSize:'0.875rem',cursor:'pointer',boxShadow:'0 4px 14px rgba(37,99,235,0.35)' }}><Plus size={17} /> New Flow</button>
        </div>
      </div>

      <div style={{ padding:'0 32px 40px',marginTop:'-24px',position:'relative',zIndex:10 }}>
        {/* KPI Cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px' }}>
          {kpis.map((k,i)=>{ const Icon=k.icon; return (
            <div key={i} style={{ backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',padding:'20px 22px',boxShadow:'0 4px 12px rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',transition:'all 0.2s',cursor:'pointer' }}
              onMouseOver={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.06)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
              <div><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px' }}>{k.label}</div><div style={{ fontSize:'2rem',fontWeight:800,color:'#0f172a',letterSpacing:'-0.05em',lineHeight:1 }}>{k.value}</div></div>
              <div style={{ width:'44px',height:'44px',borderRadius:'12px',backgroundColor:k.bg,display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={22} color={k.color} /></div>
            </div>
          );})}
        </div>

        {/* Flows Grid */}
        {isLoading ? <div style={{ textAlign:'center',padding:'60px',color:'#94a3b8' }}>Loading approval flows...</div> : (
          workflows.length>0 ? (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))',gap:'16px' }}>
              {workflows.map(w => {
                let approverList: string[] = [];
                try { approverList = typeof w.approvers==='string' ? JSON.parse(w.approvers) : (Array.isArray(w.approvers)?w.approvers:[]); } catch {}
                return (
                  <div key={w.id} style={{ backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',transition:'all 0.2s' }}
                    onMouseOver={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                    onMouseOut={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.05)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
                    <div style={{ background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                        <div style={{ width:'36px',height:'36px',borderRadius:'10px',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}><GitBranch size={18} color="#fff" /></div>
                        <div><div style={{ color:'#fff',fontWeight:800,fontSize:'0.95rem' }}>{w.name}</div>
                        <div style={{ color:'rgba(255,255,255,0.5)',fontSize:'0.72rem',marginTop:'2px' }}>{approverList.length} approval step{approverList.length!==1?'s':''}</div></div>
                      </div>
                      <span style={{ background:'rgba(255,255,255,0.12)',color:'#bfdbfe',padding:'3px 9px',borderRadius:'12px',fontSize:'0.72rem',fontWeight:700 }}>{w.category||'General'}</span>
                    </div>
                    <div style={{ padding:'16px 20px' }}>
                      {approverList.length>0 ? (
                        <div style={{ display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px' }}>
                          {approverList.map((ap,i)=>(
                            <div key={i} style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                              <div style={{ width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.6rem',flexShrink:0 }}>
                                {i+1}
                              </div>
                              <div style={{ flex:1,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'7px',padding:'6px 10px',fontSize:'0.8rem',color:'#334155',fontWeight:500 }}>{ap}</div>
                              {i<approverList.length-1&&<ArrowRight size={14} color="#94a3b8" />}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding:'16px',background:'#f8fafc',borderRadius:'8px',textAlign:'center',color:'#94a3b8',fontSize:'0.8rem',marginBottom:'16px' }}>No approvers configured</div>
                      )}
                      <div style={{ display:'flex',gap:'8px' }}>
                        <div style={{ flex:1,display:'flex',alignItems:'center',gap:'5px',padding:'6px 10px',background:'#dcfce7',border:'1px solid #86efac',borderRadius:'7px',fontSize:'0.72rem',fontWeight:700,color:'#15803d' }}><CheckCircle2 size={12} /> Active</div>
                        <button onClick={()=>handleDelete(w.id)} style={{ padding:'6px 12px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'7px',cursor:'pointer',color:'#dc2626',display:'flex',alignItems:'center',gap:'5px',fontSize:'0.72rem',fontWeight:600 }}><Trash2 size={12} /> Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',padding:'64px',textAlign:'center',boxShadow:'0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
                <div style={{ width:'64px',height:'64px',borderRadius:'20px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center' }}><ShieldAlert size={30} color="#cbd5e1" /></div>
                <div style={{ fontWeight:700,color:'#0f172a',fontSize:'1.1rem' }}>No approval flows configured</div>
                <div style={{ color:'#64748b',fontSize:'0.875rem',maxWidth:'380px' }}>Create approval chains to route purchase orders through the right stakeholders before they are committed.</div>
                <button onClick={()=>setIsModalOpen(true)} style={{ display:'inline-flex',alignItems:'center',gap:'8px',marginTop:'12px',padding:'12px 24px',background:'linear-gradient(135deg,#071330,#0d1f4f)',color:'#fff',borderRadius:'10px',border:'none',fontWeight:700,fontSize:'0.9rem',cursor:'pointer',boxShadow:'0 4px 12px rgba(13,31,79,0.3)' }}><Plus size={18} /> Create First Flow</button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }} onClick={()=>setIsModalOpen(false)}>
          <div style={{ background:'#fff',borderRadius:'20px',width:'500px',maxWidth:'92vw',maxHeight:'85vh',display:'flex',flexDirection:'column',boxShadow:'0 30px 60px rgba(0,0,0,0.2)',overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg,#071330,#0d1f4f)',padding:'22px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
              <h2 style={{ margin:0,fontSize:'1.1rem',fontWeight:800,color:'#fff' }}>New Approval Flow</h2>
              <button onClick={()=>setIsModalOpen(false)} style={{ background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'#fff',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'16px',overflowY:'auto' }}>
              <div><label style={{ display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.04em' }}>Flow Name</label>
              <input value={newWorkflow.name} onChange={e=>setNewWorkflow(p=>({...p,name:e.target.value}))} placeholder="e.g. IT Hardware Approval"
                style={{ width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',boxSizing:'border-box' }} /></div>
              <div><label style={{ display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.04em' }}>Category</label>
              <select value={newWorkflow.category} onChange={e=>setNewWorkflow(p=>({...p,category:e.target.value}))} style={{ width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',background:'#fff' }}>
                <option value="">Select category...</option>
                {categories.map(c=><option key={c}>{c}</option>)}
              </select></div>
              <div>
                <label style={{ display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.04em' }}>Approval Chain</label>
                {approvers.map((ap,i)=>(
                  <div key={i} style={{ display:'flex',gap:'8px',alignItems:'center',marginBottom:'8px' }}>
                    <div style={{ width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.65rem',flexShrink:0 }}>{i+1}</div>
                    <select value={ap} onChange={e=>{const n=[...approvers];n[i]=e.target.value;setApprovers(n);}}
                      style={{ flex:1,padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',background:'#fff' }}>
                      <option value="">Select approver...</option>
                      {systemUsers.map(u=><option key={u.id} value={u.email||u.name}>{u.name} ({u.role})</option>)}
                    </select>
                    {approvers.length>1&&<button onClick={()=>setApprovers(prev=>prev.filter((_,j)=>j!==i))} style={{ background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'7px',padding:'8px',cursor:'pointer',color:'#dc2626',display:'flex' }}><X size={14} /></button>}
                  </div>
                ))}
                <button onClick={()=>setApprovers(p=>[...p,''])} style={{ display:'flex',alignItems:'center',gap:'6px',padding:'8px 14px',border:'1px dashed #bfdbfe',borderRadius:'8px',background:'#f0f7ff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,color:'#2563eb',marginTop:'4px' }}><Plus size={14} /> Add Another Approver</button>
              </div>
              <div style={{ display:'flex',gap:'10px',marginTop:'4px' }}>
                <button onClick={()=>setIsModalOpen(false)} style={{ flex:1,padding:'11px',border:'1px solid #e2e8f0',borderRadius:'10px',background:'#fff',color:'#475569',fontWeight:600,fontSize:'0.875rem',cursor:'pointer' }}>Cancel</button>
                <button onClick={handleCreate} style={{ flex:2,padding:'11px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'0.875rem',cursor:'pointer' }}>Create Flow</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
