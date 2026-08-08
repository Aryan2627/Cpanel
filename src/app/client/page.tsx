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

  // Widget configuration
  const [widgets, setWidgets] = useState(['kpis', 'trends', 'alerts']);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    if (saved) {
      setWidgets(JSON.parse(saved));
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidget(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetId) return;

    const newWidgets = [...widgets];
    const draggedIdx = newWidgets.indexOf(draggedWidget);
    const targetIdx = newWidgets.indexOf(targetId);

    newWidgets.splice(draggedIdx, 1);
    newWidgets.splice(targetIdx, 0, draggedWidget);

    setWidgets(newWidgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(newWidgets));
    setDraggedWidget(null);
  };

  const renderWidget = (id: string) => {
    if (id === 'kpis') {
      return (
        <div id="tour-kpi-cards" className="kpi-grid" style={{ width: '100%' }}>
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
              <div className="kpi-title">{kpi.title}</div>
              <div className="kpi-value" style={{ color: kpi.color }}>
                {loading ? <span style={{ opacity: 0.5 }}>...</span> : kpi.value}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (id === 'trends') {
      return (
        <div className="surface" style={{ flex: 2, minWidth: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'grab' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Volume Trends</h2>
            <span style={{ color: '#cbd5e1' }}>⠿</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '24px', borderBottom: '1px solid var(--surface-border)' }}>
            {[40, 65, 30, 85, 50, 95, 75].map((height, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', height: `${height}%`, backgroundColor: 'var(--primary-color)', borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'height 1s ease-out' }}></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (id === 'alerts') {
      return (
        <div id="tour-recent-events" className="surface" style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'grab' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px' }}>Recent Alerts</h2>
            <span style={{ color: '#cbd5e1' }}>⠿</span>
          </div>
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
      );
    }
  };

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
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        {widgets.map((wId) => (
          <div 
            key={wId}
            draggable
            onDragStart={(e) => handleDragStart(e, wId)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, wId)}
            style={{ 
              width: wId === 'kpis' ? '100%' : 'auto', 
              flex: wId !== 'kpis' ? 1 : 'unset',
              opacity: draggedWidget === wId ? 0.5 : 1,
              transition: 'opacity 0.2s',
              cursor: 'grab'
            }}
          >
            {renderWidget(wId)}
          </div>
        ))}
      </div>
    </div>
  );
}
