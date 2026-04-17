/**
 * مملكة أبا مالك العقيلي - الإصدار 2026
 * المحرك البرمجي الموحد (Kingdom Core Engine v6.2)
 * دمج نظام الحماية، التثبيت، عداد الصلاة، الحكمة والتقييم
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
const auth = firebase.auth();

db.enablePersistence().catch((err) => console.warn("الوضع الأوفلاين غير متاح:", err.code));

// ==========================================
// 2. نظام الحماية (Auth Guard)
// ==========================================
auth.onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!user) {
        if (!isLoginPage) {
            window.location.href = 'login.html';
        }
    } else {
        if (isLoginPage) {
            window.location.href = 'index.html';
        }
        console.log("أهلاً بك يا ملك: " + user.email);
    }
});

window.logout = function() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
};

// ==========================================
// 3. الحالة العامة (Global State)
// ==========================================
let points = parseInt(localStorage.getItem('userPoints')) || 0;
let userRating = 0; 
let deferredPrompt; 

// ==========================================
// 4. محرك عداد وقت الصلاة (إصلاح عداد الشاشة)
// ==========================================
window.updatePrayerWidget = function() {
    const timerElem = document.getElementById('prayerTimer');
    if (!timerElem) return;

    const now = new Date();
    const nextPrayer = new Date();
    // توقيت افتراضي صلاة المغرب 6:30 مساءً (يمكنك تعديله)
    nextPrayer.setHours(18, 30, 0); 

    let diff = nextPrayer - now;
    if (diff < 0) {
        nextPrayer.setDate(nextPrayer.getDate() + 1);
        diff = nextPrayer - now;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    timerElem.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ==========================================
// 5. نظام التثبيت الذكي (PWA Logic)
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
// 6. الهوية الملكية ونقاط الأثر
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

// ==========================================
// 7. نظام الحكمة (Wisdom System)
// ==========================================
window.showRandomWisdom = function() {
    const modal = document.getElementById('wisdomModal');
    const txt = document.getElementById('wisdomText');
    
    const hks = [
        "من اعتمد على الله كفاه، ومن توكل عليه هداه.",
        "الوقت هو المادة الخام للحياة، فلا تضيعه في التوافه.",
        "إذا أردت أن تعرف قدرك عند الله، فانظر أين أقامك.",
        "القلوب أوعية، وخيرها أوعاها للخير.",
        "اتقِ الله حيثما كنت، وأتبع السيئة الحسنة تمحها."
    ];

    if (modal && txt) {
        txt.innerText = hks[Math.floor(Math.random() * hks.length)];
        modal.classList.remove('hidden');
        window.addPoints(5);
    }
};

window.closeWisdom = function() {
    const modal = document.getElementById('wisdomModal');
    if (modal) modal.classList.add('hidden');
};

// ==========================================
// 8. نظام التقييم (Rating System)
// ==========================================
window.openRating = () => {
    if (localStorage.getItem('hasRated')) return alert("شكراً لتقييمك المسبق!");
    
    let rating = prompt("قيم تجربتك في المملكة من 1 إلى 5 نجوم:", "5");
    if (rating && rating >= 1 && rating <= 5) {
        db.collection('ratings').add({
            stars: parseInt(rating),
            user: auth.currentUser ? auth.currentUser.email : "زائر",
            time: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            localStorage.setItem('hasRated', 'true');
            alert("تم التقييم بنجاح! نلت 30 نقطة ملكية.");
            window.addPoints(30);
        }).catch(e => alert("خطأ في الاتصال. حاول لاحقاً."));
    }
};

// ==========================================
// 9. التشغيل النهائي (Main Init)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // تحديث النقاط
    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = points;
    
    // تشغيل المحركات
    updateRoyalIdentity();
    initInstallHandler();
    
    // تشغيل عداد الصلاة كل ثانية
    setInterval(window.updatePrayerWidget, 1000);
    window.updatePrayerWidget(); 
    
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
});

// تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=6')
        .then(reg => console.log('v6 active'));
    });
}
    
