const abaMalikWisdoms = {
    main: "كُنْ مَاهِراً لِيَحْتَاجَكَ النَّاس, وَكُنْ هَيِّناً لِيُحِبَّكَ النَّاس.",
    others: [
        "من استشار، شارك الناس في عقولهم.",
        "العدل أساس الملك.",
        "القائد الناجح هو من يصنع قادة، وليس من يصنع أتباعاً.",
        "الدقة في التنفيذ هي الفارق بين الهواة والمحترفين.",
        "قوة الرجل في هدوئه، وهيبته في صدق كلمته.",
        "التواضع عند الرفعة، والعفو عند القدرة.. شيم الكبار."
    ]
};

function getRandomWisdom() {
    return Math.random() > 0.4 
        ? abaMalikWisdoms.main 
        : abaMalikWisdoms.others[Math.floor(Math.random() * abaMalikWisdoms.others.length)];
}

function showWisdom() {
    const modal = document.getElementById('wisdomModal');
    const textZone = document.getElementById('wisdomText');
    if (modal && textZone) {
        const wisdom = getRandomWisdom();
        textZone.innerText = wisdom;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // حفظ الحكمة الحالية للمشاركة
        window.currentWisdom = wisdom; 
    }
}

// وظيفة مشاركة الحكمة عبر واتساب
function shareWisdom() {
    const text = encodeURIComponent(`من تطبيق أبا مالك العقيلي:\n\n"${window.currentWisdom}"`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function closeWisdom() {
    document.getElementById('wisdomModal').classList.add('hidden');
    document.getElementById('wisdomModal').classList.remove('flex');
}
