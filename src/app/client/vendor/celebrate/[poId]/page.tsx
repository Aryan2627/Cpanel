'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Check, Download, PartyPopper, ArrowLeft } from 'lucide-react';

export default function VendorLootDropPage() {
  const params = useParams();
  const router = useRouter();
  
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/pos/${params.poId}`)
      .then(res => res.json())
      .then(data => {
        setPo(data);
        setLoading(false);
        triggerConfetti();
      })
      .catch(err => {
        setLoading(false);
      });
  }, [params.poId]);

  // Simple JS particle system for confetti
  const triggerConfetti = () => {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 150; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = '-10px';
      confetti.style.opacity = Math.random().toString();
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 0.5;
      
      confetti.style.animation = `fall ${duration}s ${delay}s linear forwards`;
      container.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => {
        if (container.contains(confetti)) {
          container.removeChild(confetti);
        }
      }, (duration + delay) * 1000);
    }
  };

  // 3D Tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15; // Max rotation 15deg
    const rotateY = ((x - centerX) / centerX) * 15;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    
    // Glare effect
    const glare = card.querySelector('.glare') as HTMLElement;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`;
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const glare = cardRef.current.querySelector('.glare') as HTMLElement;
    if (glare) {
      glare.style.background = 'transparent';
    }
  };

  if (loading) return <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Epic Drop...</div>;
  if (!po) return <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>PO Not Found</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(2,6,23,0) 70%)', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '40%', left: '45%', transform: 'translate(-50%, -50%)', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(219,39,119,0.1) 0%, rgba(2,6,23,0) 70%)', zIndex: 0, pointerEvents: 'none' }}></div>

      {/* Confetti Container */}
      <div id="confetti-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10, overflow: 'hidden' }}></div>
      
      {/* Fall animation styles */}
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
          @keyframes pulse-glow {
            0% { box-shadow: 0 0 20px rgba(219,39,119,0.4), 0 0 40px rgba(139,92,246,0.2); }
            50% { box-shadow: 0 0 40px rgba(219,39,119,0.8), 0 0 80px rgba(139,92,246,0.4); }
            100% { box-shadow: 0 0 20px rgba(219,39,119,0.4), 0 0 40px rgba(139,92,246,0.2); }
          }
        `}
      </style>

      {/* Back Button */}
      <button onClick={() => router.back()} style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', zIndex: 50, backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
        <ArrowLeft size={18} /> Return to Dashboard
      </button>

      <div style={{ zIndex: 20, textAlign: 'center', marginBottom: '40px', animation: 'float 6s ease-in-out infinite' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(219, 39, 119, 0.2)', border: '1px solid rgba(219, 39, 119, 0.5)', color: '#fbcfe8', padding: '8px 16px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '16px', textTransform: 'uppercase' }}>
          <PartyPopper size={16} style={{ marginRight: '8px' }} /> Contract Awarded
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 16px 0', background: 'linear-gradient(to right, #f472b6, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 10px 30px rgba(219, 39, 119, 0.3)' }}>
          You Won the Bid.
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          The client has selected you for this project. Review your epic holographic Purchase Order below.
        </p>
      </div>

      {/* 3D Card Container */}
      <div 
        style={{ perspective: '1000px', zIndex: 20, cursor: 'pointer', padding: '20px' }}
      >
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ 
            width: '450px', 
            height: '600px', 
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            position: 'relative',
            transition: 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d',
            overflow: 'hidden',
            animation: 'pulse-glow 4s infinite'
          }}
        >
          {/* Glare overlay */}
          <div className="glare" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none', transition: 'background 0.2s' }}></div>

          {/* Holographic foil effect */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(125deg, transparent 20%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 60%, transparent 80%)', backgroundSize: '200% 200%', animation: 'foil 5s infinite linear', opacity: 0.5, pointerEvents: 'none' }}></div>
          <style>
            {`
              @keyframes foil {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}
          </style>

          {/* Card Content */}
          <div style={{ position: 'relative', zIndex: 5, padding: '40px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
              <div>
                <div style={{ color: '#cbd5e1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '8px' }}>Official PO</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '1px' }}>{po.poNumber}</div>
              </div>
              <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={24} color="#fff" strokeWidth={3} />
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Client</div>
                <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600 }}>Acme Corporation</div>
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <div style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Event Source</div>
                <div style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>Event ID: {po.eventId}</div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Contract Value</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '12px' }}>
                ${po.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ zIndex: 20, display: 'flex', gap: '16px', marginTop: '40px' }}>
        <button style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(16, 185, 129, 0.6)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.4)'; }}>
          Accept & Sign Contract
        </button>
        <button style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
          <Download size={18} /> Export PDF
        </button>
      </div>

    </div>
  );
}
