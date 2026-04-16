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

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// تفعيل العمل بدون إنترنت لضمان السرعة
db.enablePersistence().catch((err) => console.warn("الوضع الأوفلاين غير متاح:", err.code));

// ==========================================
// 2. المحرك الرئيسي للتنقل (SPA Engine)
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
// 3. نظام "نقاط الأثر" (Gamification)
// ==========================================
let points = parseInt(localStorage.getItem('userPoints')) || 0;

function addPoints(amount) {
    points += amount;
    localStorage.setItem('userPoints', points);
    const elem = document.getElementById('userPoints');
    if (elem) {
        elem.innerText = points;
        elem.parentElement.classList.add('animate__animated', 'animate__bounce');
        setTimeout(() => elem.parentElement.classList.remove('animate__bounce'), 1000);
    }
}

// ==========================================
// 4. المحراب العلوي (Prayer System)
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

    document.getElementById('nextPrayerName').innerText = next.name;
    
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
// 5. بوصلة المشاعر ونظام المنشورات
// ==========================================
const moodWisdoms = {
    happy: "الحمد لله! 'لئن شكرتم لأزيدنكم'. فرحك طاعة.",
    tired: "استرح بذكر الله.. 'ألا بذكر الله تطمئن القلوب'.",
    anxious: "ردد: لا حول ولا قوة إلا بالله، ففيها الفرج.",
    grateful: "دوام النعمة بالشكر.. شاركنا الحمد في منشور."
};

window.setMood = function(mood) {
    document.getElementById('wisdomText').innerText = moodWisdoms[mood];
    document.getElementById('wisdomModal').classList.remove('hidden');
    addPoints(10);
};

window.addNewPost = async function() {
    const input = document.getElementById('postInput');
    const content = input.value.trim();
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

function loadPosts() {
    const container = document.querySelector('.posts-container');
    db.collection('posts').orderBy('createdAt', 'desc').onSnapshot(snap => {
        if (!container) return;
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
                <p class="text-gray-200 text-xs leading-relaxed">${post.content}</p>
            </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    });
}

// ==========================================
// 6. المظهر والتثبيت (Theme & PWA)
// ==========================================
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installApp')?.classList.remove('hidden');
});

function initUIHandlers() {
    // زر الوضع الليلي
    document.getElementById('themeToggle').onclick = () => {
        document.body.classList.toggle('light-mode');
        const icon = document.getElementById('themeIcon');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    };

    // زر التثبيت
    document.getElementById('installApp').onclick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') document.getElementById('installApp').classList.add('hidden');
            deferredPrompt = null;
        }
    };

    // زر الحكمة
    document.getElementById('wisdomBtn').onclick = () => {
        const hks = ["كن مع الله ولا تبالي", "الوقت كالسيف", "من اعتمد على الله كفاه"];
        document.getElementById('wisdomText').innerText = hks[Math.floor(Math.random()*hks.length)];
        document.getElementById('wisdomModal').classList.remove('hidden');
    };
}

// ==========================================
// 7. التشغيل النهائي (The BIG CLICK)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // تحديث البيانات الأولية
    document.getElementById('userPoints').innerText = points;
    updatePrayerWidget();
    setInterval(updatePrayerWidget, 1000);
    
    // تشغيل الأنظمة
    loadPosts();
    initUIHandlers();
    
    // تسجيل الإحصائيات
    db.collection('analytics').add({ type: 'تصفح', time: firebase.firestore.FieldValue.serverTimestamp() });
    db.collection('analytics').where('type', '==', 'تصفح').onSnapshot(s => {
        document.getElementById('viewCount').innerText = s.size;
    });
});
                                               
