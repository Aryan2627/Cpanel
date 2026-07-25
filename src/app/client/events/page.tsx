'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('LIVE');
  const [activeStageFilter, setActiveStageFilter] = useState('All Stages');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [dbEvents, setDbEvents] = useState<any[]>([]);
  
  // Modal states for View Bids
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isBidsLoading, setIsBidsLoading] = useState(false);

  const mockEvents = [
    {
      account: 'Support S Account S',
      refId: 'RFX-20012',
      itemsCount: 2,
      title: 'testing del item2',
      stages: [
        {
          name: 'Technical Offer',
          statusIcon: '⚠️',
          statusColor: '#9ca3af',
          timeText: 'Overdue by about 1h',
          timeColor: '#dc2626',
          participants: '1/2',
          participantsColor: '#3b82f6',
          actionText: 'Send for TR',
          actionBadge: '1',
          actionType: 'warning'
        }
      ]
    },
    {
      account: 'Support S Account S',
      refId: 'RFX-20009',
      itemsCount: 1,
      title: 'Demo Procol - 4',
      stages: [
        {
          name: 'RFQ',
          statusIcon: '◐',
          statusColor: '#f97316',
          timeText: 'Ends in 11m : 30d : 3h : 34m : 02s',
          timeColor: '#374151',
          participants: '0/5',
          participantsColor: '#dc2626',
          actionText: 'Evaluate RFQ Commercials',
          actionBadge: '1',
          actionType: 'warning'
        }
      ]
    }
  ];

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(dbEvent => ({
            id: dbEvent.refId, // use refId for API calls
            account: dbEvent.account || 'Default Account',
            refId: dbEvent.refId,
            itemsCount: dbEvent.itemsCount || 1,
            title: dbEvent.title || 'Untitled Event',
            type: dbEvent.type || 'Price based',
            stages: [
              {
                name: 'Live RFQ (Database)',
                statusIcon: '◐',
                statusColor: '#10b981',
                timeText: 'Live now',
                timeColor: '#10b981',
                participants: 'View Bids',
                participantsColor: '#2563eb',
                actionText: 'Evaluate Bids',
                actionBadge: 'New',
                actionType: 'success'
              }
            ]
          }));
          setDbEvents(mapped);
        }
      })
      .catch(console.error);
  }, []);

  const allEvents = useMemo(() => {
    return [...dbEvents, ...mockEvents];
  }, [dbEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        event.title.toLowerCase().includes(query) || 
        event.refId.toLowerCase().includes(query) ||
        event.account.toLowerCase().includes(query);

      let matchesStage = true;
      if (activeStageFilter === 'Live') {
        matchesStage = event.stages.some((s: any) => s.statusColor === '#10b981' || s.statusColor === '#f97316');
      } else if (activeStageFilter === 'In - Evaluation') {
        matchesStage = event.stages.some((s: any) => s.actionText.includes('Evaluate') || s.actionText.includes('Send for'));
      } else if (activeStageFilter === 'Upcoming') {
        matchesStage = event.stages.some((s: any) => s.statusColor === '#d1d5db' || s.timeText.includes('Scheduled'));
      }

      return matchesSearch && matchesStage;
    });
  }, [searchQuery, activeStageFilter, allEvents]);

  const handleViewBids = async (eventId: string) => {
    setSelectedEventId(eventId);
    setIsBidsLoading(true);
    try {
      const res = await fetch(`/api/bids?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setBids(data);
      }
    } catch(err) {
      console.error(err);
    }
    setIsBidsLoading(false);
  };

  const handleAward = async (bid: any) => {
    try {
      // 1. Generate PO
      const poRes = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `PO for Event ${selectedEventId}`,
          vendorId: bid.vendorId,
          total: bid.amount,
          eventId: selectedEventId,
          status: 'Draft',
          poNumber: `PO-${Date.now()}` // Automatically generating a PO number for quick demo
        })
      });

      // 2. Generate Contract
      const contractRes = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Master Agreement - Event ${selectedEventId}`,
          vendorId: bid.vendorId,
          vendorName: bid.vendorName,
          eventId: selectedEventId,
          total: bid.amount,
          status: 'Draft'
        })
      });

      if (poRes.ok && contractRes.ok) {
        alert('Purchase Order and Draft Contract successfully generated!');
        setSelectedEventId(null);
        router.push('/client/contracts');
      } else {
        alert('Failed to generate PO or Contract');
      }
    } catch(err) {
      alert('Error awarding bid');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#f3f4f6', margin: '-32px', position: 'relative' }}>
      
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: '#ffffff', padding: '0 24px', borderBottom: '1px solid #e5e7eb', height: '60px' }}>
        <div style={{ display: 'flex', gap: '32px', height: '100%' }}>
          <div 
            onClick={() => setActiveTab('LIVE')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: activeTab === 'LIVE' ? '3px solid #2563eb' : '3px solid transparent', color: activeTab === 'LIVE' ? '#2563eb' : '#6b7280', fontWeight: 'bold', fontSize: '0.9rem', paddingTop: '16px' }}
          >
            LIVE <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{allEvents.length}</span>
          </div>
          <div 
            onClick={() => setActiveTab('HISTORY')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', borderBottom: activeTab === 'HISTORY' ? '3px solid #2563eb' : '3px solid transparent', color: activeTab === 'HISTORY' ? '#2563eb' : '#9ca3af', fontWeight: 'bold', fontSize: '0.9rem', paddingTop: '16px' }}
          >
            HISTORY
          </div>
        </div>

        <div style={{ paddingBottom: '10px', position: 'relative' }}>
          <button 
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            + Create Event
            <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '8px', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
               ▼
            </span>
          </button>
          
          {isCreateMenuOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, minWidth: '180px', overflow: 'hidden' }}>
              <div onClick={() => router.push('/client/events/create/single-stage')} style={{ padding: '10px 16px', fontSize: '0.9rem', color: '#374151', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}>Single Stage</div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', backgroundColor: '#eef2f6', gap: '16px' }}>
        
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden', width: '250px' }}>
          <input 
            type="text" 
            placeholder="Search Title" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', padding: '8px 12px', outline: 'none', width: '100%', fontSize: '0.9rem' }} 
          />
        </div>

        <div style={{ flex: 1 }}></div>

        {/* Stage Filters */}
        <div style={{ display: 'flex', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden', fontSize: '0.85rem', fontWeight: '600' }}>
          <div 
            onClick={() => setActiveStageFilter('All Stages')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: activeStageFilter === 'All Stages' ? '#f3f4f6' : '#fff', color: '#374151', borderRight: '1px solid #e5e7eb' }}
          >
            All Stages
          </div>
          <div 
            onClick={() => setActiveStageFilter('Live')}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: activeStageFilter === 'Live' ? '#f3f4f6' : '#fff', color: '#374151', borderRight: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ color: '#10b981' }}>●</span> Live
          </div>
        </div>
      </div>

      {/* Events List */}
      <div style={{ flex: 1, padding: '16px 24px', overflowY: 'auto' }}>
        {filteredEvents.map((event, idx) => (
          <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            
            {/* Event Header */}
            <div style={{ padding: '16px 20px', borderBottom: event.stages.length > 0 ? '1px solid #f3f4f6' : 'none' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>
                {event.account} • {event.refId} • {event.itemsCount} item{event.itemsCount > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937' }}>
                {event.title}
              </div>
            </div>

            {/* Event Stages */}
            {event.stages.map((stage: any, sIdx: number) => (
              <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr', alignItems: 'center', padding: '12px 20px', borderBottom: sIdx !== event.stages.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: '0.85rem' }}>
                
                {/* Stage Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#4b5563' }}>
                  <span style={{ color: stage.statusColor, fontSize: '1.1rem' }}>{stage.statusIcon}</span>
                  {stage.name}
                </div>

                {/* Time */}
                <div style={{ color: stage.timeColor || '#374151', fontWeight: stage.timeColor === '#dc2626' ? '600' : '400' }}>
                  {stage.timeText}
                </div>

                {/* Participants */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: stage.participantsColor, fontWeight: '500' }}>
                  {stage.name.includes('Live RFQ') ? (
                    <button onClick={() => handleViewBids(event.id || event.refId)} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>View Bids</button>
                  ) : (
                    <span>{stage.participants}</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {stage.actionText && (
                    <div 
                      onClick={() => { if(stage.name.includes('Live RFQ')) handleViewBids(event.id || event.refId) }}
                      style={{ 
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px',
                      backgroundColor: stage.actionType === 'warning' ? '#fff7ed' : stage.actionType === 'success' ? '#f0fdf4' : '#fff',
                      border: `1px solid ${stage.actionType === 'warning' ? '#fed7aa' : stage.actionType === 'success' ? '#bbf7d0' : '#e5e7eb'}`,
                      color: stage.actionType === 'warning' ? '#c2410c' : stage.actionType === 'success' ? '#15803d' : '#374151',
                      cursor: stage.name.includes('Live RFQ') ? 'pointer' : 'default'
                    }}>
                      <span style={{ fontSize: '0.8rem' }}>{stage.actionText}</span>
                      <span style={{ 
                        backgroundColor: stage.actionType === 'warning' ? '#ffedd5' : stage.actionType === 'success' ? '#dcfce7' : '#f3f4f6', 
                        color: stage.actionType === 'warning' ? '#ea580c' : stage.actionType === 'success' ? '#166534' : '#6b7280',
                        padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' 
                      }}>
                        {stage.actionBadge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* View Bids Modal */}
      {selectedEventId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', width: '600px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Event Bids: {selectedEventId}</h2>
              <button onClick={() => setSelectedEventId(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>&times;</button>
            </div>

            {isBidsLoading ? (
              <p>Loading bids...</p>
            ) : bids.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No bids have been submitted yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', color: '#374151' }}>Vendor Name</th>
                    <th style={{ padding: '12px', color: '#374151' }}>Date</th>
                    <th style={{ padding: '12px', color: '#374151' }}>Bid Amount</th>
                    <th style={{ padding: '12px', color: '#374151', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid, i) => (
                    <tr key={bid.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{bid.vendorName || 'Vendor'} {i === 0 ? <span style={{color: '#10b981', fontSize: '0.75rem', marginLeft: '4px'}}>(Best)</span> : ''}</td>
                      <td style={{ padding: '12px', color: '#6b7280' }}>{new Date(bid.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>${bid.amount.toLocaleString()}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleAward(bid)}
                          style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Award & Create PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
