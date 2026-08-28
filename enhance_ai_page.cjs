const fs = require('fs');

const content = `"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Zap, CheckCircle2, AlertCircle, Sparkles, User, ShieldCheck, Terminal, Target, TrendingDown, Settings2, Plus, X } from 'lucide-react';

export default function AIAgentsPage() {
  const [messages, setMessages] = useState([
    { sender: 'vendor', text: "We've reviewed the specs. We can do $45,000 for the Q4 shipment, but that's our bottom line.", time: '10:42 AM' }
  ]);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [vendorTyping, setVendorTyping] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, logs, analyzing, vendorTyping]);

  useEffect(() => {
    // Advanced Simulation Sequence
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => {
      setAnalyzing(true);
      setLogs(prev => [...prev, "> Analyzing vendor historical margins..."]);
    }, 1500));

    timers.push(setTimeout(() => {
      setLogs(prev => [...prev, "> Cross-referencing Q3 global steel indices... (-4.2% MoM)"]);
    }, 2500));

    timers.push(setTimeout(() => {
      setLogs(prev => [...prev, "> MATCH: Vendor historically accepts 8.5% discount for net-15 payment terms."]);
    }, 4000));

    timers.push(setTimeout(() => {
      setAnalyzing(false);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Based on current market indices, our max threshold is $41,175. However, if you can meet this price, we are authorized to upgrade payment terms to Net-15 to improve your cash flow. Can we close this today?", 
        time: '10:43 AM' 
      }]);
      setVendorTyping(true);
    }, 5500));

    timers.push(setTimeout(() => {
      setVendorTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'vendor', 
        text: "Let me check with my director...", 
        time: '10:45 AM' 
      }]);
      setVendorTyping(true);
    }, 8500));
    
    timers.push(setTimeout(() => {
      setVendorTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'vendor', 
        text: "Okay, with the Net-15 payment terms, we can accept $41,175. I will generate the contract now.", 
        time: '10:48 AM' 
      }]);
      setClosed(true);
    }, 12000));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
            <Bot size={36} className="text-violet-600 dark:text-violet-500 drop-shadow-md" />
            Autonomous Negotiators
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Deploy advanced AI agents to autonomously negotiate with suppliers based on real-time market data and custom constraints.
          </p>
        </div>
        <button onClick={() => setShowDeployModal(true)} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5">
          <Plus size={18} /> Deploy New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
        
        {/* Left Sidebar: Active Agents */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 p-5 flex flex-col h-[700px]">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-slate-900 dark:text-white pb-4 border-b border-slate-100 dark:border-white/5">
            <Zap size={18} className="text-amber-500" /> Live Deployments
          </h3>
          
          <div className="space-y-3 overflow-y-auto pr-2">
            <div className="bg-violet-50 dark:bg-violet-900/10 border-l-4 border-violet-500 p-4 rounded-r-2xl cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/10 rounded-bl-full pointer-events-none"></div>
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Q4 Raw Steel</h4>
                <span className="bg-violet-200 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full animate-pulse border border-violet-300 dark:border-violet-500/30">Live</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Agent: &alpha;-Strike Model</p>
              <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-500/20 flex justify-between text-[11px]">
                 <span className="text-slate-500 dark:text-slate-400">Target: $40,000</span>
                 <span className="text-violet-600 dark:text-violet-400 font-bold">Round 2</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Office Hardware</h4>
                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">Closed</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between text-[11px]">
                 <span className="text-slate-500 dark:text-slate-400">Target: $15,000</span>
                 <span className="text-emerald-600 dark:text-emerald-400 font-bold">Won @ $12,400</span>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Logistics Contract</h4>
                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">Closed</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-between text-[11px]">
                 <span className="text-slate-500 dark:text-slate-400">Target: $1.2M</span>
                 <span className="text-emerald-600 dark:text-emerald-400 font-bold">Won @ $1.11M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Negotiation View */}
        <div className="lg:col-span-2 bg-white dark:bg-[#050505] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col h-[700px] overflow-hidden relative">
          
          {/* View Header */}
          <div className="bg-slate-50 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 p-4 md:p-5 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Bot size={24} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  ProcGen Agent &alpha;
                  {analyzing && <Sparkles size={14} className="text-fuchsia-500 animate-pulse" />}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Terminal size={12} className="text-violet-500" /> Model: Procurement-LLM-v4
                </p>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div ref={chatRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-[#080808] relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent pointer-events-none"></div>
            
            {messages.map((m, i) => (
              <div key={i} className={\`flex gap-4 relative z-10 \${m.sender === 'ai' ? 'flex-row-reverse' : ''}\`}>
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md \${m.sender === 'ai' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600' : 'bg-slate-700 dark:bg-white/10 border border-white/5'}\`}>
                  {m.sender === 'ai' ? <Bot size={20} /> : <span className="font-bold">V</span>}
                </div>
                <div className={\`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm \${m.sender === 'ai' ? 'bg-violet-600 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(139,92,246,0.3)]' : 'bg-white dark:bg-[#151515] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 rounded-tl-sm'}\`}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <p className={\`text-[10px] mt-2 font-mono \${m.sender === 'ai' ? 'text-violet-200 text-right' : 'text-slate-500 text-left'}\`}>{m.time}</p>
                </div>
              </div>
            ))}

            {/* AI Internal Thought Terminal */}
            {analyzing && (
              <div className="pr-14 pl-14 flex justify-end relative z-10">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-xs font-mono text-emerald-400 max-w-[85%] w-full shadow-2xl">
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2 text-slate-400">
                    <Terminal size={12} /> agent_reasoning.log
                  </div>
                  <div className="space-y-1.5 opacity-90">
                    {logs.map((log, i) => (
                       <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">{log}</div>
                    ))}
                    <div className="animate-pulse">_</div>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Typing Indicator */}
            {vendorTyping && (
               <div className="flex gap-4 relative z-10">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 bg-slate-700 dark:bg-white/10 border border-white/5">
                   <span className="font-bold">V</span>
                 </div>
                 <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-1.5 w-16">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 </div>
               </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/5 z-10 relative">
             {closed ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Contract Secured</p>
                      <p className="text-emerald-600 dark:text-emerald-500 text-xs">Total Savings: $3,825.00</p>
                    </div>
                  </div>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors">
                    View PO
                  </button>
                </div>
             ) : (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 text-xs md:text-sm text-amber-800 dark:text-amber-400 flex items-start gap-3 border border-amber-200 dark:border-amber-500/20 font-medium">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Autonomous Mode Engaged</strong>
                    Manual chat input is disabled while the AI Agent holds the active negotiation token. You can forcibly revoke the token from the settings menu.
                  </div>
                </div>
             )}
          </div>
        </div>

        {/* Right Sidebar: Telemetry & Settings */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           {/* Telemetry Card */}
           <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 p-5">
             <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wider">
               <Target size={16} className="text-fuchsia-500" /> Agent Telemetry
             </h3>
             <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Target Price</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">$40,000</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5">
                  <p className="text-xs text-slate-500 mb-1">Authorized Limit</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">$42,000</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-100 dark:border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Market Sentiment</p>
                    <p className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                      <TrendingDown size={14} /> Softening (-4%)
                    </p>
                  </div>
                </div>
             </div>
           </div>

           {/* Settings Card */}
           <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 p-5 flex-1">
             <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-wider">
               <Settings2 size={16} className="text-violet-500" /> Strategy Guardrails
             </h3>
             <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Aggression Level</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">Collaborative</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 w-[40%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Patience / Delays</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold">High (24h)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 w-[80%]"></div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10">
                   <p className="text-xs text-slate-500 mb-3">Allowed Concessions</p>
                   <div className="flex flex-wrap gap-2">
                     <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 px-3 py-1 rounded-lg text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/30">Payment Terms</span>
                     <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 px-3 py-1 rounded-lg text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/30">Delivery Dates</span>
                     <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 px-3 py-1 rounded-lg text-[11px] font-bold border border-rose-200 dark:border-rose-500/30 line-through opacity-70">Quantity Limits</span>
                   </div>
                </div>
             </div>
           </div>
        </div>

      </div>

      {/* Deploy Modal Overlay */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Sparkles size={20} className="text-violet-500" /> Configure New Agent
               </h2>
               <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                 <X size={20} />
               </button>
             </div>
             <div className="p-6 space-y-5">
               <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Select Active Tender</label>
                 <select className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500">
                   <option>RFP-2027: Raw Steel Fulfillment</option>
                   <option>RFQ-9092: Logistics Services</option>
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Price</label>
                   <input type="text" placeholder="$40,000" className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Limit</label>
                   <input type="text" placeholder="$42,000" className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-violet-500" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Negotiation Strategy</label>
                 <div className="flex gap-2">
                   <button className="flex-1 bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-500/50 text-violet-800 dark:text-violet-300 p-2 rounded-lg text-sm font-bold">Collaborative</button>
                   <button className="flex-1 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 p-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-white/5">Aggressive</button>
                 </div>
               </div>
             </div>
             <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#050505] flex justify-end gap-3">
               <button onClick={() => setShowDeployModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">Cancel</button>
               <button onClick={() => setShowDeployModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/30 transition-colors">Deploy Agent</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
`;
fs.writeFileSync('src/app/client/ai-agents/page.tsx', content, 'utf8');
console.log("Enhanced AI Agents page completely");
