'use client';
import React, { useState, useEffect } from 'react';

export default function ERPIntegrationPage() {
  const [system, setSystem] = useState('SAP S/4HANA');
  const [url, setUrl] = useState('https://api.erp-sandbox.internal/v1/');
  const [apiKey, setApiKey] = useState('mock-key');
  const [logs, setLogs] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch('http://localhost:3001/connections');
      const data = await res.json();
      setConnections(data);
    } catch (err) {
      addLog('Failed to fetch existing connections from ERP Sync Service. Is it running on port 3001?');
    }
  };

  const registerConnection = async () => {
    setSyncing(true);
    addLog(`Registering connection to ${system} via Microservice...`);
    try {
      const res = await fetch('http://localhost:3001/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${system} Prod`, type: system, url, apiKey })
      });
      const data = await res.json();
      if (res.ok) {
        addLog(`Success! Registered ${system} integration. ID: ${data.id}`);
        fetchConnections();
      } else {
        addLog(`Registration failed: ${data.error}`);
      }
    } catch (err) {
      addLog(`Error communicating with ERP Sync Service on port 3001.`);
    } finally {
      setSyncing(false);
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/connections/${id}`, { method: 'DELETE' });
      addLog(`Deleted connection ${id}`);
      fetchConnections();
    } catch (err) {
      addLog(`Failed to delete connection ${id}`);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Enterprise ERP Integrations (Standalone)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure the standalone ERP Sync Service middleware to automatically push PRs to ProcGen.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div className="surface">
          <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>New Connection</h3>
          
          <div className="form-group">
            <label className="form-label">System of Record</label>
            <select className="form-input" value={system} onChange={(e) => setSystem(e.target.value)}>
              <option value="SAP S/4HANA">SAP S/4HANA</option>
              <option value="Oracle ERP Cloud">Oracle ERP Cloud</option>
              <option value="Microsoft Dynamics 365">Microsoft Dynamics 365</option>
              <option value="NetSuite">NetSuite</option>
              <option value="Tally">Tally</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">API Endpoint URL</label>
            <input type="text" className="form-input" value={url} onChange={e => setUrl(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">API Key / Token</label>
            <input type="password" className="form-input" value={apiKey} onChange={e => setApiKey(e.target.value)} />
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button className="btn btn-primary" onClick={registerConnection} disabled={syncing}>
              {syncing ? 'Connecting...' : 'Register ERP Connection'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="surface">
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Active Connections</h3>
            {connections.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)' }}>No active ERP connections registered in the microservice.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {connections.map(conn => (
                  <div key={conn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{conn.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{conn.type}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger-color)' }} onClick={() => deleteConnection(conn.id)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--primary-color)' }}>Sync Logs</h3>
            
            <div style={{ 
              flex: 1, 
              backgroundColor: '#1e293b', 
              color: '#a3e635', 
              padding: '16px', 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflowY: 'auto',
              minHeight: '200px'
            }}>
              {logs.length === 0 ? (
                <div style={{ color: '#64748b' }}>Waiting for activity...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
