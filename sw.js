/* مملكة أبا مالك - الإصدار v8.0 (2026) 🚀
   نظام التحديث الإجباري والمزامنة الملكية
*/

// تغيير رقم الإصدار هنا يجبر المتصفح على مسح الكاش القديم وتحميل العداد الجديد
const cacheName = 'aba-malik-royal-v8.0'; 

const assets = [
  './',
  './index.html?v=8.0',
  './mosque.html?v=8.0', // تحديث نسخة المسجد
  './azkar.html?v=8.0',
  './app.js?v=8.0', 
  './manifest.json?v=8.0',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت: تحميل النسخة الجديدة وضمان حفظ العداد المصلح
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تحديث المملكة إلى الإصدار 8.0...');
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('فشل حفظ المورد في المملكة:', url));
        })
      );
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل: تنظيف شامل لأي كاش قديم تسبب في تعطل العداد
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => {
            console.log('SW: تم إزالة النسخة القديمة:', key);
            return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); 
});

// 3. الجلب: استراتيجية "الشبكة أولاً" لضمان التحديث اللحظي
self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  if (url.includes('.js') || url.includes('.html') || url.includes('manifest')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(cacheName).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});

// 4. إدارة التنبيهات الملكية
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                if (client.url.includes('/') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow('./index.html');
        })
    );
});
                   
