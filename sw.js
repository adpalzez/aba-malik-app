const cacheName = 'aba-malik-v3'; // رفعنا الإصدار للتحديث
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

// تثبيت مرن
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('جاري حفظ الملفات في الذاكرة...');
      // استخدام حلقة لتجنب تعطل التثبيت في حال فشل ملف واحد
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('فشل تحميل الملف:', url, err));
        })
      );
    })
  );
  self.skipWaiting(); // تفعيل فوري للنسخة الجديدة
});

// تفعيل وتنظيف الذاكرة القديمة
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // السيطرة الفورية على الصفحات المفتوحة
});

// العرض من الذاكرة
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        // إذا فشل النت وكان الطلب لصفحة HTML، يمكننا عرض صفحة "أوفلاين" هنا
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
            
