const CACHE_NAME = 'aba-malik-royal-v20.0'; 

// جميع ملفات التطبيق والمكتبات الخارجية والصور
const assets = [
  './',
  './index.html',
  './mosque.html', 
  './quran.js',
  './app.js',
  './manifest.json',
  './tajweed.html',
  './fatawa.html',
  './hadith.html',
  './azkar.html',
  './quran-read.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
  self.skipWaiting(); 
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.aladhan.com') || e.request.url.includes('api.hadith.gading.dev') || e.request.url.includes('api.alquran.cloud')) {
     return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('notificationclick', event => {
    event.notification.close(); 
    event.waitUntil(clients.openWindow('./mosque.html'));
});
    
