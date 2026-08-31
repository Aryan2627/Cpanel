'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Terminal, X, BrainCircuit, Activity, Zap } from 'lucide-react';

export default function JarvisAssistant() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(true);
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState('');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [position, setPosition] = useState({ x: typeof window !== "undefined" ? window.innerWidth - 90 : 1000, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [pulseScale, setPulseScale] = useState(1);
  const positionRef = useRef(position);
  useEffect(() => { positionRef.current = position; }, [position]);
  const [isLockdown, setIsLockdown] = useState(false);
  const [shouldCrash, setShouldCrash] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const [targetResponse, setTargetResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);

  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google UK English') || v.name.includes('Samantha') || v.name.includes('Daniel'));
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const checkSettings = () => {
      try {
        const saved = localStorage.getItem('godTierFeatures');
        if (saved) {
          const features = JSON.parse(saved);
          if (features.jarvisAssistant === false) {
             setIsEnabled(false);
          } else {
             setIsEnabled(true);
          }
        }
      } catch (e) {}
    };
    checkSettings();
    
    // Poll for settings changes as a fallback, or use event listeners
    const interval = setInterval(checkSettings, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (displayedResponse !== targetResponse) {
      const timeout = setTimeout(() => {
        setDisplayedResponse(targetResponse.slice(0, displayedResponse.length + 1));
      }, 15); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [displayedResponse, targetResponse]);

  // Global Keyboard Shortcut: Ctrl + J
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + J or Cmd + J
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };
    
    if (isEnabled) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }
        
        const currentText = finalTranscript || interimTranscript;
        setTranscript(currentText);
        
        // Pulse effect based on audio (simulated via text length changes)
        setPulseScale(1 + Math.random() * 0.5);
        setTimeout(() => setPulseScale(1), 100);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Process command when listening stops and we have a transcript
  useEffect(() => {
    if (!isListening && transcript) {
      processCommand(transcript);
    }
  }, [isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setJarvisResponse('Listening...');
      setIsTerminalOpen(true);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim()) {
      const command = textInput;
      setTranscript(command);
      setTextInput('');
      processCommand(command);
    }
  };

  const handleChipClick = (command: string) => {
    setTranscript(command);
    processCommand(command);
  };

  const processCommand = async (text: string) => {
    setTargetResponse('');
    setDisplayedResponse('');
    
    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      const reply = data.reply || 'I encountered an error processing your request.';
      setTargetResponse(reply);
      speak(reply);

      if (data.action) {
        if (data.action.type === 'NAVIGATE' && data.action.payload) {
          setTimeout(() => { router.push(data.action.payload); closeTerminal(); }, 2000);
        } else if (data.action.type === 'UI_EFFECT') {
          if (data.action.payload === 'LOCKDOWN') {
            setIsLockdown(true);
            document.body.style.backgroundColor = '#7f1d1d';
            setTimeout(() => closeTerminal(), 3000);
          } else if (data.action.payload === 'DARK_MODE') {
            document.body.style.backgroundColor = '#0f172a';
            document.body.style.color = '#f8fafc';
            const els = document.querySelectorAll('.app-container, .sidebar, .main-content');
            els.forEach((el: any) => el.style.backgroundColor = '#0f172a');
          } else if (data.action.payload === 'CRASH') {
            setTimeout(() => setShouldCrash(true), 1500);
          }
        }
      }
    } catch (err) {
      console.error(err);
      const errReply = 'I lost connection to the mainframe.';
      setTargetResponse(errReply);
      speak(errReply);
    }
  };

  const closeTerminal = () => {
    setIsTerminalOpen(false);
    setTranscript('');
    setTargetResponse('');
    setDisplayedResponse('');
    setTextInput('');
  };

  if (shouldCrash) {
    throw new Error("CRITICAL_FAULT: Manual Override Exception Triggered by Jarvis Protocol.");
  }

  

  return (
    <>
      {isLockdown && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(220, 38, 38, 0.2)', pointerEvents: 'none', zIndex: 9999999, animation: 'lockdownFlash 1s infinite alternate' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ef4444', fontSize: '5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '10px', textShadow: '0 0 20px #ef4444' }}>
            SYSTEM LOCKDOWN
          </div>
        </div>
      )}

      {/* Holographic Orb */}
      <div 
        
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
          e.stopPropagation();
        }}
        onClick={(e) => {
          if (!isDragging) toggleListening();
        }}
  
        title="Toggle Jarvis (Ctrl + J)"
        style={{
          position: 'fixed', top: `${position.y}px`, left: `${position.x}px`,
          width: '60px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 999999,
          transform: `scale(${isListening ? pulseScale : 1})`,
          transition: 'transform 0.1s'
        }}
      >
        {/* Core Ring 1 */}
        <div style={{
          position: 'absolute', width: '100%', height: '100%',
          border: `2px solid ${isListening ? '#f43f5e' : '#38bdf8'}`,
          borderRadius: '50%', borderTopColor: 'transparent', borderBottomColor: 'transparent',
          animation: 'spin 4s linear infinite',
          boxShadow: `0 0 15px ${isListening ? '#f43f5e' : '#38bdf8'}`
        }} />
        {/* Core Ring 2 */}
        <div style={{
          position: 'absolute', width: '70%', height: '70%',
          border: `3px solid ${isListening ? '#8b5cf6' : '#818cf8'}`,
          borderRadius: '50%', borderLeftColor: 'transparent', borderRightColor: 'transparent',
          animation: 'spin-reverse 3s linear infinite',
          boxShadow: `inset 0 0 10px ${isListening ? '#8b5cf6' : '#818cf8'}`
        }} />
        {/* Center Glow */}
        <div style={{
          position: 'absolute', width: '40%', height: '40%',
          backgroundColor: isListening ? '#f43f5e' : '#38bdf8',
          borderRadius: '50%',
          boxShadow: `0 0 20px 5px ${isListening ? '#f43f5e' : '#38bdf8'}`,
          animation: 'pulse-glow 2s ease-in-out infinite'
        }} />
        <Zap color="#fff" size={20} style={{ position: 'relative', zIndex: 2 }} fill="#fff" />
      </div>

      {/* Slide-out Terminal Overlay */}
      <div style={{
        position: 'fixed',
        top: `${typeof window !== "undefined" ? Math.min(position.y + 70, window.innerHeight - 300) : position.y + 70}px`,
        left: isTerminalOpen ? `${typeof window !== "undefined" ? Math.min(position.x - 360 > 0 ? position.x - 360 : position.x + 70, window.innerWidth - 380) : position.x - 360}px` : '-1000px',
        width: '350px',
        backgroundColor: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(20px) saturate(150%)',
        borderRadius: '16px',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 0 40px rgba(56, 189, 248, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.8)',
        padding: '20px',
        color: '#fff',
        zIndex: 999998,
        transition: 'right 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'monospace'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 'bold' }}>
            <BrainCircuit size={18} /> JARVIS TERMINAL
          </div>
          <button onClick={closeTerminal} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>System Response</div>
          <div style={{ minHeight: '60px', color: '#34d399', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '16px', textShadow: '0 0 10px rgba(52, 211, 153, 0.6)' }}>
            {displayedResponse && '> ' + displayedResponse}
            {displayedResponse !== targetResponse && displayedResponse.length > 0 && (
              <span style={{ display: 'inline-block', width: '8px', height: '14px', backgroundColor: '#34d399', marginLeft: '4px', animation: 'blink 1s step-end infinite', boxShadow: '0 0 8px #34d399' }}></span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>Manual Override</div>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderBottom: '2px solid rgba(56, 189, 248, 0.6)', transition: 'border-color 0.2s' }}>
            <span style={{ color: '#38bdf8', paddingLeft: '12px', fontWeight: 'bold' }}>{'>'}</span>
            <input 
              type="text" 
              placeholder="Type a command..." 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleTextSubmit}
              style={{ width: '100%', padding: '12px 10px', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <style>
          {`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            @keyframes spin {
              100% { transform: rotate(360deg); }
            }
            @keyframes spin-reverse {
              100% { transform: rotate(-360deg); }
            }
            @keyframes pulse-glow {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.2); opacity: 1; }
            }
            @keyframes lockdownFlash {
              0% { background-color: rgba(220, 38, 38, 0.1); }
              100% { background-color: rgba(220, 38, 38, 0.4); }
            }
          `}
        </style>
      </div>
    </>
  );
}
