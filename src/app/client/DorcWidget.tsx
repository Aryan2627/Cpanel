'use client';

/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It manages the client-side UI, user interactions, and state management.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, Monitor } from 'lucide-react';

/**
 * Renders the main DorcWidget component.
 * This component handles its own local state and orchestrates user interactions.
 */
export default function DorcWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'agent',
      content: 'I have been upgraded to read the actual pixels on your screen using an advanced in-browser OCR engine. Select a window to test me!',
      title: 'Real Screen Analysis Ready'
    }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScan = async () => {
    if (isScanning) return;
    
    // Inject Tesseract if missing
    if (!(window as any).Tesseract) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      document.head.appendChild(script);
    }

    setIsScanning(true);
    const loadingId = Date.now();
    setMessages(prev => [...prev, { id: loadingId, role: 'agent', content: 'Capturing video frame...', title: 'Scanning...' }]);

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'window' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      await new Promise(r => setTimeout(r, 1000));
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      stream.getTracks().forEach(t => t.stop());
      
      setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: 'Frame captured! Running local machine learning OCR...', title: 'Processing...' } : m));

      // wait for tesseract
      while (!(window as any).Tesseract) {
        await new Promise(r => setTimeout(r, 200));
      }

      const { data: { text } } = await (window as any).Tesseract.recognize(canvas, 'eng');
      
      const extractedText = text.trim() ? text.substring(0, 800) + (text.length > 800 ? '...' : '') : 'No readable text found on the selected window.';

      setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: `Extracted Data:\n${extractedText}`, title: 'Analysis Complete' } : m));

    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: 'Scan cancelled or failed. ' + e.message, title: 'Error' } : m));
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      {/* Floating Widget Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '110px',
          right: '30px',
          width: '400px',
          height: '600px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid rgba(226, 232, 240, 1)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          fontFamily: 'system-ui, sans-serif'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(to bottom, #f8fafc, #fff)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.1rem' }}>
                <img src="/dorc-logo.png" style={{ width: 22, height: 22, objectFit: "contain", filter: "none" }} /> Dorc AI
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Live Vision AI (Local OCR)
              </span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div ref={chatRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                background: msg.title === 'Real Screen Analysis Ready' 
                  ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.1))'
                  : 'rgba(0, 0, 0, 0.02)',
                border: '1px solid ' + (msg.title === 'Real Screen Analysis Ready' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(0, 0, 0, 0.06)'),
                padding: '16px',
                borderRadius: '12px',
              }}>
                <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.9rem' }}>
                  {msg.title === 'Scanning...' || msg.title === 'Processing...' ? <Loader2 size={14} className="animate-spin" color="#2563eb" /> : null}
                  {msg.title}
                </strong>
                <div style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Action Area */}
          <div style={{ padding: '20px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button 
              onClick={handleScan}
              disabled={isScanning}
              style={{
                width: '100%',
                padding: '14px',
                background: '#2563eb',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                opacity: isScanning ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
              }}
            >
              <Monitor size={18} />
              {isScanning ? 'Analyzing...' : 'Analyze Real Screen'}
            </button>
          </div>
        </div>
      )}

      {/* Floating Dorc AI Ring */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        title="Launch Web Copilot"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f8fafc, #e0f2fe)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10000,
          animation: isOpen ? 'none' : 'pulseRing 2s infinite',
          backdropFilter: 'blur(10px)'
        }}
      >
        {isOpen ? <X size={28} color="#2563eb" /> : <img src="/dorc-logo.png" style={{ width: 44, height: 44, objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }} />}
        <style>{`
          @keyframes pulseRing {
            0% { box-shadow: 0 0 10px rgba(0, 0, 0, 0.05), inset 0 0 5px rgba(0, 0, 0, 0.05); }
            50% { box-shadow: 0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.02); }
            100% { box-shadow: 0 0 10px rgba(0, 0, 0, 0.05), inset 0 0 5px rgba(0, 0, 0, 0.05); }
          }
            50% { box-shadow: 0 0 25px rgba(0, 198, 255, 0.8), inset 0 0 15px rgba(0, 198, 255, 0.5); }
            100% { box-shadow: 0 0 15px rgba(0, 198, 255, 0.4), inset 0 0 10px rgba(0, 198, 255, 0.3); }
          }
        `}</style>
      </div>
    </>
  );
}