'use client';
import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, Users, UserCheck, UserX, Shield, Edit, Trash2, ArrowUpDown } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'Buyer', erpId: '', status: 'Active', department: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc'|'desc' }|null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const roles = ['All', 'Admin', 'Manager', 'Buyer', 'Finance', 'Viewer'];
  const kpis = [
    { label: 'Total Users', value: users.length, icon: Users, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Active', value: users.filter(u => u.status === 'Active').length, icon: UserCheck, color: '#16a34a', bg: '#dcfce7' },
    { label: 'Inactive', value: users.filter(u => u.status === 'Inactive').length, icon: UserX, color: '#dc2626', bg: '#fef2f2' },
    { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: Shield, color: '#7c3aed', bg: '#faf5ff' },
  ];

  const filtered = useMemo(() => {
    let d = [...users];
    if (filterRole !== 'All') d = d.filter(u => u.role === filterRole);
    if (searchQuery) { const q = searchQuery.toLowerCase(); d = d.filter(u => (u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)||(u.department||'').toLowerCase().includes(q)); }
    if (sortConfig) d.sort((a,b) => { const av=(a as any)[sortConfig.key]||''; const bv=(b as any)[sortConfig.key]||''; return sortConfig.direction==='asc'?(av>bv?1:-1):(av<bv?1:-1); });
    return d;
  }, [users, filterRole, searchQuery, sortConfig]);

  const statusStyle = (s: string): React.CSSProperties => s === 'Active' ? { background:'#dcfce7',color:'#15803d',border:'1px solid #86efac' } : { background:'#fef2f2',color:'#dc2626',border:'1px solid #fca5a5' };
  const roleStyle = (r: string): React.CSSProperties => {
    if (r==='Admin') return { background:'#faf5ff',color:'#7c3aed',border:'1px solid #c4b5fd' };
    if (r==='Manager') return { background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe' };
    if (r==='Finance') return { background:'#fef3c7',color:'#b45309',border:'1px solid #fde68a' };
    return { background:'#f1f5f9',color:'#475569',border:'1px solid #cbd5e1' };
  };

  const handleSave = async () => {
    if (!formData.name||!formData.email) { setFormError('Name and Email are required.'); return; }
    const method = isEditMode ? 'PATCH' : 'POST';
    const url = isEditMode ? `/api/users?id=${editingUserId}` : '/api/users';
    const res = await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(formData) });
    if (res.ok) { const updated = await fetch('/api/users').then(r=>r.json()); setUsers(Array.isArray(updated)?updated:[]); setIsCreateModalOpen(false); setFormData({name:'',email:'',phone:'',role:'Buyer',erpId:'',status:'Active',department:''}); setFormError(''); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div style={{ backgroundColor:'#f0f4f8', minHeight:'100%', fontFamily:'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)', padding:'28px 32px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px' }}>
              <Users size={18} color="rgba(255,255,255,0.55)" />
              <p style={{ color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Master Data</p>
            </div>
            <h1 style={{ color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px' }}>Users</h1>
            <p style={{ color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem' }}>Manage portal users, roles, and permissions.</p>
          </div>
          <button onClick={() => { setIsEditMode(false); setFormData({name:'',email:'',phone:'',role:'Buyer',erpId:'',status:'Active',department:''}); setIsCreateModalOpen(true); }}
            style={{ display:'flex',alignItems:'center',gap:'7px',padding:'10px 20px',background:'#2563eb',border:'none',borderRadius:'10px',color:'#fff',fontWeight:700,fontSize:'0.875rem',cursor:'pointer',boxShadow:'0 4px 14px rgba(37,99,235,0.35)' }}>
            <Plus size={17} /> Add User
          </button>
        </div>
      </div>

      <div style={{ padding:'0 32px 40px', marginTop:'-24px', position:'relative', zIndex:10 }}>
        {/* KPI Cards */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px' }}>
          {kpis.map((k,i) => { const Icon=k.icon; return (
            <div key={i} style={{ backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',padding:'20px 22px',boxShadow:'0 4px 12px rgba(0,0,0,0.06)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',transition:'all 0.2s',cursor:'pointer' }}
              onMouseOver={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(0,0,0,0.1)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
              onMouseOut={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.06)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
              <div><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'8px' }}>{k.label}</div>
              <div style={{ fontSize:'2rem',fontWeight:800,color:'#0f172a',letterSpacing:'-0.05em',lineHeight:1 }}>{k.value}</div></div>
              <div style={{ width:'44px',height:'44px',borderRadius:'12px',backgroundColor:k.bg,display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={22} color={k.color} /></div>
            </div>
          );})}
        </div>

        {/* Table Card */}
        <div style={{ backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',overflow:'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding:'0 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'4px',background:'#fafbfc',flexWrap:'wrap' }}>
            {roles.map(r => (
              <button key={r} onClick={()=>setFilterRole(r)} style={{ padding:'14px 14px',border:'none',borderBottom:filterRole===r?'2px solid #1e3a8a':'2px solid transparent',background:'transparent',cursor:'pointer',fontSize:'0.8rem',fontWeight:filterRole===r?700:500,color:filterRole===r?'#1e3a8a':'#64748b',transition:'all 0.15s',whiteSpace:'nowrap' }}>
                {r} <span style={{ padding:'1px 6px',borderRadius:'10px',fontSize:'0.68rem',fontWeight:700,background:filterRole===r?'#0d1f4f':'#f1f5f9',color:filterRole===r?'#fff':'#94a3b8',marginLeft:'4px' }}>
                  {r==='All'?users.length:users.filter(u=>u.role===r).length}
                </span>
              </button>
            ))}
            <div style={{ flex:1 }} />
            <div style={{ display:'flex',alignItems:'center',gap:'7px',padding:'0 12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',margin:'8px 0' }}>
              <Search size={14} color="#94a3b8" />
              <input type="text" placeholder="Search name, email, department..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                style={{ border:'none',outline:'none',background:'transparent',fontSize:'0.82rem',color:'#0f172a',padding:'8px 0',width:'220px' }} />
              {searchQuery && <button onClick={()=>setSearchQuery('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:0 }}><X size={13} /></button>}
            </div>
          </div>

          {loading ? (
            <div style={{ padding:'60px',textAlign:'center',color:'#94a3b8' }}>Loading users...</div>
          ) : (
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'linear-gradient(90deg,#0d1f4f,#1a2f6b)' }}>
                <th style={{ padding:'13px 16px',width:'44px' }}>
                  <input type="checkbox" checked={selectedIds.size===filtered.length&&filtered.length>0} onChange={e=>setSelectedIds(e.target.checked?new Set(filtered.map(u=>u.id)):new Set())} style={{ accentColor:'#2563eb',cursor:'pointer' }} />
                </th>
                {[['name','Name'],['email','Email'],['department','Department'],['role','Role'],['status','Status'],['erpId','ERP ID']].map(([key,label])=>(
                  <th key={key} onClick={()=>setSortConfig(prev=>prev?.key===key?{key,direction:prev.direction==='asc'?'desc':'asc'}:{key,direction:'asc'})}
                    style={{ padding:'13px 16px',textAlign:'left',color:'rgba(255,255,255,0.75)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',cursor:'pointer',whiteSpace:'nowrap' }}>
                    <span style={{ display:'flex',alignItems:'center',gap:'5px' }}>{label} <ArrowUpDown size={10} color="rgba(255,255,255,0.3)" /></span>
                  </th>
                ))}
                <th style={{ padding:'13px 16px',color:'rgba(255,255,255,0.75)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length>0 ? filtered.map((u,idx)=>{
                const isSel=selectedIds.has(u.id);
                return (
                  <tr key={u.id} style={{ borderBottom:'1px solid #f1f5f9',background:isSel?'#eff6ff':idx%2===0?'#fff':'#fafbfc',borderLeft:isSel?'3px solid #2563eb':'3px solid transparent',transition:'all 0.12s' }}
                    onMouseOver={e=>{if(!isSel){(e.currentTarget as HTMLElement).style.background='#f8fafc';(e.currentTarget as HTMLElement).style.borderLeft='3px solid #3b82f6';}}}
                    onMouseOut={e=>{if(!isSel){(e.currentTarget as HTMLElement).style.background=idx%2===0?'#fff':'#fafbfc';(e.currentTarget as HTMLElement).style.borderLeft='3px solid transparent';}}}>
                    <td style={{ padding:'13px 16px' }}><input type="checkbox" checked={isSel} onChange={()=>{const s=new Set(selectedIds);isSel?s.delete(u.id):s.add(u.id);setSelectedIds(s);}} style={{ accentColor:'#2563eb',cursor:'pointer' }} /></td>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
                        <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#0d1f4f,#2563eb)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'0.75rem',flexShrink:0 }}>
                          {(u.name||'U').charAt(0).toUpperCase()}
                        </div>
                        <div><div style={{ fontWeight:700,color:'#0f172a',fontSize:'0.875rem' }}>{u.name}</div>
                        {u.phone&&<div style={{ fontSize:'0.72rem',color:'#94a3b8' }}>{u.phone}</div>}</div>
                      </div>
                    </td>
                    <td style={{ padding:'13px 16px',color:'#475569',fontSize:'0.82rem' }}>{u.email}</td>
                    <td style={{ padding:'13px 16px',color:'#475569',fontSize:'0.82rem' }}>{u.department||'—'}</td>
                    <td style={{ padding:'13px 16px' }}><span style={{ padding:'4px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,...roleStyle(u.role) }}>{u.role}</span></td>
                    <td style={{ padding:'13px 16px' }}><span style={{ padding:'4px 10px',borderRadius:'20px',fontSize:'0.72rem',fontWeight:700,...statusStyle(u.status) }}>{u.status}</span></td>
                    <td style={{ padding:'13px 16px',color:'#94a3b8',fontSize:'0.78rem',fontFamily:'monospace' }}>{u.erpId||'—'}</td>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex',gap:'6px' }}>
                        <button onClick={()=>{setIsEditMode(true);setEditingUserId(u.id);setFormData({name:u.name||'',email:u.email||'',phone:u.phone||'',role:u.role||'Buyer',erpId:u.erpId||'',status:u.status||'Active',department:u.department||''});setIsCreateModalOpen(true);}}
                          style={{ display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'7px',cursor:'pointer',fontSize:'0.72rem',fontWeight:600,color:'#475569',transition:'all 0.15s' }}
                          onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background='#eff6ff';(e.currentTarget as HTMLElement).style.color='#2563eb';}}
                          onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background='#f8fafc';(e.currentTarget as HTMLElement).style.color='#475569';}}>
                          <Edit size={12} /> Edit
                        </button>
                        <button onClick={()=>handleDelete(u.id)}
                          style={{ display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'7px',cursor:'pointer',fontSize:'0.72rem',fontWeight:600,color:'#dc2626' }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} style={{ padding:'64px',textAlign:'center' }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
                    <div style={{ width:'56px',height:'56px',borderRadius:'16px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center' }}><Users size={28} color="#cbd5e1" /></div>
                    <div style={{ fontWeight:700,color:'#0f172a',fontSize:'1rem' }}>No users found</div>
                    <div style={{ color:'#64748b',fontSize:'0.875rem' }}>Add your first user to get started.</div>
                    <button onClick={()=>setIsCreateModalOpen(true)} style={{ display:'inline-flex',alignItems:'center',gap:'6px',marginTop:'8px',padding:'10px 20px',background:'#0d1f4f',color:'#fff',borderRadius:'9px',border:'none',fontWeight:700,fontSize:'0.875rem',cursor:'pointer' }}><Plus size={16} /> Add User</button>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          )}
          {filtered.length>0&&(
            <div style={{ padding:'12px 20px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fafbfc' }}>
              <div style={{ fontSize:'0.8rem',color:'#64748b' }}>
                <strong style={{ color:'#0f172a' }}>{filtered.length}</strong> of <strong style={{ color:'#0f172a' }}>{users.length}</strong> users
                {selectedIds.size>0&&<span style={{ marginLeft:'12px',color:'#2563eb',fontWeight:600 }}>· {selectedIds.size} selected</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isCreateModalOpen&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }} onClick={()=>setIsCreateModalOpen(false)}>
          <div style={{ background:'#fff',borderRadius:'20px',width:'480px',maxWidth:'92vw',boxShadow:'0 30px 60px rgba(0,0,0,0.2)',overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg,#071330,#0d1f4f)',padding:'22px 24px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <h2 style={{ margin:0,fontSize:'1.1rem',fontWeight:800,color:'#fff' }}>{isEditMode?'Edit User':'Add New User'}</h2>
              <button onClick={()=>setIsCreateModalOpen(false)} style={{ background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'#fff',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'14px' }}>
              {formError&&<div style={{ background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'8px',padding:'10px 14px',color:'#dc2626',fontSize:'0.8rem' }}>{formError}</div>}
              {[['name','Full Name','text'],['email','Email Address','email'],['phone','Phone','text'],['erpId','ERP ID','text'],['department','Department','text']].map(([field,label,type])=>(
                <div key={field}><label style={{ display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.04em' }}>{label}</label>
                <input type={type} value={(formData as any)[field]} onChange={e=>setFormData(p=>({...p,[field]:e.target.value}))}
                  style={{ width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',boxSizing:'border-box' }} /></div>
              ))}
              {[['role','Role',['Admin','Manager','Buyer','Finance','Viewer']],['status','Status',['Active','Inactive']]].map(([field,label,opts])=>(
                <div key={field}><label style={{ display:'block',fontSize:'0.75rem',fontWeight:700,color:'#64748b',marginBottom:'5px',textTransform:'uppercase',letterSpacing:'0.04em' }}>{label}</label>
                <select value={(formData as any)[field]} onChange={e=>setFormData(p=>({...p,[field]:e.target.value}))}
                  style={{ width:'100%',padding:'10px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'0.875rem',outline:'none',background:'#fff' }}>
                  {(opts as string[]).map((o:string)=><option key={o}>{o}</option>)}
                </select></div>
              ))}
              <div style={{ display:'flex',gap:'10px',marginTop:'4px' }}>
                <button onClick={()=>setIsCreateModalOpen(false)} style={{ flex:1,padding:'11px',border:'1px solid #e2e8f0',borderRadius:'10px',background:'#fff',color:'#475569',fontWeight:600,fontSize:'0.875rem',cursor:'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ flex:2,padding:'11px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'0.875rem',cursor:'pointer' }}>
                  {isEditMode?'Save Changes':'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
