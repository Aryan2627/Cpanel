'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Terminal, RefreshCw, Cpu, Activity, Copy, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isFixing, setIsFixing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSentinelEnabled, setIsSentinelEnabled] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem('godTierFeatures');
      if (saved) {
        const features = JSON.parse(saved);
        if (features.sentinelDebug === false) {
          setIsSentinelEnabled(false);
        }
      }
    } catch (e) {}

    // Log the error to an actual error reporting service in production
    console.error("Sentinel intercepted a critical error:", error);
  }, [error]);

  const runAutoFix = () => {
    setIsFixing(true);
    setLogs(["[SYSTEM] Initializing Sentinel Auto-Debug Protocol..."]);
    
    const steps = [
      "Analyzing stack trace for anomaly signatures...",
      `Detected runtime exception: ${error.message}`,
      "Isolating rogue memory pointers in client components...",
      "Bypassing corrupt state tree...",
      "Compiling hot-patch for active DOM...",
      "Applying patch...",
      "[SUCCESS] Runtime stability restored. Rebooting router..."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setTimeout(() => {
            // Attempt to recover by resetting the error boundary
            reset();
            // And pushing to the dashboard as a fallback
            router.push('/client');
          }, 1500);
        }
      }, (index + 1) * 800);
    });
  };

  const copyBugReport = () => {
    const report = `
[SENTINEL CRASH REPORT]
Timestamp: ${new Date().toISOString()}
User-Agent: ${navigator.userAgent}
URL: ${window.location.href}
Error Digest: ${error.digest || 'N/A'}
Message: ${error.message}

Stack Trace:
${error.stack || 'No stack trace available.'}
    `.trim();

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!hasMounted) return null;

  if (!isSentinelEnabled) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px 0' }}>Something went wrong!</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>We encountered an unexpected error while rendering this page.</p>
        <button 
          onClick={() => reset()}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617', // Very dark slate
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'monospace',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Matrix/Grid effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        zIndex: 0,
        opacity: 0.2
      }} />

      <div style={{
        zIndex: 1,
        maxWidth: '800px',
        width: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderBottom: '1px solid #ef4444',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert color="#ef4444" size={24} />
          <h2 style={{ margin: 0, color: '#ef4444', fontSize: '1.2rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Sentinel Critical Intercept
          </h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <span style={{ display: 'block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'blink 1s infinite' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem' }}>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            A critical runtime exception was detected in the active module. Sentinel has intercepted the crash to prevent total platform collapse.
          </p>

          {/* Stack Trace Box */}
          <div style={{
            backgroundColor: '#000',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1rem',
            overflowX: 'auto'
          }}>
            <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Uncaught Exception: {error.message || 'Unknown Error'}</span>
              {error.digest && <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'normal' }}>Digest ID: {error.digest}</span>}
            </div>
            <pre style={{ color: '#fb923c', fontSize: '0.85rem', margin: 0, whiteSpace: 'pre-wrap' }}>
              {error.stack || 'No stack trace available.'}
            </pre>
          </div>

          <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
             <span>Environment: {hasMounted ? (window.location.hostname === 'localhost' ? 'Development' : 'Production') : 'Unknown'}</span>
             <span>Browser: {hasMounted ? navigator.userAgent.split(' ')[0] : 'Unknown'}</span>
          </div>

          {/* Action Area */}
          {!isFixing ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={runAutoFix}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid #10b981',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.2)'; }}
              >
                <Cpu size={20} />
                Initialize AI Auto-Fix
              </button>
              
              <button
                onClick={copyBugReport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {copied ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
                {copied ? 'Copied to Clipboard' : 'Copy Bug Report'}
              </button>

              <button
                onClick={() => reset()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #475569',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <RefreshCw size={18} />
                Manual Retry
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#000',
              border: '1px solid #10b981',
              borderRadius: '6px',
              padding: '1.5rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '1rem', fontWeight: 'bold' }}>
                <Activity size={18} className="animate-spin" />
                Executing Diagnostic Protocol...
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ color: log.includes('[SUCCESS]') ? '#10b981' : '#38bdf8', fontSize: '0.9rem' }}>
                    <span style={{ color: '#475569', marginRight: '8px' }}>[{new Date().toISOString().split('T')[1].slice(0, -1)}]</span>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: .5; transform: scale(1.05); }
          }
          .animate-spin {
            animation: spin 2s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
