/**
 * نظام التقييم بالنجوم - تطبيق أبا مالك العقيلي
 * مبرمج للعمل مع Firebase Firestore
 */

let userRating = 0;

// 1. فتح نافذة التقييم
function openRating() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

// 2. إغلاق نافذة التقييم
function closeRating() {
    const modal = document.getElementById('ratingModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// 3. اختيار عدد النجوم (التفاعل البصري)
function setRating(n) {
    userRating = n;
    const stars = document.querySelectorAll('.star-btn');
    
    stars.forEach((star, i) => {
        if (i < n) {
            // تلوين النجوم المختارة
            star.classList.remove('far', 'text-gray-400');
            star.classList.add('fas', 'text-yellow-400');
        } else {
            // إرجاع النجوم غير المختارة
            star.classList.remove('fas', 'text-yellow-400');
            star.classList.add('far', 'text-gray-400');
        }
    });

    // تفعيل زر الإرسال وتغيير مظهره
    const btn = document.getElementById('submitRatingBtn');
    if (btn) {
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btn.classList.add('animate__animated', 'animate__pulse', 'bg-orange-500');
    }
}

// 4. إرسال التقييم لـ Firebase
function submitRating() {
    if (typeof db !== 'undefined' && userRating > 0) {
        db.collection('ratings').add({
            stars: userRating,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            device: navigator.userAgent.substring(0, 50)
        })
        .then(() => {
            alert(`شكراً لك يا أبا مالك! تم تسجيل ${userRating} نجوم بنجاح 🌟`);
            closeRating();
        })
        .catch(err => {
            console.error("Firebase Error:", err);
            alert("عذراً، حدث خطأ أثناء الإرسال. تأكد من اتصال الإنترنت.");
        });
    } else {
        alert("برجاء اختيار النجوم أولاً!");
    }
}
