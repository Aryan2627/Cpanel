"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AutoLogout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only apply auto-logout on authenticated routes
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') return;

    let timeout: NodeJS.Timeout;

    const logout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        // Also clear local storage if any
        localStorage.clear();
        sessionStorage.clear();
        router.push('/login');
      } catch (e) {
        window.location.href = '/login';
      }
    };

    const resetTimeout = () => {
      clearTimeout(timeout);
      // 10 minutes of inactivity
      timeout = setTimeout(logout, 10 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimeout));
      clearTimeout(timeout);
    };
  }, [router, pathname]);

  return null;
}
