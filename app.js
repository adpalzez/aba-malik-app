/**
 * مملكة أبا مالك العقيلي - الإصدار 2026
 * المحرك البرمجي الموحد (Unified App Engine)
 */

// ==========================================
// 1. تدشين Firebase (v8)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...", // ⚠️ استبدله بمفتاحك الحقيقي
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
db.enablePersistence().catch((err) => console.warn("الوضع الأوفلاين غير متاح:", err.code));

// ==========================================
// 2. الحالة العامة (Global State)
// ==========================================
let points = parseInt(localStorage.getItem('userPoints')) || 0;
let userRating = 0; 
let deferredPrompt; 

// ==========================================
// 3. نظام التثبيت الذكي (PWA Logic)
// ==========================================
function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installApp');
    if (installBtn && !isAppInstalled()) {
        installBtn.classList.remove('hidden');
        installBtn.style.display = 'flex';
    }
});

function initInstallHandler() {
    const installBtn = document.getElementById('installApp');
    if (installBtn) {
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
                deferredPrompt = null;
            }
        };
    }
}

// ==========================================
// 4. الهوية الملكية ونقاط الأثر
// ==========================================
window.addPoints = function(amount) {
    points += amount;
    localStorage.setItem('userPoints', points);
    const elem = document.getElementById('userPoints');
    if (elem) elem.innerText = points;
};

function updateRoyalIdentity() {
    const savedName = localStorage.getItem('royalName');
    const nameDisplay = document.querySelector('.mood-bar span.text-\\[9px\\]');
    if (savedName && nameDisplay) {
        nameDisplay.innerText = savedName;
    }
}

window.saveIdentity = function() {
    const newName = document.getElementById('royalNameInput').value;
    if(newName) {
        localStorage.setItem('royalName', newName);
        alert('تم تحديث هوية الملك بنجاح!');
        window.location.href = 'index.html';
    }
};

// ==========================================
// 5. نظام الحكمة (Wisdom System)
// ==========================================
window.showRandomWisdom = function() {
    const hks = [
        "من اعتمد على الله كفاه، ومن توكل عليه هداه.",
        "الوقت هو المادة الخام للحياة، فلا تضيعه في التوافه.",
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
// 6. نظام التقييم (Rating System)
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
            if (userRating === 0) return alert("يرجى اختيار عدد النجوم");
            try {
                await db.collection('ratings').add({
                    stars: userRating,
                    comment: comment || "",
                    time: firebase.firestore.FieldValue.serverTimestamp()
                });
                localStorage.setItem('hasRated', 'true');
                alert("تم التقييم بنجاح!");
                document.getElementById('ratingModal')?.classList.add('hidden');
                window.addPoints(30);
            } catch(e) { alert("خطأ في الاتصال."); }
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
            console.log('مملكة أبا مالك: نظام v4 نشط');
        });
    });
}

// ==========================================
// 8. التشغيل النهائي
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = points;
    updateRoyalIdentity();
    initInstallHandler();
    initRatingSystem();
    
    // المظهر
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

    // تحديث مواقيت الصلاة
    setInterval(() => { 
        if (typeof updatePrayerWidget === 'function') updatePrayerWidget(); 
    }, 1000);
});
    
