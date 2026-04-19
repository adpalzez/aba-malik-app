/* مملكة أبا مالك - الإصدار v14.0 (2026) 
   نظام التحديث الإجباري والمزامنة الفائقة الشاملة
*/

// تحديث اسم الكاش إلى v14.0 لإدراج محرك المصاحف الجديد quran.js
const cacheName = 'aba-malik-royal-v14.0'; 

const assets = [
  './',
  './index.html?v=14.0',
  './mosque.html?v=14.0', 
  './azkar.html?v=14.0',
  './quran.js?v=14.0', // تم إضافة المحرك المستقل للمصاحف
  './app.js?v=14.0',
  './manifest.json?v=14.0',
  './sw.js?v=14.0',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت (Install): تحميل ملفات v14.0 في ذاكرة الهاتف للعمل بدون إنترنت
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تحديث المحراب الملكي إلى v14.0...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل (Activate): مسح كاش v13.5 وكافة النسخ القديمة فوراً
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

// 3. الجلب (Fetch): استراتيجية "الشبكة أولاً" لضمان التحديث اللحظي للمواقيت
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(cacheName).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) // العمل من الذاكرة عند انقطاع الإنترنت
  );
});

// 4. نظام التنبيهات: فتح المحراب عند الضغط على الإشعارات
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
                      
