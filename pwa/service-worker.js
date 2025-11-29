// File: pwa/service-worker.js
// Ini adalah service worker yang SANGAT SEDERHANA.
// Ini akan meng-cache file statis dan halaman utama.

const CACHE_NAME = 'umroh-manager-cache-v1';
const URLS_TO_CACHE = [
  // URL ini harus disesuaikan dengan path *build* React Anda
  // Kita asumsikan path relatif dari service-worker.js
  '/wp-admin/admin.php?page=umroh-manager',
  '../build/index.js',
  // Anda bisa tambahkan URL lain yang penting, misal logo
  '../assets/images/logo-login.png'
];

// 1. Installasi: Simpan file-file penting ke cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        // 'addAll' mungkin gagal jika salah satu file gagal.
        // Untuk production, Anda mungkin ingin 'add' satu per satu.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// 2. Fetch: Ambil dari cache dulu, baru network
self.addEventListener('fetch', function(event) {
  // Kita hanya tangani GET request
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Jangan cache API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Jika ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }

        // Jika tidak, ambil dari network
        return fetch(event.request).then(
          function(response) {
            // Jangan cache jika response error
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Penting: Clone response.
            // Response adalah Stream dan hanya bisa dikonsumsi sekali.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

// 3. Activate: Hapus cache lama
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});