'use client';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, X, Package, Tag, Layers, BarChart3, ArrowUpDown, Upload, Eye } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key:string;direction:'asc'|'desc'}|null>(null);

  useEffect(() => {
    fetch('/api/products').then(r=>r.json()).then(d=>{ setProducts(Array.isArray(d)?d:[]); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p=>p.category||'Uncategorised').filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    let d = [...products];
    if (filterCategory!=='All') d=d.filter(p=>(p.category||'Uncategorised')===filterCategory);
    if (searchQuery){const q=searchQuery.toLowerCase();d=d.filter(p=>(p.code||'').toLowerCase().includes(q)||(p.name||'').toLowerCase().includes(q)||(p.category||'').toLowerCase().includes(q));}
    if (sortConfig) d.sort((a,b)=>{const av=(a as any)[sortConfig.key]||'';const bv=(b as any)[sortConfig.key]||'';return sortConfig.direction==='asc'?(av>bv?1:-1):(av<bv?1:-1);});
    return d;
  }, [products, filterCategory, searchQuery, sortConfig]);

  const kpis = [
    { label:'Total Products', value:products.length, icon:Package, color:'#2563eb', bg:'#eff6ff' },
    { label:'Categories', value:categories.length-1, icon:Tag, color:'#7c3aed', bg:'#faf5ff' },
    { label:'Active', value:products.filter(p=>p.status!=='Inactive').length, icon:BarChart3, color:'#16a34a', bg:'#dcfce7' },
    { label:'Bulk Upload', value:'XLSX', icon:Layers, color:'#d97706', bg:'#fef3c7' },
  ];

  return (
    <div style={{ backgroundColor:'#f0f4f8',minHeight:'100%',fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'linear-gradient(135deg,#071330 0%,#0d1f4f 55%,#1a2f6b 100%)',padding:'28px 32px 40px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:0,right:0,width:'400px',height:'100%',background:'radial-gradient(circle at 70% 50%,rgba(59,130,246,0.12),transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'relative',zIndex:1,display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px' }}><Package size={18} color="rgba(255,255,255,0.55)" /><p style={{ color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',margin:0 }}>Master Data</p></div>
            <h1 style={{ color:'#fff',fontSize:'1.8rem',fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.5px' }}>Products</h1>
            <p style={{ color:'rgba(255,255,255,0.5)',margin:0,fontSize:'0.9rem' }}>Manage your product catalog and item master.</p>
          </div>
          <div style={{ display:'flex',gap:'10px' }}>
            <button onClick={()=>setShowBulkModal(true)} style={{ display:'flex',alignItems:'center',gap:'7px',padding:'10px 16px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'10px',color:'#fff',fontWeight:600,fontSize:'0.82rem',cursor:'pointer' }}><Upload size={15} /> Bulk Upload</button>
            <Link href="/client/manage/products/create" style={{ display:'flex',alignItems:'center',gap:'7px',padding:'10px 20px',background:'#2563eb',border:'none',borderRadius:'10px',color:'#fff',fontWeight:700,fontSize:'0.875rem',textDecoration:'none',boxShadow:'0 4px 14px rgba(37,99,235,0.35)' }}><Plus size={17} /> Add Product</Link>
          </div>
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
          <div style={{ padding:'0 20px',borderBottom:'1px solid #f1f5f9',display:'flex',alignItems:'center',gap:'4px',background:'#fafbfc',flexWrap:'wrap' }}>
            {categories.slice(0,6).map(c=>(
              <button key={c} onClick={()=>setFilterCategory(c)} style={{ padding:'14px 12px',border:'none',borderBottom:filterCategory===c?'2px solid #1e3a8a':'2px solid transparent',background:'transparent',cursor:'pointer',fontSize:'0.78rem',fontWeight:filterCategory===c?700:500,color:filterCategory===c?'#1e3a8a':'#64748b',transition:'all 0.15s',whiteSpace:'nowrap' }}>{c}</button>
            ))}
            <div style={{ flex:1 }} />
            <div style={{ display:'flex',alignItems:'center',gap:'7px',padding:'0 12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',margin:'8px 0' }}>
              <Search size={14} color="#94a3b8" />
              <input type="text" placeholder="Search code, name, category..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ border:'none',outline:'none',background:'transparent',fontSize:'0.82rem',color:'#0f172a',padding:'8px 0',width:'200px' }} />
              {searchQuery&&<button onClick={()=>setSearchQuery('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:0 }}><X size={13} /></button>}
            </div>
          </div>

          {loading ? <div style={{ padding:'60px',textAlign:'center',color:'#94a3b8' }}>Loading products...</div> : (
          <table style={{ width:'100%',borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'linear-gradient(90deg,#0d1f4f,#1a2f6b)' }}>
                <th style={{ padding:'13px 16px',width:'44px' }}><input type="checkbox" checked={selectedIds.size===filtered.length&&filtered.length>0} onChange={e=>setSelectedIds(e.target.checked?new Set(filtered.map(p=>p.id)):new Set())} style={{ accentColor:'#2563eb',cursor:'pointer' }} /></th>
                {[['code','Code'],['name','Name'],['category','Category'],['unitPrice','Unit Price'],['uom','UOM'],['stock','Stock']].map(([k,l])=>(
                  <th key={k} onClick={()=>setSortConfig(prev=>prev?.key===k?{key:k,direction:prev.direction==='asc'?'desc':'asc'}:{key:k,direction:'asc'})}
                    style={{ padding:'13px 16px',textAlign:'left',color:'rgba(255,255,255,0.75)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',cursor:'pointer',whiteSpace:'nowrap' }}>
                    <span style={{ display:'flex',alignItems:'center',gap:'5px' }}>{l} <ArrowUpDown size={10} color="rgba(255,255,255,0.3)" /></span>
                  </th>
                ))}
                <th style={{ padding:'13px 16px',color:'rgba(255,255,255,0.75)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length>0 ? filtered.map((p,idx)=>{
                const isSel=selectedIds.has(p.id);
                return (
                  <tr key={p.id} style={{ borderBottom:'1px solid #f1f5f9',background:isSel?'#eff6ff':idx%2===0?'#fff':'#fafbfc',borderLeft:isSel?'3px solid #2563eb':'3px solid transparent',transition:'all 0.12s' }}
                    onMouseOver={e=>{if(!isSel){(e.currentTarget as HTMLElement).style.background='#f8fafc';(e.currentTarget as HTMLElement).style.borderLeft='3px solid #3b82f6';}}}
                    onMouseOut={e=>{if(!isSel){(e.currentTarget as HTMLElement).style.background=idx%2===0?'#fff':'#fafbfc';(e.currentTarget as HTMLElement).style.borderLeft='3px solid transparent';}}}>
                    <td style={{ padding:'13px 16px' }}><input type="checkbox" checked={isSel} onChange={()=>{const s=new Set(selectedIds);isSel?s.delete(p.id):s.add(p.id);setSelectedIds(s);}} style={{ accentColor:'#2563eb',cursor:'pointer' }} /></td>
                    <td style={{ padding:'13px 16px' }}><span style={{ background:'#eff6ff',color:'#1d4ed8',padding:'3px 8px',borderRadius:'5px',fontFamily:'monospace',fontSize:'0.72rem',fontWeight:700 }}>{p.code||'—'}</span></td>
                    <td style={{ padding:'13px 16px',fontWeight:700,color:'#1e3a8a',fontSize:'0.875rem' }}>{p.name}</td>
                    <td style={{ padding:'13px 16px' }}><span style={{ background:'#f1f5f9',color:'#475569',padding:'3px 9px',borderRadius:'6px',fontSize:'0.75rem',fontWeight:600 }}>{p.category||'—'}</span></td>
                    <td style={{ padding:'13px 16px',fontWeight:700,color:'#16a34a',fontSize:'0.875rem' }}>{p.unitPrice?`₹${Number(p.unitPrice).toLocaleString('en-IN')}`:'—'}</td>
                    <td style={{ padding:'13px 16px',color:'#64748b',fontSize:'0.82rem' }}>{p.uom||'EA'}</td>
                    <td style={{ padding:'13px 16px',fontWeight:600,color:'#0f172a' }}>{p.stock??'—'}</td>
                    <td style={{ padding:'13px 16px' }}>
                      <div style={{ display:'flex',gap:'6px' }}>
                        <Link href={`/client/manage/products/edit/${p.id}`} style={{ display:'flex',alignItems:'center',gap:'4px',padding:'5px 10px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'7px',color:'#2563eb',fontWeight:700,fontSize:'0.72rem',textDecoration:'none' }}><Eye size={12} /> View</Link>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={8} style={{ padding:'64px',textAlign:'center' }}>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'12px' }}>
                    <div style={{ width:'56px',height:'56px',borderRadius:'16px',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={28} color="#cbd5e1" /></div>
                    <div style={{ fontWeight:700,color:'#0f172a' }}>No products found</div>
                    <Link href="/client/manage/products/create" style={{ display:'inline-flex',alignItems:'center',gap:'6px',padding:'10px 20px',background:'#0d1f4f',color:'#fff',borderRadius:'9px',textDecoration:'none',fontWeight:700,fontSize:'0.875rem' }}><Plus size={16} /> Add Product</Link>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          )}
          {filtered.length>0&&(
            <div style={{ padding:'12px 20px',borderTop:'1px solid #f1f5f9',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#fafbfc' }}>
              <div style={{ fontSize:'0.8rem',color:'#64748b' }}>Showing <strong style={{ color:'#0f172a' }}>{filtered.length}</strong> of <strong style={{ color:'#0f172a' }}>{products.length}</strong> products{selectedIds.size>0&&<span style={{ marginLeft:'12px',color:'#2563eb',fontWeight:600 }}>· {selectedIds.size} selected</span>}</div>
            </div>
          )}
        </div>
      </div>

      {showBulkModal&&(
        <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.55)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center' }} onClick={()=>setShowBulkModal(false)}>
          <div style={{ background:'#fff',borderRadius:'20px',width:'440px',maxWidth:'92vw',boxShadow:'0 30px 60px rgba(0,0,0,0.2)',overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ background:'linear-gradient(135deg,#071330,#0d1f4f)',padding:'22px 24px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <h2 style={{ margin:0,fontSize:'1.1rem',fontWeight:800,color:'#fff' }}>Bulk Upload Products</h2>
              <button onClick={()=>setShowBulkModal(false)} style={{ background:'rgba(255,255,255,0.1)',border:'none',cursor:'pointer',color:'#fff',width:'32px',height:'32px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'12px' }}>
              <p style={{ color:'#64748b',fontSize:'0.875rem',margin:0,lineHeight:1.6 }}>Upload an Excel file with columns: Code, Name, Category, Unit Price, UOM, Stock.</p>
              <div style={{ border:'2px dashed #e2e8f0',borderRadius:'12px',padding:'32px',textAlign:'center',background:'#f8fafc' }}>
                <Upload size={32} color="#cbd5e1" style={{ marginBottom:'12px' }} />
                <div style={{ fontWeight:600,color:'#64748b',fontSize:'0.875rem' }}>Drag & drop or click to upload</div>
                <div style={{ color:'#94a3b8',fontSize:'0.75rem',marginTop:'4px' }}>.xlsx, .csv accepted</div>
              </div>
              <button onClick={()=>setShowBulkModal(false)} style={{ padding:'11px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:'10px',fontWeight:700,fontSize:'0.875rem',cursor:'pointer' }}>Upload File</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
