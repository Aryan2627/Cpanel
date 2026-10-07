import { EventEmitter } from 'events';

// Global Event Emitter for Realtime WebSocket/SSE Broadcasts across Node processes
const globalEmitter = (global as any).__realtimeEmitter || new EventEmitter();
globalEmitter.setMaxListeners(200);
(global as any).__realtimeEmitter = globalEmitter;

export interface RealtimeMessage {
  id: string;
  topic: 'bids' | 'events' | 'approvals' | 'pos';
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
}

/**
 * Broadcast a real-time database change to all active subscribers
 */
export function broadcastRealtimeEvent(
  topic: 'bids' | 'events' | 'approvals' | 'pos',
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  payload: any
) {
  const msg: RealtimeMessage = {
    id: `rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    topic,
    event,
    payload,
    timestamp: new Date().toISOString(),
  };

  globalEmitter.emit('realtime_change', msg);
  globalEmitter.emit(`topic_${topic}`, msg);

  return msg;
}

export function subscribeRealtime(topic: string, listener: (msg: RealtimeMessage) => void) {
  const eventName = topic === 'all' ? 'realtime_change' : `topic_${topic}`;
  globalEmitter.on(eventName, listener);
  return () => {
    globalEmitter.off(eventName, listener);
  };
}
