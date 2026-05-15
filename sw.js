const CACHE_NAME = 'aba-malik-royal-v21.0'; 

const assets = [
  './',
  './index.html',
  './mosque.html', 
  './app.js',
  './manifest.json',
  './quran-read.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', e => {
  self.skipWaiting(); 
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
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
  // عدم تخزين روابط الـ API لكي تتحدث مواقيت الصلاة والقرآن دائماً
  if (e.request.url.includes('api.aladhan.com') || e.request.url.includes('api.alquran.cloud')) {
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
