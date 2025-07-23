const CACHE_NAME = 'my-pwa-cache-v3';
const BASE_PATH = ''; // Убедитесь, что путь правильный

const urlsToCache = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/style.css',
  BASE_PATH + '/fairies.html',
  BASE_PATH + '/herbalism.html',
  BASE_PATH + '/contacts.html',
  BASE_PATH + '/outdoor.html',
  BASE_PATH + '/site1.png',
  BASE_PATH + '/site2.png'
  // Добавьте другие ресурсы по мере необходимости
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => console.error('Ошибка кэширования в install:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then(networkResponse => {
            // Проверяем, можно ли кэшировать ответ
            if (!networkResponse ||  networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone))
              .catch(err => console.error('Ошибка сохранения в кэш:', err));

            return networkResponse;
          })
          .catch(() => {
            // Опционально: оффлайн-страница
            return caches.match('/offline.html') || new Response('Нет подключения к интернету');
          });
      })
  );
});