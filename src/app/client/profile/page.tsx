'use client';
import { useState, useEffect } from 'react';

interface LoginActivity {
  id: string;
  identifier: string;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/auth/activity').then(r => r.ok ? r.json() : []),
    ]).then(([userData, activityData]) => {
      setUser(userData);
      setActivities(Array.isArray(activityData) ? activityData : []);
      setLoading(false);
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getBrowser = (ua: string | null) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome')) return ' Chrome';
    if (ua.includes('Firefox')) return ' Firefox';
    if (ua.includes('Safari')) return ' Safari';
    if (ua.includes('Edge')) return ' Edge';
    return '️ Browser';
  };

  if (loading) return <div style={{ padding: '40px', color: '#64748b' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {/* Profile Header */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{user?.name || 'Unknown User'}</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.95rem' }}>{user?.email}</p>
          <span style={{ display: 'inline-block', marginTop: '8px', padding: '4px 12px', borderRadius: '99px', background: '#eff6ff', color: '#2563eb', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' }}>
            {user?.role || 'User'}
          </span>
        </div>
      </div>

      {/* Login Activity */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}> Login Activity</h2>

        {activities.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No login activity recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act, i) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', background: i === 0 ? '#f0fdf4' : '#f8fafc', border: `1px solid ${i === 0 ? '#bbf7d0' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{act.success ? '' : ''}</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.9rem' }}>
                      {getBrowser(act.userAgent)} {i === 0 && <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>Current Session</span>}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      {act.ip ? `IP: ${act.ip}` : 'IP not recorded'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', color: '#64748b', fontSize: '0.82rem' }}>
                  {formatDate(act.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
