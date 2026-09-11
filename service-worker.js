const CACHE_NAME = 'som-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/app.css',
    './js/config.js',
    './js/api.js',
    './js/auth.js',
    './js/app.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
