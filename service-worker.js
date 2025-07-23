// Based off of https://github.com/pwa-builder/PWABuilder/blob/main/docs/sw.js

const CACHE_NAME = 'pwa-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/style.css',
  '/icon-192.png',
  '/icon-512.png'
];

const HOSTNAME_WHITELIST = [
  self.location.hostname,
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'cdn.jsdelivr.net'
];

const getFixedUrl = (req) => {
  const now = Date.now();
  const url = new URL(req.url);

  // 1. Протокол: использовать тот же, что и у сайта (http/https)
  url.protocol = self.location.protocol;

  // 2. Добавить параметр для борьбы с кэшированием (cache-busting)
  if (url.hostname === self.location.hostname) {
    url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  }

  return url.href;
};

self.addEventListener('install', (event) => {
  // Кэшируем основные ресурсы при установке
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('Install failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  // Немедленно активировать нового SW и забрать контроль
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Пропускаем не-HTTP запросы (например, chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  // Пропускаем запросы к хостам из белого списка
  if (HOSTNAME_WHITELIST.includes(url.hostname)) {
    // Стратегия: Stale-while-revalidate
    // Сначала — кэш, параллельно — обновление с сервера

    const cached = caches.match(event.request);
    const fixedUrl = getFixedUrl(event.request);
    const fetched = fetch(fixedUrl, { cache: 'no-store' });
    const fetchedCopy = fetched.then(res => res.clone());

    // Ответ: либо из кэша, либо с сервера
    event.respondWith(
      Promise.race([fetched.catch(() => cached), cached])
        .then(resp => resp || fetched)
        .catch(() => {
          // Если ничего не помогло — можно вернуть заглушку
          if (event.request.destination === 'document') {
            return caches.match('/offline.html'); // опционально
          }
        })
    );

    // Обновляем кэш свежими данными
    event.waitUntil(
      Promise.all([fetchedCopy, caches.open(CACHE_NAME)])
        .then(async ([response, cache]) => {
          if (response && response.ok) {
            await cache.put(event.request, response);
          }
        })
        .catch(console.error)
    );
  }
});