'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, Search, Building2, MapPin, Mail, Phone,
  CheckCircle2, XCircle, Clock, X, BadgeCheck, Star,
  AlertCircle, Copy, ShieldCheck, Plus, ArrowUpDown, Eye, Inbox
} from 'lucide-react';

export default function VendorManagement() {
  const router = useRouter();
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string|null>(null);
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<{key:string;direction:'asc'|'desc'}|null>(null);
  const [formData, setFormData] = useState({ name:'', email:'', type:'Manufacturer/Trader', vendorCode:'', dealsIn:'', city:'' });

  useEffect(() => {
    fetch('/api/vendors').then(r=>r.ok?r.json():Promise.reject()).then(d=>{ if(Array.isArray(d)) setVendors(d); }).catch(()=>{}).finally(()=>setIsLoading(false));
  }, []);

  const handleApproveVendor = async (id: string) => {
    const res = await fetch(`/api/vendors/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'Onboarded'})});
    if(res.ok){setVendors(prev=>prev.map(v=>v.id===id?{...v,status:'Onboarded'}:v));setSelectedVendorForApproval(null);}
  };
  const handleRejectVendor = async (id: string) => {
    const res = await fetch(`/api/vendors/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'Rejected'})});
    if(res.ok){setVendors(prev=>prev.map(v=>v.id===id?{...v,status:'Rejected'}:v));setSelectedVendorForApproval(null);}
  };
  const handleSubmit = async () => {
    if(!formData.name||!formData.email){alert('Name and Email required');return;}
    setIsSubmitting(true);
    const res = await fetch('/api/vendors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:formData.name,vendorCode:formData.vendorCode||'-',companyCode:'-',email:formData.email,phone:'-',type:formData.type,city:formData.city||'-',status:'Invited'})});
    if(res.ok){const nv=await res.json();setVendors(prev=>[nv,...prev]);setIsInviteOpen(false);setFormData({name:'',email:'',type:'Manufacturer/Trader',vendorCode:'',dealsIn:'',city:''});}
    setIsSubmitting(false);
  };
  const handleCopy = (text:string,id:string)=>{navigator.clipboard.writeText(text);setCopiedId(id);setTimeout(()=>setCopiedId(null),2000);};

  const statusTabs = ['All','Onboarded','Invited','Pending Review','Rejected'];
  const statusStyle=(s:string):React.CSSProperties=>{
    if(s==='Onboarded') return {background:'#dcfce7',color:'#15803d',border:'1px solid #86efac'};
    if(s==='Invited') return {background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'};
    if(s==='Pending Review') return {background:'#fef3c7',color:'#b45309',border:'1px solid #fde68a'};
    if(s==='Rejected') return {background:'#fef2f2',color:'#dc2626',border:'1px solid #fca5a5'};
    return {background:'#f1f5f9',color:'#475569',border:'1px solid #cbd5e1'};
  };

  const filtered = vendors.filter(v=>{
    if(filterStatus!=='All'&&v.status!==filterStatus) return false;
    if(!searchQuery) return true;
    const q=searchQuery.toLowerCase();
    return (v.name||'').toLowerCase().includes(q)||(v.email||'').toLowerCase().includes(q)||(v.city||'').toLowerCase().includes(q)||(v.type||'').toLowerCase().includes(q);
  });

  const kpis=[
    {label:'Total Vendors',value:vendors.length,icon:Building2,color:'#2563eb',bg:'#eff6ff'},
    {label:'Onboarded',value:vendors.filter(v=>v.status==='Onboarded').length,icon:BadgeCheck,color:'#16a34a',bg:'#dcfce7'},
    {label:'Pending Review',value:vendors.filter(v=>v.status==='Pending Review').length,icon:Clock,color:'#d97706',bg:'#fef3c7'},
    {label:'Invited',value:vendors.filter(v=>v.status==='Invited').length,icon:UserPlus,color:'#7c3aed',bg:'#faf5ff'},
  ];

  return (
    <div style={{backgroundColor:'#f0f4f8',minHeight:'100%',fontFamily:'system-ui,sans-serif'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)',padding:'28px 32px 40px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none'}} />
        <div style={{position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}><Building2 size={18} color="rgba(255,255,255,0.55)"/><p style={{color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Vendors</p></div>
            <h1 style={{color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px'}}>Supplier List</h1>
            <p style={{color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem'}}>Manage your vendor network, onboard suppliers and track status.</p>
          </div>
          <button onClick={()=>setIsInviteOpen(true)} style={{display:'flex',alignItems:'center',gap:'7px',padding:'10px 20px',background:'#2563eb',border:'none',borderRadius:'10px',color:'#fff',fontWeight:700,fontSize:'0.875rem',cursor:'pointer',boxShadow:'0 4px 14px rgba(37,99,235,0.35)'}}>
            <UserPlus size={17}/> Invite Vendor
          </button>
        </div>
      </div>

      <div style={{padding:'0 32px 40px',marginTop:'-24px',position:'relative',zIndex:10}}>
        {/* KPI Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px'}}>
          {kpis.map((k,i)=>{const Icon=k.icon;return(
            <div key={i} style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',padding:'20px 22px',boxShadow:'0 4px 12px rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',transition:'all 0.2s',cursor:'pointer'}}
              onMouseOver={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.06)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
              <div><div style={{fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px'}}>{k.label}</div><div style={{fontSize:'2rem',fontWeight:800,color:'#0f172a',letterSpacing:'-0.05em',lineHeight:1}}>{k.value}</div></div>
              <div style={{width:'44px',height:'44px',borderRadius:'12px',backgroundColor:k.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Icon size={22} color={k.color}/></div>
            </div>
          );})}
        </div>

        {/* Table Card */}
        <div style={{backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',overflow:'hidden'}}>
          {/* Tabs + Search */}
          <div style={{padding:'0 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'2px',background:'#fafbfc',flexWrap:'wrap'}}>
            {statusTabs.map(tab=>(
              <button key={tab} onClick={()=>setFilterStatus(tab)} style={{padding:'14px 12px',border:'none',borderBottom:filterStatus===tab?'2px solid #1e3a8a':'2px solid transparent',background:'transparent',cursor:'pointer',fontSize:'0.78rem',fontWeight:filterStatus===tab?700:500,color:filterStatus===tab?'#1e3a8a':'#64748b',transition:'all 0.15s',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:'6px'}}>
                {tab}<span style={{padding:'1px 6px',borderRadius:'10px',fontSize:'0.68rem',fontWeight:700,background:filterStatus===tab?'#0d1f4f':'#f1f5f9',color:filterStatus===tab?'#fff':'#94a3b8'}}>
                  {tab==='All'?vendors.length:vendors.filter(v=>v.status===tab).length}
                </span>
              </button>
            ))}
            <div style={{flex:1}}/>
            <div style={{display:'flex',alignItems:'center',gap:'7px',padding:'0 12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',margin:'8px 0'}}>
              <Search size={14} color="#94a3b8"/>
              <input type="text" placeholder="Search name, email, city..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{border:'none',outline:'none',background:'transparent',fontSize:'0.82rem',color:'#0f172a',padding:'8px 0',width:'220px'}}/>
              {searchQuery&&<button onClick={()=>setSearchQuery('')} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:0}}><X size={13}/></button>}
            </div>
          </div>

          {isLoading?<div style={{padding:'60px',textAlign:'center',color:'#94a3b8'}}>Loading vendors...</div>:(
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'linear-gradient(90deg,#0d1f4f,#1a2f6b)'}}>
                {[['name','Vendor Name'],['type','Type'],['email','Email'],['city','Location'],['status','Status'],['rating','Rating']].map(([k,l])=>(
                  <th key={k} onClick={()=>setSortConfig(prev=>prev?.key===k?{key:k,direction:prev.direction==='asc'?'desc':'asc'}:{key:k,direction:'asc'})}
                    style={{padding:'13px 16px',textAlign:'left',color:'rgba(255,255,255,0.75)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',cursor:'pointer',whiteSpace:'nowrap'}}>
                    <span style={{display:'flex',alignItems:'center',gap:'5px'}}>{l}<ArrowUpDown size={10} color="rgba(255,255,255,0.3)"/></span>
                  </th>
                ))}
                <th style={{padding:'13px 16px',color:'rgba(255,255,255,0.75)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length>0?filtered.map((v,idx)=>(
                <tr key={v.id} style={{borderBottom:'1px solid #f1f5f9',background:idx%2===0?'#fff':'#fafbfc',borderLeft:'3px solid transparent',transition:'all 0.12s'}}
                  onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background='#f8fafc';(e.currentTarget as HTMLElement).style.borderLeft='3px solid #3b82f6';}}
                  onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background=idx%2===0?'#fff':'#fafbfc';(e.currentTarget as HTMLElement).style.borderLeft='3px solid transparent';}}>
                  <td style={{padding:'13px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'34px',height:'34px',borderRadius:'10px',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.75rem',flexShrink:0}}>{(v.name||'V').charAt(0).toUpperCase()}</div>
                      <div><div style={{fontWeight:700,color:'#0f172a',fontSize:'0.875rem'}}>{v.name}</div>
                      <div style={{fontSize:'0.72rem',color:'#94a3b8',fontFamily:'monospace',marginTop:'2px',display:'flex',alignItems:'center',gap:'4px'}}>
                        {v.vendorCode||'—'}
                        {v.vendorCode&&<button onClick={()=>handleCopy(v.vendorCode,v.id)} style={{background:'none',border:'none',cursor:'pointer',color:copiedId===v.id?'#16a34a':'#94a3b8',padding:0,display:'flex'}}><Copy size={11}/></button>}
                      </div></div>
                    </div>
                  </td>
                  <td style={{padding:'13px 16px'}}><span style={{background:'#f1f5f9',color:'#475569',padding:'3px 9px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:600}}>{v.type||'—'}</span></td>
                  <td style={{padding:'13px 16px',color:'#475569',fontSize:'0.82rem'}}>{v.email||'—'}</td>
                  <td style={{padding:'13px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'5px',color:'#64748b',fontSize:'0.82rem'}}>
                      <MapPin size={13} color="#94a3b8"/>{v.city||'—'}
                    </div>
                  </td>
                  <td style={{padding:'13px 16px'}}><span style={{padding:'4px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,...statusStyle(v.status)}}>{v.status||'Unknown'}</span></td>
                  <td style={{padding:'13px 16px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'3px'}}>
                      {[1,2,3,4,5].map(s=><Star key={s} size={13} color={s<=4?'#f59e0b':'#e2e8f0'} fill={s<=4?'#f59e0b':'transparent'}/>)}
                      <span style={{marginLeft:'4px',fontSize:'0.72rem',color:'#64748b',fontWeight:600}}>4.0</span>
                    </div>
                  </td>
                  <td style={{padding:'13px 16px'}}>
                    <div style={{display:'flex',gap:'6px',flexWrap:'nowrap'}}>
                      <button onClick={()=>router.push(`/client/vendors/${v.id}`)} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'7px',color:'#2563eb',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}><Eye size={12}/> View</button>
                      {v.status==='Pending Review'&&(
                        <button onClick={()=>setSelectedVendorForApproval(v)} style={{display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'#dcfce7',border:'1px solid #86efac',borderRadius:'7px',color:'#15803d',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}><ShieldCheck size={12}/> Review</button>
                      )}
                    </div>
                  </td>
                </tr>
              )):(
                <tr><td colSpan={7} style={{padding:'64px',textAlign:'center'}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center'}}><Building2 size={28} color="#cbd5e1"/></div>
                    <div style={{fontWeight:700,color:'#0f172a'}}>No vendors found</div>
                    <button onClick={()=>setIsInviteOpen(true)} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',background:'#0d1f4f',color:'#fff',borderRadius:'9px',border:'none',fontWeight:700,fontSize:'0.875rem',cursor:'pointer'}}><UserPlus size={16}/> Invite First Vendor</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          )}
          {filtered.length>0&&(
            <div style={{padding:'12px 20px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fafbfc'}}>
              <div style={{fontSize:'0.8rem',color:'#64748b'}}><strong style={{color:'#0f172a'}}>{filtered.length}</strong> of <strong style={{color:'#0f172a'}}>{vendors.length}</strong> vendors</div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setIsInviteOpen(false)}>
          <div style={{background:'#fff',borderRadius:'20px',width:'480px',maxWidth:'92vw',boxShadow:'0 30px 60px rgba(0,0,0,0.2)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:'linear-gradient(135deg,#071330,#0d1f4f)',padding:'22px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2 style={{margin:0,fontSize:'1.1rem',fontWeight:800,color:'#fff'}}>Invite Vendor</h2>
              <button onClick={()=>setIsInviteOpen(false)} style={{background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'#fff',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={16}/></button>
            </div>
            <div style={{padding:'24px',display:'flex',flexDirection:'column',gap:'14px'}}>
              {[['name','Company Name'],['email','Email Address'],['vendorCode','Vendor Code'],['city','City']].map(([f,l])=>(
                <div key={f}><label style={{display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.04em'}}>{l}</label>
                <input value={(formData as any)[f]} onChange={e=>setFormData(p=>({...p,[f]:e.target.value}))} style={{width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.04em'}}>Vendor Type</label>
              <select value={formData.type} onChange={e=>setFormData(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',background:'#fff'}}>
                {['Manufacturer/Trader','Service Provider','Distributor','Consultant'].map(o=><option key={o}>{o}</option>)}
              </select></div>
              <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
                <button onClick={()=>setIsInviteOpen(false)} style={{flex:1,padding:'11px',border:'1px solid #e2e8f0',borderRadius:'10px',background:'#fff',color:'#475569',fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button onClick={handleSubmit} disabled={isSubmitting} style={{flex:2,padding:'11px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,cursor:'pointer'}}>{isSubmitting?'Sending...':'Send Invitation'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {selectedVendorForApproval&&(
        <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSelectedVendorForApproval(null)}>
          <div style={{background:'#fff',borderRadius:'20px',width:'480px',maxWidth:'92vw',boxShadow:'0 30px 60px rgba(0,0,0,0.2)',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:'linear-gradient(135deg,#071330,#0d1f4f)',padding:'22px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h2 style={{margin:0,fontSize:'1.1rem',fontWeight:800,color:'#fff'}}>Review Vendor</h2>
              <button onClick={()=>setSelectedVendorForApproval(null)} style={{background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'#fff',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={16}/></button>
            </div>
            <div style={{padding:'24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px',background:'#f8fafc',borderRadius:'12px',marginBottom:'20px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'12px',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.1rem'}}>{selectedVendorForApproval.name?.charAt(0)}</div>
                <div><div style={{fontWeight:800,color:'#0f172a',fontSize:'1rem'}}>{selectedVendorForApproval.name}</div>
                <div style={{color:'#64748b',fontSize:'0.82rem'}}>{selectedVendorForApproval.email}</div>
                <div style={{color:'#94a3b8',fontSize:'0.75rem'}}>{selectedVendorForApproval.type} · {selectedVendorForApproval.city}</div></div>
              </div>
              <div style={{display:'flex',gap:'10px'}}>
                <button onClick={()=>handleRejectVendor(selectedVendorForApproval.id)} style={{flex:1,padding:'12px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'10px',color:'#dc2626',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><XCircle size={16}/> Reject</button>
                <button onClick={()=>handleApproveVendor(selectedVendorForApproval.id)} style={{flex:2,padding:'12px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}><BadgeCheck size={16}/> Approve & Onboard</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
