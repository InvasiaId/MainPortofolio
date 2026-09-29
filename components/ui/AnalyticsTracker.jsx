'use client';

import { useEffect } from 'react';

export default function AnalyticsTracker() {
  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent;
      if (/Mobile|Android|iPhone/i.test(ua)) return 'Ponsel';
      if (/Tablet|iPad/i.test(ua)) return 'Tablet';
      return 'Komputer';
    };

    const detectBrowser = () => {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
      if (ua.includes('Edg')) return 'Edge';
      return 'Lainnya';
    };

    const sessionId = sessionStorage.getItem('sid') || (() => {
      const id = Math.random().toString(36).slice(2);
      sessionStorage.setItem('sid', id);
      return id;
    })();

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        referrer: document.referrer || null,
        device: detectDevice(),
        browser: detectBrowser(),
        sessionId,
      }),
    }).catch(() => {});

    // Global error handler
    const handleError = (event) => {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorMessage: event.message || 'Kesalahan tidak diketahui',
          errorStack: event.error?.stack || null,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {});
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return null;
}
