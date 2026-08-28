const fs = require('fs');
let code = fs.readFileSync('src/app/client/ai-agents/page.tsx', 'utf8');

// Replace the hardcoded timers useEffect
const oldEffect = `  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => {
      setAnalyzing(true);
      setLogs(prev => [...prev, "> INITIALIZING STRATEGY ENGINE..."]);
    }, 1500));

    timers.push(setTimeout(() => {
      setLogs(prev => [...prev, "> ANALYZING VENDOR MARGIN HISTORY..."]);
    }, 2500));

    timers.push(setTimeout(() => {
      setLogs(prev => [...prev, "> CROSS-REFERENCING Q3 INDICES: -4.2% MoM"]);
    }, 3500));

    timers.push(setTimeout(() => {
      setLogs(prev => [...prev, "> MATCH FOUND: 8.5% DISCOUNT PROBABILITY WITH NET-15."]);
    }, 4500));

    timers.push(setTimeout(() => {
      setAnalyzing(false);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Based on current market indices, our max threshold is $41,175. However, if you can meet this price, we are authorized to upgrade payment terms to Net-15 to improve your cash flow. Can we close this today?", 
        time: '10:43:12 AM' 
      }]);
      setVendorTyping(true);
    }, 6000));

    timers.push(setTimeout(() => {
      setVendorTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'vendor', 
        text: "Let me check with my director...", 
        time: '10:45:30 AM' 
      }]);
      setVendorTyping(true);
    }, 9000));
    
    timers.push(setTimeout(() => {
      setVendorTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'vendor', 
        text: "Okay, with the Net-15 payment terms, we can accept $41,175. I will generate the contract now.", 
        time: '10:48:05 AM' 
      }]);
      setClosed(true);
    }, 13000));

    return () => timers.forEach(clearTimeout);
  }, []);`;

const newLogic = `
  const [inputText, setInputText] = useState("");
  const [started, setStarted] = useState(false);

  // Trigger the AI to respond to the very first vendor message on load
  useEffect(() => {
    if (!started && messages.length === 1) {
      setStarted(true);
      handleAgentTurn(messages);
    }
  }, [messages, started]);

  const handleAgentTurn = async (currentMessages: any[]) => {
    setAnalyzing(true);
    setLogs(["> INITIALIZING STRATEGY ENGINE...", "> ANALYZING VENDOR MARGIN HISTORY...", "> EXECUTING LLM INFERENCE..."]);
    
    try {
      const apiMessages = currentMessages.map(m => ({
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text
      }));
      
      const res = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      
      const data = await res.json();
      
      if (data.reply) {
        let replyText = data.reply;
        let isClosed = false;
        
        if (replyText.includes("CONTRACT SECURED")) {
          isClosed = true;
          replyText = replyText.replace("CONTRACT SECURED", "").trim();
        }
        
        setMessages(prev => [...prev, { sender: 'ai', text: replyText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
        if (isClosed) setClosed(true);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: "Error connecting to AI.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    }
    setAnalyzing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || analyzing || closed) return;
    
    const newMsg = { sender: 'vendor', text: inputText, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText("");
    
    handleAgentTurn(updatedMessages);
  };
`;

code = code.replace(oldEffect, newLogic);

// Add the chat input UI
const oldFooter = `          {/* Footer Controls */}
          <div style={{ padding: '20px', background: '#020617', borderTop: '1px solid #1e293b', zIndex: 10 }}>
             {closed ? (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <CheckCircle2 size={20} color="var(--success-color)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: 'var(--success-color)', fontSize: '14px', letterSpacing: '0.05em', margin: 0 }}>CONTRACT SECURED</p>
                      <p style={{ color: 'rgba(16,185,129,0.7)', fontSize: '12px', fontFamily: 'monospace', margin: '4px 0 0 0' }}>Total Savings: $3,825.00</p>
                    </div>
                  </div>
                  <button style={{ background: 'var(--success-color)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}>
                    Review PO
                  </button>
                </div>
             ) : (
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px', fontSize: '13px', color: 'rgba(245,158,11,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  <AlertCircle size={16} />
                  AUTONOMOUS OVERRIDE: Manual input disabled during active negotiation block.
                </div>
             )}
          </div>`;

const newFooter = `          {/* Footer Controls */}
          <div style={{ padding: '20px', background: '#020617', borderTop: '1px solid #1e293b', zIndex: 10 }}>
             {closed ? (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'rgba(16,185,129,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                      <CheckCircle2 size={20} color="var(--success-color)" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 'bold', color: 'var(--success-color)', fontSize: '14px', letterSpacing: '0.05em', margin: 0 }}>CONTRACT SECURED</p>
                      <p style={{ color: 'rgba(16,185,129,0.7)', fontSize: '12px', fontFamily: 'monospace', margin: '4px 0 0 0' }}>Autonomously locked via NVIDIA Nemotron.</p>
                    </div>
                  </div>
                  <button style={{ background: 'var(--success-color)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }}>
                    Review PO
                  </button>
                </div>
             ) : (
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type as the Vendor..." 
                    disabled={analyzing}
                    style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px 16px', borderRadius: '8px', outline: 'none' }}
                  />
                  <button type="submit" disabled={analyzing} style={{ background: analyzing ? '#334155' : 'var(--accent-color)', color: '#fff', border: 'none', padding: '0 24px', borderRadius: '8px', fontWeight: 'bold', cursor: analyzing ? 'not-allowed' : 'pointer' }}>
                    {analyzing ? 'AI Thinking...' : 'Send'}
                  </button>
                </form>
             )}
          </div>`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/app/client/ai-agents/page.tsx', code, 'utf8');
