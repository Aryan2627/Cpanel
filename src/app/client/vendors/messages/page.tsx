'use client';
import { useState, useEffect, useRef } from 'react';

type Message = {
  id: string;
  sender: 'me' | 'vendor';
  text: string;
  timestamp: string;
  isFile?: boolean;
  fileName?: string;
};

export default function VendorMessagesPage() {
  const [activeVendor, setActiveVendor] = useState('Alpha Technologies');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventIdFilter, setEventIdFilter] = useState('');
  const [debouncedEventId, setDebouncedEventId] = useState('');

  // Debounce event filter
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEventId(eventIdFilter), 500);
    return () => clearTimeout(timer);
  }, [eventIdFilter]);

  // Fetch Vendors from Database
  useEffect(() => {
    const fetchVendors = async () => {
      if (!debouncedEventId.trim()) {
        setVendors([]);
        setActiveVendor('');
        return;
      }

      try {
        const url = `/api/vendors?eventId=${debouncedEventId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setVendors(data);
          
          if (data.length > 0) {
            // Auto-select first if current active is not in list
            if (!data.find((v:any) => v.name === activeVendor)) {
              setActiveVendor(data[0].name);
            }
          } else {
             setActiveVendor('');
          }
        }
      } catch(e) {
        console.error("Failed to fetch vendors", e);
      }
    };
    fetchVendors();
  }, [debouncedEventId, activeVendor]);

  // Load messages from local storage or set defaults
  useEffect(() => {
    const loadMessages = () => {
      const saved = localStorage.getItem(`chat_${activeVendor}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch(e) {}
      } else {
        // Default messages for demo
        const defaults: Message[] = [
          { id: '1', sender: 'vendor', text: `Hi there! We reviewed your latest RFQ for the XPS laptops.`, timestamp: '10:00 AM' },
          { id: '2', sender: 'me', text: `Great. Are you able to hit the target price of $1,200 per unit?`, timestamp: '10:15 AM' },
          { id: '3', sender: 'vendor', text: `We can do $1,250 if you increase the volume to 50 units. Otherwise, $1,300 is our floor.`, timestamp: '10:22 AM' }
        ];
        setMessages(defaults);
        localStorage.setItem(`chat_${activeVendor}`, JSON.stringify(defaults));
      }
    };
    
    loadMessages();

    // Listen for storage changes from the vendor tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `chat_${activeVendor}`) loadMessages();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Fallback polling for same-window testing
    const interval = setInterval(loadMessages, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeVendor]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string = newMessage, isFile: boolean = false, fileName?: string) => {
    if (!text.trim() && !isFile) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFile,
      fileName
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setNewMessage('');
    localStorage.setItem(`chat_${activeVendor}`, JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSend(`Sent document: ${file.name}`, true, file.name);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      
      {/* Left Sidebar: Vendor List */}
      <div id="tour-vendor-list" style={{ width: '320px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>Messages</h2>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af', fontSize: '0.9rem' }}>️</span>
              <input 
                type="text" 
                placeholder="Filter by Event ID (e.g. EVT-1004)" 
                value={eventIdFilter}
                onChange={(e) => setEventIdFilter(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: '600' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#9ca3af', fontSize: '0.9rem' }}></span>
              <input 
                type="text" 
                placeholder="Search vendors..." 
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {vendors.map((vendor) => (
            <div 
              key={vendor.name}
              onClick={() => setActiveVendor(vendor.name)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px',
                backgroundColor: activeVendor === vendor.name ? '#e0e7ff' : 'transparent',
                cursor: 'pointer', transition: 'background-color 0.2s', marginBottom: '4px'
              }}
              onMouseOver={(e) => { if (activeVendor !== vendor.name) e.currentTarget.style.backgroundColor = '#f1f5f9' }}
              onMouseOut={(e) => { if (activeVendor !== vendor.name) e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: '700', fontSize: '1.1rem' }}>
                  {vendor.name.charAt(0)}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #fff',
                  backgroundColor: vendor.status === 'Online' ? '#10b981' : vendor.status === 'Away' ? '#f59e0b' : '#9ca3af'
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: activeVendor === vendor.name ? '700' : '600', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {vendor.name}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {vendor.status || 'Active'}
                  </p>
                  {vendor.liveEventId && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #fde68a' }}>
                       Live: {vendor.liveEventId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', position: 'relative' }}>
        
        {activeVendor ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: '700', fontSize: '1.25rem' }}>
                    {activeVendor.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>{activeVendor}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Active Now</span>
                    </div>
                  </div>
              </div>
              <button style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
                View Profile
              </button>
            </div>

        {/* Chat Messages */}
        <div id="tour-chat-area" style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                animation: 'slideUp 0.3s ease-out forwards'
              }}
            >
              <div style={{ 
                maxWidth: '70%', 
                padding: '12px 16px', 
                borderRadius: '16px', 
                backgroundColor: msg.sender === 'me' ? '#3b82f6' : '#fff',
                color: msg.sender === 'me' ? '#fff' : '#1f2937',
                border: msg.sender === 'me' ? 'none' : '1px solid #e5e7eb',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderBottomRightRadius: msg.sender === 'me' ? '4px' : '16px',
                borderBottomLeftRadius: msg.sender === 'vendor' ? '4px' : '16px',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {msg.isFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '1.5rem' }}></div>
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
                {msg.sender === 'me' && <span style={{ color: '#3b82f6' }}></span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div id="tour-chat-input" style={{ padding: '24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f9fafb', padding: '8px 16px', borderRadius: '24px', border: '1px solid #e5e7eb', transition: 'border-color 0.2s, box-shadow 0.2s' }} id="chat-input-wrapper">
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#9ca3af', cursor: 'pointer', padding: '4px' }} title="Attach File"></button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onFocus={() => { document.getElementById('chat-input-wrapper')!.style.borderColor = '#3b82f6'; document.getElementById('chat-input-wrapper')!.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
              onBlur={() => { document.getElementById('chat-input-wrapper')!.style.borderColor = '#e5e7eb'; document.getElementById('chat-input-wrapper')!.style.boxShadow = 'none'; }}
              placeholder="Type your message here..."
              style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.95rem', color: '#1f2937' }}
            />
            <button 
              onClick={() => handleSend(newMessage, false)}
              disabled={!newMessage.trim()}
              style={{ 
                width: '36px', height: '36px', borderRadius: '50%', border: 'none', 
                background: newMessage.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' : '#e5e7eb', 
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: newMessage.trim() ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none'
              }}
              onMouseOver={(e) => { if (newMessage.trim()) e.currentTarget.style.transform = 'scale(1.05)' }}
              onMouseOut={(e) => { if (newMessage.trim()) e.currentTarget.style.transform = 'scale(1)' }}
            >
              
            </button>
          </div>
        </div>
        </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '2.5rem' }}></span>
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: '0 0 12px 0' }}>No Event Selected</h3>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '400px', lineHeight: '1.6' }}>
              Please enter an Event ID in the filter box on the left to securely message the vendors participating in that event.
            </p>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
