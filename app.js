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
// 3. نظام "نقاط الأثر" و "الهوية الملكية" (ربط الإعدادات)
// ==========================================
window.addPoints = function(amount) {
    points += amount;
    localStorage.setItem('userPoints', points);
    const elem = document.getElementById('userPoints');
    if (elem) elem.innerText = points;
};

// وظيفة تحديث الاسم من الإعدادات
function updateRoyalIdentity() {
    const savedName = localStorage.getItem('royalName');
    const nameDisplay = document.querySelector('.mood-bar span.text-\\[9px\\]');
    if (savedName && nameDisplay) {
        nameDisplay.innerText = savedName;
    }
}

// دالة حفظ الاسم الجديد (تُستدعى من settings.html)
window.saveIdentity = function() {
    const newName = document.getElementById('royalNameInput').value;
    if(newName) {
        localStorage.setItem('royalName', newName);
        alert('تم تحديث هوية الملك بنجاح! سيظهر الاسم الجديد في شريط النبض.');
        window.location.href = 'index.html';
    }
};

// ==========================================
// 4. نظام "الحكمة" (Wisdom System)
// ==========================================
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
// 5. نظام التقييم (Rating System)
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
// 6. زر التثبيت (PWA Fix)
// ==========================================
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
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
            }
        };
    }
}

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
// 8. التشغيل عند التحميل (DOMContentLoaded)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // تحديث النقاط والاسم الملكي
    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = points;
    updateRoyalIdentity();

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

    // إحصائيات ومنشورات ومواقيت صلاة
    setInterval(() => { 
        if (typeof updatePrayerWidget === 'function') updatePrayerWidget(); 
    }, 1000);
});
        
