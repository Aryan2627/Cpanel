'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('verify');
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
      } else {
        alert(data.error || 'Failed to request OTP');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.role === 'admin') router.push('/admin');
        else if (data.role === 'vendor') router.push('/vendor');
        else router.push('/client/intake');
      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>ProcGen</h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>Sign in to your account</p>
        </div>

        {step === 'request' ? (
          <>
            <button 
              type="button" 
              onClick={() => { window.location.href = '/api/auth/google'; }}
              style={{
                width: '100%', padding: '12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px',
                fontSize: '0.95rem', fontWeight: '500', color: '#334155', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '10px', cursor: 'pointer', transition: 'background-color 0.2s',
                marginBottom: '24px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center', margin: '24px 0' }}>
              <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></div>
              <span style={{ padding: '0 10px', color: '#94a3b8', fontSize: '0.85rem' }}>or</span>
              <div style={{ flex: 1, borderBottom: '1px solid #e2e8f0' }}></div>
            </div>

            <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '8px' }}>Email or Phone</label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com or +1..."
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !identifier}
                style={{ width: '100%', padding: '12px', background: isLoading || !identifier ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '500', cursor: isLoading || !identifier ? 'not-allowed' : 'pointer' }}
              >
                {isLoading ? 'Sending...' : 'Send Login Code'}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginBottom: '8px', textAlign: 'center' }}>Enter the 6-digit code</label>
              
              {previewUrl && (
                <div style={{ marginBottom: '16px', padding: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'center' }}>
                  <strong>Dev Mode:</strong> <a href={previewUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>View Code</a>
                </div>
              )}

              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={6}
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1.5rem', letterSpacing: '4px', textAlign: 'center', boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || otp.length < 6}
              style={{ width: '100%', padding: '12px', background: isLoading || otp.length < 6 ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '500', cursor: isLoading || otp.length < 6 ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={() => setStep('request')}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Change email or phone
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

