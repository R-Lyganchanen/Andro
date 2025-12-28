const BASE = '/Andro/';
const CACHE_VERSION = 'v1.0.3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  `${BASE}index.html`,
  `${BASE}page2.html`,
  `${BASE}page3.html`,
  `${BASE}offline.html`,
  `${BASE}style.css`,
  `${BASE}app.js`,
  `${BASE}db.js`,
  `${BASE}manifest.json`,
  `${BASE}icons/icon-180.png`
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
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

  // Работать только в пределах нашего проекта
  if (!url.pathname.startsWith(BASE)) return;

  // HTML: NetworkFirst с офлайн-фоллбеком
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, resp.clone()));
          return resp;
        })
        .catch(() =>
          caches.match(request).then((resp) => resp || caches.match(`${BASE}offline.html`))
        )
    );
    return;
  }

  // Изображения: CacheFirst
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((resp) => {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, resp.clone()));
            return resp;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Остальное: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((resp) => {
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, resp.clone()));
          return resp;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

