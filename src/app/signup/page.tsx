"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ companyName: '', industry: '', name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      if (!loginRes.ok) {
        throw new Error('Registration successful but auto-login failed. Please log in manually.');
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
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>Create Workspace</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '1.1rem' }}>Register your company to start managing procurement.</p>

            {error && (
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', borderRadius: '4px', fontSize: '0.95rem' }}>
                <strong>Error: </strong>{error}
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Company Name</label>
                <input 
                  type="text" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  required
                  placeholder="e.g. Acme Corp"
                  className="input-field"
                />
              </div>

                                          <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Company Category / Industry</label>
                <input 
                  list="industries-list"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  required
                  placeholder="Type to search or select industry..."
                  className="input-field"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: '#fff' }}
                />
                <datalist id="industries-list">
                  <option value="Manufacturing" />
                  <option value="Automotive" />
                  <option value="Pharmaceuticals" />
                  <option value="Chemicals" />
                  <option value="Oil & Gas" />
                  <option value="Petrochemicals" />
                  <option value="Steel & Metals" />
                  <option value="Mining" />
                  <option value="Construction" />
                  <option value="Infrastructure" />
                  <option value="Real Estate" />
                  <option value="Cement" />
                  <option value="Power & Energy" />
                  <option value="Renewable Energy" />
                  <option value="Electrical & Electronics" />
                  <option value="Telecommunications" />
                  <option value="Information Technology (IT)" />
                  <option value="Software / SaaS" />
                  <option value="IT Hardware" />
                  <option value="Semiconductors" />
                  <option value="Consumer Electronics" />
                  <option value="FMCG" />
                  <option value="Food & Beverage" />
                  <option value="Agriculture" />
                  <option value="Textiles" />
                  <option value="Apparel & Fashion" />
                  <option value="Leather & Footwear" />
                  <option value="Paper & Packaging" />
                  <option value="Printing" />
                  <option value="Plastics & Rubber" />
                  <option value="Glass" />
                  <option value="Ceramics" />
                  <option value="Furniture" />
                  <option value="Home & Building Materials" />
                  <option value="Retail" />
                  <option value="Wholesale & Distribution" />
                  <option value="E-commerce" />
                  <option value="Logistics" />
                  <option value="Transportation" />
                  <option value="Warehousing" />
                  <option value="Shipping & Maritime" />
                  <option value="Aviation" />
                  <option value="Railways" />
                  <option value="Healthcare" />
                  <option value="Hospitals" />
                  <option value="Medical Devices" />
                  <option value="Biotechnology" />
                  <option value="Education" />
                  <option value="Hospitality" />
                  <option value="Hotels & Resorts" />
                  <option value="Restaurants & Catering" />
                  <option value="Travel & Tourism" />
                  <option value="Banking & Financial Services" />
                  <option value="Insurance" />
                  <option value="Real Estate Services" />
                  <option value="Professional Services" />
                  <option value="Consulting" />
                  <option value="Legal Services" />
                  <option value="Accounting & Audit" />
                  <option value="Marketing & Advertising" />
                  <option value="Media & Entertainment" />
                  <option value="Government & Public Sector" />
                  <option value="Defense & Aerospace" />
                  <option value="Security Services" />
                  <option value="Facility Management" />
                  <option value="Cleaning & Housekeeping" />
                  <option value="Human Resources / Staffing" />
                  <option value="Engineering Services" />
                  <option value="Industrial Equipment" />
                  <option value="Machinery & Equipment" />
                  <option value="Industrial Automation" />
                  <option value="Robotics" />
                  <option value="HVAC" />
                  <option value="Fire & Safety" />
                  <option value="Water & Waste Management" />
                  <option value="Environmental Services" />
                  <option value="Energy & Utilities" />
                  <option value="Telecom Infrastructure" />
                  <option value="Printing & Office Supplies" />
                  <option value="Packaging & Materials" />
                  <option value="Furniture & Office Infrastructure" />
                  <option value="Chemicals & Industrial Consumables" />
                  <option value="Lubricants & Oils" />
                  <option value="Tools & Hardware" />
                  <option value="Safety Equipment / PPE" />
                  <option value="Laboratory Equipment & Supplies" />
                  <option value="Medical Supplies" />
                  <option value="Agricultural Equipment" />
                  <option value="Renewable Energy Equipment" />
                  <option value="Solar" />
                  <option value="Wind Energy" />
                  <option value="Battery & Energy Storage" />
                  <option value="EV & EV Components" />
                  <option value="Aerospace Components" />
                  <option value="Marine & Shipbuilding" />
                  <option value="Railway Equipment" />
                  <option value="Defense Manufacturing" />
                  <option value="Luxury Goods" />
                  <option value="Jewellery" />
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Your Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Work Email</label>
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
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Password</label>
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
                style={{ background: loading ? '#93c5fd' : '', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
              >
                {loading ? 'Creating Workspace...' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.95rem', color: '#64748b' }}>
                Already have an account? <a href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Log in</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
