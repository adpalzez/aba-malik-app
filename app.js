// 1. نظام التثبيت (PWA Install)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;
    const btn = document.getElementById('installBtn');
    if(btn) btn.classList.remove('hidden');
});

window.installApp = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') document.getElementById('installBtn').classList.add('hidden');
        deferredPrompt = null;
    }
};

// 2. إعدادات الواجهة
window.toggleSettings = () => document.getElementById('settingsPanel').classList.toggle('active');
window.updateApp = () => location.reload(true);
window.requestLocation = () => navigator.geolocation.getCurrentPosition(p => { 
    localStorage.setItem('lat', p.coords.latitude); 
    localStorage.setItem('lon', p.coords.longitude); 
    location.reload(); 
});
window.toggleDarkMode = () => { 
    const isDark = document.body.classList.toggle('dark-mode'); 
    localStorage.setItem('aba_dark', isDark); 
    document.getElementById('darkToggle').classList.toggle('active', isDark); 
};

// 3. المواقيت والعد التنازلي
let prayerTimes = {};
async function fetchPrayers() {
    const lat = localStorage.getItem('lat') || "30.0444"; 
    const lon = localStorage.getItem('lon') || "31.2357";
    try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`);
        const data = await res.json(); 
        prayerTimes = data.data.timings;
        document.getElementById('prayerGrid').innerHTML = [
            {n:'الفجر', t:prayerTimes.Fajr}, {n:'الظهر', t:prayerTimes.Dhuhr}, 
            {n:'العصر', t:prayerTimes.Asr}, {n:'المغرب', t:prayerTimes.Maghrib}, {n:'العشاء', t:prayerTimes.Isha}
        ].map(p => `<div class="prayer-card p-5 text-center min-w-[100px] shadow-sm"><p class="text-[10px] font-bold text-yellow-500 mb-2">${p.n}</p><p class="font-black text-xl">${p.t}</p></div>`).join('');
        document.getElementById('hijriDate').innerText = `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar}`;
        document.getElementById('gregDate').innerText = data.data.date.gregorian.date;
        startCountdown();
    } catch (e) { console.log("خطأ في الاتصال"); }
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
        document.getElementById('mainCountdown').innerText = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        document.getElementById('nextPrayerTitle').innerText = `باقي على موعد ${next.n}`;
    }, 1000);
}

// 4. البوصلة الحقيقية
let isCompassActive = false; let qiblaDeg = 135;
window.toggleCompass = async () => {
    const cont = document.getElementById('qiblaContainer'); 
    const timer = document.getElementById('countdownContainer');
    if (!isCompassActive) {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try { const permission = await DeviceOrientationEvent.requestPermission(); if (permission !== 'granted') return alert('يجب الموافقة على وصول المستشعرات'); } catch (e) { }
        }
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
        cont.style.display = 'block'; timer.style.display = 'none'; isCompassActive = true;
    } else {
        window.removeEventListener('deviceorientationabsolute', handleOrientation); window.removeEventListener('deviceorientation', handleOrientation);
        cont.style.display = 'none'; timer.style.display = 'block'; isCompassActive = false;
    }
};

function handleOrientation(e) {
    let heading = e.alpha || e.webkitCompassHeading; if (heading == null) return;
    document.getElementById('compass').style.transform = `rotate(${-heading}deg)`;
    document.getElementById('qiblaPointer').style.transform = `translate(-50%, -100%) rotate(${qiblaDeg}deg)`;
}

// 5. المسبحة
let tCount = 0; let zikrIndex = 0; const azkarList = ["سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر"];
window.openTasbih = () => document.getElementById('tasbihModal').style.display = 'flex';
window.closeTasbih = () => document.getElementById('tasbihModal').style.display = 'none';
window.nextZikr = () => { zikrIndex = (zikrIndex + 1) % azkarList.length; document.getElementById('currentZikrText').innerText = azkarList[zikrIndex]; window.resetTasbih(); };
window.prevZikr = () => { zikrIndex = (zikrIndex - 1 + azkarList.length) % azkarList.length; document.getElementById('currentZikrText').innerText = azkarList[zikrIndex]; window.resetTasbih(); };
window.countTasbih = () => { tCount++; document.getElementById('tasbihCounter').innerText = tCount; if (navigator.vibrate) navigator.vibrate(50); };
window.resetTasbih = () => { tCount = 0; document.getElementById('tasbihCounter').innerText = 0; };

// 6. الورد اليومي
function renderWird() {
    const list = document.getElementById('wirdList'); if (!list) return;
    let myWird = JSON.parse(localStorage.getItem('aba_wird_v12')) || [
        { text: "قراءة صفحة من القرآن", done: false }, { text: "أذكار الصباح", done: false }, { text: "الاستغفار (100)", done: false }
    ];
    list.innerHTML = myWird.map((item, i) => `<div class="flex items-center justify-between p-4 bg-white/5 rounded-[25px] border border-white/5 mb-2"><div class="flex items-center gap-4"><div onclick="toggleWirdAction(${i})" class="w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer ${item.done ? 'bg-yellow-600 border-yellow-600' : 'border-white/20'}">${item.done ? '<i class="fas fa-check text-white text-xs"></i>' : ''}</div><span class="text-sm font-bold ${item.done ? 'line-through opacity-30 text-yellow-500' : 'text-white'}">${item.text}</span></div></div>`).join('');
    document.getElementById('progressText').innerText = Math.round((myWird.filter(i => i.done).length / myWird.length) * 100) + '%';
    localStorage.setItem('aba_wird_v12', JSON.stringify(myWird));
}

window.toggleWirdAction = (i) => { 
    let myWird = JSON.parse(localStorage.getItem('aba_wird_v12')); 
    myWird[i].done = !myWird[i].done; 
    localStorage.setItem('aba_wird_v12', JSON.stringify(myWird)); 
    renderWird(); 
};

// 7. التشغيل عند التحميل
document.addEventListener('DOMContentLoaded', () => {
    renderWird(); 
    fetchPrayers();
    if (localStorage.getItem('aba_dark') === 'true') { 
        document.body.classList.add('dark-mode'); 
        document.getElementById('darkToggle').classList.add('active'); 
    }
});
            
