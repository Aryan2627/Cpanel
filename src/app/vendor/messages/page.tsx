'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Message = {
  id: string;
  sender: 'me' | 'vendor'; // From the DB perspective: 'me' is the buyer, 'vendor' is the vendor.
  text: string;
  timestamp: string;
  isFile?: boolean;
  fileName?: string;
};

export default function VendorMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcode current vendor identity for the prototype
  const VENDOR_NAME = 'Alpha Technologies';
  const CHAT_KEY = `chat_${VENDOR_NAME}`;

  // Load and sync messages
  useEffect(() => {
    const loadMessages = () => {
      const saved = localStorage.getItem(CHAT_KEY);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch(e) {}
      }
    };
    
    loadMessages();

    // Listen for storage changes from the buyer tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CHAT_KEY) loadMessages();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Fallback polling for same-window testing (since 'storage' event only fires across different tabs)
    const interval = setInterval(loadMessages, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string = newMessage, isFile: boolean = false, fileName?: string) => {
    if (!text.trim() && !isFile) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'vendor', // Send as 'vendor' so the buyer sees it on the left
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFile,
      fileName
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setNewMessage('');
    localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSend(`Sent document: ${file.name}`, true, file.name);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Vendor Portal</div>
        <ul className="sidebar-nav">
          <li><Link href="/vendor">Dashboard</Link></li>
          <li><Link href="/vendor/events">Active RFQs / Events</Link></li>
          <li><Link href="#">My Bids</Link></li>
          <li><Link href="#">Purchase Orders</Link></li>
          <li><Link href="/vendor/contracts">Contracts</Link></li>
          <li><Link href="/vendor/messages" className="active">Messages</Link></li>
          <li><Link href="#">Profile Settings</Link></li>
        </ul>
        <div style={{ padding: '24px' }}>
          <Link href="/" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: 0 }}>
        
        {/* Chat Header */}
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937', fontWeight: '700', fontSize: '1.25rem' }}>
                🏢
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Procurement Team</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Buyer Online</span>
                </div>
              </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: '#f8fafc' }}>
          {messages.map((msg) => {
            // Reverse logic: 'vendor' is me (blue/right), 'me' (buyer) is them (grey/left)
            const isMyMsg = msg.sender === 'vendor';
            
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: isMyMsg ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ 
                  maxWidth: '70%', 
                  padding: '12px 16px', 
                  borderRadius: '16px', 
                  backgroundColor: isMyMsg ? '#10b981' : '#fff', // Vendor side uses Green instead of Blue!
                  color: isMyMsg ? '#fff' : '#1f2937',
                  border: isMyMsg ? 'none' : '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderBottomRightRadius: isMyMsg ? '4px' : '16px',
                  borderBottomLeftRadius: !isMyMsg ? '4px' : '16px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  {msg.isFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '1.5rem' }}>📄</div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{msg.fileName}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Document attached</div>
                      </div>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {msg.timestamp}
                  {isMyMsg && <span style={{ color: '#10b981' }}>✓✓</span>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f9fafb', padding: '8px 16px', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Attach File">📎</button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message to the buyer..."
              style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.95rem', color: '#1f2937' }}
            />
            <button 
              onClick={() => handleSend(newMessage, false)}
              disabled={!newMessage.trim()}
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', border: 'none', 
                background: newMessage.trim() ? '#10b981' : '#e5e7eb', 
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              ➤
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
