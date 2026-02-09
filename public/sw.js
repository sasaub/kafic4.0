// Service Worker za PWA
// Next.js će automatski servirati ovaj fajl na /sw.js

const CACHE_NAME = 'qr-restaurant-v2';
// Cache-uj samo resurse koji sigurno postoje
const urlsToCache = [
  '/',
  '/manifest.json',
  // Ne cache-uj ikone ako ne postoje - proveri prvo
];

// Install event - cache resurse
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache-uj resurse pojedinačno da ne blokira instalaciju ako neki ne uspe
        return Promise.allSettled(
          urlsToCache.map((url) => {
            return fetch(url)
              .then((response) => {
                // Proveri da li je response OK pre nego što cache-uješ
                if (response && response.ok) {
                  return cache.put(url, response);
                } else {
                  return Promise.resolve(); // Ne blokiraj instalaciju
                }
              })
              .catch((error) => {
                return Promise.resolve(); // Ne blokiraj instalaciju
              });
          })
        );
      })
      .catch((error) => {
        console.error('[SW] Cache open failed:', error);
        // Ne blokiraj instalaciju čak i ako cache ne radi
      })
  );
  // Force activation
  self.skipWaiting();
});

// Fetch event - serve iz cache-a samo za statičke resurse, API pozive ignoriraj
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignoriši API pozive - neka idu direktno na server (NE HAPSI IH!)
  if (url.pathname.startsWith('/api/')) {
    return; // Ne hvataj API pozive - neka idu direktno
  }

  // Ignoriši non-GET request-e
  if (request.method !== 'GET') {
    return;
  }

  // Ignoriši chrome-extension, about:, data: itd.
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Za statičke resurse, probaj cache prvo, pa network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Ako postoji u cache-u, vrati ga
        if (cachedResponse) {
          return cachedResponse;
        }

        // Ako nema u cache-u, fetch sa servera
        return fetch(request, {
          // Dodaj mode i credentials za bolju kompatibilnost
          mode: 'cors',
          credentials: 'same-origin',
          cache: 'no-cache',
        })
          .then((response) => {
            // Proveri da li je validan response
            if (!response || response.status !== 200) {
              return response;
            }

            // Kloniraj response jer može biti korišćen samo jednom
            const responseToCache = response.clone();

            // Dodaj u cache samo statičke resurse
            if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache).catch((err) => {
                    console.error('[SW] Cache put failed:', err);
                  });
                })
                .catch((err) => {
                  console.error('[SW] Cache open failed:', err);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed for:', request.url, error);
            // Ako fetch ne uspe, vrati error response umesto da baci grešku
            return new Response(JSON.stringify({ error: 'Network error' }), {
              status: 408,
              statusText: 'Request Timeout',
              headers: { 'Content-Type': 'application/json' },
            });
          });
      })
      .catch((error) => {
        console.error('[SW] Cache match failed:', error);
        // Fallback na network request
        return fetch(request).catch((fetchError) => {
          console.error('[SW] Fallback fetch also failed:', fetchError);
          throw fetchError;
        });
      })
  );
});

// Activate event - obriši stare cache-ove
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  return self.clients.claim();
});
