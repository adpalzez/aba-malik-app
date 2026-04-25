const CACHE_NAME = 'aba-malik-royal-v15.0'; 

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

// 1. مرحلة التثبيت: حفظ كل الملفات في ذاكرة الهاتف
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
  self.skipWaiting(); 
});

// 2. مرحلة التفعيل: مسح أي ذاكرة قديمة لتوفير مساحة الهاتف
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim(); 
});

// 3. مرحلة التشغيل (الذكاء): 
self.addEventListener('fetch', e => {
  // لا تقم بتخزين طلبات الـ API (مثل مواقيت الصلاة والحديث) لتتحدث دائماً
  if (e.request.url.includes('api.aladhan.com') || e.request.url.includes('api.hadith.gading.dev')) {
     return;
  }

  e.respondWith(
    // حاول فتح الصفحة من الإنترنت أولاً (لضمان أحدث نسخة)
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      // إذا انقطع الإنترنت، افتح الصفحة من الذاكرة المخزنة!
      .catch(() => caches.match(e.request))
  );
});
       // الاستماع لحدث الضغط على التنبيه
self.addEventListener('notificationclick', event => {
    event.notification.close(); // إغلاق التنبيه
    event.waitUntil(
        clients.openWindow('./mosque.html') // فتح المحراب فور الضغط على التنبيه
    );
});
          
