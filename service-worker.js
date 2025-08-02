const CACHE_NAME = 'ukur-pwa-v2';
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    'icon-192x192.png',
    'icon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // claim all clients immediately
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('[Service Worker] Serving from cache:', event.request.url);
                    return response;
                }
                console.log('[Service Worker] Fetching from network:', event.request.url);
                return fetch(event.request).catch(() => {
                    console.error('[Service Worker] Fetch failed:', event.request.url);
                    return new Response('Offline Content is not available.');
                });
            })
    );
});