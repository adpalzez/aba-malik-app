/* مملكة أبا مالك - الإصدار v7.9 (2026) 🚀
   نظام التحديث الإجباري والمزامنة الملكية
*/

const cacheName = 'aba-malik-royal-v7.9'; 

const assets = [
  './',
  './index.html?v=7.9',
  './mosque.html',
  './azkar.html?v=7.9',
  './posts.html',
  './prayer.html', 
  './app.js?v=7.9', 
  './manifest.json?v=7.9',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. التثبيت: تحميل النسخة الجديدة وضمان حفظ ركن المسجد والأذكار
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تجهيز محراب أبا مالك 7.9...');
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('فشل حفظ المورد في المملكة:', url));
        })
      );
    })
  );
  self.skipWaiting(); 
});

// 2. التفعيل: مسح أي مخلفات برمجية قديمة (التحديث الإجباري)
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

// 3. الجلب: نظام "الشبكة أولاً" للملفات الحساسة لضمان التحديث اللحظي
self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // تحديث تلقائي للملفات البرمجية عند توفر إنترنت
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
    // الصور والموارد الثابتة تُجلب من الكاش لتوفير البيانات
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
  }
});

// 4. إدارة التنبيهات الملكية (مثل منبه الصلاة)
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
       
