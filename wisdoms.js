// مصفوفة الحكم (المصدر الوحيد للحكم)
const abaMalikWisdoms = {
    main: "كُنْ مَاهِراً لِيَحْتَاجَكَ النَّاس, وَكُنْ هَيِّناً لِيُحِبَّكَ النَّاس.",
    others: [
        "من استشار، شارك الناس في عقولهم.",
        "العدل أساس الملك.",
        "القائد الناجح هو من يصنع قادة، وليس من يصنع أتباعاً.",
        "الدقة في التنفيذ هي الفارق بين الهواة والمحترفين.",
        "الأمانة في العمل تفتح لك أبواب الرزق من حيث لا تحتسب.",
        "قوة الرجل في هدوئه، وهيبته في صدق كلمته.",
        "التواضع عند الرفعة، والعفو عند القدرة.. شيم الكبار.",
        "لا يقاس النجاح بالموقع الذي يتبوأه المرء، بل بالصعاب التي تغلب عليها."
    ]
};

// وظيفة اختيار الحكمة
function getRandomWisdom() {
    // نسبة 60% للحكمة الرئيسية
    return Math.random() > 0.4 
        ? abaMalikWisdoms.main 
        : abaMalikWisdoms.others[Math.floor(Math.random() * abaMalikWisdoms.others.length)];
}

// وظيفة إظهار النافذة
function showWisdom() {
    const modal = document.getElementById('wisdomModal');
    const textZone = document.getElementById('wisdomText');
    
    if (modal && textZone) {
        textZone.innerText = getRandomWisdom(); // وضع النص
        modal.classList.remove('hidden'); // إظهار النافذة
        
        // إضافة حركة دخول جميلة (Animate.css)
        const modalContent = modal.querySelector('.glass');
        modalContent.classList.add('animate__animated', 'animate__zoomIn');
    }
}

// وظيفة إغلاق النافذة
function closeWisdom() {
    const modal = document.getElementById('wisdomModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// إغلاق عند الضغط خارج نافذة الحكمة
window.addEventListener('click', function(event) {
    const modal = document.getElementById('wisdomModal');
    if (event.target === modal) {
        closeWisdom();
    }
});
        
