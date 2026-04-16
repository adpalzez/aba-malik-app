// ==========================================
// 1. إعدادات وتدشين Firebase (v8)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSy...", // استبدلها ببياناتك الحقيقية من Firebase Console
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// تفعيل العمل بدون إنترنت
db.enablePersistence().catch((err) => console.warn("Persistence Error:", err.code));

// ==========================================
// 2. إدارة الحالة العامة (نقاط، مظهر، صفحات)
// ==========================================
let points = parseInt(localStorage.getItem('userPoints')) || 0;
let userRating = 0;

// وظيفة التنقل بين الصفحات (SPA Logic)
window.showPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) item.classList.add('active');
    });
    window.scrollTo(0, 0);
};

// وظيفة إضافة النقاط (Gamification)
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
// 3. محراب الصلاة الذكي (Mehrab Logic)
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
    const timerElem = document.getElementById('prayerTimer');
    const widget = document.getElementById('prayerWidget');

    if (nextElem) nextElem.innerText = next.name;
    
    const [nh, nm] = next.time.split(':');
    let target = new Date();
    target.setHours(nh, nm, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    if (timerElem) timerElem.innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

    if (widget) {
        if (diff < 1800000) widget.style.background = "linear-gradient(90deg, #b45309, #d97706)"; // برتقالي عند القرب
        else widget.style.background = "linear-gradient(90deg, #166534, #15803d)"; // أخضر
    }
}

// ==========================================
// 4. بوصلة الشعور والحكمة
// ==========================================
const moodWisdoms = {
    happy: "الحمد لله! 'لئن شكرتم لأزيدنكم'. استثمر فرحك في نشر الخير.",
    tired: "يا حي يا قيوم برحمتك أستغيث.. القلوب تتعب لترتاح بذكر الله.",
    anxious: "ألا بذكر الله تطمئن القلوب.. ردد: لا حول ولا قوة إلا بالله.",
    grateful: "أنت في نعمة عظيمة، ذكر غيرك بفضل الله الآن عبر منشور."
};

window.setMood = function(mood) {
    const text = moodWisdoms[mood];
    document.getElementById('wisdomText').innerText = text;
    document.getElementById('wisdomModal').classList.remove('hidden');
    addPoints(10);
};

// ==========================================
// 5. نظام التقييم المطور
// ==========================================
window.openRating = function() {
    if (localStorage.getItem('hasRated')) return alert("شكراً لك، لقد قمت بالتقييم مسبقاً!");
    document.getElementById('ratingModal').classList.remove('hidden');
};

const starBtns = document.querySelectorAll('.star-btn');
starBtns.forEach(star => {
    star.onclick = (e) => {
        userRating = parseInt(e.currentTarget.getAttribute('data-value'));
        updateStars(userRating);
        const btn = document.getElementById('submitRatingBtn');
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
    };
});

function updateStars(rating) {
    starBtns.forEach((s, i) => {
        if (i < rating) {
            s.classList.replace('far', 'fas');
            s.classList.add('text-yellow-400');
        } else {
            s.classList.replace('fas', 'far');
            s.classList.remove('text-yellow-400');
        }
    });
}

document.getElementById('submitRatingBtn').onclick = async () => {
    const comment = document.getElementById('ratingComment').value.trim();
    try {
        await db.collection('ratings').add({
            stars: userRating,
            comment: comment || "بدون تعليق",
            time: firebase.firestore.FieldValue.serverTimestamp()
        });
        localStorage.setItem('hasRated', 'true');
        alert("شكراً لتقييمك يا أبا مالك!");
        document.getElementById('ratingModal').classList.add('hidden');
        addPoints(30);
    } catch(e) { alert("خطأ في الاتصال."); }
};

// ==========================================
// 6. نظام المنشورات (Live Feed)
// ==========================================
async function addNewPost() {
    const input = document.getElementById('postInput');
    if (!input.value.trim()) return;

    try {
        await db.collection('posts').add({
            userName: "أبا مالك العقيلي",
            content: input.value,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userImage: "https://i.ibb.co/pBhzxHdM/1000027317.jpg"
        });
        input.value = "";
        addPoints(50);
    } catch(e) { alert("فشل النشر."); }
}
window.addNewPost = addNewPost;

function getPosts() {
    const container = document.querySelector('.posts-container');
    db.collection('posts').orderBy('createdAt', 'desc').onSnapshot(snap => {
        if (!container) return;
        container.innerHTML = '';
        snap.forEach(doc => {
            const post = doc.data();
            const html = `
            <div class="bg-white/10 backdrop-blur-md p-5 rounded-[30px] border border-white/10 mb-6 animate__animated animate__fadeInUp">
                <div class="flex items-center mb-3">
                    <img src="${post.userImage}" class="w-10 h-10 rounded-full border border-white/20">
                    <div class="mr-3">
                        <h3 class="font-bold text-white text-xs">${post.userName}</h3>
                        <p class="text-[8px] text-gray-400">${post.createdAt ? new Date(post.createdAt.toDate()).toLocaleTimeString('ar-EG') : 'الآن'}</p>
                    </div>
                </div>
                <p class="text-gray-200 text-sm leading-relaxed">${post.content}</p>
            </div>`;
            container.insertAdjacentHTML('beforeend', html);
        });
    });
}

// ==========================================
// 7. الإحصائيات والتشغيل النهائي
// ==========================================
function getAnalytics() {
    db.collection('analytics').where('type', '==', 'تصفح').onSnapshot(snap => {
        const el = document.getElementById('viewCount');
        if (el) el.innerText = snap.size;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. تفعيل الإحصائيات ونقاط المستخدم
    db.collection('analytics').add({ type: 'تصفح', time: firebase.firestore.FieldValue.serverTimestamp() });
    getAnalytics();
    document.getElementById('userPoints').innerText = points;

    // 2. تشغيل الأنظمة الحية
    getPosts();
    setInterval(updatePrayerWidget, 1000);

    // 3. ربط أزرار الحكمة
    const wBtn = document.getElementById('wisdomBtn');
    if (wBtn) wBtn.onclick = () => {
        const wisdoms = ["كن مع الله ولا تبالي", "الوقت كالسيف", "من اعتمد على الله كفاه"];
        document.getElementById('wisdomText').innerText = wisdoms[Math.floor(Math.random()*wisdoms.length)];
        document.getElementById('wisdomModal').classList.remove('hidden');
    };
});
                              
