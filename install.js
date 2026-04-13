let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// إعداد شكل الزر برمجياً ليكون أحمر في منتصف الأسفل
if (installBtn) {
    installBtn.style.backgroundColor = '#dc2626'; // اللون الأحمر (Tailwind red-600)
    installBtn.style.color = 'white';
    installBtn.style.position = 'fixed';
    installBtn.style.bottom = '20px';
    installBtn.style.left = '50%';
    installBtn.style.transform = 'translateX(-50%)';
    installBtn.style.padding = '15px 30px';
    installBtn.style.borderRadius = '50px';
    installBtn.style.fontWeight = 'bold';
    installBtn.style.boxShadow = '0 10px 25px rgba(220, 38, 38, 0.4)';
    installBtn.style.zIndex = '1000';
    installBtn.innerHTML = '<i class="fas fa-download ml-2"></i> تثبيت التطبيق';
    installBtn.style.display = 'none'; // مخفي في البداية
}

// الاستماع لحدث جاهزية التثبيت
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
        installBtn.style.display = 'block'; // يظهر الزر عند جاهزية المتصفح
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

// تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(() => console.log("تطبيق أبا مالك: نظام الأوفلاين نشط"));
}
