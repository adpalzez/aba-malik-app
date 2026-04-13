let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// الاستماع لحدث جاهزية التثبيت
window.addEventListener('beforeinstallprompt', (e) => {
    // منع النافذة التلقائية للمتصفح
    e.preventDefault();
    deferredPrompt = e;
    // إظهار الزر في أسفل اليمين
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

// تنفيذ التثبيت عند الضغط على الزر
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('تم قبول تثبيت تطبيق أبا مالك');
            }
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });
}

// تسجيل الـ Service Worker للعمل بدون إنترنت
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(() => console.log("تطبيق أبا مالك: نظام الأوفلاين نشط"))
    .catch(err => console.log("خطأ في النظام:", err));
}
