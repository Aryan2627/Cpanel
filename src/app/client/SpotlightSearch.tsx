'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight } from 'lucide-react';

export default function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dynamicResults, setDynamicResults] = useState<{id: string, title: string, icon: string, path: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const staticCommands = [
    { id: 'dashboard', title: 'Go to Dashboard', icon: '📊', path: '/client' },
    { id: 'create-event', title: 'Create Single-Stage Event', icon: '⚡', path: '/client/events/create/single-stage' },
    { id: 'intakes', title: 'View Purchase Intakes', icon: '📥', path: '/client/intake' },
    { id: 'templates', title: 'Manage Templates', icon: '📄', path: '/client/manage/templates' },
    { id: 'products', title: 'Product Catalog', icon: '📦', path: '/client/manage/products' },
  ];

  // Debounce API calls for dynamic search
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
          setDynamicResults(data);
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>
      <div 
        style={{ width: '600px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <Search size={20} color="#64748b" style={{ marginRight: '16px' }} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search POs, PRs, Vendors, or Commands..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.2rem', color: '#0f172a' }}
          />
          {isSearching && <span style={{fontSize: '0.8rem', color: '#94a3b8', marginRight: '8px'}}>Searching...</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>esc</span> to close
          </div>
        </div>

        <div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
          {allCommands.length > 0 ? (
            allCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div 
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.1s',
                    backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                    color: isSelected ? '#0f172a' : '#334155'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', marginRight: '16px' }}>{cmd.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{cmd.title}</span>
                  {isSelected && <ArrowRight size={16} color="#64748b" />}
                </div>
              )
            })
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
              No results found for "{query}"
            </div>
          )}
        </div>
        
        <div style={{ padding: '12px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Navigate</span> <span>↑↓</span></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>Select</span> <span style={{ padding: '2px 6px', backgroundColor: '#e2e8f0', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>↵</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6' }}>
            <Command size={14} /> Spotlight
          </div>
        </div>
      </div>
      
      {/* Invisible backdrop click catcher */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }} onClick={() => setIsOpen(false)} />
    </div>
  );
}