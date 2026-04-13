const cacheName = 'aba-malik-v2'; // قمنا بتغيير الإصدار هنا لتنشيط التحديث
const assets = [
  './',
  './index.html',
  './posts.html',
  './install.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// تثبيت وحفظ الملفات
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      // استخدام addAll بحذر، وإضافة ملفاتك الأساسية
      return cache.addAll(assets);
    })
  );
});

// تفعيل النسخة الجديدة وحذف القديمة
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key !== cacheName).map(key => caches.delete(key)));
    })
  );
});

// العرض من الذاكرة عند انقطاع النت
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
    
