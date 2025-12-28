const CACHE_VERSION = 'v1.0.2';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/', '/index.html',
  '/page2.html', '/page3.html',   // ← добавлены страницы
  '/style.css', '/app.js', '/db.js',
  '/manifest.json',
  '/offline.html',
  '/logo_light.png',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-180.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] install');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (![STATIC_CACHE, RUNTIME_CACHE].includes(key)) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // HTML навигация: NetworkFirst + офлайн-фоллбек
  if (request.mode === 'navigate' ||
      request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, resp.clone()));
          return resp;
        })
        .catch(() => caches.match(request).then((resp) => resp || caches.match('/offline.html')))
    );
    return;
  }

  // Изображения: CacheFirst
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((resp) => {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, resp.clone()));
          return resp;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Остальное: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((resp) => {
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, resp.clone()));
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});   
