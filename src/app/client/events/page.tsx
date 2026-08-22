'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Activity, AlertCircle, Clock, CheckCircle2, 
  TrendingUp, BarChart3, Users, Filter, Check, X, 
  ShieldCheck, Edit2, Eye, ChevronDown, Award, FileCheck
} from 'lucide-react';

export default function EventsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('LIVE');
  const [activeStageFilter, setActiveStageFilter] = useState('All Stages');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Modal states for View Bids
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [isBidsLoading, setIsBidsLoading] = useState(false);

  // Edit Time State
  const [editingTimeFor, setEditingTimeFor] = useState<{ eventId: string, sIdx: number } | null>(null);
  const [newTimeVal, setNewTimeVal] = useState('');

  // Mock Events
  const [mockEvents, setMockEvents] = useState<any[]>([
    {
      id: 'mock-1',
      account: 'Enterprise Corp',
      refId: 'RFX-20012',
      itemsCount: 2,
      title: 'Q3 Hardware Refresh',
      stages: [
        {
          name: 'Technical Offer',
          statusIcon: <AlertCircle size={18} color="#f59e0b" />,
          timeText: 'Overdue by 1h',
          timeColor: '#dc2626',
          participants: '1/2',
          participantsColor: '#3b82f6',
          actionText: 'Send for Review',
          actionBadge: '1',
          actionType: 'warning'
        }
      ]
    },
    {
      id: 'mock-2',
      account: 'Global Industries',
      refId: 'RFX-20009',
      itemsCount: 5,
      title: 'Software Licensing Renewal',
      stages: [
        {
          name: 'RFQ Commercials',
          statusIcon: <Clock size={18} color="#3b82f6" />,
          timeText: 'Ends in 11 days',
          timeColor: '#475569',
          participants: '3/5',
          participantsColor: '#10b981',
          actionText: 'Evaluate Quotes',
          actionBadge: '3',
          actionType: 'primary'
        }
      ]
    }
  ]);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map(dbEvent => ({
            id: dbEvent.refId,
            account: dbEvent.account || 'Internal Department',
            refId: dbEvent.refId,
            itemsCount: dbEvent.itemsCount || 1,
            title: dbEvent.title || 'Untitled Sourcing Event',
            endTime: dbEvent.endTime,
            stages: [
              {
                name: 'Live RFQ (Database)',
                statusIcon: <Activity size={18} color="#10b981" />,
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
      let isHistorical = false;
      
      if (event.endTime) {
        isHistorical = now > new Date(event.endTime);
      } else {
        isHistorical = event.stages.every((s: any) => s.timeText && (s.timeText.includes('Ended') || s.timeText.includes('History') || s.timeText.includes('Overdue')));
      }

      if (activeStageFilter === 'Live') {
        matchesStage = event.endTime ? !isHistorical : event.stages.some((s: any) => s.timeText && s.timeText.includes('Live'));
      }

      let matchesTab = true;
      if (activeTab === 'LIVE') {
        matchesTab = !isHistorical;
      } else if (activeTab === 'HISTORY') {
        matchesTab = isHistorical;
      }

      return matchesSearch && matchesStage && matchesTab;
    });
  }, [searchQuery, activeStageFilter, activeTab, allEvents, now]);

  const handleViewBids = async (eventId: string) => {
    router.push(`/client/events/${eventId}`);
  };

  const handleAward = async (bid: any) => {
    try {
      const poRes = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `PO for Event ${selectedEventId}`,
          vendorId: bid.vendorId,
          total: bid.amount,
          eventId: selectedEventId,
          status: 'Draft',
          poNumber: `PO-${Date.now()}`
        })
      });

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

  const saveNewTime = (eventId: string, sIdx: number, isDbEvent: boolean) => {
    if (!newTimeVal) {
      setEditingTimeFor(null);
      return;
    }
    
    if (isDbEvent) {
      setDbEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          const newStages = [...e.stages];
          newStages[sIdx].timeText = `Ends on ${newTimeVal}`;
          newStages[sIdx].timeColor = '#475569';
          return { ...e, stages: newStages };
        }
        return e;
      }));
    } else {
      setMockEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          const newStages = [...e.stages];
          newStages[sIdx].timeText = `Ends on ${newTimeVal}`;
          newStages[sIdx].timeColor = '#475569';
          return { ...e, stages: newStages };
        }
        return e;
      }));
    }
    setEditingTimeFor(null);
  };

  // KPI calculations
  const totalEvents = allEvents.length;
  const liveEvents = allEvents.filter(e => e.stages.some((s: any) => s.timeText.includes('Live') || s.timeText.includes('Ends in'))).length;
  
  // Historical Events definition is exactly what goes into the HISTORY tab
  const historicalEvents = allEvents.filter(e => {
    if (e.endTime) {
      return now > new Date(e.endTime);
    }
    return e.stages.every((s: any) => s.timeText && (s.timeText.includes('Ended') || s.timeText.includes('History') || s.timeText.includes('Overdue')));
  }).length;

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#333', minHeight: '100%', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Sourcing Events</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.875rem' }}>Manage your RFQs, Auctions, and Bids in real-time.</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
            style={{ 
              backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', 
              padding: '8px 16px', fontWeight: '500', display: 'flex', alignItems: 'center', 
              gap: '8px', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            <Plus size={16} /> Create Event
            <span style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '8px', marginLeft: '4px', display: 'flex', alignItems: 'center' }}>
              <ChevronDown size={14} />
            </span>
          </button>
          
          {isCreateMenuOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 50, minWidth: '200px', overflow: 'hidden' }}>
              <div onClick={() => router.push('/client/events/create/single-stage')} style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}>
                <FileCheck size={16} color="#64748b" /> Single Stage Event
              </div>
              <div onClick={() => router.push('/client/events/create/auction')} style={{ padding: '12px 16px', fontSize: '0.875rem', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s', borderTop: '1px solid #f1f5f9' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}>
                <TrendingUp size={16} color="#64748b" /> Reverse Auction
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Events', value: totalEvents, icon: BarChart3, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Live Events', value: liveEvents, icon: Activity, color: '#10b981', bg: '#ecfdf5' },
          { label: 'History Events', value: historicalEvents, icon: Clock, color: '#8b5cf6', bg: '#f5f3ff' },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{stat.label}</p>
              <h3 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 600 }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0 16px' }}>
          {['LIVE', 'HISTORY'].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '16px 24px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                color: activeTab === tab ? '#2563eb' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s', letterSpacing: '0.5px'
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Filters Area */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', width: '300px' }}>
            <div style={{ padding: '0 12px' }}><Search size={16} color="#94a3b8" /></div>
            <input 
              type="text" 
              placeholder="Search by Title, Ref ID, or Account..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', padding: '8px 12px 8px 0', outline: 'none', width: '100%', fontSize: '0.875rem', backgroundColor: 'transparent' }} 
            />
          </div>

          {/* Stage Filters */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '4px' }}>
            {['All Stages', 'Live'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveStageFilter(filter)}
                style={{
                  padding: '6px 12px', border: 'none', borderRadius: '4px', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                  backgroundColor: activeStageFilter === filter ? '#fff' : 'transparent',
                  color: activeStageFilter === filter ? '#0f172a' : '#64748b',
                  boxShadow: activeStageFilter === filter ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s, box-shadow 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; e.currentTarget.style.transform = 'none' }}>
                
                {/* Event Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                      <ShieldCheck size={14} color="#94a3b8" /> {event.account} <span style={{ color: '#cbd5e1' }}>•</span> {event.refId} <span style={{ color: '#cbd5e1' }}>•</span> {event.itemsCount} Items
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                      {event.title}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <button style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>View Details</button>
                  </div>
                </div>

                {/* Event Stages */}
                {event.stages.map((stage: any, sIdx: number) => (
                  <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr', alignItems: 'center', padding: '16px 24px', backgroundColor: '#fafaf9', borderBottom: sIdx !== event.stages.length - 1 ? '1px solid #f1f5f9' : 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                    
                    {/* Stage Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, color: '#333' }}>
                      {stage.statusIcon}
                      {stage.name}
                    </div>

                    {/* Time */}
                    <div style={{ color: stage.timeColor, fontWeight: stage.timeColor === '#dc2626' ? 600 : 400, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {editingTimeFor?.eventId === event.id && editingTimeFor?.sIdx === sIdx ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input 
                            type="date" 
                            value={newTimeVal}
                            onChange={e => setNewTimeVal(e.target.value)}
                            style={{ padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', outline: 'none' }}
                          />
                          <button onClick={() => saveNewTime(event.id, sIdx, !!dbEvents.find(e => e.id === event.id))} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', display: 'flex' }}><Check size={14} /></button>
                          <button onClick={() => setEditingTimeFor(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '2px', cursor: 'pointer', display: 'flex' }}><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          {(() => {
                            if (event.endTime) {
                              const end = new Date(event.endTime);
                              const diff = end.getTime() - now.getTime();
                              if (diff <= 0) return <span style={{ color: '#dc2626' }}>Ended</span>;
                              
                              const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                              const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                              const m = Math.floor((diff / 1000 / 60) % 60);
                              const s = Math.floor((diff / 1000) % 60);
                              
                              let timeStr = '';
                              if (d > 0) timeStr = `${d}d ${h}h remaining`;
                              else if (h > 0) timeStr = `${h}h ${m}m remaining`;
                              else timeStr = `${m}m ${s}s remaining`;
                              
                              return <span style={{ color: '#3b82f6', fontWeight: 600 }}>{timeStr}</span>;
                            }
                            return stage.timeText;
                          })()}
                          <button 
                            onClick={() => { setEditingTimeFor({ eventId: event.id, sIdx }); setNewTimeVal(''); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                            title="Edit Event Time"
                          >
                            <Edit2 size={14} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Participants */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stage.participantsColor, fontWeight: 500, fontSize: '0.875rem' }}>
                      <Users size={16} />
                      {stage.name.includes('Live RFQ') ? (
                        <button 
                          onClick={() => handleViewBids(event.id)} 
                          style={{ 
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#ffffff', 
                            cursor: 'pointer', 
                            fontWeight: 600, 
                            padding: '6px 14px', 
                            borderRadius: '99px',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.8rem'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(79, 70, 229, 0.35)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.25)' }}
                        >
                          View Bids <Eye size={14} />
                        </button>
                      ) : (
                        <span>{stage.participants}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {stage.actionText && (
                        <button 
                          onClick={() => { if(stage.name.includes('Live RFQ')) handleViewBids(event.id) }}
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '0.8125rem', border: 'none',
                            backgroundColor: stage.actionType === 'warning' ? '#fee2e2' : stage.actionType === 'success' ? '#dcfce7' : '#eff6ff',
                            color: stage.actionType === 'warning' ? '#b91c1c' : stage.actionType === 'success' ? '#15803d' : '#1d4ed8',
                            cursor: 'pointer', transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          {stage.actionType === 'success' ? <Eye size={14} /> : <AlertCircle size={14} />}
                          {stage.actionText}
                          <span style={{ 
                            backgroundColor: stage.actionType === 'warning' ? '#f87171' : stage.actionType === 'success' ? '#22c55e' : '#3b82f6', 
                            color: '#fff', padding: '2px 6px', borderRadius: '12px', fontSize: '0.7rem' 
                          }}>
                            {stage.actionBadge}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div style={{ padding: '64px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <Activity size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.125rem' }}>No events found</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Try adjusting your search filters or create a new event.</p>
            </div>
          )}
        </div>
      </div>

      {/* View Bids Modal */}
      {selectedEventId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '700px', maxWidth: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'slideUp 0.3s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Award color="#3b82f6" /> Evaluate Bids</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Event Reference: {selectedEventId}</p>
              </div>
              <button onClick={() => setSelectedEventId(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
              {isBidsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', color: '#64748b' }}>
                  <Activity size={32} className="spin-anim" style={{ marginBottom: '16px' }} />
                  <p style={{ margin: 0 }}>Fetching latest bids...</p>
                </div>
              ) : bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                  <Users size={32} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <p style={{ margin: 0 }}>No bids have been submitted by vendors yet.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 8px', color: '#475569', fontWeight: 600 }}>Vendor Name</th>
                      <th style={{ padding: '12px 8px', color: '#475569', fontWeight: 600 }}>Submission Date</th>
                      <th style={{ padding: '12px 8px', color: '#475569', fontWeight: 600 }}>Bid Amount</th>
                      <th style={{ padding: '12px 8px', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, i) => (
                      <tr key={bid.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i === 0 ? '#f0fdf4' : '#fff' }}>
                        <td style={{ padding: '16px 8px', fontWeight: 500, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {bid.vendorName || 'Vendor'} 
                            {i === 0 && <span style={{ backgroundColor: '#22c55e', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>BEST PRICE</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 8px', color: '#64748b' }}>{new Date(bid.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 8px', fontWeight: 600, color: i === 0 ? '#15803d' : '#0f172a', fontSize: '1rem' }}>
                          ${bid.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleAward(bid)}
                            style={{ 
                              padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', 
                              cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <CheckCircle2 size={16} /> Award & Create PO
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin-anim { animation: spin 2s linear infinite; }
      `}} />
    </div>
  );
}
