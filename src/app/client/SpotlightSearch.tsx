'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight } from 'lucide-react';

export default function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands = [
    { id: 'dashboard', title: 'Go to Dashboard', icon: '', path: '/client' },
    { id: 'create-event', title: 'Create Single-Stage Event', icon: '', path: '/client/events/create/single-stage' },
    { id: 'intakes', title: 'View Purchase Intakes', icon: '', path: '/client/intake' },
    { id: 'templates', title: 'Manage Templates', icon: '', path: '/client/manage/templates' },
    { id: 'products', title: 'Product Catalog', icon: '', path: '/client/manage/products' },
  ];

  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

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
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex].path);
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
            placeholder="Type a command or search..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '1.2rem', color: '#0f172a' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ padding: '2px 6px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>esc</span> to close
          </div>
        </div>

        <div style={{ padding: '8px', overflowY: 'auto', flex: 1 }}>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div 
                  key={cmd.id}
                  onClick={() => executeCommand(cmd.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.1s',
                    backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                    color: isSelected ? '#ffffff' : '#334155'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', marginRight: '16px' }}>{cmd.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{cmd.title}</span>
                  {isSelected && <ArrowRight size={16} color="#ffffff" />}
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
