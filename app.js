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

// تهيئة التطبيق
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// تفعيل العمل بدون إنترنت لضمان السرعة الفائقة
db.enablePersistence().catch((err) => console.warn("الوضع الأوفلاين غير متاح:", err.code));

// ==========================================
// 2. إدارة الحالة العامة (Global State)
// ==========================================
let points = parseInt(localStorage.getItem('userPoints')) || 0;
let userRating = 0; 
let deferredPrompt; 

// ==========================================
// 3. المحرك الرئيسي للتنقل (SPA Engine)
// ==========================================
window.showPage = function(pageId) {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');
    
    pages.forEach(p => p.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    const activeNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ==========================================
// 4. نظام "نقاط الأثر" (Gamification)
// ==========================================
window.addPoints = function(amount) {
    points += amount;
    localStorage.setItem('userPoints', points);
    const elem = document.getElementById('userPoints');
    if (elem) {
        elem.innerText = points;
        elem.parentElement.classList.add('animate__animated', 'animate__bounce');
        setTimeout(() => elem.parentElement.classList.remove('animate__bounce'), 1000);
    }
};

// ==========================================
// 5. محراب الصلاة الذكي (الشريط العلوي)
// ==========================================
const prayerTimes = [
    { name: "الفجر", time: "04:30" },
    { name: "الظهر", time: "12:00" },
    { name: "العصر", time: "15:30" },
    { name: "المغرب", time: "18:45" },
    { name: "العشاء", time: "20:15" }
];

function updatePrayerWidget() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let next = prayerTimes.find(p => {
        const [h, m] = p.time.split(':');
        return (parseInt(h) * 60 + parseInt(m)) > currentTime;
    }) || prayerTimes[0];

    const nextElem = document.getElementById('nextPrayerName');
    if (nextElem) nextElem.innerText = next.name;
    
    const [nh, nm] = next.time.split(':');
    let target = new Date();
    target.setHours(nh, nm, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    const timerElem = document.getElementById('prayerTimer');
    if (timerElem) {
        timerElem.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        if (diff < 1800000) timerElem.className = "text-xs font-mono font-black text-orange-500 animate-pulse";
        else timerElem.className = "text-xs font-mono font-black text-white";
    }
}

// ==========================================
// 6. بوصلة المشاعر والمنشورات
// ==========================================
const moodWisdoms = {
    happy: "الحمد لله! 'لئن شكرتم لأزيدنكم'. فرحك طاعة.",
    grateful: "دوام النعمة بالشكر.. الحمد لله دائماً.",
    anxious: "ردد: لا حول ولا قوة إلا بالله، ففيها الفرج.",
    tired: "استرح بذكر الله.. 'ألا بذكر الله تطمئن القلوب'."
};

window.setMood = function(mood) {
    const wisdomText = document.getElementById('wisdomText');
    if (wisdomText) wisdomText.innerText = moodWisdoms[mood];
    document.getElementById('wisdomModal')?.classList.remove('hidden');
    addPoints(10);
};

window.addNewPost = async function() {
    const input = document.getElementById('postInput');
    const content = input?.value.trim();
    if (!content) return;

    try {
        await db.collection('posts').add({
            userName: "أبا مالك العقيلي",
            content: content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userImage: "https://i.ibb.co/pBhzxHdM/1000027317.jpg"
        });
        input.value = "";
        addPoints(50);
        alert("تم النشر في المملكة!");
    } catch(e) { alert("حدث خطأ في النشر."); }
};

function getPosts() {
    const container = document.querySelector('.posts-container');
    if (!container) return;
    db.collection('posts').orderBy('createdAt', 'desc').limit(15).onSnapshot(snap => {
        container.innerHTML = '';
        snap.forEach(doc => {
            const post = doc.data();
            const html = `
            <div class="bg-white/10 backdrop-blur-md p-5 rounded-[30px] border border-white/10 mb-4 animate__animated animate__fadeInUp">
                <div class="flex items-center mb-2">
                    <img src="${post.userImage}" class="w-8 h-8 rounded-full border border-white/20">
                    <div class="mr-3">
                        <h3 class="font-bold text-white text-[10px]">${post.userName}</h3>
                        <p class="text-[7px] text-gray-500">${post.createdAt ? new Date(post.createdAt.toDate()).toLocaleTimeString('ar-EG') : 'الآن'}</p>
                    </div>
                </div>
                <p class="text-gray-200 text-xs leading-relaxed text-right">${post.content}</p>
            </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    });
}

// ==========================================
// 7. نظام التقييم وتفاعل المستخدم
// ==========================================
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
            try {
                await db.collection('ratings').add({
                    stars: userRating,
                    comment: comment || "",
                    time: firebase.firestore.FieldValue.serverTimestamp()
                });
                localStorage.setItem('hasRated', 'true');
                alert("تم إرسال تقييمك بنجاح!");
                document.getElementById('ratingModal')?.classList.add('hidden');
                addPoints(30);
            } catch(e) { alert("خطأ في الإرسال."); }
        };
    }
}

// ==========================================
// 8. المظهر و PWA والتشغيل النهائي
// ==========================================
function initUIHandlers() {
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

    const wisdomBtn = document.getElementById('wisdomBtn');
    if (wisdomBtn) {
        wisdomBtn.onclick = () => {
            const hks = ["كن مع الله ولا تبالي", "الوقت كالسيف", "من اعتمد على الله كفاه", "خالف نفسك تسترح"];
            const txt = document.getElementById('wisdomText');
            if (txt) txt.innerText = hks[Math.floor(Math.random() * hks.length)];
            document.getElementById('wisdomModal')?.classList.remove('hidden');
            addPoints(5);
        };
    }

    // PWA التثبيت
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        document.getElementById('installApp')?.classList.remove('hidden');
    });

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

// تسجيل الـ Service Worker مع نظام التحديث v4
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=4')
            .then(reg => {
                console.log('مملكة أبا مالك: تم تحديث النظام لـ v4');
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            alert("تحديث جديد متوفر! سيتم الآن إعادة تحميل المملكة.");
                            location.reload();
                        }
                    };
                };
            })
            .catch(err => console.log('خطأ في التسجيل:', err));
    });
}

// الإطلاق العظيم
document.addEventListener('DOMContentLoaded', () => {
    const pDisplay = document.getElementById('userPoints');
    if (pDisplay) pDisplay.innerText = points;

    updatePrayerWidget();
    setInterval(updatePrayerWidget, 1000);
    
    getPosts();
    initUIHandlers();
    initRatingSystem();

    // إحصائيات سريعة
    db.collection('analytics').add({ type: 'تصفح', time: firebase.firestore.FieldValue.serverTimestamp() });
    db.collection('analytics').where('type', '==', 'تصفح').onSnapshot(s => {
        const vCount = document.getElementById('viewCount');
        if (vCount) vCount.innerText = s.size;
    });
});
                            
