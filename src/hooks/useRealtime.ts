'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom React hook for live real-time synchronization across clients.
 * Subscribes via SSE / WebSockets with automatic smart polling fallback.
 */
export function useRealtime(topic: 'bids' | 'events' | 'approvals' | 'pos' | 'all', onUpdate: (data?: any) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    try {
      eventSource = new EventSource(`/api/realtime?topic=${topic}`);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.topic === topic || topic === 'all' || parsed.event) {
            onUpdateRef.current(parsed);
          }
        } catch {
          onUpdateRef.current();
        }
      };

      eventSource.onerror = () => {
        // Fallback to 5-second smart polling if SSE drops
        if (!pollInterval) {
          pollInterval = setInterval(() => {
            onUpdateRef.current();
          }, 5000);
        }
      };
    } catch {
      pollInterval = setInterval(() => {
        onUpdateRef.current();
      }, 5000);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [topic]);
}
