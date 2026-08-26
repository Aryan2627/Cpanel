
'use client';
import { useState, useEffect, useRef } from 'react';
import { Search, Send, Paperclip, FileText, IndianRupee, Clock, CheckCircle2, Building2, Package } from 'lucide-react';

type Message = {
  id: string;
  sender: 'me' | 'vendor';
  text: string;
  timestamp: string;
  isFile?: boolean;
  fileName?: string;
};

export default function VendorMessagesPage() {
  const [activeVendor, setActiveVendor] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [vendorBid, setVendorBid] = useState<any>(null);
  const [allBids, setAllBids] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventIdFilter, setEventIdFilter] = useState('');
  const [debouncedEventId, setDebouncedEventId] = useState('');

  // Debounce event filter
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedEventId(eventIdFilter), 500);
    return () => clearTimeout(timer);
  }, [eventIdFilter]);

  // Fetch Event, Vendors, and Bids
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedEventId.trim()) {
        setVendors([]);
        setActiveVendor('');
        setActiveEvent(null);
        setAllBids([]);
        return;
      }

      try {
        const eventRes = await fetch(`/api/events/${debouncedEventId}`);
        if (!eventRes.ok) throw new Error('Event not found');
        const eventData = await eventRes.json();
        setActiveEvent(eventData);

        const vendorsRes = await fetch(`/api/vendors?eventId=${debouncedEventId}`);
        let vendorsData = [];
        if (vendorsRes.ok) {
          vendorsData = await vendorsRes.json();
          setVendors(vendorsData);
        }

        const bidsRes = await fetch(`/api/bids?eventId=${eventData.id}`);
        if (bidsRes.ok) {
           const bidsData = await bidsRes.json();
           setAllBids(bidsData);
        }

        if (vendorsData.length > 0) {
           const initialVendor = vendorsData.find((v:any) => v.name === activeVendor) ? activeVendor : vendorsData[0].name;
           setActiveVendor(initialVendor);
        } else {
           setActiveVendor('');
        }
      } catch(e) {
        console.error("Failed to fetch data", e);
        setVendors([]);
        setActiveEvent(null);
        setAllBids([]);
      }
    };
    fetchData();
  }, [debouncedEventId]);

  // Update Vendor Bid when active vendor changes
  useEffect(() => {
    if (activeVendor && allBids.length > 0) {
      const bid = allBids.find(b => b.vendorName === activeVendor);
      setVendorBid(bid || null);
    } else {
      setVendorBid(null);
    }
  }, [activeVendor, allBids]);

  // Load messages from local storage or set defaults
  useEffect(() => {
    if (!activeVendor) return;
    const loadMessages = () => {
      const saved = localStorage.getItem(`chat_${activeVendor}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch(e) {}
      } else {
        const defaults: Message[] = [
          { id: '1', sender: 'vendor', text: `Hi there! We reviewed your latest RFQ.`, timestamp: '10:00 AM' },
          { id: '2', sender: 'me', text: `Great. Are you able to hit the target price?`, timestamp: '10:15 AM' },
        ];
        setMessages(defaults);
        localStorage.setItem(`chat_${activeVendor}`, JSON.stringify(defaults));
      }
    };
    
    loadMessages();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `chat_${activeVendor}`) loadMessages();
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadMessages, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeVendor]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string = newMessage, isFile = false, fileName?: string) => {
    if (!text.trim() && !isFile) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: text.trim(),
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      
      {/* Left Sidebar: Event Search & Vendor List */}
      <div style={{ width: '320px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0, marginBottom: '16px' }}>Secure Events</h2>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Enter Event ID (e.g. EVT-...)" 
              value={eventIdFilter}
              onChange={(e) => setEventIdFilter(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', color: '#111827', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f1f5f9' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase' }}>Invited Suppliers</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {vendors.map((vendor) => (
            <div 
              key={vendor.id} 
              onClick={() => setActiveVendor(vendor.name)}
              style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: activeVendor === vendor.name ? '#e0e7ff' : 'transparent', borderLeft: activeVendor === vendor.name ? '4px solid #4f46e5' : '4px solid transparent' }}
              onMouseOver={(e) => { if (activeVendor !== vendor.name) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseOut={(e) => { if (activeVendor !== vendor.name) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: activeVendor === vendor.name ? '#4f46e5' : '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1rem', transition: 'background-color 0.2s' }}>
                  {vendor.name.charAt(0)}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: activeVendor === vendor.name ? '#111827' : '#374151', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vendor.name}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {vendor.email}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {debouncedEventId && vendors.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No suppliers found for this event.
            </div>
          )}
        </div>
      </div>

      {activeEvent ? (
        <>
          {/* Middle: Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', position: 'relative' }}>
            {activeVendor ? (
              <>
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
                </div>

                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}
                    >
                      <div style={{ maxWidth: '70%', padding: msg.isFile ? '12px 16px' : '12px 16px', borderRadius: msg.sender === 'me' ? '16px 16px 0 16px' : '16px 16px 16px 0', backgroundColor: msg.sender === 'me' ? '#4f46e5' : '#f3f4f6', color: msg.sender === 'me' ? '#fff' : '#1f2937', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.95rem', lineHeight: '1.5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {msg.isFile && <FileText size={18} />}
                        {msg.text}
                      </div>
                      <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f9fafb', padding: '8px 16px', borderRadius: '24px', border: '1px solid #e5e7eb', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}><Paperclip size={20} /></button>
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message here..."
                      style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '0.95rem', color: '#1f2937' }}
                    />
                    <button 
                      onClick={() => handleSend(newMessage, false)}
                      disabled={!newMessage.trim()}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: newMessage.trim() ? '#4f46e5' : '#e5e7eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'not-allowed' }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: '0 0 12px 0' }}>No Vendor Selected</h3>
                <p style={{ color: '#6b7280', maxWidth: '400px', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>
                  Select a vendor from the list to start messaging.
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Quotation Details */}
          <div style={{ width: '360px', borderLeft: '1px solid #e5e7eb', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#3b82f6" /> Event Details
              </h3>
              <div style={{ marginTop: '12px', fontSize: '0.9rem', color: '#475569' }}>
                <strong>{activeEvent.refId}</strong>: {activeEvent.title}
              </div>
            </div>
            
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee size={16} color="#10b981" /> Quotation Details
              </h4>
              
              {vendorBid ? (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Status</span>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>{vendorBid.status}</span>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>Total Bid Amount</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{vendorBid.currency} {vendorBid.amount.toLocaleString()}</div>
                  </div>
                  
                  {vendorBid.templateData && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginTop: '16px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>Item Breakdown</div>
                      {(() => {
                         try {
                           const items = typeof vendorBid.templateData === 'string' ? JSON.parse(vendorBid.templateData) : vendorBid.templateData;
                           if (Array.isArray(items)) {
                             return items.map((item:any, idx:number) => (
                               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                 <span style={{ color: '#64748b' }}>{item.itemName || item.name || `Item ${idx+1}`}</span>
                                 <span style={{ fontWeight: '500', color: '#0f172a' }}>{item.price || item.total || '-'}</span>
                               </div>
                             ));
                           } else {
                             return Object.keys(items).map(k => (
                               <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                 <span style={{ color: '#64748b' }}>{k}</span>
                                 <span style={{ fontWeight: '500', color: '#0f172a' }}>{items[k]}</span>
                               </div>
                             ));
                           }
                         } catch(e) { return null; }
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px 20px', textAlign: 'center' }}>
                  <Clock size={24} color="#94a3b8" style={{ marginBottom: '12px' }} />
                  <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>No Quotation Submitted</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>This vendor hasn't placed a bid on this event yet.</div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Search size={32} color="#94a3b8" />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: '0 0 12px 0' }}>Search Secure Events</h3>
          <p style={{ color: '#6b7280', maxWidth: '400px', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>
            Please enter an Event ID in the search box on the left to securely message the invited suppliers and review their quotations.
          </p>
        </div>
      )}
    </div>
  );
}
