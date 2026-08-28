"use client";
import "./tailwind.css";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Zap, CheckCircle2, AlertCircle, Sparkles, User, ShieldCheck, Terminal, Target, TrendingDown, Settings2, Plus, X, Activity, Cpu } from 'lucide-react';

export default function AIAgentsPage() {
  const [messages, setMessages] = useState([
    { sender: 'vendor', text: "We've reviewed the specs. We can do $45,000 for the Q4 shipment, but that's our bottom line.", time: '10:42:04 AM' }
  ]);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [vendorTyping, setVendorTyping] = useState(false);
  const [closed, setClosed] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, logs, analyzing, vendorTyping]);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans selection:bg-violet-500/30 overflow-hidden relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-white/20">
              <Bot size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                AI Command Center
              </h1>
              <p className="text-zinc-500 mt-1 text-sm font-medium tracking-wide">
                Monitor and deploy autonomous negotiation agents.
              </p>
            </div>
          </div>
          <button onClick={() => setShowDeployModal(true)} className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] transform hover:-translate-y-0.5">
            <Plus size={18} /> Deploy Agent
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
          
          {/* Left Sidebar: Active Nodes */}
          <div className="lg:col-span-3 bg-[#0a0a0a] rounded-3xl border border-white/10 p-5 flex flex-col h-[750px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
            
            <h3 className="font-bold text-sm mb-6 flex items-center gap-2 text-white pb-4 border-b border-white/5 uppercase tracking-widest">
              <Activity size={16} className="text-emerald-500" /> Active Nodes
            </h3>
            
            <div className="space-y-4 overflow-y-auto pr-2">
              <div className="bg-[#111] border border-violet-500/30 p-4 rounded-2xl cursor-pointer hover:bg-[#151515] transition-colors relative group">
                <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <h4 className="font-bold text-sm text-white">Q4 Raw Steel</h4>
                  <span className="flex items-center gap-1.5 bg-violet-500/20 text-violet-300 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-violet-500/50">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-ping"></span> Live
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mb-4">
                  <Cpu size={12} className="text-zinc-500" /> Model: &alpha;-Strike v4
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/50 rounded-lg p-2 border border-white/5">
                    <span className="block text-zinc-500 mb-1">Target</span>
                    <span className="text-white font-bold font-mono">$40,000</span>
                  </div>
                  <div className="bg-violet-900/20 rounded-lg p-2 border border-violet-500/20">
                    <span className="block text-violet-400/70 mb-1">Status</span>
                    <span className="text-violet-300 font-bold">Round 2</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded-2xl cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-sm text-white">Office Hardware</h4>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-500/20">Closed</span>
                </div>
                <div className="bg-black/50 rounded-lg p-3 border border-white/5 flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500">Secured</span>
                  <span className="text-emerald-400 font-bold font-mono">$12,400</span>
                </div>
              </div>
              
              <div className="bg-[#0c0c0c] border border-white/5 p-4 rounded-2xl cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-sm text-white">Logistics Contract</h4>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-500/20">Closed</span>
                </div>
                <div className="bg-black/50 rounded-lg p-3 border border-white/5 flex justify-between items-center text-[11px]">
                  <span className="text-zinc-500">Secured</span>
                  <span className="text-emerald-400 font-bold font-mono">$1.11M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Live Negotiation View */}
          <div className="lg:col-span-6 bg-[#0a0a0a] rounded-3xl shadow-2xl border border-white/10 flex flex-col h-[750px] overflow-hidden relative">
            
            {/* View Header */}
            <div className="bg-[#111] border-b border-white/5 p-5 flex items-center justify-between z-20">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center text-white">
                    <Bot size={20} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111]"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    ProcGen Agent &alpha;
                    {analyzing && <Sparkles size={14} className="text-violet-400 animate-pulse" />}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 mt-1">
                    <ShieldCheck size={12} className="text-emerald-500" /> Authorized Limit: <span className="text-emerald-400">$42,000</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={chatRef} className="flex-1 p-6 overflow-y-auto space-y-8 relative">
              {/* Subtle grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
              
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 relative z-10 ${m.sender === 'ai' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${m.sender === 'ai' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600' : 'bg-[#151515] border border-white/10'}`}>
                    {m.sender === 'ai' ? <Bot size={20} /> : <span className="font-bold text-zinc-400">V</span>}
                  </div>
                  <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl ${m.sender === 'ai' ? 'bg-[#111] text-zinc-200 border border-violet-500/30 rounded-tr-sm shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'bg-[#0c0c0c] text-zinc-400 border border-white/5 rounded-tl-sm'}`}>
                    <p className="text-[15px] leading-relaxed">{m.text}</p>
                    <p className={`text-[10px] mt-3 font-mono ${m.sender === 'ai' ? 'text-violet-400/50 text-right' : 'text-zinc-600 text-left'}`}>{m.time}</p>
                  </div>
                </div>
              ))}

              {/* Hacker Terminal Logs */}
              {analyzing && (
                <div className="pr-14 pl-14 flex justify-end relative z-10">
                  <div className="bg-black border border-emerald-500/30 rounded-xl p-4 text-[11px] font-mono text-emerald-400 max-w-[90%] w-full shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-50"></div>
                    <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2 text-emerald-500/70">
                      <Terminal size={12} /> execution_trace.log
                    </div>
                    <div className="space-y-2 opacity-90 tracking-wide uppercase">
                      {logs.map((log, i) => (
                         <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">{log}</div>
                      ))}
                      <div className="animate-pulse">_</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor Typing Indicator */}
              {vendorTyping && (
                 <div className="flex gap-4 relative z-10">
                   <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-[#151515] border border-white/10">
                     <span className="font-bold text-zinc-400">V</span>
                   </div>
                   <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 w-16">
                     <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                     <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                     <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                   </div>
                 </div>
              )}
            </div>

            {/* Footer Controls */}
            <div className="p-5 bg-[#111] border-t border-white/5 z-10 relative">
               {closed ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-400 text-sm tracking-wide">CONTRACT SECURED</p>
                        <p className="text-emerald-500/70 text-xs font-mono mt-0.5">Total Savings: $3,825.00</p>
                      </div>
                    </div>
                    <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all relative z-10">
                      Review PO
                    </button>
                  </div>
               ) : (
                  <div className="bg-amber-500/5 rounded-xl p-4 text-[13px] text-amber-500/80 flex items-center justify-center gap-3 border border-amber-500/20 font-medium font-mono">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    AUTONOMOUS OVERRIDE: Manual input disabled during active negotiation block.
                  </div>
               )}
            </div>
          </div>

          {/* Right Sidebar: Telemetry */}
          <div className="lg:col-span-3 flex flex-col gap-6">
             {/* Telemetry Card */}
             <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 p-5 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
               <h3 className="font-bold text-xs mb-5 flex items-center gap-2 text-white uppercase tracking-widest border-b border-white/5 pb-4">
                 <Target size={14} className="text-emerald-500" /> Telemetry Data
               </h3>
               
               <div className="space-y-3 relative z-10">
                  <div className="bg-[#111] rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-bold">Target Price</p>
                    <p className="text-2xl font-mono font-black text-white">$40,000</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-bold">Authorized Limit</p>
                    <p className="text-2xl font-mono font-black text-zinc-400">$42,000</p>
                  </div>
                  <div className="bg-[#111] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-bold">Market Sentiment</p>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <TrendingDown size={14} /> Softening (-4.2%)
                      </p>
                    </div>
                  </div>
               </div>
             </div>

             {/* Settings Card */}
             <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 p-5 shadow-xl flex-1 flex flex-col">
               <h3 className="font-bold text-xs mb-5 flex items-center gap-2 text-white uppercase tracking-widest border-b border-white/5 pb-4">
                 <Settings2 size={14} className="text-violet-500" /> Guardrails
               </h3>
               <div className="space-y-6 flex-1">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">Aggression</span>
                      <span className="text-violet-400 font-mono">COLLABORATIVE</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#151515] rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 w-[40%] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-500 uppercase font-bold text-[10px] tracking-wider">Patience Limit</span>
                      <span className="text-violet-400 font-mono">HIGH (24H)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#151515] rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 w-[80%] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-white/5">
                     <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-3">Allowed Concessions</p>
                     <div className="flex flex-wrap gap-2">
                       <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-mono border border-emerald-500/20">PAYMENT_TERMS</span>
                       <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-mono border border-emerald-500/20">DELIVERY_DATE</span>
                       <span className="bg-rose-500/10 text-rose-500/50 px-3 py-1.5 rounded-lg text-[10px] font-mono border border-rose-500/20 line-through">QTY_LIMITS</span>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* Deploy Modal Overlay */}
        {showDeployModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
             <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.15)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#050505]">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                   <Sparkles size={18} className="text-violet-500" /> Configure Agent
                 </h2>
                 <button onClick={() => setShowDeployModal(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 w-8 h-8 rounded-full flex items-center justify-center">
                   <X size={16} />
                 </button>
               </div>
               <div className="p-6 space-y-5">
                 <div>
                   <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Target Tender</label>
                   <select className="w-full bg-[#111] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-violet-500 appearance-none">
                     <option>RFP-2027: Raw Steel Fulfillment</option>
                     <option>RFQ-9092: Logistics Services</option>
                   </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Target Price</label>
                     <input type="text" placeholder="$40,000" className="w-full bg-[#111] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-violet-500 font-mono" />
                   </div>
                   <div>
                     <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Max Threshold</label>
                     <input type="text" placeholder="$42,000" className="w-full bg-[#111] border border-white/10 rounded-xl p-3.5 text-sm text-white outline-none focus:border-violet-500 font-mono" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-[11px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Strategy Model</label>
                   <div className="flex gap-2">
                     <button className="flex-1 bg-violet-600/20 border border-violet-500/50 text-violet-300 p-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-inner">Collaborative</button>
                     <button className="flex-1 bg-[#111] border border-white/5 text-zinc-500 p-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#151515] transition-colors">Aggressive</button>
                   </div>
                 </div>
               </div>
               <div className="p-6 border-t border-white/10 bg-[#050505] flex justify-end gap-3">
                 <button onClick={() => setShowDeployModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-sm">Cancel</button>
                 <button onClick={() => setShowDeployModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-black bg-white hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all text-sm">Deploy Agent</button>
               </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
