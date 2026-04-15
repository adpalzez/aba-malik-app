// 1. إعدادات Firebase الخاصة بمشروعك
// (استبدل القيم أدناه ببياناتك من لوحة تحكم Firebase)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// 2. تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// 3. تفعيل خاصية الثبات (Offline Persistence) 
// هذا الجزء هو المسؤول عن جعل المنشورات تظهر بدون إنترنت
firebase.firestore().enablePersistence()
  .then(() => {
    console.log("تم تفعيل وضع الأوفلاين للبيانات بنجاح!");
  })
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // تعدد التبويبات المفتوحة قد يمنع التفعيل
      console.warn("التخزين المحلي يعمل في تبويب واحد فقط.");
    } else if (err.code == 'unimplemented') {
      // المتصفح لا يدعم الخاصية
      console.warn("المتصفح لا يدعم التخزين المحلي.");
    }
  });

// 4. تسجيل الـ Service Worker (sw.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker: تم التسجيل بنجاح'))
      .catch(err => console.log('Service Worker: فشل التسجيل', err));
  });
}

// 5. وظيفة جلب المنشورات وعرضها (مثال)
const postsContainer = document.querySelector('.posts-container');

function getPosts() {
  // استخدام onSnapshot يضمن تحديث البيانات فوراً عند عودة النت
  db.collection('posts').orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      if (postsContainer) {
        postsContainer.innerHTML = ''; // مسح المحتوى القديم
        snapshot.forEach((doc) => {
          const post = doc.data();
          renderPost(post, doc.id);
        });
      }
    }, (err) => {
      console.log('خطأ في جلب البيانات:', err.message);
    });
}

// 6. وظيفة بناء شكل المنشور (Tailwind CSS)
function renderPost(post, id) {
  const html = `
    <div class="bg-white p-4 rounded-lg shadow-md mb-4 animate__animated animate__fadeIn" data-id="${id}">
      <div class="flex items-center mb-2">
        <img src="${post.userImage || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full border">
        <div class="mr-3">
          <h3 class="font-bold text-gray-800">${post.userName || 'مستخدم'}</h3>
          <p class="text-xs text-gray-500">${new Date(post.createdAt?.toDate()).toLocaleString('ar-EG')}</p>
        </div>
      </div>
      <p class="text-gray-700 leading-relaxed">${post.content}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="mt-3 rounded-lg w-full h-auto">` : ''}
    </div>
  `;
  postsContainer.innerHTML += html;
}

// تشغيل جلب البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  if (postsContainer) getPosts();
});
        
