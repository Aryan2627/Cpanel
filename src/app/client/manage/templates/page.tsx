'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileCode2, Plus, Search, X, FileText, Play, Trash2, Copy, LayoutTemplate, CheckCircle2, Clock } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/templates'); const d = await r.json();
        setTemplates(Array.isArray(d)?d:[]);
      } catch { setTemplates([]); } finally { setLoading(false); }
    }; load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    setTemplates(prev=>prev.filter(t=>t.id!==id));
  };

  const types = ['All','RFQ','Technical','Auction'];
  const filtered = templates.filter(t => {
    const matchType = filterType==='All'||t.type===filterType;
    const matchQ = !searchQuery||(t.name||'').toLowerCase().includes(searchQuery.toLowerCase());
    return matchType&&matchQ;
  });

  const kpis = [
    { label:'Total Templates', value:templates.length, icon:LayoutTemplate, color:'#2563eb', bg:'#eff6ff' },
    { label:'RFQ Templates', value:templates.filter(t=>t.type==='RFQ').length, icon:FileText, color:'#16a34a', bg:'#dcfce7' },
    { label:'Technical', value:templates.filter(t=>t.type==='Technical').length, icon:CheckCircle2, color:'#7c3aed', bg:'#faf5ff' },
    { label:'Auction', value:templates.filter(t=>t.type==='Auction').length, icon:Clock, color:'#d97706', bg:'#fef3c7' },
  ];

  const typeStyle = (t: string): React.CSSProperties => {
    if (t==='RFQ') return { background:'#dcfce7',color:'#15803d',border:'1px solid #86efac' };
    if (t==='Technical') return { background:'#faf5ff',color:'#7c3aed',border:'1px solid #c4b5fd' };
    if (t==='Auction') return { background:'#fef3c7',color:'#b45309',border:'1px solid #fde68a' };
    return { background:'#f1f5f9',color:'#475569',border:'1px solid #cbd5e1' };
  };

  return (
    <div style={{ backgroundColor:'#f0f4f8',minHeight:'100%',fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)',padding:'28px 32px 40px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px' }}><FileCode2 size={18} color="rgba(255,255,255,0.55)" /><p style={{ color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Master Data</p></div>
            <h1 style={{ color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px' }}>Event Templates</h1>
            <p style={{ color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem' }}>Build and manage RFQ, Technical, and Auction templates.</p>
          </div>
          <Link href="/client/manage/templates/create" style={{ display:'flex',alignItems:'center',gap:'7px',padding:'10px 20px',background:'#2563eb',border:'none',borderRadius:'10px',color:'#fff',fontWeight:700,fontSize:'0.875rem',textDecoration:'none',boxShadow:'0 4px 14px rgba(37,99,235,0.35)' }}><Plus size={17} /> New Template</Link>
        </div>
      </div>

      <div style={{ padding:'0 32px 40px',marginTop:'-24px',position:'relative',zIndex:10 }}>
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

        <div style={{ backgroundColor:'#fff',borderRadius:'16px',border:'1px solid #e2e8f0',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',overflow:'hidden' }}>
          <div style={{ padding:'0 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'4px',background:'#fafbfc' }}>
            {types.map(t=>(
              <button key={t} onClick={()=>setFilterType(t)} style={{ padding:'14px 14px',border:'none',borderBottom:filterType===t?'2px solid #1e3a8a':'2px solid transparent',background:'transparent',cursor:'pointer',fontSize:'0.8rem',fontWeight:filterType===t?700:500,color:filterType===t?'#1e3a8a':'#64748b',transition:'all 0.15s',display:'flex',alignItems:'center',gap:'6px' }}>
                {t} <span style={{ padding:'1px 6px',borderRadius:'10px',fontSize:'0.68rem',fontWeight:700,background:filterType===t?'#0d1f4f':'#f1f5f9',color:filterType===t?'#fff':'#94a3b8' }}>
                  {t==='All'?templates.length:templates.filter(x=>x.type===t).length}
                </span>
              </button>
            ))}
            <div style={{ flex:1 }} />
            <div style={{ display:'flex',alignItems:'center',gap:'7px',padding:'0 12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',margin:'8px 0' }}>
              <Search size={14} color="#94a3b8" />
              <input type="text" placeholder="Search templates..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ border:'none',outline:'none',background:'transparent',fontSize:'0.82rem',color:'#0f172a',padding:'8px 0',width:'180px' }} />
              {searchQuery&&<button onClick={()=>setSearchQuery('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:0 }}><X size={13} /></button>}
            </div>
          </div>

          {loading ? <div style={{ padding:'60px',textAlign:'center',color:'#94a3b8' }}>Loading templates...</div> : (
          filtered.length>0 ? (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'16px',padding:'20px' }}>
              {filtered.map(t => {
                let fieldCount = 0;
                try { fieldCount = JSON.parse(t.fields||'[]').length; } catch {}
                return (
                  <div key={t.id} style={{ borderRadius:'14px',border:'1px solid #e2e8f0',background:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',overflow:'hidden',transition:'all 0.2s' }}
                    onMouseOver={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 20px rgba(0,0,0,0.08)';(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                    onMouseOut={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';(e.currentTarget as HTMLElement).style.transform='translateY(0)';}}>
                    <div style={{ background:'linear-gradient(135deg,#0d1f4f,#1a2f6b)',padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                      <div style={{ width:'38px',height:'38px',borderRadius:'10px',background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}><FileCode2 size={20} color="#fff" /></div>
                      <span style={{ padding:'4px 10px',borderRadius:'20px',fontSize:'0.7rem',fontWeight:700,...typeStyle(t.type) }}>{t.type||'General'}</span>
                    </div>
                    <div style={{ padding:'16px 18px' }}>
                      <h3 style={{ margin:'0 0 6px',fontSize:'1rem',fontWeight:800,color:'#0f172a' }}>{t.name}</h3>
                      <p style={{ margin:'0 0 14px',color:'#64748b',fontSize:'0.8rem',lineHeight:1.5 }}>{t.description||'No description provided.'}</p>
                      <div style={{ display:'flex',gap:'8px',alignItems:'center',fontSize:'0.72rem',color:'#94a3b8',marginBottom:'14px' }}>
                        <span style={{ background:'#f1f5f9',padding:'2px 8px',borderRadius:'5px',fontWeight:600,color:'#475569' }}>{fieldCount} fields</span>
                        <span>·</span><span>{t.createdAt?new Date(t.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</span>
                      </div>
                      <div style={{ display:'flex',gap:'8px' }}>
                        <Link href={`/client/manage/templates/${t.id}`} style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',padding:'8px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'8px',color:'#2563eb',fontWeight:700,fontSize:'0.78rem',textDecoration:'none' }}><Play size={13} /> Use</Link>
                        <Link href={`/client/manage/templates/${t.id}`} style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',padding:'8px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',color:'#475569',fontWeight:600,fontSize:'0.78rem',textDecoration:'none' }}><FileText size={13} /> Edit</Link>
                        <button onClick={()=>handleDelete(t.id)} style={{ padding:'8px 10px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'8px',cursor:'pointer',color:'#dc2626',display:'flex',alignItems:'center' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding:'64px',textAlign:'center' }}>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
                <div style={{ width:'56px',height:'56px',borderRadius:'16px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center' }}><FileCode2 size={28} color="#cbd5e1" /></div>
                <div style={{ fontWeight:700,color:'#0f172a',fontSize:'1rem' }}>No templates found</div>
                <div style={{ color:'#64748b',fontSize:'0.875rem' }}>Create your first template to get started.</div>
                <Link href="/client/manage/templates/create" style={{ display:'inline-flex',alignItems:'center',gap:'6px',marginTop:'8px',padding:'10px 20px',background:'#0d1f4f',color:'#fff',borderRadius:'9px',textDecoration:'none',fontWeight:700,fontSize:'0.875rem' }}><Plus size={16} /> New Template</Link>
              </div>
            </div>
          ))}
          {filtered.length>0&&<div style={{ padding:'12px 20px',borderTop:'1px solid #f1f5f9',background:'#fafbfc',fontSize:'0.8rem',color:'#64748b' }}><strong style={{ color:'#0f172a' }}>{filtered.length}</strong> of <strong style={{ color:'#0f172a' }}>{templates.length}</strong> templates</div>}
        </div>
      </div>
    </div>
  );
}
