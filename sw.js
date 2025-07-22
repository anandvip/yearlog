const CACHE_NAME = 'yearlog-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  'https://raw.githubusercontent.com/anandvip/yearlog/refs/heads/main/ylg.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
