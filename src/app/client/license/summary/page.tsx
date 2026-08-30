
'use client';
import React from 'react';
import { PieChart, Activity, AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function LicenseSummary() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>License Summary</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Executive overview of your software asset landscape.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {[
          { title: 'Total License Value', value: '$2.4M', icon: DollarSign, color: '#3b82f6', trend: '+4.2%' },
          { title: 'Active Licenses', value: '14,204', icon: CheckCircle, color: '#10b981', trend: '+1.1%' },
          { title: 'Compliance Risk', value: 'High (3)', icon: AlertTriangle, color: '#ef4444', trend: 'Needs Action' },
          { title: 'Under-utilized', value: '$184k', icon: TrendingUp, color: '#f59e0b', trend: 'Potential Savings' },
        ].map((kpi, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ backgroundColor: kpi.color + '15', padding: '12px', borderRadius: '8px', color: kpi.color }}>
                <kpi.icon size={24} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: kpi.color }}>{kpi.trend}</span>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{kpi.value}</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{kpi.title}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Spend by Publisher</h3>
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
             {[
               { name: 'Microsoft', pct: 45, color: '#3b82f6' },
               { name: 'Salesforce', pct: 25, color: '#0ea5e9' },
               { name: 'Adobe', pct: 15, color: '#ef4444' },
               { name: 'Oracle', pct: 10, color: '#f59e0b' },
               { name: 'Other', pct: 5, color: '#94a3b8' }
             ].map(pub => (
               <div key={pub.name}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                   <span style={{ fontWeight: 600, color: '#334155' }}>{pub.name}</span>
                   <span style={{ color: '#64748b' }}>{pub.pct}%</span>
                 </div>
                 <div style={{ width: '100%', backgroundColor: '#f1f5f9', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                   <div style={{ width: `${pub.pct}%`, backgroundColor: pub.color, height: '100%' }}></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              "50 new Adobe CC licenses allocated.",
              "Oracle DB maintenance expires in 12 days.",
              "Microsoft EA renewal finalized.",
              "Unlicensed installations detected on 3 servers."
            ].map((msg, i) => (
              <div key={i} style={{ padding: '12px', borderLeft: '3px solid #3b82f6', backgroundColor: '#f8fafc', fontSize: '0.9rem', color: '#334155' }}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
