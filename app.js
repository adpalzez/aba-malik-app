// ==================== 1. نظام التثبيت والإعدادات ====================
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
        if (outcome === 'accepted') {
            const btn = document.getElementById('installBtn');
            if(btn) btn.classList.add('hidden');
        }
        deferredPrompt = null;
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
    const toggleBtn = document.getElementById('darkToggle');
    if(toggleBtn) toggleBtn.classList.toggle('active', isDark); 
};

// ==================== 2. المواقيت وحساب القبلة الدقيق ====================
let prayerTimes = {};
let QIBLA_DEGREE = 136.2; // قيمة ابتدائية سيتم تحديثها بالـ GPS

// خوارزمية حساب القبلة الدقيقة بناءً على خطوط الطول والعرض
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
    
    // حساب القبلة الدقيقة فوراً لموقعك الحالي
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
        
        const hDate = document.getElementById('hijriDate');
        if(hDate) hDate.innerText = `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar}`;
        
        const gDate = document.getElementById('gregDate');
        if(gDate) gDate.innerText = data.data.date.gregorian.date;
        
        startCountdown();
    } catch (e) { console.log("خطأ في الاتصال"); }
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
            const countElem = document.getElementById('mainCountdown');
            if(countElem) countElem.innerText = `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
            
            const titleElem = document.getElementById('nextPrayerTitle');
            if(titleElem) titleElem.innerText = `باقي على موعد ${next.n}`;
        }
    }, 1000);
}

// ==================== 3. محرك البوصلة المطابق للفيديو ====================
let isCompassActive = false; 

window.toggleCompass = async () => {
    const cont = document.getElementById('qiblaContainer'); 
    if(!cont) return;

    if (!isCompassActive) {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try { 
                const permission = await DeviceOrientationEvent.requestPermission(); 
                if (permission !== 'granted') return alert('يجب الموافقة على المستشعرات لتعمل البوصلة'); 
            } catch (e) { console.error(e); }
        }
        
        // تثبيت موقع الكعبة بناءً على الحساب الدقيق لموقعك
        const kaaba = document.getElementById('kaabaMarker');
        if(kaaba) kaaba.style.transform = `rotate(${QIBLA_DEGREE}deg)`;

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
        
        cont.classList.remove('hidden');
        cont.classList.add('flex');
        isCompassActive = true;
    } else {
        window.removeEventListener('deviceorientationabsolute', handleOrientation); 
        window.removeEventListener('deviceorientation', handleOrientation);
        
        cont.classList.add('hidden');
        cont.classList.remove('flex');
        isCompassActive = false;
    }
};

function handleOrientation(e) {
    let heading;
    // دعم دقيق للآيفون والأندرويد
    if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
        heading = 360 - e.alpha;
    } else {
        return;
    }

    // دوران قرص البوصلة بالكامل
    const dial = document.getElementById('compassDial');
    if(dial) dial.style.transform = `rotate(${-heading}deg)`;
    
    // كتابة الدرجة الحالية
    const textElem = document.getElementById('headingText');
    if(textElem) textElem.innerText = heading.toFixed(1) + '°';

    // التحقق من التطابق مع درجة القبلة الدقيقة
    let diff = Math.abs(heading - QIBLA_DEGREE);
    
    const innerDrop = document.getElementById('teardropInner');
    const iconDrop = document.getElementById('teardropIcon');

    if(innerDrop && iconDrop) {
        if (diff < 3 || diff > 357) {
            // حالة النجاح
            innerDrop.style.backgroundColor = '#2a7a6c'; 
            iconDrop.style.color = 'white';              
            if (navigator.vibrate) navigator.vibrate(20); 
        } else {
            // الحالة العادية
            innerDrop.style.backgroundColor = '#eaf5f4'; 
            iconDrop.style.color = '#2a7a6c';            
        }
    }
}

// ==================== 4. المسبحة ====================
let tCount = 0; let zikrIndex = 0; const azkarList = ["سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر"];
window.openTasbih = () => {
    const modal = document.getElementById('tasbihModal');
    if(modal) modal.style.display = 'flex';
};
window.closeTasbih = () => {
    const modal = document.getElementById('tasbihModal');
    if(modal) modal.style.display = 'none';
};
window.nextZikr = () => { 
    zikrIndex = (zikrIndex + 1) % azkarList.length; 
    const txt = document.getElementById('currentZikrText');
    if(txt) txt.innerText = azkarList[zikrIndex]; 
    window.resetTasbih(); 
};
window.prevZikr = () => { 
    zikrIndex = (zikrIndex - 1 + azkarList.length) % azkarList.length; 
    const txt = document.getElementById('currentZikrText');
    if(txt) txt.innerText = azkarList[zikrIndex]; 
    window.resetTasbih(); 
};
window.countTasbih = () => { 
    tCount++; 
    const tc = document.getElementById('tasbihCounter');
    if(tc) tc.innerText = tCount; 
};
window.resetTasbih = () => { 
    tCount = 0; 
    const tc = document.getElementById('tasbihCounter');
    if(tc) tc.innerText = 0; 
};

// ==================== 5. الورد اليومي ====================
function renderWird() {
    const list = document.getElementById('wirdList'); if (!list) return;
    let myWird = JSON.parse(localStorage.getItem('aba_wird_v12')) || [
        { text: "قراءة صفحة من القرآن", done: false }, { text: "أذكار الصباح", done: false }, { text: "الاستغفار (100)", done: false }
    ];
    list.innerHTML = myWird.map((item, i) => `<div class="flex items-center justify-between p-4 bg-white/5 rounded-[25px] border border-white/5 mb-2"><div class="flex items-center gap-4"><div onclick="toggleWirdAction(${i})" class="w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer ${item.done ? 'bg-yellow-600 border-yellow-600' : 'border-white/20'}">${item.done ? '<i class="fas fa-check text-white text-xs"></i>' : ''}</div><span class="text-sm font-bold ${item.done ? 'line-through opacity-30 text-yellow-500' : 'text-white'}">${item.text}</span></div></div>`).join('');
    
    const prog = document.getElementById('progressText');
    if(prog) prog.innerText = Math.round((myWird.filter(i => i.done).length / myWird.length) * 100) + '%';
    
    localStorage.setItem('aba_wird_v12', JSON.stringify(myWird));
}

window.toggleWirdAction = (i) => { 
    let myWird = JSON.parse(localStorage.getItem('aba_wird_v12')); 
    myWird[i].done = !myWird[i].done; 
    localStorage.setItem('aba_wird_v12', JSON.stringify(myWird)); 
    renderWird(); 
};

// ==================== 6. التشغيل عند التحميل ====================
document.addEventListener('DOMContentLoaded', () => {
    renderWird(); 
    fetchPrayers();
    if (localStorage.getItem('aba_dark') === 'true') { 
        document.body.classList.add('dark-mode'); 
        const tog = document.getElementById('darkToggle');
        if(tog) tog.classList.add('active'); 
    }
});

// ==================== 7. تشغيل وضع الأوفلاين (بدون إنترنت) ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('تم تفعيل وضع عدم الاتصال (Offline) بنجاح'))
            .catch(err => console.log('خطأ في تفعيل الأوفلاين:', err));
    });
}
    // ==================== 8. نظام التنبيهات الذكية ====================

// طلب إذن التنبيهات من المستخدم
async function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    
    if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("تم تفعيل التنبيهات بنجاح");
        }
    }
}

// وظيفة لإرسال تنبيه فوري
function sendSmartNotification(title, body) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: 'https://i.ibb.co/pBhzxHdM/1000027317.jpg', // صورتك الشخصية كأيقونة
                badge: 'https://i.ibb.co/pBhzxHdM/1000027317.jpg',
                vibrate: [200, 100, 200],
                tag: 'prayer-time'
            });
        });
                         // ==================== 8. نظام التنبيهات الذكية ====================

// طلب إذن التنبيهات من المستخدم
async function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    
    if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("تم تفعيل التنبيهات بنجاح");
        }
    }
}

// وظيفة لإرسال تنبيه فوري
function sendSmartNotification(title, body) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: 'https://i.ibb.co/pBhzxHdM/1000027317.jpg', // صورتك الشخصية كأيقونة
                badge: 'https://i.ibb.co/pBhzxHdM/1000027317.jpg',
                vibrate: [200, 100, 200],
                tag: 'prayer-time'
            });
        });
    }
}

// ربط التنبيه مع مواقيت الصلاة
// داخل وظيفة startCountdown الموجودة لديك، أضف هذا الجزء:
if (hrs === 0 && mins === 0 && secs === 0) {
    sendSmartNotification("حان الآن موعد الصلاة", `حان الآن موعد أذان ${next.n} بتوقيتك المحلي`);
}

// تشغيل طلب الإذن عند فتح التطبيق
document.addEventListener('DOMContentLoaded', requestNotificationPermission);
        
