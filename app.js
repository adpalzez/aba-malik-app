// ==================== 1. نظام التثبيت والإعدادات ====================
let deferredPrompt;

// الاستماع لحدث التثبيت من المتصفح
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); 
    deferredPrompt = e;
    const btn = document.getElementById('installBtn');
    if(btn) {
        btn.classList.remove('hidden');
        btn.style.display = 'block'; // التأكد من الظهور
    }
});

window.installApp = async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            const btn = document.getElementById('installBtn');
            if(btn) btn.classList.add('hidden');
        }
        deferredPrompt = null;
    } else {
        // رسالة مساعدة لمستخدمي الآيفون أو في حال عدم دعم المتصفح للحدث
        alert("لتثبيت التطبيق على هاتفك:\n١. اضغط على زر المشاركة (Share)\n٢. اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen)");
    }
};

window.toggleSettings = () => {
    const panel = document.getElementById('settingsPanel');
    if(panel) panel.classList.toggle('active');
};

window.updateApp = () => location.reload(true);

window.requestLocation = () => navigator.geolocation.getCurrentPosition(p => { 
    localStorage.setItem('lat', p.coords.latitude); 
    localStorage.setItem('lon', p.coords.longitude); 
    location.reload(); 
});

window.toggleDarkMode = () => { 
    const isDark = document.body.classList.toggle('dark-mode'); 
    localStorage.setItem('aba_dark', isDark); 
};

// ==================== 2. المواقيت وحساب القبلة الدقيق ====================
let prayerTimes = {};
let QIBLA_DEGREE = 136.2;

function calculateQibla(lat, lon) {
    const makkahLat = 21.422487 * (Math.PI / 180);
    const makkahLon = 39.826206 * (Math.PI / 180);
    const userLat = lat * (Math.PI / 180);
    const userLon = lon * (Math.PI / 180);
    const dLon = makkahLon - userLon;
    const y = Math.sin(dLon);
    const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(dLon);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    return parseFloat(((qibla + 360) % 360).toFixed(1));
}

async function fetchPrayers() {
    const lat = localStorage.getItem('lat') || "30.0444"; 
    const lon = localStorage.getItem('lon') || "31.2357";
    QIBLA_DEGREE = calculateQibla(parseFloat(lat), parseFloat(lon));

    try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=5`);
        const data = await res.json(); 
        prayerTimes = data.data.timings;
        const grid = document.getElementById('prayerGrid');
        if(grid) {
            grid.innerHTML = [
                {n:'الفجر', t:prayerTimes.Fajr}, {n:'الظهر', t:prayerTimes.Dhuhr}, 
                {n:'العصر', t:prayerTimes.Asr}, {n:'المغرب', t:prayerTimes.Maghrib}, {n:'العشاء', t:prayerTimes.Isha}
            ].map(p => `<div class="prayer-card p-5 text-center min-w-[100px] shadow-sm"><p class="text-[10px] font-bold text-yellow-500 mb-2">${p.n}</p><p class="font-black text-xl">${p.t}</p></div>`).join('');
        }
        if(document.getElementById('hijriDate')) document.getElementById('hijriDate').innerText = `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar}`;
        if(document.getElementById('gregDate')) document.getElementById('gregDate').innerText = data.data.date.gregorian.date;
        startCountdown();
    } catch (e) { console.log("خطأ في جلب المواقيت"); }
}

function startCountdown() {
    setInterval(() => {
        const now = new Date(); 
        const pList = [{n:'الفجر', t:prayerTimes.Fajr}, {n:'الظهر', t:prayerTimes.Dhuhr}, {n:'العصر', t:prayerTimes.Asr}, {n:'المغرب', t:prayerTimes.Maghrib}, {n:'العشاء', t:prayerTimes.Isha}];
        let next = null;
        for (let p of pList) { 
            if(!p.t) continue;
            const [h, m] = p.t.split(':'); 
            const pDate = new Date(); pDate.setHours(h, m, 0); 
            if (pDate > now) { next = { ...p, d: pDate }; break; } 
        }
        if (!next && pList[0].t) { 
            const [h, m] = pList[0].t.split(':'); 
            const pDate = new Date(); pDate.setDate(pDate.getDate()+1); pDate.setHours(h, m, 0); 
            next = { ...pList[0], d: pDate }; 
        }
        
        if(next) {
            const diff = next.d - now; 
            const hrs = Math.floor(diff/3600000); const mins = Math.floor((diff%3600000)/60000); const secs = Math.floor((diff%60000)/1000);
            if(document.getElementById('mainCountdown')) document.getElementById('mainCountdown').innerText = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
            if(document.getElementById('nextPrayerTitle')) document.getElementById('nextPrayerTitle').innerText = `باقي على موعد ${next.n}`;
        }
    }, 1000);
}

// ==================== 3. محرك البوصلة المطور ====================
let isCompassActive = false; 
window.toggleCompass = async () => {
    const cont = document.getElementById('qiblaContainer'); 
    if(!cont) return;

    if (!isCompassActive) {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission !== 'granted') {
                    alert("يجب السماح بحساسات الحركة لتعمل البوصلة");
                    return;
                }
            } catch (e) { console.error(e); }
        }

        const kaaba = document.getElementById('kaabaMarker');
        if(kaaba) kaaba.style.transform = `rotate(${QIBLA_DEGREE}deg)`;

        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        cont.classList.replace('hidden', 'flex');
        isCompassActive = true;
    } else {
        window.removeEventListener('deviceorientationabsolute', handleOrientation); 
        window.removeEventListener('deviceorientation', handleOrientation);
        cont.classList.replace('flex', 'hidden');
        isCompassActive = false;
    }
};

function handleOrientation(e) {
    let heading = e.webkitCompassHeading || (360 - e.alpha);
    if (document.getElementById('compassDial')) document.getElementById('compassDial').style.transform = `rotate(${-heading}deg)`;
    if (document.getElementById('headingText')) document.getElementById('headingText').innerText = heading.toFixed(1) + '°';
    
    let diff = Math.abs(heading - QIBLA_DEGREE);
    const innerDrop = document.getElementById('teardropInner');
    if(innerDrop) {
        if (diff < 5 || diff > 355) { 
            innerDrop.style.backgroundColor = '#10b981'; 
            if (navigator.vibrate) navigator.vibrate(20); 
        } 
        else { innerDrop.style.backgroundColor = '#ffffff'; }
    }
}

// ==================== 4. المسبحة ====================
let tCount = 0; let zikrIndex = 0; const azkarList = ["سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر"];
window.openTasbih = () => document.getElementById('tasbihModal').style.display = 'flex';
window.closeTasbih = () => document.getElementById('tasbihModal').style.display = 'none';
window.nextZikr = () => { zikrIndex = (zikrIndex + 1) % azkarList.length; document.getElementById('currentZikrText').innerText = azkarList[zikrIndex]; window.resetTasbih(); };
window.prevZikr = () => { zikrIndex = (zikrIndex - 1 + azkarList.length) % azkarList.length; document.getElementById('currentZikrText').innerText = azkarList[zikrIndex]; window.resetTasbih(); };
window.countTasbih = () => { tCount++; document.getElementById('tasbihCounter').innerText = tCount; if (navigator.vibrate) navigator.vibrate(40); };
window.resetTasbih = () => { tCount = 0; document.getElementById('tasbihCounter').innerText = 0; };

// ==================== 5. الإشعارات والبحث ====================
window.requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification("محراب أبا مالك", { body: "تم تفعيل التنبيهات بنجاح", icon: 'https://i.ibb.co/pBhzxHdM/1000027317.jpg' });
        });
    }
};

window.toggleGlobalSearch = () => {
    const modal = document.getElementById('searchModal');
    modal.classList.toggle('hidden');
};

async function runGlobalSearch(query) {
    const resultsCont = document.getElementById('searchResults');
    if (query.length < 3) return;
    resultsCont.innerHTML = '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-yellow-500"></i></div>';
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/search/${query}/all/ar.clean`);
        const data = await res.json();
        let html = '';
        if (data.data && data.data.matches.length > 0) {
            data.data.matches.slice(0, 10).forEach(m => {
                html += `<div class="bg-white/5 p-4 rounded-2xl border border-white/5 mb-2"><p class="text-white mb-1">${m.text}</p><p class="text-[10px] text-yellow-500">سورة ${m.surah.name} - آية ${m.numberInSurah}</p></div>`;
            });
            resultsCont.innerHTML = html;
        } else { resultsCont.innerHTML = '<p class="text-center opacity-30">لا توجد نتائج</p>'; }
    } catch (e) { resultsCont.innerHTML = '<p class="text-center text-red-400">خطأ في الاتصال</p>'; }
}

// ==================== 6. ورد اليوم ====================
function renderWird() {
    const list = document.getElementById('wirdList'); if (!list) return;
    let myWird = JSON.parse(localStorage.getItem('aba_wird_v12')) || [{ text: "قراءة صفحة من القرآن", done: false }, { text: "أذكار الصباح", done: false }, { text: "الاستغفار (100)", done: false }];
    list.innerHTML = myWird.map((item, i) => `<div class="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 mb-2"><div class="flex items-center gap-4"><div onclick="toggleWirdAction(${i})" class="w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer ${item.done ? 'bg-yellow-600 border-yellow-600' : 'border-white/20'}">${item.done ? '<i class="fas fa-check text-white text-xs"></i>' : ''}</div><span class="text-sm font-bold ${item.done ? 'line-through opacity-30 text-yellow-500' : 'text-white'}">${item.text}</span></div></div>`).join('');
    document.getElementById('progressText').innerText = Math.round((myWird.filter(i => i.done).length / myWird.length) * 100) + '%';
    localStorage.setItem('aba_wird_v12', JSON.stringify(myWird));
}
window.toggleWirdAction = (i) => { let myWird = JSON.parse(localStorage.getItem('aba_wird_v12')); myWird[i].done = !myWird[i].done; localStorage.setItem('aba_wird_v12', JSON.stringify(myWird)); renderWird(); };

// ==================== 7. آية عشوائية ====================
window.getRandomAyah = async () => {
    const textEl = document.getElementById('ayahText');
    if(!textEl) return;
    const randomID = Math.floor(Math.random() * 6236) + 1;
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomID}/editions/quran-uthmani,ar.jalalayn`);
        const data = await res.json();
        if(data.status === "OK") {
            textEl.innerText = `﴿ ${data.data[0].text} ﴾`;
            document.getElementById('tafsirText').innerText = data.data[1].text;
            document.getElementById('surahName').innerText = `سورة ${data.data[0].surah.name}`;
            document.getElementById('ayahNumber').innerText = data.data[0].numberInSurah;
        }
    } catch (e) { console.log("خطأ في جلب الآية"); }
};

// ==================== 8. التشغيل ====================
document.addEventListener('DOMContentLoaded', () => {
    renderWird(); 
    fetchPrayers();
    getRandomAyah();
    if (localStorage.getItem('aba_dark') === 'true') document.body.classList.add('dark-mode');
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }
});
