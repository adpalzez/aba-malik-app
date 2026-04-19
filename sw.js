/* مملكة أبا مالك - الإصدار v12.0 (2026) 
   نظام التحديث الإجباري والمزامنة الفائقة
*/

// تم تحديث الإصدار إلى 12.0 لضمان مسح الكاش القديم عند المستخدمين
const cacheName = 'aba-malik-royal-v12.0'; 

const assets = [
  './',
  './index.html?v=12.0',
  './mosque.html?v=12.0', 
  './azkar.html?v=12.0',
  './manifest.json?v=12.0',
  './sw.js?v=12.0',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت: تحميل كافة الملفات في الكاش فوراً
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تجهيز محراب أبا مالك v12.0...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل: حذف الكاش v8.0 وأي كاش قديم فوراً
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => {
            console.log('SW: تم تنظيف النسخة القديمة:', key);
            return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); 
});

// 3. الجلب (Fetch): استراتيجية "الشبكة أولاً" لضمان حصولك على التحديثات
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // إذا نجح الاتصال، قم بتحديث الكاش بالنسخة الجديدة
        const clone = res.clone();
        caches.open(cacheName).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // إذا كنت "أوفلاين"، استخرجها من الكاش
  );
});

// 4. نظام التنبيهات الملكي (عند الضغط على إشعار الصلاة)
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // البحث عن الصفحة المفتوحة بالفعل لتركيزها
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('mosque.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // إذا كانت الصفحة مغلقة، افتح صفحة المسجد
            if (clients.openWindow) return clients.openWindow('./mosque.html');
        })
    );
});
                       
