const compassButton = document.getElementById('startCompassBtn');
const compassElement = document.getElementById('compass');

if (compassButton) {
    compassButton.addEventListener('click', () => {
        // 1. التحقق من أجهزة الآيفون (iOS 13+) التي تتطلب إذن صريح
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        // بدء الاستماع لحركة الجهاز بعد قبول الإذن
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        compassButton.style.display = 'none'; // إخفاء الزر بعد التفعيل بنجاح
                    } else {
                        alert('عذراً، يتطلب التطبيق إذن الوصول للمستشعر لتشغيل البوصلة!');
                    }
                })
                .catch(error => {
                    console.error('خطأ في طلب الإذن على الآيفون:', error);
                });
        } else {
            // 2. أجهزة الأندرويد والمتصفحات الأخرى (لا تحتاج إذن صريح وتعمل مباشرة)
            if ('ondeviceorientationabsolute' in window) {
                // الأندرويد الحديث يفضل الحساب المطلق لتجنب الانحراف
                window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            } else {
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
            compassButton.style.display = 'none'; // إخفاء الزر
        }
    });
}

// دالة معالجة حركة واتجاه الهاتف
function handleOrientation(event) {
    let heading = 0;

    // أجهزة الآيفون (توفر خاصية جاهزة ومباشرة للشمال المغناطيسي)
    if (event.webkitCompassHeading !== undefined) {
        heading = event.webkitCompassHeading;
    } 
    // أجهزة الأندرويد (تعتمد على الزاوية المطلقة لـ alpha)
    else if (event.alpha !== null) {
        heading = 360 - event.alpha; 
    }

    // تدوير صورة البوصلة بناءً على الدرجة المحسوبة
    if (compassElement) {
        // نقوم بالتدوير بعكس الاتجاه (سالب) لكي تظل البوصلة متجهة للشمال دائماً
        compassElement.style.transform = `rotate(${-heading}deg)`;
    }
                       }
