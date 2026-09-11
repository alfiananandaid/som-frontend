// service-worker.js
const CACHE_NAME = 'som-cache-v2.1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/app.css',
    './js/app.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
        ))
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) return; 

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                console.warn('Network offline:', event.request.url);
            });
        })
    );
});

