'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MasterLandingPage() {
  const router = useRouter();
  const [isHoveringDemo, setIsHoveringDemo] = useState(false);
  
  // Custom Pricing Modal States
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingStep, setPricingStep] = useState(1); // 1 = modules, 2 = details, 3 = success
  
  // Form Data
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '' });

  const modulesList = [
    'Source-to-Pay (S2P)', 'Procure-to-Pay (P2P)', 'Orchestration', 
    'Strategic Sourcing', 'eAuction', 'Vendor Onboarding', 'Vendor Portal'
  ];
  
  const addOnsList = [
    'Contract Repository', 'Spend Analytics', 
    'Integrations & Customizations', 'Dynamic Approval Workflows'
  ];

  const handleCheckboxChange = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(o => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitPricingRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setPricingStep(3);
    setTimeout(() => {
      setIsPricingModalOpen(false);
      setPricingStep(1);
      setSelectedOptions([]);
      setFormData({ name: '', company: '', email: '', phone: '' });
    }, 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '"Inter", sans-serif', color: '#000000', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 100, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '16px 40px', backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)', borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-1px', color: '#111827', cursor: 'pointer' }}>
          PROC<span style={{ color: '#2563eb' }}>GEN</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', fontSize: '1rem', fontWeight: '500', color: '#374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            Products <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            Solutions <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div style={{ cursor: 'pointer' }}>Customers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            Resources <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div 
            onClick={() => setIsPricingModalOpen(true)}
            style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 'bold' }}
          >
            Pricing
          </div>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ 
            width: '44px', height: '44px', borderRadius: '50%', 
            border: '1px solid #d1d5db', backgroundColor: '#ffffff', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </button>

          <button 
            onClick={() => router.push('/login')}
            onMouseEnter={() => setIsHoveringDemo(true)}
            onMouseLeave={() => setIsHoveringDemo(false)}
            style={{
              backgroundColor: isHoveringDemo ? '#1d4ed8' : '#2563eb',
              color: '#ffffff', border: 'none', borderRadius: '999px',
              padding: '12px 28px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isHoveringDemo ? '0 4px 14px 0 rgba(37,99,235,0.39)' : 'none'
            }}
          >
            Get Free Demo
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ 
        padding: '120px 40px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', textAlign: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: '250px', height: '250px', background: 'radial-gradient(circle, #fbcfe8 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '300px', height: '300px', background: 'radial-gradient(circle, #bfdbfe 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px' }}>
          <div style={{ 
            display: 'inline-block', padding: '6px 16px', borderRadius: '999px', 
            backgroundColor: '#000000', color: '#ccf381', fontSize: '0.9rem', fontWeight: 'bold',
            marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase',
            boxShadow: '4px 4px 0px #3b82f6'
          }}>
            ⚡ The New Standard for Sourcing
          </div>
          
          <h1 style={{ fontSize: '5.5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-2px', marginBottom: '32px', color: '#0f172a' }}>
            Sourcing <span style={{ color: 'transparent', WebkitTextStroke: '2px #2563eb' }}>Doesn't</span> Have <br />
            To Be <span style={{ background: 'linear-gradient(90deg, #f43f5e, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Boring.</span>
          </h1>
          
          <p style={{ fontSize: '1.5rem', color: '#475569', maxWidth: '700px', margin: '0 auto 48px auto', lineHeight: '1.5', fontWeight: '500' }}>
            ProcGen is the ultimate procurement platform. Ditch the endless spreadsheets and email threads. Book a demo to see how we automate your entire intake-to-PO workflow.
          </p>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            <button 
              onClick={() => router.push('/login')}
              style={{
                backgroundColor: '#ccf381', color: '#000000', border: '2px solid #000000',
                borderRadius: '12px', padding: '16px 40px', fontSize: '1.25rem', fontWeight: '800',
                cursor: 'pointer', boxShadow: '6px 6px 0px #000000',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(6px, 6px)';
                e.currentTarget.style.boxShadow = '0px 0px 0px #000000';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0px, 0px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000000';
              }}
            >
              BOOK A DEMO TODAY
            </button>
            <button 
              onClick={() => setIsPricingModalOpen(true)}
              style={{
                backgroundColor: 'transparent', color: '#000000', border: '2px solid #000000',
                borderRadius: '12px', padding: '16px 40px', fontSize: '1.25rem', fontWeight: '800',
                cursor: 'pointer', transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section style={{ padding: '80px 0', backgroundColor: '#000000', color: '#ffffff', overflow: 'hidden' }}>
        <div style={{ display: 'flex', whiteSpace: 'nowrap', marginBottom: '80px', fontSize: '4rem', fontWeight: '900', WebkitTextStroke: '1px #334155', color: 'transparent', opacity: 0.5 }}>
           INTAKE ENGINE • VENDOR PORTAL • LIVE BIDDING • PURCHASE ORDERS • ANALYTICS • INTAKE ENGINE • VENDOR PORTAL • LIVE BIDDING • PURCHASE ORDERS • ANALYTICS •
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
            <ServiceCard title="Intake Engine" desc="Drop in a request and watch the magic happen. Instantly route and convert business requests into live sourcing events." color="#ccf381" />
            <ServiceCard title="Live e-Bidding" desc="Suppliers lock in their best prices in real-time. Watch the savings pile up right before your eyes." color="#a78bfa" />
            <ServiceCard title="Vendor Portal" desc="Give your vendors a unified, slick interface to manage all their quotes, invoices, and purchase orders." color="#60a5fa" />
            <ServiceCard title="Instant POs" desc="Found the winning bid? Click 'Award' and instantly generate a secure, finalized Purchase Order." color="#f472b6" />
          </div>
        </div>
      </section>

      {/* CUSTOM PRICING MODAL */}
      {isPricingModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: '#174ea6', // Deep blue resembling the provided image
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', // Dot grid pattern
            backgroundSize: '20px 20px',
            borderRadius: '16px', padding: '40px', position: 'relative', color: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            
            <button 
              onClick={() => {
                setIsPricingModalOpen(false);
                setTimeout(() => setPricingStep(1), 300);
              }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}
            >
              &times;
            </button>

            {pricingStep === 1 && (
              <>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Request custom pricing</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '32px', opacity: 0.9 }}>Select your modules to get a custom quote.</p>

                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.5px' }}>Modules</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {modulesList.map(mod => (
                      <label key={mod} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedOptions.includes(mod)}
                          onChange={() => handleCheckboxChange(mod)}
                          style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#2563eb' }} 
                        />
                        {mod}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.5px' }}>Add-Ons</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {addOnsList.map(addon => (
                      <label key={addon} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedOptions.includes(addon)}
                          onChange={() => handleCheckboxChange(addon)}
                          style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#2563eb' }} 
                        />
                        {addon}
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setPricingStep(2)}
                  disabled={selectedOptions.length === 0}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '8px', border: 'none',
                    backgroundColor: selectedOptions.length > 0 ? '#ffffff' : 'rgba(255,255,255,0.3)',
                    color: selectedOptions.length > 0 ? '#174ea6' : 'rgba(255,255,255,0.5)',
                    fontSize: '1.25rem', fontWeight: '700', cursor: selectedOptions.length > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  Continue &rarr;
                </button>
              </>
            )}

            {pricingStep === 2 && (
              <form onSubmit={submitPricingRequest}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Almost there</h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '32px', opacity: 0.9 }}>Where should we send your custom quote?</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Name</label>
                    <input required name="name" value={formData.name} onChange={handleFormChange} type="text" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Company</label>
                    <input required name="company" value={formData.company} onChange={handleFormChange} type="text" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Email ID</label>
                    <input required name="email" value={formData.email} onChange={handleFormChange} type="email" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Phone Number</label>
                    <input required name="phone" value={formData.phone} onChange={handleFormChange} type="tel" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', fontSize: '1rem' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    type="button"
                    onClick={() => setPricingStep(1)}
                    style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '2px solid #ffffff', backgroundColor: 'transparent', color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    style={{ flex: 2, padding: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#ccf381', color: '#000000', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Submit Quote Request
                  </button>
                </div>
              </form>
            )}

            {pricingStep === 3 && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>Quote Sent!</h2>
                <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
                  Our team is preparing your custom pricing for the {selectedOptions.length} modules selected. We'll be in touch shortly.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

function ServiceCard({ title, desc, color }: { title: string, desc: string, color: string }) {
  return (
    <div style={{
      backgroundColor: '#111827', border: `2px solid ${color}`, borderRadius: '16px', padding: '40px',
      position: 'relative', transition: 'transform 0.2s', cursor: 'default'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: color, marginBottom: '24px' }}></div>
      <h3 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px', color: '#ffffff' }}>{title}</h3>
      <p style={{ fontSize: '1.1rem', color: '#9ca3af', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}
