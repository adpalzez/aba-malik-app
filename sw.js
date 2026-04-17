/* مملكة أبا مالك - الإصدار v6.3 (2026)
   نظام العمل أوفلاين مع خاصية التحديث الإجباري
*/

// تغيير هذا الاسم هو المفتاح لرؤية التحديثات فوراً
const cacheName = 'aba-malik-v6.3'; 

const assets = [
  './',
  './index.html',
  './posts.html',
  './prayer.html', 
  './wisdoms.js?v=6.3',
  './app.js?v=6.3',
  './manifest.json?v=6.3',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت: تحميل النسخة الجديدة
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تحديث موارد المملكة إلى v6.3...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // إجبار المتصفح على الانتقال للنسخة الجديدة فوراً
});

// 2. التفعيل: مسح كل "المخلفات" والنسخ القديمة (v4، v5 وغيرها)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => {
            console.log('SW: تنظيف النسخة القديمة المؤرشفة:', key);
            return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); // السيطرة على المتصفح فوراً
});

// 3. الجلب: استراتيجية "الشبكة أولاً" لملفات البرمجة و "الكاش أولاً" للصور
self.addEventListener('fetch', e => {
  // إذا كان الطلب لملف برمجي، ابحث في الشبكة أولاً لضمان التحديث
  if (e.request.url.includes('.js') || e.request.url.includes('.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  } else {
    // للصور والخطوط، استخدم الكاش للسرعة
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});

// --- 4. نظام الإشعارات الملكية ---
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 
    if (event.action !== 'close') {
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
    }
});
                                                  
