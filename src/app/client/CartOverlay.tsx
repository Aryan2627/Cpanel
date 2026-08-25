'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartOverlay() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCart = () => {
      const saved = localStorage.getItem('rfqCart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    };

    loadCart();

    const handleCartUpdate = () => loadCart();
    window.addEventListener('cart_updated', handleCartUpdate);

    return () => window.removeEventListener('cart_updated', handleCartUpdate);
  }, []);

  if (cart.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#fff',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      borderRadius: '12px',
      padding: '20px',
      zIndex: 1000,
      width: '320px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
           RFQ Cart <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{cart.length}</span>
        </h3>
        <button 
          onClick={() => {
            localStorage.removeItem('rfqCart');
            setCart([]);
          }}
          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Clear
        </button>
      </div>

      <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '16px' }}>
        {cart.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: '#4b5563' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{item.name}</span>
            <span style={{ fontWeight: '600' }}>1 {item.uom || 'Unit'}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={() => {
          router.push('/client/events/create/single-stage?fromCart=true');
        }}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#10b981',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
      >
         Convert to RFQ Event
      </button>
    </div>
  );
}
