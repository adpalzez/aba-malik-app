// ==========================================
// 1. تدشين Firebase (v8)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...", // ⚠️ ضع مفتاحك الحقيقي هنا
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
db.enablePersistence().catch((err) => console.warn("الوضع الأوفلاين غير متاح:", err.code));

// ==========================================
// 2. الحالة العامة (Global State)
// ==========================================
let points = parseInt(localStorage.getItem('userPoints')) || 0;
let userRating = 0; 
let deferredPrompt; 

// ==========================================
// 3. نظام "نقاط الأثر" و "الحكمة" (إصلاح زر الحكمة)
// ==========================================
window.addPoints = function(amount) {
    points += amount;
    localStorage.setItem('userPoints', points);
    const elem = document.getElementById('userPoints');
    if (elem) elem.innerText = points;
};

// جعل الدالة عالمية لكي يعمل الزر في HTML
window.showRandomWisdom = function() {
    const hks = [
        "من اعتمد على الله كفاه، ومن توكل عليه هداه.",
        "الوقت هو المادة الخام للحياة، فلا تضيعه في التوافه.",
        "العلم صيد والكتابة قيده، فقيّد صيدك بكثرة القراءة.",
        "إذا أردت أن تعرف قدرك عند الله، فانظر أين أقامك.",
        "القلوب أوعية، وخيرها أوعاها للخير."
    ];
    const txt = document.getElementById('wisdomText');
    if (txt) {
        txt.innerText = hks[Math.floor(Math.random() * hks.length)];
        document.getElementById('wisdomModal')?.classList.remove('hidden');
        window.addPoints(5);
    }
};

window.closeWisdom = function() {
    document.getElementById('wisdomModal')?.classList.add('hidden');
};

// ==========================================
// 4. نظام التقييم (إصلاح النجوم)
// ==========================================
window.openRating = () => {
    if (localStorage.getItem('hasRated')) return alert("شكراً لتقييمك المسبق!");
    document.getElementById('ratingModal')?.classList.remove('hidden');
};

function initRatingSystem() {
    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach(star => {
        star.onclick = (e) => {
            userRating = parseInt(e.currentTarget.getAttribute('data-value'));
            starBtns.forEach((s, i) => {
                if (i < userRating) {
                    s.classList.replace('far', 'fas');
                    s.classList.add('text-yellow-400');
                } else {
                    s.classList.replace('fas', 'far');
                    s.classList.remove('text-yellow-400');
                }
            });
            const submitBtn = document.getElementById('submitRatingBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-50');
            }
        };
    });

    const submitBtn = document.getElementById('submitRatingBtn');
    if (submitBtn) {
        submitBtn.onclick = async () => {
            const comment = document.getElementById('ratingComment')?.value.trim();
            if (userRating === 0) return alert("يرجى اختيار عدد النجوم أولاً");
            try {
                await db.collection('ratings').add({
                    stars: userRating,
                    comment: comment || "",
                    time: firebase.firestore.FieldValue.serverTimestamp()
                });
                localStorage.setItem('hasRated', 'true');
                alert("تم إرسال تقييمك بنجاح!");
                document.getElementById('ratingModal')?.classList.add('hidden');
                window.addPoints(30);
            } catch(e) { alert("خطأ في الإرسال: تأكد من اتصالك"); }
        };
    }
}

// ==========================================
// 5. زر التثبيت (PWA Fix)
// ==========================================
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // إظهار الزر فوراً عند جاهزية المتصفح
    const installBtn = document.getElementById('installApp');
    if (installBtn) installBtn.classList.remove('hidden');
});

function initInstallHandler() {
    const installBtn = document.getElementById('installApp');
    if (installBtn) {
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') installBtn.classList.add('hidden');
                deferredPrompt = null;
            } else {
                alert("التطبيق مثبت بالفعل أو المتصفح لا يدعم التثبيت حالياً.");
            }
        };
    }
}

// ==========================================
// 6. المحرك الرئيسي (SPA & Navigation)
// ==========================================
window.showPage = function(pageId) {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    pages.forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    document.querySelector(`.nav-item[data-page="${pageId}"]`)?.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ==========================================
// 7. تسجيل الـ Service Worker (v4)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=4')
        .then(reg => {
            console.log('مملكة أبا مالك: تم التحديث لـ v4');
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        alert("تحديث جديد متوفر! سيتم تحميل الواجهة الجديدة الآن.");
                        location.reload();
                    }
                };
            };
        });
    });
}

// ==========================================
// 8. التشغيل عند التحميل
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // تحديث النقاط
    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = points;

    // تشغيل الأنظمة
    initRatingSystem();
    initInstallHandler();
    
    // تشغيل الوضع الليلي
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.toggle('light-mode');
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.classList.toggle('fa-moon');
                icon.classList.toggle('fa-sun');
            }
        };
    }

    // إحصائيات سريعة ومنشورات
    if (typeof getPosts === 'function') getPosts();
    setInterval(() => { if (typeof updatePrayerWidget === 'function') updatePrayerWidget(); }, 1000);
});
                    
