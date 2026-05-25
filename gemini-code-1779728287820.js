const CACHE_NAME = 'safechef-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Запросы к внешнему API кулинарии пропускаем напрямую через сеть
  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  let requestToMatch = event.request;
  if (url.pathname === '/index.html') {
    requestToMatch = new Request('/');
  }
  
  event.respondWith(
    caches.match(requestToMatch).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});