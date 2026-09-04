(function () {
  'use strict';

  var dictionaries = {
    en: {
      "منصة ثمار": "Thimar Platform", "منصة ثِمار": "Thimar Platform", "لحفظ القرآن الكريم": "for memorizing the Holy Quran", "نظام إدارة الطلاب": "Student Management System", "دخول النظام": "System Login", "دخول": "Log in", "تسجيل الدخول": "Log in", "تسجيل الخروج": "Log out", "خروج": "Log out", "إنشاء حساب جديد": "Create account", "ليس لديك حساب؟": "Don't have an account?", "أليس لديك حساب؟": "Don't have an account?", "هل نسيت الرقم السري؟": "Forgot your password?", "هل نسيت Password؟": "Forgot your password?", "تغيير اللغة / Change language": "Change language", "Change language / Change language": "Change language", "تغيير اللغة": "Change language", "تبديل اللغة": "Switch language",
      "اسم المستخدم": "Username", "الرقم السري": "Password", "أدخل الرقم السري": "Enter your password", "أدخل اسم المستخدم": "Enter username", "أدخل اسم المستخدم والرقم السري": "Enter your username and password", "أو رقم الموبايل للمسؤول": "or admin mobile number", "للمسؤول": "for the admin", "للمسؤول فقط": "for the admin only", "إظهار الرقم السري": "Show password", "إظهار Password": "Show password", "إخفاء الرقم السري": "Hide password", "إخفاء Password": "Hide password",
      "الرئيسية": "Home", "الصفحة الرئيسية": "Home", "لوحة التحكم": "Dashboard", "الإعدادات": "Settings", "إعدادات المسؤول": "Admin settings", "الرسائل": "Messages", "الرسائل الواردة": "Inbox", "محادثة": "Chat", "التواصل": "Contact", "✉️ التواصل": "✉️ Compose", "التنبيهات": "Notifications", "الأدوات": "Tools", "فتح قائمة الأدوات": "Open tools menu", "إغلاق القائمة": "Close menu", "الملفات": "Files", "الملفات المرفوعة": "Uploaded files", "الملفات لمرفوعة": "Uploaded files", "الملفات المرسلة لي": "Files sent to me", "المسؤول": "Admin", "المسؤولون": "Admins", "الطالب": "Student", "الطلاب": "Students", "المعلم": "Teacher", "المعلمين": "Teachers", "ولي الأمر": "Parent", "أولياء الأمور": "Parents",
      "التحكم الكامل في النظام والطلاب": "Full control over the system and students", "متابعة المواد والواجبات والحفظ": "Track subjects, homework and memorization", "متابعة ابنك/ابنتك والتقارير": "Follow your child and reports", "مرحباً بك — اختر طريقة استخدامك للموقع": "Welcome — choose how you want to use the site", "تسجيل بجوجل أو رقم الواتساب ثم إرسال طلب للمسؤول": "Sign up with Google or WhatsApp, then send a request to the admin",
      "المصحف الشريف": "Holy Quran", "القرآن الكريم": "The Holy Quran", "الاختبارات": "Exams", "قائمة الاختبار": "Exam list", "توليد الأسئلة بالذكاء الاصطناعي": "Generate questions with AI", "الواجبات": "Homework", "المهام": "Tasks", "التسميع": "Recitation", "التسجيل الصوتي": "Audio recording", "التقارير": "Reports", "الحضور والغياب": "Attendance", "المواد الدراسية": "Subjects", "مكافحة الغش": "Anti-cheat", "تحليل التسجيل": "Analyze recording", "مساعد الذكاء الاصطناعي": "AI assistant", "المحادثة مع الذكاء الاصطناعي": "AI chat", "مخطط التقييم": "Evaluation chart", "صندوق التسجيلات": "Recordings inbox", "مساعد تطوير الموقع": "Site development assistant", "مزامنة GitHub": "GitHub Sync", "أدوات المسؤول": "Admin tools", "أدوات الطالب": "Student tools", "أدوات ولي الأمر": "Parent tools",
      "حفظ": "Save", "حفظ الطالب": "Save student", "حفظ التغييرات": "Save changes", "حفظ التعديلات": "Save changes", "إلغاء": "Cancel", "حذف": "Delete", "تعديل": "Edit", "إضافة": "Add", "رجوع": "Back", "إرسال": "Send", "تحميل": "Loading", "جار التحميل...": "Loading...", "جارٍ التحميل...": "Loading...", "تحديث": "Refresh", "بحث": "Search", "التالي": "Next", "السابق": "Previous", "إغلاق": "Close", "تأكيد": "Confirm", "إعادة المحاولة": "Try again", "نجح": "Succeeded", "فشل": "Failed", "مفتوح": "Open", "مغلق": "Closed", "لا توجد بيانات": "No data available", "حدث خطأ": "An error occurred", "خطأ في الشبكة": "Network error", "تم الحفظ بنجاح": "Saved successfully", "تعذر الحفظ": "Could not save", "نعم": "Yes", "لا": "No", "الاسم": "Name", "الاسم بالكامل": "Full name", "الاسم بالكامل *": "Full name *", "تاريخ الميلاد": "Date of birth", "الصف الدراسي": "Grade", "النتيجة": "Result", "الوقت المتبقي": "Time remaining", "حالة الجلسة": "Session status", "محظور": "Blocked", "مفعل": "Enabled", "غير مفعل": "Disabled",
      "استرجاع الحساب": "Account recovery", "طلب استرداد الحساب": "Account recovery request", "استرجاع الحساب": "Recover account", "أدخل البيانات المسجلة بالحساب. لن يتم إرسال الطلب إلا بعد مطابقتها بالكامل.": "Enter the data registered on the account. The request is sent only after all details match.", "نوع الحساب *": "Account type *", "طالب": "Student", "ولي أمر": "Parent", "الاسم المسجل بالحساب": "Name registered on the account", "كود الهوية أو جواز السفر": "National ID or passport number", "كود الهوية أو جواز السفر *": "National ID or passport number *", "الرقم القومي": "National ID", "الرقم القومي *": "National ID *", "الرقم القومي المسجل": "Registered national ID", "رقم الهاتف": "Phone number", "رقم الهاتف *": "Phone number *", "رقم الموبايل": "Mobile number", "رقم الموبايل الحالي (للتأكيد)": "Current mobile number (for confirmation)", "رقم الموبايل الجديد": "New mobile number", "رقم واتساب المسؤول لاستلام طلبات الانضمام": "Admin WhatsApp number for join requests", "الرقم الدولي": "International number", "الرقم بدون كود الدولة": "Local number without country code", "اختر الدولة": "Choose country", "بحث عن الدولة": "Search countries", "كود دولة الهاتف": "Phone country code", "كود دولة الواتساب": "WhatsApp country code", "دولة الهوية": "Identity country", "دولة رقم الهاتف": "Phone country", "صيغة الدولة المختارة": "Format for the selected country",
      "إنشاء حساب — التحقق من الهوية": "Create account — identity verification", "بيانات طلب الانضمام": "Join request details", "اختر طريقة التسجيل": "Choose a sign-up method", "اختر طريقة التسجيل، وسيتم إرسال رسالة تحقق على واتساب للتأكد من هويتك قبل إدخال البيانات.": "Choose a sign-up method. A WhatsApp verification message will confirm your identity before you enter your data.", "التسجيل بحساب جوجل": "Sign up with Google", "التسجيل برقم الهاتف (واتساب)": "Sign up with phone (WhatsApp)", "اختر حساب جوجل لإكمال التسجيل *": "Choose a Google account to complete sign-up *", "اضغط لعرض حسابات جوجل الموجودة على جهازك واختيار أحدها. لن يُطلب منك رقم هاتف أو كود تحقق.": "Click to show Google accounts on this device. No phone number or verification code is required.", "رقم الواتساب لاستلام كود التحقق *": "WhatsApp number to receive the verification code *", "إرسال كود التحقق على واتساب": "Send verification code on WhatsApp", "كود التحقق (6 أرقام) *": "Verification code (6 digits) *", "أدخل الكود الذي وصلك": "Enter the code you received", "تأكيد الهوية والمتابعة": "Verify identity and continue", "إعادة إرسال الكود": "Resend code", "اسم ولي الأمر *": "Parent name *", "اسم الطالب *": "Student name *", "الاسم كما في البطاقة": "Name as shown on the ID", "اكتب اسم ولي الأمر بالكامل": "Enter the parent full name", "اكتب اسم الطالب بالكامل": "Enter the student full name", "أي معلومات إضافية تريد إبلاغ المسؤول بها": "Any additional information for the admin", "الجزء": "Juz", "السورة": "Surah", "اختر الجزء...": "Choose Juz...", "اختر الجزء أولاً...": "Choose a Juz first...", "اختر السورة...": "Choose a Surah...", "ملاحظات": "Notes", "إرسال الطلب للمسؤول": "Send request to admin",
      "دخول المسؤول": "Admin login", "الرقم السري الحالي (للتأكيد)": "Current password (for confirmation)", "الرقم السري الجديد": "New password", "نوع المسؤول": "Admin type", "فرعي": "Sub-admin", "رئيسي": "Main", "التحكم": "Actions", "غير قابل للتعديل": "Not editable", "إضافة مسؤول": "Add admin", "إدارة المسؤولين": "Manage admins", "تأكيد الهوية": "Identity confirmation", "البيانات الجديدة": "New data",
      "إضافة طالب جديد": "Add new student", "تعديل بيانات الطالب": "Edit student data", "اسم الطالب": "Student name", "اسم المستخدم": "Username", "اسم المستخدم لتسجيل الدخول": "Username for sign in", "السن": "Age", "السن (يحسب تلقائياً)": "Age (calculated automatically)", "الدولة ورقم الهاتف": "Country and phone number", "المواد الدراسية": "Subjects", "اضغط Ctrl لاختيار أكثر من مادة": "Press Ctrl to select more than one subject", "ملاحظات إضافية": "Additional notes", "بيانات حفظ القرآن الكريم": "Quran memorization details", "البصمة الصوتية": "Voiceprint", "اختياري": "Optional", "جاهز": "Ready", "جاهز للتسجيل": "Ready to record", "بدء التسجيل": "Start recording", "إيقاف مؤقت": "Pause", "استكمال التسجيل": "Resume recording", "إدخال البيانات بالصوت": "Enter data by voice",
      "تم التحقق من هويتك بنجاح.": "Your identity was verified successfully.", "الرقم القومي يجب أن يكون 14 رقم بالضبط": "The national ID must be exactly 14 digits.", "رقم الهاتف يجب أن يكون 11 رقم": "The phone number must match the selected country.", "رقم الموبايل يجب أن يكون 11 رقم": "The mobile number must match the selected country.", "يرجى ملء جميع الحقول المطلوبة": "Please complete all required fields.", "يرجى إدخال الاسم وكود الهوية ورقم الهاتف وفق صيغة الدولة المختارة.": "Enter the name, identity number, and phone number using the selected country formats.", "لا يوجد طلاب مسجلين": "No students are registered", "لا توجد تنبيهات حتى الآن.": "There are no notifications yet.", "تحديد الكل كمقروء": "Mark all as read", "مقروء": "Read", "غير مقروء": "Unread", "نوع الحساب": "Account type", "الهاتف": "Phone", "وقت الطلب": "Request time", "استرجاع حساب": "Account recovery", "تنبيه عام": "General alert", "مخالفة": "Violation", "إنذار خاطئ": "False alarm",
      "الكاميرا غير متاحة": "Camera unavailable", "تم رفض صلاحية الكاميرا": "Camera permission was denied", "الكاميرا مستخدمة بواسطة تطبيق آخر": "Camera is being used by another app", "المتصفح لا يدعم الكاميرا": "This browser does not support the camera", "حدث خطأ أثناء تشغيل الكاميرا": "An error occurred while starting the camera", "البصمة الصوتية": "Voiceprint", "بدء التسجيل": "Start recording", "إيقاف التسجيل": "Stop recording", "تسجيل الصوت": "Record audio", "إعدادات العرض": "Display settings", "تبديل الوضع": "Toggle theme", "قال تعالى:": "Allah Almighty said:", "صدق الله العظيم": "Allah Almighty has spoken the truth", "مصحف مفتوح على حامل خشبي": "An open Quran on a wooden stand"
    }
  };

  var religiousSelector = '[data-no-translate],.quran-text,.ayah,.hadith,.dhikr,.thimar-ayah-frame,.thimar-ayah-ref,.thimar-footer .ayah,.thimar-footer .ref,.thimar-footer-sidq,[lang="ar-QA"]';
  var locale = localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
  var originals = new WeakMap();
  var attributeNames = ['placeholder', 'title', 'aria-label', 'aria-description', 'alt', 'value'];

  function isProtected(node) {
    var parent = node && (node.nodeType === Node.TEXT_NODE ? node.parentElement : node);
    return !parent || !!parent.closest('script,style,noscript,code,pre,' + religiousSelector);
  }

  function dictionaryFor(target) {
    if (target === 'en') return dictionaries.en;
    if (!dictionaries._ar) dictionaries._ar = Object.keys(dictionaries.en).reduce(function (result, key) {
      if (!result[dictionaries.en[key]]) result[dictionaries.en[key]] = key;
      return result;
    }, {});
    return dictionaries._ar;
  }

  function translate(value, target) {
    if (!value) return value;
    var dict = dictionaryFor(target || locale);
    var result = value;
    Object.keys(dict).sort(function (a, b) { return b.length - a.length; }).forEach(function (key) {
      if (result.indexOf(key) !== -1) result = result.split(key).join(dict[key]);
    });
    return result;
  }

  function applyText(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim() || isProtected(node)) continue;
      if (!originals.has(node)) originals.set(node, node.nodeValue);
      var source = originals.get(node);
      node.nodeValue = locale === 'ar' ? translate(source, 'ar') : translate(source, 'en');
    }
  }

  function applyAttributes(root) {
    var elements = [];
    if (root && root.nodeType === Node.ELEMENT_NODE) elements.push(root);
    if (root && root.querySelectorAll) elements = elements.concat(Array.prototype.slice.call(root.querySelectorAll('input,textarea,button,select,option,[title],[aria-label],[aria-description],[alt]')));
    elements.forEach(function (element) {
      if (isProtected(element)) return;
      attributeNames.forEach(function (attribute) {
        if (!element.hasAttribute(attribute)) return;
        if (attribute === 'value' && !['button', 'submit', 'reset'].includes(String(element.type || '').toLowerCase())) return;
        var key = 'data-i18n-original-' + attribute;
        if (!element.hasAttribute(key)) element.setAttribute(key, element.getAttribute(attribute) || '');
        var source = element.getAttribute(key) || '';
        element.setAttribute(attribute, locale === 'ar' ? translate(source, 'ar') : translate(source, 'en'));
      });
    });
  }

  function apply(root) {
    if (!root) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'en' ? 'ltr' : 'rtl';
    applyText(root);
    applyAttributes(root);
    var button = document.getElementById('langToggleBtn');
    if (button) {
      button.textContent = locale === 'en' ? 'ع' : 'EN';
      button.setAttribute('aria-label', locale === 'en' ? 'Switch to Arabic' : 'Switch to English');
    }
    document.querySelectorAll('.country-search').forEach(function (search) {
      search.placeholder = locale === 'en' ? 'Search countries' : 'بحث عن الدولة';
      search.setAttribute('aria-label', locale === 'en' ? 'Search countries' : 'بحث عن الدولة');
    });
  }

  function setLocale(next) {
    locale = next === 'en' ? 'en' : 'ar';
    localStorage.setItem('lang', locale);
    apply(document.body);
  }

  window.ThimarI18n = {
    apply: apply,
    setLocale: setLocale,
    t: function (value) { return translate(value, locale); },
    getLocale: function () { return locale; }
  };

  window.addEventListener('languagechange', function () {
    // The event is a notification, not a second toggle. This prevents Arabic -> English -> Arabic flips.
    locale = localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
    apply(document.body);
  });

  var observerFrame = 0;
  var pendingRoots = [];
  function scheduleApply(root) {
    if (!root) return;
    if (pendingRoots.indexOf(root) === -1) pendingRoots.push(root);
    if (observerFrame) return;
    var flush = function () {
      observerFrame = 0;
      var roots = pendingRoots.splice(0, pendingRoots.length);
      roots.slice(0, 12).forEach(apply);
      if (roots.length > 12) {
        pendingRoots = roots.slice(12).concat(pendingRoots);
        scheduleApply(pendingRoots[0]);
      }
    };
    observerFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(flush) : setTimeout(flush, 0);
  }

  function init() {
    apply(document.body);
    var observer = new MutationObserver(function (records) {
      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes, function (added) {
          if (added.nodeType === Node.ELEMENT_NODE || added.nodeType === Node.TEXT_NODE) scheduleApply(added.nodeType === Node.TEXT_NODE ? added.parentElement : added);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
