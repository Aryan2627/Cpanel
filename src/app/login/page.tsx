"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid email or password');
      }
      
      router.push('/client/intake');
  
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .login-container { display: flex; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .login-left { flex: 1; background: radial-gradient(circle at top right, #1e293b 0%, #020617 100%); color: white; display: flex; flex-direction: column; justify-content: center; padding: 60px; position: relative; overflow: hidden; }
        .login-right { flex: 1; display: flex; align-items: center; justify-content: center; background: #ffffff; padding: 40px; }
        .brand-logo { font-size: 2rem; font-weight: 800; letter-spacing: -0.05em; display: flex; align-items: center; gap: 12px; margin-bottom: 2rem; position: relative; z-index: 2; }
        .hero-text { font-size: 3.5rem; font-weight: 700; line-height: 1.1; margin-bottom: 1.5rem; position: relative; z-index: 2; }
        .hero-subtext { font-size: 1.25rem; color: #94a3b8; max-width: 480px; line-height: 1.6; position: relative; z-index: 2; }
        .feature-list { margin-top: 3rem; display: flex; flex-direction: column; gap: 1.5rem; position: relative; z-index: 2; }
        .feature-item { display: flex; align-items: center; gap: 16px; font-size: 1.1rem; color: #cbd5e1; }
        .feature-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; border-radius: 12px; }
        .abstract-shape { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%); top: -100px; right: -200px; pointer-events: none; }
        .login-box { width: 100%; max-width: 440px; }
        .btn-primary { width: 100%; padding: 14px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
        .btn-primary:hover:not(:disabled) { background: #1d4ed8; }
        .input-field { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.2s; color: #0f172a; }
        .input-field:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        @media (max-width: 900px) {
          .login-left { display: none; }
        }
      `}} />

      <div className="login-container">
        <div className="login-left">
          <div className="abstract-shape"></div>
          
          <div className="brand-logo" style={{ background: '#fff', padding: '12px 24px', borderRadius: '12px', width: 'fit-content' }}>
            <img src="/logo.webp" alt="ProcGen Logo" style={{ height: '48px', objectFit: 'contain' }} />
          </div>

          <h1 className="hero-text">Intelligent B2B<br />Sourcing.</h1>
          <p className="hero-subtext">Automate your enterprise procurement, run dynamic reverse auctions, and discover vendor savings—all in one secure portal.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'white', marginBottom: '4px' }}>Drive Cost Savings</strong>
                Compare Bids & Award Contracts faster.
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'white', marginBottom: '4px' }}>Multi-Tier Workflows</strong>
                Streamlined intake requests & approvals.
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'white', marginBottom: '4px' }}>Enterprise Security</strong>
                Isolated tenant architecture & audit logs.
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1.1rem' }}>Enter your corporate credentials to access the portal.</p>

            {error && (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', borderRadius: '4px', fontSize: '0.95rem' }}>
                <strong>Access Denied: </strong>{error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Corporate Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="name@company.com"
                  className="input-field"
                />
              </div>
              
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                  <span>Password</span>
                  <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
                </label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary"
                style={{ background: loading ? '#93c5fd' : '', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.95rem', color: '#64748b' }}>
                Is your company new to ProcGen? <a href="/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Register Organization</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
