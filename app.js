// ==========================================
// 1. إعدادات وتدشين Firebase
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...", // ضع بياناتك الحقيقية هنا
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// تفعيل خاصية العمل بدون إنترنت (Offline Persistence)
db.enablePersistence().catch((err) => {
    console.warn("Persistence Error:", err.code);
});

// تسجيل الـ Service Worker لتثبيت التطبيق (PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Error:', err));
    });
}

// ==========================================
// 2. إدارة المظهر (Dark/Light Mode)
// ==========================================
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) {
            icon.classList.toggle('fa-sun');
            icon.classList.toggle('fa-moon');
        }
    });
}

// ==========================================
// 3. نظام الإحصائيات (شريط النبض الحي)
// ==========================================
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

// ==========================================
// 4. نظام التقييم المطور (نجوم + تعليق)
// ==========================================
let userRating = 0;
const ratingModal = document.getElementById('ratingModal');
const submitBtn = document.getElementById('submitRatingBtn');
const starBtns = document.querySelectorAll('.star-btn');
const ratingComment = document.getElementById('ratingComment');

function openRating() {
    if (localStorage.getItem('hasRated')) {
        alert("لقد قمت بالتقييم مسبقاً، شكراً لك!");
        return;
    }
    if (ratingModal) ratingModal.classList.replace('hidden', 'flex');
}

function closeRating() {
    if (ratingModal) ratingModal.classList.replace('flex', 'hidden');
    resetRating();
}

// ربط أزرار النجوم
starBtns.forEach((star) => {
    star.onclick = (e) => {
        userRating = parseInt(e.currentTarget.getAttribute('data-value'));
        updateStars(userRating);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    };

    star.onmouseenter = (e) => {
        const hoverValue = parseInt(e.currentTarget.getAttribute('data-value'));
        updateStars(hoverValue, true);
    };

    star.onmouseleave = () => {
        updateStars(userRating);
    };
});

function updateStars(rating, isHover = false) {
    starBtns.forEach((s, i) => {
        const starValue = i + 1;
        if (starValue <= rating) {
            s.classList.replace('far', 'fas');
            s.classList.add(isHover ? 'text-yellow-200' : 'text-yellow-400');
            s.classList.remove('text-gray-500');
        } else {
            s.classList.replace('fas', 'far');
            s.classList.add('text-gray-500');
            s.classList.remove('text-yellow-400', 'text-yellow-200');
        }
    });
}

function resetRating() {
    userRating = 0;
    if (ratingComment) ratingComment.value = "";
    updateStars(0);
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

if (submitBtn) {
    submitBtn.onclick = async () => {
        if (userRating === 0) return;
        const originalText = submitBtn.innerText;
        const comment = ratingComment ? ratingComment.value.trim() : "";

        submitBtn.innerText = "جاري الحفظ...";
        submitBtn.disabled = true;

        try {
            await db.collection('ratings').add({
                stars: userRating,
                comment: comment || "بدون تعليق",
                time: firebase.firestore.FieldValue.serverTimestamp(),
                device: navigator.userAgent.substring(0, 30)
            });

            localStorage.setItem('hasRated', 'true');

            ratingModal.querySelector('.glass').innerHTML = `
                <div class="py-10 animate__animated animate__fadeIn">
                    <i class="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                    <h3 class="text-2xl font-black mb-2">تم الاستلام!</h3>
                    <p class="text-gray-400 text-sm">شكراً لك على دعمك يا أبا مالك.</p>
                    <button onclick="location.reload()" class="mt-8 bg-white text-black px-8 py-2 rounded-full font-bold shadow-lg">إغلاق</button>
                </div>`;
            
            db.collection('analytics').add({ type: 'تقييم مكتمل', value: userRating, time: firebase.firestore.FieldValue.serverTimestamp() });
        } catch (error) {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            alert("خطأ في الاتصال بالقاعدة.");
        }
    };
}

// ربط أزرار الفتح والإغلاق يدوياً
const openBtn = document.getElementById('ratingBtn');
const closeBtn = document.getElementById('closeRating');
if (openBtn) openBtn.onclick = openRating;
if (closeBtn) closeBtn.onclick = closeRating;

// ==========================================
// 5. نظام المنشورات الحية
// ==========================================
const postsContainer = document.querySelector('.posts-container');

function getPosts() {
    db.collection('posts').orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (postsContainer) {
                postsContainer.innerHTML = '';
                snapshot.forEach((doc) => {
                    renderPost(doc.data(), doc.id);
                });
            }
        }, (err) => console.log('Firestore Error:', err.message));
}

function renderPost(post, id) {
    const html = `
    <div class="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 mb-6 animate__animated animate__fadeInUp" data-id="${id}">
      <div class="flex items-center mb-3">
        <img src="${post.userImage || 'https://i.ibb.co/pBhzxHdM/1000027317.jpg'}" class="w-10 h-10 rounded-full border border-white/20">
        <div class="mr-3">
          <h3 class="font-bold text-white text-sm">${post.userName || 'أبا مالك العقيلي'}</h3>
          <p class="text-[10px] text-gray-400">${post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString('ar-EG') : 'الآن'}</p>
        </div>
      </div>
      <p class="text-gray-200 text-sm leading-relaxed">${post.content}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" class="mt-3 rounded-2xl w-full h-48 object-cover border border-white/10">` : ''}
    </div>`;
    if (postsContainer) postsContainer.insertAdjacentHTML('beforeend', html);
}

// ==========================================
// 6. التشغيل عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    logVisit();
    getAnalytics();
    if (postsContainer) getPosts();
});
  
