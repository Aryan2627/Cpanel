"use client";
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function ClickTracker() {
  const pathname = usePathname();
  const clickBuffer = useRef<any[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Extract meaningful information about what was clicked
      const clickData = {
        tag: target.tagName,
        text: target.innerText?.substring(0, 50) || target.getAttribute('aria-label') || target.getAttribute('placeholder') || 'Unknown',
        id: target.id || undefined,
        className: typeof target.className === 'string' ? target.className : undefined,
        x: e.clientX,
        y: e.clientY,
        path: pathname,
        timestamp: new Date().toISOString()
      };

      clickBuffer.current.push(clickData);

      // Flush if buffer gets large
      if (clickBuffer.current.length >= 5) {
        flushClicks();
      }
    };

    const flushClicks = () => {
      if (clickBuffer.current.length === 0) return;
      const batch = [...clickBuffer.current];
      clickBuffer.current = []; // clear immediately

      // Send to telemetry endpoint silently
      fetch('/api/telemetry/clickstream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clicks: batch }),
        keepalive: true // Ensure it sends even if page unloads
      }).catch(err => {
        // Silently swallow network errors to avoid polluting console
      });
    };

    // Flush periodically
    const interval = setInterval(flushClicks, 10000);

    // Flush on page unload
    window.addEventListener('beforeunload', flushClicks);
    document.addEventListener('click', handleClick, { capture: true, passive: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      window.removeEventListener('beforeunload', flushClicks);
      clearInterval(interval);
      flushClicks(); // final flush on unmount
    };
  }, [pathname]);

  return null;
}
