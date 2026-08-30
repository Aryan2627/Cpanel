'use client';
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Globe, BrainCircuit, Activity, Link as LinkIcon, 
  Languages, Camera, Users, Leaf, ShieldAlert, Cpu, Settings, Gift, Mic
} from 'lucide-react';

export default function SettingsPage() {
  const [workflowsEnabled, setWorkflowsEnabled] = useState(false);
  const [exportIntakeEnabled, setExportIntakeEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  
  // God-tier features state
  const [features, setFeatures] = useState({
    ghostBidding: false,
    tinderMatchmaking: false,
    smartEscrow: false,
    godModeGlobe: false,
    autoTranslation: false,
    visualSourcing: false,
    multiplayerBidding: false,
    carbonOffset: false,
    bankruptcyPredictor: true, // Currently built and active
    iotAutoSourcing: false,
    vendorLootDrop: false,
    jarvisAssistant: false,
    sentinelDebug: true
  });

  useEffect(() => {
    setWorkflowsEnabled(localStorage.getItem('enableWorkflows') === 'true');
    setExportIntakeEnabled(localStorage.getItem('exportIntake') === 'true');
    
    // Load saved features
    const saved = localStorage.getItem('godTierFeatures');
    if (saved) {
      try { setFeatures(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleToggleWorkflows = (checked: boolean) => {
    setWorkflowsEnabled(checked);
    localStorage.setItem('enableWorkflows', checked ? 'true' : 'false');
    window.dispatchEvent(new Event('settings_updated'));
  };

  const handleToggleExportIntake = (checked: boolean) => {
    setExportIntakeEnabled(checked);
    localStorage.setItem('exportIntake', checked ? 'true' : 'false');
    window.dispatchEvent(new Event('settings_updated'));
  };

  const handleToggleFeature = (key: keyof typeof features) => {
    const newFeatures = { ...features, [key]: !features[key] };
    setFeatures(newFeatures);
    localStorage.setItem('godTierFeatures', JSON.stringify(newFeatures));
  };

  const featureList = [
    { key: 'bankruptcyPredictor', name: 'Supplier Bankruptcy Predictor', icon: ShieldAlert, color: '#ef4444', desc: 'Active AI scanning of SEC filings, news sentiment, and credit scores to block awarding to insolvent vendors.' },
    { key: 'ghostBidding', name: 'AI "Ghost Bidding"', icon: BrainCircuit, color: '#8b5cf6', desc: 'Predictive market intel that generates an expected bid based on live global commodity and labor indexes.' },
    { key: 'tinderMatchmaking', name: '"Tinder" Smart Matchmaking', icon: Users, color: '#ec4899', desc: 'Algorithmic curation of the top 5 perfect suppliers for an event. Swipe right to invite.' },
    { key: 'smartEscrow', name: 'Smart-Contract Auto-Escrow', icon: LinkIcon, color: '#3b82f6', desc: 'Locks PO funds in blockchain escrow and automatically releases upon warehouse receipt scan.' },
    { key: 'godModeGlobe', name: '"God Mode" Spend Analytics', icon: Globe, color: '#0ea5e9', desc: 'Replaces static charts with an interactive 3D WebGL globe mapping live supply chain capital flows.' },
    { key: 'autoTranslation', name: 'Live Currency Hedging & Translation', icon: Languages, color: '#f59e0b', desc: 'Auto-translates bids globally and calculates 6-month FX currency risk.' },
    { key: 'visualSourcing', name: 'Visual Sourcing ("Shazam")', icon: Camera, color: '#10b981', desc: 'Scan broken factory parts with a mobile app to auto-generate RFPs for local 3D print/CNC shops.' },
    { key: 'multiplayerBidding', name: 'Multiplayer Collaborative Bidding', icon: Activity, color: '#f43f5e', desc: 'Figma-style live cursors and cell commenting between buyers and vendors during negotiation.' },
    { key: 'carbonOffset', name: 'One-Click "Net Zero"', icon: Leaf, color: '#16a34a', desc: 'Automatically attaches carbon credit micro-transactions to POs to instantly offset the footprint.' },
    { key: 'iotAutoSourcing', name: 'IoT Auto-Sourcing', icon: Cpu, color: '#6366f1', desc: 'Connects to factory weight sensors to auto-draft RFPs when raw materials drop below 15%.' },
    { key: 'vendorLootDrop', name: 'Gamified Vendor Celebrations', icon: Gift, color: '#db2777', desc: 'Replaces boring standard emails with a massive 3D holographic "Loot Drop" celebration when a vendor wins a contract.' },
    { key: 'jarvisAssistant', name: 'Jarvis Voice Assistant', icon: Mic, color: '#0ea5e9', desc: 'Global voice-activated AI assistant that controls the platform, pulls up data, and executes commands via speech.' },
    { key: 'sentinelDebug', name: 'Sentinel Auto-Debug UI', icon: ShieldAlert, color: '#ef4444', desc: 'When the platform crashes, launch the advanced Hacker-style AI Auto-Fix interface instead of a standard crash screen.' }
  ];

  const ToggleSwitch = ({ checked, onChange, color = '#10b981' }: { checked: boolean, onChange: () => void, color?: string }) => (
    <div 
      onClick={onChange}
      style={{
        width: '44px', height: '24px', backgroundColor: checked ? color : '#e2e8f0',
        borderRadius: '12px', position: 'relative', transition: 'background-color 0.2s',
        cursor: 'pointer', flexShrink: 0
      }}
    >
      <div style={{
        width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%',
        position: 'absolute', top: '2px', left: checked ? '22px' : '2px',
        transition: 'left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }} />
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100%', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#2563eb', padding: '8px', borderRadius: '8px', color: '#fff' }}>
          <Settings size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Platform Settings</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Configure your enterprise workspace and experimental modules.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '100%' }}>
        
        {/* Standard Settings */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#1e293b' }}>General Preferences</h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Enable Field Map Module</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Turns on the Field Map menu item in the Manage sidebar section.</div>
            </div>
            <ToggleSwitch checked={workflowsEnabled} onChange={() => handleToggleWorkflows(!workflowsEnabled)} color="#2563eb" />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: '20px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>Enable Export Intake Button</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Displays an Export to CSV/PDF button on the Purchase Intake dashboard.</div>
            </div>
            <ToggleSwitch checked={exportIntakeEnabled} onChange={() => handleToggleExportIntake(!exportIntakeEnabled)} color="#2563eb" />
          </div>
        </div>

        
        {/* Billing & License Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #3b82f6', padding: '24px', boxShadow: '0 4px 6px -1px rgba(59,130,246,0.1)', position: 'relative', overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#3b82f6' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Sparkles size={24} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Platform License & Billing</h3>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#1e293b' }}>ProcGen {currentUser?.licensePlan || 'Enterprise'} Plan</h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Your current license status is <strong style={{ color: currentUser?.licenseStatus === 'Expired' ? '#ef4444' : '#10b981' }}>{currentUser?.licenseStatus || 'Loading...'}</strong>. 
                <br/>Expires on: <strong>{currentUser?.licenseExpiry ? new Date(currentUser.licenseExpiry).toLocaleDateString() : 'Dec 31, 2026'}</strong>
              </p>
            </div>
            <button 
              onClick={async () => {
                if (confirm("Are you sure you want to generate a ₹10,50,000 PO to renew your license?")) {
                   try {
                     const res = await fetch('/api/license/renew', { 
                       method: 'POST', 
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ organizationId: currentUser?.organizationId }) 
                     });
                     if (res.ok) {
                       alert('Purchase Order Generated Successfully! Check your PO list.');
                       window.location.reload();
                     } else {
                       alert('Failed to generate PO.');
                     }
                   } catch(e) {}
                }
              }}
              style={{ background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}>
              Renew License (Generate PO)
            </button>
          </div>
        </div>

        {/* Advanced Enterprise Modules */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)' }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Sparkles size={24} color="#8b5cf6" />
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Advanced Enterprise Modules</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px', lineHeight: '1.5' }}>
            Configure advanced AI, blockchain, and IoT procurement modules to enhance supply chain operations and analytics.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
            {featureList.map((feature) => (
              <div key={feature.key} style={{ 
                border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', 
                backgroundColor: features[feature.key as keyof typeof features] ? '#f8fafc' : '#fff',
                transition: 'all 0.2s', display: 'flex', gap: '16px', alignItems: 'flex-start'
              }}>
                <div style={{ backgroundColor: `${feature.color}15`, padding: '10px', borderRadius: '10px', color: feature.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <feature.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 600 }}>{feature.name}</h4>
                    <ToggleSwitch 
                      checked={features[feature.key as keyof typeof features]} 
                      onChange={() => handleToggleFeature(feature.key as keyof typeof features)} 
                      color={feature.color}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
