'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

const AGENTS = [
  {
    id: 'niti',
    name: 'NITI',
    role: 'Negotiation Agent',
    description: 'Fights for the best price, demands favorable payment terms, and prevents long-term vendor lock-in. Powered by advanced context rules.',
    seed: 'Niti',
  },
  {
    id: 'anveshan',
    name: 'ANVESHAN',
    role: 'Sourcing Agent',
    description: 'Performs deep web scanning to discover sustainable, SOC-2 compliant, and cost-effective global suppliers.',
    seed: 'Anveshan',
  },
  {
    id: 'tark',
    name: 'TARK',
    role: 'Operations Agent',
    description: 'Automates purchase order creation, routes complex approvals, and enforces strict contract logic flawlessly.',
    seed: 'Tark',
  },
  {
    id: 'garuda',
    name: 'GARUDA',
    role: 'Risk Agent',
    description: 'Monitors real-time supply chain disruptions, geopolitical events, and ESG compliance across your vendor base.',
    seed: 'Garuda',
  },
  {
    id: 'jarvis',
    name: 'JARVIS',
    role: 'Global Co-pilot',
    description: 'Your conversational AI assistant that navigates the entire procurement platform and answers data queries.',
    seed: 'Jarvis',
  },
  {
    id: 'lexis',
    name: 'LEXIS',
    role: 'Glossary Builder',
    description: 'Automatically builds and maintains your enterprise procurement glossary from raw database column patterns.',
    seed: 'Lexis',
  },
];

export default function AutonomousAgentsPage() {
  const [activeAgentId, setActiveAgentId] = useState(AGENTS[0].id);

  const activeAgent = AGENTS.find((a) => a.id === activeAgentId) || AGENTS[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Fake Header to mimic marketing site */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#06b6d4' }}>❖</span> ProcGen
          </div>
          <nav style={{ display: 'flex', gap: '24px', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
            <span style={{ color: '#2563eb' }}>Platform</span>
            <span>Solutions</span>
            <span>Customers</span>
            <span>Resources</span>
            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
               AI Lab
            </span>
          </nav>
        </div>
        <button style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
          Request Demo
        </button>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Top Typography */}
        <div style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '60px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Context Agents
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
            The team that makes <br />
            <span style={{ color: '#2563eb' }}>your procurement AI-ready.</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, marginBottom: '32px' }}>
            Supplier relationships have been an unsolved problem for years, and modern procurement needs more diligence than humans can manually provide. Context Agents are the AI teammates that negotiate, source, and continuously manage your supply chain.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              See How it Works <ArrowRight size={18} />
            </button>
            <a href="#" style={{ color: '#0f172a', fontWeight: 600, fontSize: '1rem', textDecoration: 'underline' }}>
              Book a Demo
            </a>
          </div>
        </div>

        {/* Interactive Interactive Team Grid */}
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          border: '6px solid #2563eb', 
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(37, 99, 235, 0.1)',
          minHeight: '450px'
        }}>
          
          {/* Left Detail Panel */}
          <div style={{ 
            width: '35%', 
            backgroundColor: '#f8fafc', 
            padding: '40px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              width: '140px', 
              height: '140px', 
              backgroundColor: '#fff', 
              borderRadius: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
              marginBottom: '24px',
              position: 'relative'
            }}>
              {/* Decorative radial glow */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '24px', boxShadow: 'inset 0 0 20px rgba(37,99,235,0.1)' }} />
              <img 
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${activeAgent.seed}`} 
                alt={activeAgent.name} 
                style={{ width: '100px', height: '100px', zIndex: 1 }} 
              />
            </div>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
              {activeAgent.name}
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
              {activeAgent.description}
            </p>
          </div>

          {/* Right Grid Panel */}
          <div style={{ 
            width: '65%', 
            backgroundColor: '#ffffff', 
            padding: '40px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 24px 0', textAlign: 'center' }}>
              Meet your team
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              flex: 1
            }}>
              {AGENTS.map((agent) => {
                const isActive = activeAgentId === agent.id;
                return (
                  <div 
                    key={agent.id}
                    onMouseEnter={() => setActiveAgentId(agent.id)}
                    style={{
                      border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                      boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.1)' : 'none'
                    }}
                  >
                    <img 
                      src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${agent.seed}`} 
                      alt={agent.name} 
                      style={{ width: '48px', height: '48px', marginBottom: '12px' }} 
                    />
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                      {agent.role}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
