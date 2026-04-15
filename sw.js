// اسم الإصدار - يفضل رفعه عند كل تحديث جوهري للملفات
const cacheName = 'aba-malik-v3'; 

// قائمة الملفات المراد تخزينها للعمل بدون إنترنت (Offline)
const assets = [
  './',
  './index.html',
  './posts.html',
  './install.js',
  './wisdom.js', // تم الدمج هنا لضمان عمل برمجة الحكم أوفلاين
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.ibb.co/pBhzxHdM/1000027317.jpg'
];

// 1. حدث التثبيت (Install Event)
// يتم فيه فتح الكاش وحفظ الملفات
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: جاري حفظ الملفات في الذاكرة المؤقتة...');
      // استخدام Promise.all لضمان استمرار التثبيت حتى لو فشل تحميل ملف واحد
      return Promise.all(
        assets.map(url => {
          return cache.add(url).catch(err => console.error('SW: فشل تحميل الملف:', url, err));
        })
      );
    })
  );
  self.skipWaiting(); // تفعيل النسخة الجديدة فوراً بمجرد انتهاء التثبيت
});

// 2. حدث التفعيل (Activate Event)
// يتم فيه تنظيف أي كاش قديم بأسماء مختلفة (V1, V2...)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // السيطرة الفورية على جميع الصفحات المفتوحة
});

// 3. حدث جلب البيانات (Fetch Event)
// استراتيجية "الكاش أولاً" لضمان السرعة وتوفير البيانات
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      // إذا وجد الملف في الكاش نعرضه، وإلا نقوم بطلبه من الإنترنت
      return res || fetch(e.request).catch(() => {
        // في حال فشل الإنترنت وكان المستخدم يتصفح صفحات الموقع
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
