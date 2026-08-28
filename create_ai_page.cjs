const fs = require('fs');
const content = `"use client";
import React, { useState, useEffect } from 'react';
import { Bot, Zap, CheckCircle2, AlertCircle, Sparkles, User, ShieldCheck } from 'lucide-react';

export default function AIAgentsPage() {
  const [messages, setMessages] = useState([
    { sender: 'vendor', text: "We've reviewed the specs. We can do $45,000 for the Q4 shipment, but that's our bottom line.", time: '10:42 AM' }
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    // Simulate the sequence
    const t1 = setTimeout(() => {
      setAnalyzing(true);
    }, 2000);

    const t2 = setTimeout(() => {
      setAnalyzing(false);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: "Our maximum approved budget is $41,175. However, we are willing to extend the delivery deadline by 14 days to accommodate this price. Can we close this today?", 
        time: '10:43 AM' 
      }]);
    }, 5000);

    const t3 = setTimeout(() => {
      setMessages(prev => [...prev, { 
        sender: 'vendor', 
        text: "Let me check... Okay, with the extended delivery, we can accept $41,175. I will generate the contract now.", 
        time: '10:45 AM' 
      }]);
      setClosed(true);
    }, 9000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
            <Bot size={36} className="text-violet-600 dark:text-violet-500 drop-shadow-md" />
            Autonomous Negotiators
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-xl">
            Deploy AI agents to automatically negotiate with suppliers based on your exact constraints and historical network data.
          </p>
        </div>
        <button className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5">
          <Sparkles size={18} /> Deploy New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Agents List */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 p-6 flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
            <Zap size={20} className="text-emerald-500" /> Active Negotiations
          </h3>
          
          <div className="space-y-4 flex-1">
            <div className="bg-violet-50 dark:bg-violet-900/10 border-l-4 border-violet-500 p-4 rounded-r-2xl cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/20 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Q4 Raw Steel Procurement</h4>
                <span className="bg-violet-200 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full animate-pulse border border-violet-300 dark:border-violet-500/30">Live</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Target: $40,000 &bull; Flex: Delivery Date</p>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Office Hardware Refresh</h4>
                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">Closed</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved: $12,400 (18% below target)</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-4 rounded-2xl cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Logistics Contract 2027</h4>
                <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30">Closed</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved: $89,000 (4% below target)</p>
            </div>
          </div>
        </div>

        {/* Live Negotiation View */}
        <div className="lg:col-span-2 bg-white dark:bg-[#050505] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col h-[650px] overflow-hidden relative">
          
          {/* View Header */}
          <div className="bg-slate-50 dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/5 p-4 md:p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Bot size={24} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></div>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">ProcGen Agent &alpha;</h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={14} className="text-emerald-500" /> Authorized Limit: $42,000
                </p>
              </div>
            </div>
            {closed && (
               <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                 <CheckCircle2 size={16} /> Deal Secured
               </span>
            )}
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-transparent relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/5 to-transparent pointer-events-none"></div>
            
            {messages.map((m, i) => (
              <div key={i} className={\`flex gap-4 relative z-10 \${m.sender === 'ai' ? 'flex-row-reverse' : ''}\`}>
                <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-md \${m.sender === 'ai' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600' : 'bg-slate-400 dark:bg-white/10 border border-white/5'}\`}>
                  {m.sender === 'ai' ? <Bot size={20} /> : <span className="font-bold">V</span>}
                </div>
                <div className={\`max-w-[80%] md:max-w-[70%] p-4 md:p-5 rounded-2xl shadow-sm \${m.sender === 'ai' ? 'bg-violet-600 text-white rounded-tr-sm shadow-[0_5px_15px_rgba(139,92,246,0.3)]' : 'bg-white dark:bg-[#111] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-tl-sm'}\`}>
                  <p className="text-sm md:text-base leading-relaxed">{m.text}</p>
                  <p className={\`text-[10px] mt-2 font-mono \${m.sender === 'ai' ? 'text-violet-200 text-right' : 'text-slate-400 text-left'}\`}>{m.time}</p>
                </div>
              </div>
            ))}

            {analyzing && (
              <div className="pr-14 pl-14 flex justify-end relative z-10">
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 text-xs font-mono text-violet-700 dark:text-violet-300 max-w-[80%] shadow-inner">
                  <div className="flex items-center gap-2 mb-2 font-bold text-violet-800 dark:text-violet-400">
                    <Sparkles size={14} className="animate-pulse text-fuchsia-500" /> Analyzing Network Data...
                  </div>
                  <p className="opacity-90 leading-relaxed">Match found: Vendor historically accepts 8.5% discount when buyer offers +14 days delivery flexibility. Strategy updated.</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Placeholder */}
          <div className="p-4 md:p-6 bg-white dark:bg-[#0a0a0a] border-t border-slate-200 dark:border-white/5 z-10">
             <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 md:p-4 text-xs md:text-sm text-amber-800 dark:text-amber-400 flex items-center justify-center gap-3 border border-amber-200 dark:border-amber-500/20 font-medium text-center">
               <AlertCircle size={18} className="flex-shrink-0" />
               Agent is operating autonomously. Manual intervention is disabled during active negotiation block.
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/app/client/ai-agents/page.tsx', content, 'utf8');
console.log("Created AI Agents Dashboard page");
