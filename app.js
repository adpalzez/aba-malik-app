// 1. إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSy...", // ضع بياناتك الحقيقية هنا
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
firebase.firestore().enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') console.warn("التخزين المحلي يعمل في تبويب واحد فقط.");
    else if (err.code == 'unimplemented') console.warn("المتصفح لا يدعم التخزين المحلي.");
  });

// 4. تسجيل الـ Service Worker (sw.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker: تم التسجيل بنجاح'))
      .catch(err => console.log('Service Worker: فشل التسجيل', err));
  });
}

// --- 5. نظام الإحصائيات ونبض التطبيق ---

function logVisit() {
  db.collection('analytics').add({
    type: 'تصفح',
    device: navigator.userAgent.substring(0, 50),
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
}

window.addEventListener('appinstalled', () => {
  db.collection('analytics').add({
    type: 'تحميل وتثبيت',
    time: firebase.firestore.FieldValue.serverTimestamp()
  });
});

function getAnalytics() {
  const viewElem = document.getElementById('viewCount');
  const installElem = document.getElementById('installCount');

  if (viewElem) {
    db.collection('analytics').where('type', '==', 'تصفح')
      .onSnapshot(snap => { viewElem.innerText = snap.size; });
  }
  if (installElem) {
    db.collection('analytics').where('type', '==', 'تحميل وتثبيت')
      .onSnapshot(snap => { installElem.innerText = snap.size; });
  }
}

// --- 6. نظام التقييم بالنجوم (الجديد) ---

let userRating = 0;

function openRating() {
    const modal = document.getElementById('ratingModal');
    if(modal) modal.classList.replace('hidden', 'flex');
}

function closeRating() {
    const modal = document.getElementById('ratingModal');
    if(modal) modal.classList.replace('flex', 'hidden');
}

function setRating(n) {
    userRating = n;
    const stars = document.querySelectorAll('.star-btn');
    stars.forEach((star, i) => {
        if (i < n) {
            star.classList.replace('far', 'fas');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.replace('fas', 'far');
            star.classList.remove('text-yellow-400');
        }
    });
    
    const btn = document.getElementById('submitRatingBtn');
    if(btn) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function submitRating() {
    if (userRating === 0) return;

    db.collection('ratings').add({
        stars: userRating,
        time: firebase.firestore.FieldValue.serverTimestamp(),
        device: navigator.userAgent.substring(0, 30)
    }).then(() => {
        alert("شكراً لتقييمك يا أبا مالك! تم استلام النجوم بنجاح.");
        closeRating();
        
        // تسجيل التقييم كنشاط في الإحصائيات
        db.collection('analytics').add({
            type: 'تقييم نجوم',
            value: userRating,
            time: firebase.firestore.FieldValue.serverTimestamp()
        });
    }).catch(err => console.error("خطأ في التقييم:", err));
}

// --- 7. وظيفة جلب المنشورات ---

const postsContainer = document.querySelector('.posts-container');

function getPosts() {
  db.collection('posts').orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      if (postsContainer) {
        postsContainer.innerHTML = ''; 
        snapshot.forEach((doc) => {
          const post = doc.data();
          renderPost(post, doc.id);
        });
      }
    }, (err) => console.log('خطأ في جلب البيانات:', err.message));
}

function renderPost(post, id) {
  const html = `
    <div class="bg-white p-4 rounded-lg shadow-md mb-4 animate__animated animate__fadeIn" data-id="${id}">
      <div class="flex items-center mb-2">
        <img src="${post.userImage || 'https://via.placeholder.com/40'}" class="w-10 h-10 rounded-full border">
        <div class="mr-3">
          <h3 class="font-bold text-gray-800">${post.userName || 'مستخدم'}</h3>
          <p class="text-xs text-gray-500">${post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString('ar-EG') : ''}</p>
        </div>
      </div>
      <p class="text-gray-700 leading-relaxed">${post.content}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="mt-3 rounded-lg w-full h-auto">` : ''}
    </div>
  `;
  if (postsContainer) postsContainer.innerHTML += html;
}

// --- 8. تشغيل كل شيء عند التحميل ---

document.addEventListener('DOMContentLoaded', () => {
  logVisit();      
  getAnalytics();  
  if (postsContainer) getPosts();
});
      
