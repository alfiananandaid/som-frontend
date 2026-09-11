const CACHE_NAME = 'som-cache-v2.2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/app.css',
    './js/app.js',
    './manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Langsung ambil alih control
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
    // Jangan cache request API POST ke Google Apps Script
    if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) return; 

    event.respondWith(
        caches.match(event.request).then(response => {
            // Jika ada di cache, gunakan. Jika tidak, fetch dari network.
            return response || fetch(event.request).catch((err) => {
                console.warn('Network offline atau gagal load:', event.request.url);
                // WAJIB mengembalikan objek Response agar browser tidak crash
                return Response.error(); 
            });
        })
    );
});
