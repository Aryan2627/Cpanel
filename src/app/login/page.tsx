'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setIsLoading(true);
    setTimeout(() => {
      setStep('verify');
      setIsLoading(false);
    }, 1000); // Simulate network request
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Mock routing based on email/number input for testing roles
      if (identifier.includes('admin')) {
        router.push('/admin');
      } else if (identifier.includes('vendor')) {
        router.push('/vendor');
      } else {
        router.push('/client/intake'); // Default to client portal
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#ffffff', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Left Side - Branding / Graphic (Hidden on mobile) */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '60px', 
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(60px)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '24px', letterSpacing: '-1px' }}>
            ProcGen
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#bfdbfe', lineHeight: '1.6', marginBottom: '48px' }}>
            Streamline your sourcing, accelerate approvals, and collaborate effortlessly with vendors on a single unified platform.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '4px', backgroundColor: '#60a5fa', borderRadius: '4px' }}></div>
            <div style={{ width: '24px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
            <div style={{ width: '24px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px',
        backgroundColor: '#f8fafc' 
      }}>
        <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#ffffff', padding: '48px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' }}>
          
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 35 25 C 50 10, 80 15, 80 40" stroke="#7e22ce" strokeWidth="8" strokeLinecap="round" />
                <path d="M 65 75 C 50 90, 20 85, 20 60" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
                <path d="M 25 35 L 35 45 L 75 45 M 35 55 L 70 55 M 40 65 L 65 65" stroke="#1e3a8a" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="55" cy="75" r="5" fill="#1e3a8a" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '8px', letterSpacing: '1px' }}>PROCGEN</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Secure, passwordless authentication</p>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Mobile Number or Email</label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: '8px', 
                    border: '1px solid #cbd5e1', outline: 'none', 
                    fontSize: '1rem', color: '#0f172a', transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !identifier}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '8px', border: 'none', 
                  backgroundColor: identifier ? '#2563eb' : '#94a3b8', 
                  color: '#ffffff', fontSize: '1rem', fontWeight: '600', 
                  cursor: identifier ? 'pointer' : 'not-allowed', 
                  transition: 'background-color 0.2s', marginTop: '8px'
                }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Enter 6-digit OTP</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="· · · · · ·"
                  maxLength={6}
                  required
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: '8px', 
                    border: '1px solid #cbd5e1', outline: 'none', 
                    fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center', color: '#0f172a', transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || otp.length < 4}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '8px', border: 'none', 
                  backgroundColor: otp.length >= 4 ? '#2563eb' : '#94a3b8', 
                  color: '#ffffff', fontSize: '1rem', fontWeight: '600', 
                  cursor: otp.length >= 4 ? 'pointer' : 'not-allowed', 
                  transition: 'background-color 0.2s', marginTop: '8px'
                }}
              >
                {isLoading ? 'Verifying...' : 'Sign In'}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setStep('request')}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Change Email/Mobile
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
