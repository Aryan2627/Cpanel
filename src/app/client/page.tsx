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
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Command Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Welcome back to your procurement overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/client/intake/create">
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>+</span> New Intake
            </button>
          </Link>
          <Link href="/client/events">
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>+</span> New Event
            </button>
          </Link>
        </div>
      </div>
      
      {/* KPI Grid */}
      <div className="kpi-grid">
        {[
          { title: 'Total Purchase Requests', value: stats.intakes, color: 'var(--primary-color)', icon: '🛒' },
          { title: 'Active Products', value: stats.products, color: 'var(--success-color)', icon: '📦' },
          { title: 'Registered Users', value: stats.users, color: '#8b5cf6', icon: '👥' },
          { title: 'Active Teams', value: stats.teams, color: 'var(--warning-color)', icon: '🏢' },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>
              {kpi.icon}
            </div>
            <div className="kpi-title">
              {kpi.title}
            </div>
            <div className="kpi-value" style={{ color: kpi.color }}>
              {loading ? <span style={{ opacity: 0.5 }}>...</span> : kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* CSS Chart Section */}
        <div className="surface">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Volume Trends</h2>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '24px', borderBottom: '1px solid var(--surface-border)' }}>
            {[40, 65, 30, 85, 50, 95, 75].map((height, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  width: '100%', height: `${height}%`, backgroundColor: 'var(--primary-color)', 
                  borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'height 1s ease-out' 
                }}></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="surface">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Recent Alerts</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning-color)', marginTop: '6px' }}></div>
               <div>
                 <div style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem' }}>PR-2026-000001 pending</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2 hours ago</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)', marginTop: '6px' }}></div>
               <div>
                 <div style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem' }}>RFQ Event #450 ended</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yesterday</div>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', marginTop: '6px' }}></div>
               <div>
                 <div style={{ fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.95rem' }}>New Vendor Onboarded</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Jun 24, 2026</div>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
