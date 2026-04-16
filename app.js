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

// تهيئة التطبيق
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// تفعيل خاصية العمل بدون إنترنت
db.enablePersistence().catch((err) => {
    console.warn("Persistence Error:", err.code);
});

// تسجيل الـ Service Worker (PWA)
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
const submitRatingBtn = document.getElementById('submitRatingBtn');
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

// تفاعل النجوم
starBtns.forEach((star) => {
    star.onclick = (e) => {
        userRating = parseInt(e.currentTarget.getAttribute('data-value'));
        updateStars(userRating);
        if (submitRatingBtn) {
            submitRatingBtn.disabled = false;
            submitRatingBtn.classList.remove('opacity-50', 'cursor-not-allowed');
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
    if (submitRatingBtn) {
        submitRatingBtn.disabled = true;
        submitRatingBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

if (submitRatingBtn) {
    submitRatingBtn.onclick = async () => {
        if (userRating === 0) return;
        const originalText = submitRatingBtn.innerText;
        const comment = ratingComment ? ratingComment.value.trim() : "";

        submitRatingBtn.innerText = "جاري الحفظ...";
        submitRatingBtn.disabled = true;

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
                    <p class="text-gray-400 text-sm px-6">شكراً لك على دعمك يا أبا مالك.</p>
                    <button onclick="location.reload()" class="mt-8 bg-white text-black px-8 py-2 rounded-full font-bold shadow-lg">إغلاق</button>
                </div>`;
            
            db.collection('analytics').add({ type: 'تقييم مكتمل', value: userRating, time: firebase.firestore.FieldValue.serverTimestamp() });
        } catch (error) {
            submitRatingBtn.innerText = originalText;
            submitRatingBtn.disabled = false;
            alert("خطأ في الاتصال بالقاعدة.");
        }
    };
}

// ربط أزرار الفتح والإغلاق
const ratingBtn = document.getElementById('ratingBtn');
const closeRatingBtn = document.getElementById('closeRating');
if (ratingBtn) ratingBtn.onclick = openRating;
if (closeRatingBtn) closeRatingBtn.onclick = closeRating;


// ==========================================
// 5. نظام المنشورات (عرض + إضافة)
// ==========================================
const postsContainer = document.querySelector('.posts-container');

// جلب المنشورات وعرضها
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
    <div class="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 mb-6 animate__animated animate__fadeInUp" data-id="${id}">
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

// دالة إضافة منشور جديد (خاصة بأبا مالك)
async function addNewPost() {
    const postInput = document.getElementById('postInput');
    const content = postInput.value.trim();
    
    if (!content) {
        alert("من فضلك اكتب محتوى المنشور أولاً.");
        return;
    }

    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري النشر...';
    btn.disabled = true;

    try {
        await db.collection('posts').add({
            userName: "أبا مالك العقيلي",
            userImage: "https://i.ibb.co/pBhzxHdM/1000027317.jpg",
            content: content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0
        });

        postInput.value = ""; 
        alert("تم النشر بنجاح على مملكة العقيلي!");
        
    } catch (error) {
        console.error("خطأ في النشر: ", error);
        alert("عذراً، حدث خطأ أثناء النشر.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ==========================================
// 6. نظام الحكم (Wisdoms)
// ==========================================
const wisdoms = [
    "من اعتمد على الله كفاه.",
    "الوقت هو المادة الخام للحياة.",
    "العلم صيد والكتابة قيده.",
    "خالف نفسك تسترح."
];

const wisdomBtn = document.getElementById('wisdomBtn');
const wisdomModal = document.getElementById('wisdomModal');
const closeWisdom = document.getElementById('closeWisdom');

if (wisdomBtn) {
    wisdomBtn.onclick = () => {
        const text = wisdoms[Math.floor(Math.random() * wisdoms.length)];
        document.getElementById('wisdomText').innerText = text;
        if (wisdomModal) wisdomModal.classList.replace('hidden', 'flex');
    };
}

if (closeWisdom) {
    closeWisdom.onclick = () => {
        if (wisdomModal) wisdomModal.classList.replace('flex', 'hidden');
    };
}

// ==========================================
// 7. التشغيل عند تحميل الصفحة
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    logVisit();
    getAnalytics();
    if (postsContainer) getPosts();
});
                    
