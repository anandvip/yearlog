// YearLog Service Worker - v1.0
// Handles offline functionality, caching, and background sync

const CACHE_NAME = 'yearlog-v1.0';
const STATIC_CACHE = 'yearlog-static-v1.0';
const RUNTIME_CACHE = 'yearlog-runtime-v1.0';

// Files to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://raw.githubusercontent.com/anandvip/yearlog/refs/heads/main/ylg.png'
];

// Install event - precache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[SW] Precaching failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests and essential external resources
  if (url.origin === location.origin || url.href.includes('github.com')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
          }

          // Not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response as it can only be consumed once
              const responseToCache = response.clone();

              // Cache successful responses
              caches.open(RUNTIME_CACHE)
                .then((cache) => {
                  console.log('[SW] Caching new resource:', request.url);
                  cache.put(request, responseToCache);
                });

              return response;
            })
            .catch(() => {
              // Network failed, try to serve a meaningful offline response
              if (request.destination === 'document') {
                return caches.match('/');
              }
              
              // For other resources, just fail gracefully
              return new Response('Offline - Resource not available', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
});

// Background sync for future features (e.g., data backup)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'backup-entries') {
    event.waitUntil(
      // Future implementation for cloud backup
      console.log('[SW] Background backup requested')
    );
  }
});

// Push notifications for future features
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Time to add a new memory!',
    icon: 'https://raw.githubusercontent.com/anandvip/yearlog/refs/heads/main/ylg.png',
    badge: 'https://raw.githubusercontent.com/anandvip/yearlog/refs/heads/main/ylg.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open YearLog',
        icon: 'https://raw.githubusercontent.com/anandvip/yearlog/refs/heads/main/ylg.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'https://raw.githubusercontent.com/anandvip/yearlog/refs/heads/main/ylg.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('YearLog Memory Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: 'v1.0'
    });
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker script loaded successfully');
