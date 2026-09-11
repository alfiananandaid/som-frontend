const CACHE_NAME = 'som-cache-v1.1'; // Naikkan versi cache
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
    self.skipWaiting(); // Memaksa service worker baru langsung aktif
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // PENTING: Jangan intercept request API (POST) atau request ke Google Apps Script
    if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) {
        return; 
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch((err) => {
                console.warn('Network offline atau gagal load:', event.request.url);
                // Biarkan jalan terus tanpa melempar error yang membuat UI blank
            });
        })
    );
});
