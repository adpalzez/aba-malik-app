window.openQuranApp = () => {
    // محاولة فتح التطبيق المخصص
    const appIntent = "intent://#Intent;scheme=http;package=com.simppro.qurankarim;end";
    window.location.href = appIntent;
    
    // بديل إذا لم يفتح
    setTimeout(function() {
        if (!document.hidden) window.location.href = "https://quran.com/ar";
    }, 2500);
};
