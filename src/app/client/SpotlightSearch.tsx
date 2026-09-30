'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight, LayoutDashboard, PlusCircle, Inbox, FileCode2, Package, Sparkles } from 'lucide-react';

export default function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicResults, setDynamicResults] = useState<{id: string, title: string, icon: string, path: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const staticCommands = [
    { id: 'dashboard', title: 'Go to Dashboard', icon: <LayoutDashboard size={18}/>, path: '/client' },
    { id: 'dorc-ai', title: 'Chat with Dorc AI', icon: <Sparkles size={18}/>, path: '/client/cortex' },
    { id: 'create-event', title: 'Create Single-Stage Event', icon: <PlusCircle size={18}/>, path: '/client/events/create/single-stage' },
    { id: 'intakes', title: 'View Purchase Intakes', icon: <Inbox size={18}/>, path: '/client/intake' },
    { id: 'templates', title: 'Manage Templates', icon: <FileCode2 size={18}/>, path: '/client/manage/templates' },
    { id: 'products', title: 'Product Catalog', icon: <Package size={18}/>, path: '/client/manage/products' },
  ];

  useEffect(() => {
    if (query.trim().length < 2) {
      setDynamicResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=` + encodeURIComponent(query));
        if (res.ok) {
          const data = await res.json();
          // Convert string icons to lucide generic if needed, but for now we just wrap the string
          const mapped = data.map((d: any) => ({
            ...d,
            icon: <span style={{ fontSize: '1rem' }}>{d.icon}</span>
          }));
          setDynamicResults(mapped);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const filteredStatic = staticCommands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
  const allCommands = [...filteredStatic, ...dynamicResults];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      setDynamicResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, dynamicResults]);

  const executeCommand = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allCommands.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allCommands[selectedIndex]) {
        executeCommand(allCommands[selectedIndex].path);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 100000, display: 'flex', justifyContent: 'center', paddingTop: '12vh' }}>
      <div 
        style={{ 
          width: '640px', 
          backgroundColor: '#ffffff', 
          backdropFilter: 'blur(20px)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column', 
          maxHeight: '70vh' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <Search size={22} color="#64748b" style={{ marginRight: '16px' }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search assets, workflows, or jump to Dorc AI..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.25rem', color: '#0f172a', backgroundColor: 'transparent', fontWeight: 500 }}
          />
          {isSearching && <span style={{fontSize: '0.8rem', color: '#64748b', marginRight: '12px', animation: 'pulse 1.5s infinite'}}>Searching...</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>
            <span style={{ padding: '4px 8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px' }}>ESC</span>
          </div>
        </div>

        <div style={{ padding: '12px', overflowY: 'auto', flex: 1 }}>
          {allCommands.length > 0 ? (
            allCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div 
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s ease',
                    backgroundColor: isSelected ? '#f8faff' : 'transparent',
                    border: isSelected ? '1px solid #e5edff' : '1px solid transparent',
                    color: isSelected ? '#0f172a' : '#475569'
                  }}
                >
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: isSelected ? '#e5edff' : '#f1f5f9', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px',
                    color: isSelected ? '#0f172a' : '#64748b'
                  }}>
                    {cmd.icon}
                  </div>
                  <span style={{ flex: 1, fontWeight: isSelected ? 600 : 500, fontSize: '0.95rem' }}>{cmd.title}</span>
                  {isSelected && <ArrowRight size={18} color="#0f172a" />}
                </div>
              )
            })
          ) : (
            <div style={{ padding: '48px 32px', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Command size={48} color="#f1f5f9" />
              <div style={{ fontSize: '1rem', fontWeight: 500 }}>No results found for "{query}"</div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>Try searching for "events", "vendors", or "dashboard"</div>
            </div>
          )}
        </div>
        
        <div style={{ padding: '14px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>Navigate</span> <span style={{display: 'flex', gap: '2px'}}><ArrowRight size={12} style={{transform: 'rotate(90deg)'}}/><ArrowRight size={12} style={{transform: 'rotate(-90deg)'}}/></span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span>Select</span> <span style={{ padding: '2px 6px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#475569' }}>↵</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.5px' }}>
            <Command size={14} /> PROCGEN COMMAND
          </div>
        </div>
      </div>
      
      {/* Invisible backdrop click catcher */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} onClick={() => setIsOpen(false)} />
    </div>
  );
}