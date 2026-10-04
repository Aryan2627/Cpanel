"use client";
import React, { useEffect, useState } from 'react';
import { Users, FileCheck2, Clock, Search, ExternalLink } from 'lucide-react';

export default function HireDashboard() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/hire')
      .then(res => res.json())
      .then(data => {
        setCandidates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCandidates = candidates.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-purple" style={{ marginBottom: '12px' }}>
            <Users size={14} /> Recruitment & Hiring
          </div>
          <h1 className="page-title" style={{ color: 'var(--text)' }}>Candidate Responses</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View and review all technical assessments taken by candidates.</p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search candidates..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Candidate Info</th>
              <th>Status</th>
              <th>Education & Exp</th>
              <th>Logical / Quant</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Loading candidates...</td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No candidates found.</td>
              </tr>
            ) : (
              filteredCandidates.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>📞 {c.phone || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`badge ${c.status === 'COMPLETED' ? 'badge-green' : c.status === 'PENDING' ? 'badge-gray' : c.status === 'SUSPENDED' ? 'badge-red' : 'badge-blue'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{c.education || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Exp: {c.experience || 'N/A'} yrs</div>
                  </td>
                  <td>
                    {c.status === 'COMPLETED' ? (
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.85rem' }}>Logical: <strong style={{ color: 'var(--primary)' }}>{c.logicalScore || 0}</strong></span>
                          <span style={{ fontSize: '0.85rem' }}>Quant: <strong style={{ color: 'var(--accent)' }}>{c.quantScore || 0}</strong></span>
                       </div>
                    ) : (
                       <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending completion...</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
