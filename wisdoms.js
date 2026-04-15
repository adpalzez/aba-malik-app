// --- 1. قاعدة بيانات الحكم (Wisdom Encyclopedia) ---
const wisdomData = {
    main: "كُنْ مَاهِراً لِيَحْتَاجَكَ النَّاس, وَكُنْ هَيِّناً لِيُحِبَّكَ النَّاس.",
    others: [
        "من استشار، شارك الناس في عقولهم.",
        "العدل أساس الملك.",
        "القائد الناجح هو من يصنع قادة، وليس من يصنع أتباعاً.",
        "الصبر مفتاح الفرج.",
        "العلم في الصغر كالنقش على الحجر.",
        "العمل المتقن يفرض نفسه.",
        "احرص على ما ينفعك، واستعن بالله.",
        "الدقة في التنفيذ هي الفارق بين الهواة والمحترفين.",
        "الأمانة في العمل تفتح لك أبواب الرزق من حيث لا تحتسب.",
        "قوة الرجل في هدوئه، وهيبته في صدق كلمته.",
        "التواضع عند الرفعة، والعفو عند القدرة.. شيم الكبار.",
        "لا يقاس النجاح بالموقع الذي يتبوأه المرء، بل بالصعاب التي تغلب عليها."
    ]
};

// --- 2. وظائف المنطق (Logic Functions) ---

// دالة تجلب حكمة عشوائية بناءً على الاحتمالات
function getRandomWisdom() {
    const probability = Math.random();
    // احتمال 60% لظهور الحكمة الرئيسية و 40% للحكم الأخرى
    if (probability > 0.4) {
        return wisdomData.main;
    } else {
        const randomIndex = Math.floor(Math.random() * wisdomData.others.length);
        return wisdomData.others[randomIndex];
    }
}

// وظيفة إظهار النافذة المنبثقة (Modal)
function showWisdom() {
    const modal = document.getElementById('wisdomModal');
    const textZone = document.getElementById('wisdomText');
    
    if (modal && textZone) {
        // تعيين النص عشوائياً
        textZone.innerHTML = getRandomWisdom();
        
        // إظهار النافذة بحركة انسيابية (باستخدام Animate.css إذا كانت متوفرة)
        modal.classList.remove('hidden'); 
        modal.classList.add('flex', 'animate__animated', 'animate__fadeIn');
    }
}

// وظيفة إغلاق النافذة
function closeWisdom() { 
    const modal = document.getElementById('wisdomModal');
    if (modal) {
        modal.classList.add('hidden'); 
        modal.classList.remove('flex');
    }
}

// --- 3. تحسين تجربة المستخدم (UX) ---

// إغلاق النافذة عند الضغط في أي مكان خارج محتوى النافذة
window.addEventListener('click', function(event) {
    const modal = document.getElementById('wisdomModal');
    if (event.target === modal) {
        closeWisdom();
    }
});

// إغلاق النافذة عند الضغط على زر Escape من لوحة المفاتيح
window.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeWisdom();
    }
});
