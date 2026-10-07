"use client";
import React, { useEffect, useState } from 'react';
import { Settings, ExternalLink, CheckCircle } from 'lucide-react';

export default function IntegrationsPage() {
  const [orgData, setOrgData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/tenant').then(r => r.json()).then(data => setOrgData(data.organization));
  }, []);

  const handleSlackConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
    const redirectUri = encodeURIComponent(window.location.origin + '/api/auth/slack/callback');
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,chat:write.public,users:read.email&redirect_uri=${redirectUri}`;
    window.location.href = slackAuthUrl;
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', color: '#f1f5f9' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Integrations</h1>
      <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Connect ProcGen to your favorite enterprise tools.</p>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" style={{ width: '40px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 4px 0' }}>Slack Approvals Bot</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Route purchase requests directly to executives via Slack DMs.</p>
          </div>
        </div>
        
        <div>
          {orgData?.slackToken ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600 }}>
              <CheckCircle size={20} /> Connected to {orgData.slackTeamName}
            </div>
          ) : (
            <button onClick={handleSlackConnect} style={{ background: '#4A154B', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Add to Slack <ExternalLink size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
