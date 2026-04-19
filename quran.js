/**
 * محرك المصاحف الملكي - مملكة أبا مالك العقيلي
 * هذا الملف مسؤول عن فتح تطبيقات المصحف والروابط البديلة
 */

window.openQuranApp = () => {
    // 1. محاولة فتح التطبيق (المصحف الذي أرسلت صورته)
    // Package: com.simppro.qurankarim
    const appIntent = "intent://#Intent;scheme=http;package=com.simppro.qurankarim;end";
    
    // إرسال الأمر للهاتف
    window.location.href = appIntent;

    // 2. خيار احتياطي: إذا لم يفتح التطبيق خلال ثانيتين ونصف
    setTimeout(function() {
        if (!document.hidden) {
            // يفتح المصحف الإلكتروني (موقع ويب) كبديل
            window.location.href = "https://quran.com/ar";
        }
    }, 2500);
};

// يمكنك إضافة مصاحف أخرى هنا مستقبلاً
window.openGoldenQuran = () => {
    window.location.href = "intent://#Intent;scheme=http;package=com.moatamed.goldenquran;end";
};
