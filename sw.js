/* مملكة أبا مالك - الإصدار v7.1 (2026) 🚀
   نظام التحديث الإجباري الشامل - الانتقال للمحرك الموحد
*/

// تغيير هذا الاسم هو "التعويذة" التي تمسح الذاكرة القديمة فوراً
const cacheName = 'aba-malik-v7.1'; 

const assets = [
  './',
  './index.html',
  './posts.html',
  './prayer.html', 
  './login.html',
  './app.js?v=7.1', // ربط مع رقم إصدار المحرك الجديد
  './manifest.json?v=7.1',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت: تحميل النسخة الملكية الجديدة
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تحديث المملكة إلى الإصدار 7.1...');
      // استخدام addAll بحذر لضمان عدم توقف الخدمة إذا فشل ملف واحد
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('فشل تحميل مورد:', url));
        })
      );
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل: طرد الأرواح القديمة (v4, v6.3, إلخ)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => {
            console.log('SW: تم حذف الكاش القديم بنجاح:', key);
            return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); 
});

// 3. الجلب الذكي: الشبكة أولاً للملفات البرمجية لضمان التحديث اللحظي
self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // استراتيجية التحديث الفوري لملفات البرمجيات
  if (url.includes('.js') || url.includes('.html') || url.includes('manifest')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // تحديث الكاش في الخلفية بالنسخة الجديدة
          const clone = res.clone();
          caches.open(cacheName).then(cache => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // الكاش أولاً للصور والخطوط لتوفير البيانات والسرعة
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});

// --- 4. نظام الإشعارات الملكية ---
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
                      
