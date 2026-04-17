/* مملكة أبا مالك - الإصدار v7.7 (2026) 🚀
   نظام التحديث الإجباري - فتح بوابات المملكة
*/

// تغيير هذا الاسم هو "التعويذة" التي تمسح الذاكرة القديمة وتلغي البوابة
const cacheName = 'aba-malik-bypass-v7.7'; 

const assets = [
  './',
  './index.html?v=7.7',
  './posts.html',
  './prayer.html', 
  './app.js?v=7.7', 
  './manifest.json?v=7.7',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت: تحميل النسخة الجديدة المفتوحة
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تحديث المملكة إلى 7.7 وفتح البوابات...');
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('فشل تحميل مورد:', url));
        })
      );
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل: تنظيف شامل لذاكرة الهاتف من الإصدارات القديمة
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => {
            console.log('SW: تم حذف الكاش القديم:', key);
            return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); 
});

// 3. الجلب: الشبكة أولاً لضمان عدم ظهور شاشة الدخول القديمة
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

// 4. نظام الإشعارات الملكية
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
                                      
