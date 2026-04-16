/* مملكة أبا مالك - الإصدار v4 (2026)
   نظام العمل أوفلاين وإدارة الإشعارات المتقدمة
*/

const cacheName = 'aba-malik-v4'; 

// قائمة الملفات المحدثة للعمل بدون إنترنت (Assets)
const assets = [
  './',
  './index.html',
  './posts.html',
  './prayer.html', 
  './install.js',
  './wisdoms.js',
  './app.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. حدث التثبيت (Install): حفظ الملفات في ذاكرة الكاش
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري تأمين ملفات المملكة للعمل أوفلاين (v4)...');
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('SW: فشل تحميل مورد:', url, err));
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. حدث التفعيل (Activate): تنظيف النسخ القديمة فوراً
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => {
            console.log('SW: جاري حذف الكاش القديم:', key);
            return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. حدث جلب البيانات (Fetch): جلب من الكاش أولاً للسرعة
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        // إذا انقطع الإنترنت، وجّه المستخدم دائماً للصفحة الرئيسية
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// --- 4. نظام إدارة الإشعارات الملكية ---

self.addEventListener('notificationclick', function(event) {
    // إغلاق الإشعار فور الضغط عليه
    event.notification.close(); 

    // إذا ضغط المستخدم على زر "إغلاق" (إن وجد)
    if (event.action === 'close') {
        return; 
    } else {
        // إذا ضغط على الإشعار، يتم فتحه في نافذة التطبيق
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(windowClients => {
                // البحث عن نافذة مفتوحة للتطبيق والتركيز عليها
                for (let i = 0; i < windowClients.length; i++) {
                    let client = windowClients[i];
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                // إذا كان التطبيق مغلقاً تماماً، افتح صفحة المسجد (أو الرئيسية)
                if (clients.openWindow) {
                    return clients.openWindow('./prayer.html');
                }
            })
        );
    }
});
                      
