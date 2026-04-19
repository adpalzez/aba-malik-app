/**
 * مملكة أبا مالك العقيلي - الإصدار 12.0 (2026) ⚔️
 * المحرك الموحد المفتوح (Full Access Engine)
 * دمج Firebase + المواقيت + المسبحة + البوصلة + النقاط
 */

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

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();

// ==========================================
// 2. محرك المواقيت والعد التنازلي
// ==========================================
let prayerTimes = {};

async function fetchPrayers() {
    const lat = localStorage.getItem('lat') || "30.0444";
    const lon = localStorage.getItem('lon') || "31.2357";
    const method = localStorage.getItem('aba_method') || "5";
    
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}`);
        const data = await res.json();
        prayerTimes = data.data.timings;
        
        // تحديث واجهة الشبكة
        const grid = document.getElementById('prayerGrid');
        if (grid) {
            grid.innerHTML = [
                {n:'الفجر', t:prayerTimes.Fajr}, {n:'الظهر', t:prayerTimes.Dhuhr}, 
                {n:'العصر', t:prayerTimes.Asr}, {n:'المغرب', t:prayerTimes.Maghrib}, 
                {n:'العشاء', t:prayerTimes.Isha}
            ].map(p => `<div class="prayer-card p-5 text-center min-w-[100px] shadow-sm animate__animated animate__fadeIn">
                            <p class="text-[10px] font-bold text-yellow-500 mb-2">${p.n}</p>
                            <p class="font-black text-xl text-white">${p.t}</p>
                        </div>`).join('');
        }

        document.getElementById('hijriDate').innerText = `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar}`;
        document.getElementById('gregDate').innerText = data.data.date.gregorian.date;
        startCountdown();
    } catch (e) { console.error("خطأ في جلب المواقيت"); }
}

function startCountdown() {
    setInterval(() => {
        const now = new Date();
        const pList = [{n:'الفجر', t:prayerTimes.Fajr}, {n:'الظهر', t:prayerTimes.Dhuhr}, {n:'العصر', t:prayerTimes.Asr}, {n:'المغرب', t:prayerTimes.Maghrib}, {n:'العشاء', t:prayerTimes.Isha}];
        let next = null;
        for (let p of pList) {
            const [h, m] = p.t.split(':');
            const pDate = new Date(); pDate.setHours(h, m, 0);
            if (pDate > now) { next = { ...p, d: pDate }; break; }
        }
        if (!next) {
            const [h, m] = pList[0].t.split(':');
            const pDate = new Date(); pDate.setDate(pDate.getDate()+1); pDate.setHours(h, m, 0);
            next = { ...pList[0], d: pDate };
        }
        const diff = next.d - now;
        const hrs = Math.floor(diff/3600000); const mins = Math.floor((diff%3600000)/60000); const secs = Math.floor((diff%60000)/1000);
        const countElem = document.getElementById('mainCountdown');
        if (countElem) countElem.innerText = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        const titleElem = document.getElementById('nextPrayerTitle');
        if (titleElem) titleElem.innerText = `باقي على موعد ${next.n}`;
    }, 1000);
}

// ==========================================
// 3. محرك المسبحة الذكية
// ==========================================
let tCount = 0;
let zikrIndex = 0;
const azkarList = ["سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر", "أستغفر الله"];

window.openTasbih = () => { document.getElementById('tasbihModal').style.display = 'flex'; };
window.closeTasbih = () => { document.getElementById('tasbihModal').style.display = 'none'; };

window.nextZikr = () => { zikrIndex = (zikrIndex + 1) % azkarList.length; updateZikr(); };
window.prevZikr = () => { zikrIndex = (zikrIndex - 1 + azkarList.length) % azkarList.length; updateZikr(); };

function updateZikr() {
    document.getElementById('currentZikrText').innerText = azkarList[zikrIndex];
    window.resetTasbih();
}

window.countTasbih = () => {
    tCount++;
    document.getElementById('tasbihCounter').innerText = tCount;
    if (localStorage.getItem('aba_vibrate') !== 'false' && navigator.vibrate) navigator.vibrate(50);
    window.addPoints(1); // نقطة لكل تسبيحة
};

window.resetTasbih = () => { tCount = 0; document.getElementById('tasbihCounter').innerText = 0; };

// ==========================================
// 4. محرك الورد اليومي والبوصلة
// ==========================================
let qiblaDeg = 135;

window.toggleWird = (index) => {
    let wirds = JSON.parse(localStorage.getItem('aba_wird_v8'));
    wirds[index].done = !wirds[index].done;
    if (wirds[index].done) window.addPoints(10); // 10 نقاط لكل طاعة
    localStorage.setItem('aba_wird_v8', JSON.stringify(wirds));
    renderWird();
};

function renderWird() {
    const list = document.getElementById('wirdList');
    if (!list) return;
    const wirds = JSON.parse(localStorage.getItem('aba_wird_v8')) || [
        { text: "قراءة صفحة من القرآن الكريم", done: false },
        { text: "أذكار الصباح والمساء", done: false },
        { text: "الاستغفار (100 مرة)", done: false }
    ];
    list.innerHTML = wirds.map((item, index) => `
        <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl mb-2">
            <div class="flex items-center gap-4">
                <div onclick="toggleWird(${index})" class="w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer ${item.done ? 'bg-yellow-600 border-yellow-600' : 'border-white/20'}">
                    ${item.done ? '<i class="fas fa-check text-white text-[10px]"></i>' : ''}
                </div>
                <span class="text-sm font-bold ${item.done ? 'line-through opacity-30' : ''}">${item.text}</span>
            </div>
        </div>
    `).join('');
}

window.toggleCompass = async () => {
    const cont = document.getElementById('qiblaContainer');
    const timer = document.getElementById('countdownContainer');
    cont.classList.toggle('hidden');
    timer.classList.toggle('hidden');
    if (!cont.classList.contains('hidden')) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') await DeviceOrientationEvent.requestPermission();
        window.addEventListener('deviceorientationabsolute', (e) => {
            let heading = e.alpha || e.webkitCompassHeading;
            document.getElementById('compass').style.transform = `rotate(${-heading}deg)`;
            document.getElementById('qiblaPointer').style.transform = `translate(-50%, -100%) rotate(${qiblaDeg}deg)`;
        }, true);
    }
};

// ==========================================
// 5. نظام النقاط والتقييم والضبط
// ==========================================
window.addPoints = (amount) => {
    let p = parseInt(localStorage.getItem('userPoints')) || 0;
    p += amount;
    localStorage.setItem('userPoints', p);
    const display = document.getElementById('userPointsDisplay');
    if (display) display.innerText = p;
};

window.toggleDarkMode = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('aba_dark', isDark);
    document.getElementById('darkToggle')?.classList.toggle('active', isDark);
};

// ==========================================
// 6. التشغيل النهائي عند التحميل
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderWird();
    fetchPrayers();
    if (localStorage.getItem('aba_dark') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('darkToggle')?.classList.add('active');
    }
    const pDisplay = document.getElementById('userPointsDisplay');
    if (pDisplay) pDisplay.innerText = localStorage.getItem('userPoints') || 0;
});
                
