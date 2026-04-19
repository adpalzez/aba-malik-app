/* مملكة أبا مالك - الإصدار v13.0 (2026) 
   نظام التحديث الإجباري والمزامنة الفائقة
*/

// تحديث اسم الكاش لضمان مسح v12.0 وتحميل v13.0 الجديد
const cacheName = 'aba-malik-royal-v13.0'; 

const assets = [
  './',
  './index.html?v=13.0',
  './mosque.html?v=13.0', 
  './azkar.html?v=13.0',
  './manifest.json?v=13.0',
  './sw.js?v=13.0',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت (Install): جلب النسخة الجديدة v13.0
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تجهيز محراب أبا مالك v13.0...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل (Activate): مسح كاش v12.0 وكافة النسخ القديمة
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

// 3. الجلب (Fetch): استراتيجية الشبكة أولاً لضمان التحديث
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(cacheName).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// 4. نظام التنبيهات: فتح صفحة المحراب مباشرة عند الضغط
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('mosque.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow('./mosque.html');
        })
    );
});
     
