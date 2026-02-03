'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Uvek registruj service worker - on već ignoriše API pozive
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Proveri za update-e
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Možeš dodati notifikaciju korisniku da refresh-uje stranicu
                }
              });
            }
          });
        })
        .catch((error) => {
          // Samo loguj greške, ne uspešne registracije
          if (error) {
            console.error('[SW] Service Worker registration failed:', error);
          }
        });

      // Listen for updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}
