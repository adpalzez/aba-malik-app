/**
 * مملكة أبا مالك العقيلي - الإصدار 2026
 * المحرك الموحد المصلح (Integrated Core Engine)
 */

// ==========================================
// 1. تدشين Firebase (v8)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...", 
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

// ==========================================
// 2. المحركات الأساسية (تعمل فوراً دون قيود)
// ==========================================

// --- محرك الوضع الليلي ---
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    
    // استعادة الوضع المحفوظ
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    if (themeToggle) {
        themeToggle.onclick = () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            if (icon) {
                icon.classList.toggle('fa-moon', !isLight);
                icon.classList.toggle('fa-sun', isLight);
            }
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        };
    }
}

// --- محرك عداد وقت الصلاة (توقيت حي) ---
window.updatePrayerWidget = function() {
    const timerElem = document.getElementById('prayerTimer');
    if (timerElem) {
        const now = new Date();
        timerElem.innerText = now.toLocaleTimeString('ar-SA');
    }
};

// --- محرك الحكمة الملكية ---
window.showRandomWisdom = function() {
    const modal = document.getElementById('wisdomModal');
    const txt = document.getElementById('wisdomText');
    const hks = [
        "من اعتمد على الله كفاه، ومن توكل عليه هداه.",
        "الوقت هو المادة الخام للحياة، فلا تضيعه في التوافه.",
        "القلوب أوعية، وخيرها أوعاها للخير.",
        "الكلمة الطيبة صدقة."
    ];
    
    if (modal && txt) {
        txt.innerText = hks[Math.floor(Math.random() * hks.length)];
        modal.classList.remove('hidden');
        window.addPoints(5);
    } else {
        alert(hks[Math.floor(Math.random() * hks.length)]);
    }
};

window.closeWisdom = function() {
    document.getElementById('wisdomModal')?.classList.add('hidden');
};

// ==========================================
// 3. نظام الحماية (Auth Guard)
// ==========================================
auth.onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes('login.html');
    if (!user && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (user && isLoginPage) {
        window.location.href = 'index.html';
    }
});

// ==========================================
// 4. نظام التقييم والتثبيت
// ==========================================
window.openRating = () => {
    if (localStorage.getItem('hasRated')) return alert("شكراً لتقييمك المسبق!");
    let rating = prompt("قيم تجربتك من 1 إلى 5 نجوم:", "5");
    if (rating && rating >= 1 && rating <= 5) {
        db.collection('ratings').add({
            stars: parseInt(rating),
            user: auth.currentUser ? auth.currentUser.email : "زائر",
            time: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            localStorage.setItem('hasRated', 'true');
            alert("تم التقييم بنجاح!");
            window.addPoints(30);
        });
    }
};

// نظام التثبيت (PWA)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installApp');
    if (btn) btn.classList.replace('hidden', 'flex');
});

window.installKingdom = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') document.getElementById('installApp').style.display = 'none';
        deferredPrompt = null;
    }
};

// ==========================================
// 5. التشغيل النهائي (Main Init)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // تشغيل المحركات المستقلة فوراً
    initTheme();
    setInterval(window.updatePrayerWidget, 1000);
    window.updatePrayerWidget();
    
    // ربط زر التثبيت
    const installBtn = document.getElementById('installApp');
    if (installBtn) installBtn.onclick = window.installKingdom;

    // تحديث النقاط
    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = localStorage.getItem('userPoints') || 0;
});

window.addPoints = function(amount) {
    let p = parseInt(localStorage.getItem('userPoints')) || 0;
    p += amount;
    localStorage.setItem('userPoints', p);
    const elem = document.getElementById('userPoints');
    if (elem) elem.innerText = p;
};
                
