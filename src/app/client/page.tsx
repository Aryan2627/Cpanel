'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    teams: 0,
    products: 0,
    intakes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, teamsRes, productsRes, intakesRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/teams'),
          fetch('/api/products'),
          fetch('/api/intakes')
        ]);
        
        const users = await usersRes.json();
        const teams = await teamsRes.json();
        const products = await productsRes.json();
        const intakes = await intakesRes.json();

        setStats({
          users: Array.isArray(users) ? users.length : 0,
          teams: Array.isArray(teams) ? teams.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          intakes: Array.isArray(intakes) ? intakes.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Command Center</h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Welcome back to your procurement overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/client/intake/create" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' }}>
              <span>+</span> New Intake
            </button>
          </Link>
          <Link href="/client/events" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid #cbd5e1' }}>
              <span>+</span> New Event
            </button>
          </Link>
        </div>
      </div>
      
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {[
          { title: 'Total Purchase Requests', value: stats.intakes, color: '#3b82f6', icon: '🛒' },
          { title: 'Active Products', value: stats.products, color: '#10b981', icon: '📦' },
          { title: 'Registered Users', value: stats.users, color: '#8b5cf6', icon: '👥' },
          { title: 'Active Teams', value: stats.teams, color: '#f59e0b', icon: '🏢' },
        ].map((kpi, i) => (
          <div key={i} style={{ 
            backgroundColor: '#fff', padding: '24px', borderRadius: '12px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9',
            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>
              {kpi.icon}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', zIndex: 1 }}>
              {kpi.title}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: kpi.color, zIndex: 1 }}>
              {loading ? <span style={{ opacity: 0.5 }}>...</span> : kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* CSS Chart Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px' }}>Volume Trends</h2>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            {[40, 65, 30, 85, 50, 95, 75].map((height, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '100%', height: `${height}%`, backgroundColor: '#3b82f6', 
                  borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'height 1s ease-out' 
                }}></div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '24px' }}>Recent Alerts</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', marginTop: '6px' }}></div>
               <div>
                 <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.95rem' }}>PR-2026-000001 pending</div>
                 <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2 hours ago</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', marginTop: '6px' }}></div>
               <div>
                 <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.95rem' }}>RFQ Event #450 ended</div>
                 <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Yesterday</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '6px' }}></div>
               <div>
                 <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.95rem' }}>New Vendor Onboarded</div>
                 <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Jun 24, 2026</div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
