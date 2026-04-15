// اسم الإصدار - قمنا بالترقية لـ v4 لتفعيل الإشعارات والملفات الجديدة
const cacheName = 'aba-malik-v4'; 

// قائمة الملفات المحدثة للعمل بدون إنترنت
const assets = [
  './',
  './index.html',
  './posts.html',
  './prayer.html', // أضفنا ركن المسجد هنا
  './install.js',
  './wisdoms.js', // تأكدنا من الاسم الصحيح (بالجمع)
  './app.js',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. حدث التثبيت
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: حفظ الملفات للعمل أوفلاين...');
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('SW: فشل تحميل:', url, err));
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. حدث التفعيل وتنظيف الكاش القديم
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// 3. حدث جلب البيانات (Offline Support)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// --- 4. نظام إدارة الإشعارات (الجديد) ---

self.addEventListener('notificationclick', function(event) {
    // إذا ضغط المستخدم على زر "إزالة الإشعار"
    if (event.action === 'close') {
        event.notification.close(); 
    } else {
        // إذا ضغط على الإشعار نفسه، يفتح التطبيق ويغلق الإشعار
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(windowClients => {
                // إذا كان التطبيق مفتوحاً أصلاً، نركز عليه
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // إذا كان مغلقاً، نفتح نافذة جديدة
                if (clients.openWindow) {
                    return clients.openWindow('./prayer.html');
                }
            })
        );
        event.notification.close();
    }
});
                      
