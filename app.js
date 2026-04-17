/**
 * مملكة أبا مالك العقيلي - الإصدار 2026
 * المحرك الموحد المصلح (Integrated Core Engine v7.6)
 * [تحديث]: تم إيقاف بوابة الدخول الإجبارية لتسهيل التطوير
 */

// ==========================================
// 1. تدشين Firebase (v8)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...", // ⚠️ ضع مفتاحك الحقيقي هنا ليعمل التقييم
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

// تفعيل خاصية التذكر الدائم (Persistence)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => console.log("نظام الدخول السريع: نشط"))
  .catch((err) => console.error("نظام التذكر: فشل", err));

// ==========================================
// 2. نظام الحالة (بوابة الدخول معطلة مؤقتاً)
// ==========================================

auth.onAuthStateChanged((user) => {
    // تم إلغاء التحويل التلقائي لصفحة login.html للسماح بالمعاينة الحرة
    if (user) {
        console.log("تم التعرف على الملك: " + user.email);
    } else {
        console.log("تصفح بوضع الضيف - بوابات المملكة مفتوحة للتطوير");
    }
});

// دوال الدخول (تعمل عند الطلب فقط)
window.fastLogin = function() {
    const email = document.getElementById('emailInput')?.value.trim();
    const password = document.getElementById('passwordInput')?.value;
    if (!email || !password) return alert("البيانات ناقصة يا ملك");
    auth.signInWithEmailAndPassword(email, password)
        .then(() => { window.location.href = 'index.html'; })
        .catch((err) => alert("فشل الدخول: " + err.message));
};

window.createNewAccount = function() {
    const email = document.getElementById('emailInput')?.value.trim();
    const password = document.getElementById('passwordInput')?.value;
    if (!email || !password) return alert("يرجى ملء البيانات");
    auth.createUserWithEmailAndPassword(email, password)
        .then((cred) => {
            alert("مبارك! تم إنشاء حسابك الملكي.");
            db.collection('users').doc(cred.user.uid).set({
                email: email, points: 50, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            window.location.href = 'index.html';
        })
        .catch((err) => alert("خطأ في الإنشاء: " + err.message));
};

window.logout = () => {
    auth.signOut().then(() => { window.location.href = 'login.html'; });
};

// ==========================================
// 3. المحركات الأساسية (تعمل بشكل مستقل 100%)
// ==========================================

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
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

window.updatePrayerWidget = function() {
    const timerElem = document.getElementById('prayerTimer');
    if (timerElem) {
        const now = new Date();
        timerElem.innerText = now.toLocaleTimeString('ar-SA');
    }
};

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
    }
};

window.closeWisdom = () => document.getElementById('wisdomModal')?.classList.add('hidden');

// ==========================================
// 4. التقييم، النقاط، والتثبيت
// ==========================================

window.addPoints = function(amount) {
    let p = parseInt(localStorage.getItem('userPoints')) || 0;
    p += amount;
    localStorage.setItem('userPoints', p);
    const elem = document.getElementById('userPoints');
    if (elem) elem.innerText = p;
};

window.openRating = () => {
    if (localStorage.getItem('hasRated')) return alert("شكراً لتقييمك المسبق!");
    let rating = prompt("قيم تجربتك من 1 إلى 5 نجوم:", "5");
    if (rating && rating >= 1 && rating <= 5) {
        db.collection('ratings').add({
            stars: parseInt(rating),
            user: auth.currentUser?.email || "زائر",
            time: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            localStorage.setItem('hasRated', 'true');
            alert("تم التقييم بنجاح!");
            window.addPoints(30);
        });
    }
};

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('installApp');
    if (btn) btn.classList.replace('hidden', 'flex');
});

// ==========================================
// 5. التشغيل النهائي
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setInterval(window.updatePrayerWidget, 1000);
    window.updatePrayerWidget();
    
    const installBtn = document.getElementById('installApp');
    if (installBtn) {
        installBtn.onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') installBtn.style.display = 'none';
                deferredPrompt = null;
            }
        };
    }

    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = localStorage.getItem('userPoints') || 0;
});
         
