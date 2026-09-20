(function () {
  'use strict';

  var dictionaries = {
    en: {
      "منصة ثمار": "Thimar Platform",
      "منصة ثِمار": "Thimar Platform",
      "لحفظ القرآن الكريم": "for memorizing the Holy Quran",
      "نظام إدارة الطلاب": "Student Management System",
      "منصة القرآن والتعليم": "Quran & Education Platform",
      "دخول النظام": "System Login",
      "دخول": "Log in",
      "تسجيل الدخول": "Log in",
      "تسجيل الخروج": "Log out",
      "خروج": "Log out",
      "إنشاء حساب جديد": "Create account",
      "إنشاء حساب": "Create account",
      "ليس لديك حساب؟": "Don't have an account?",
      "أليس لديك حساب؟": "Don't have an account?",
      "هل نسيت الرقم السري؟": "Forgot your password?",
      "تغيير اللغة / Change language": "Change language",
      "تغيير اللغة": "Change language",
      "تبديل اللغة": "Switch language",
      "اسم المستخدم": "Username",
      "الرقم السري": "Password",
      "أدخل الرقم السري": "Enter your password",
      "أدخل اسم المستخدم": "Enter username",
      "أدخل اسم المستخدم والرقم السري": "Enter your username and password",
      "أو رقم الموبايل للمسؤول": "or admin mobile number",
      "للمسؤول": "for the admin",
      "للمسؤول فقط": "for the admin only",
      "إظهار الرقم السري": "Show password",
      "إخفاء الرقم السري": "Hide password",
      "الرئيسية": "Home",
      "الصفحة الرئيسية": "Home",
      "لوحة التحكم": "Dashboard",
      "الإعدادات": "Settings",
      "إعدادات المسؤول": "Admin settings",
      "إعدادات العرض": "Display settings",
      "تبديل الوضع": "Toggle theme",
      "الرسائل": "Messages",
      "الرسائل الواردة": "Inbox",
      "محادثة": "Chat",
      "التواصل": "Contact",
      "✉️ التواصل": "✉️ Contact",
      "التنبيهات": "Notifications",
      "الأدوات": "Tools",
      "فتح قائمة الأدوات": "Open tools menu",
      "إغلاق القائمة": "Close menu",
      "الملفات": "Files",
      "الملفات المرفوعة": "Uploaded files",
      "الملفات المرسلة لي": "Files sent to me",
      "المسؤول": "Admin",
      "المسؤولون": "Admins",
      "المسؤول الرئيسي": "Main Admin",
      "مسؤول فرعي": "Sub-admin",
      "الطالب": "Student",
      "الطلاب": "Students",
      "المعلم": "Teacher",
      "المعلمون": "Teachers",
      "المعلمين": "Teachers",
      "ولي الأمر": "Parent",
      "أولياء الأمور": "Parents",
      "التحكم الكامل في النظام والطلاب": "Full control over the system and students",
      "متابعة المواد والواجبات والحفظ": "Track subjects, homework and memorization",
      "متابعة ابنك/ابنتك والتقارير": "Follow your child and reports",
      "مرحباً بك — اختر طريقة استخدامك للموقع": "Welcome — choose how you want to use the site",
      "المصحف الشريف": "Holy Quran",
      "القرآن الكريم": "The Holy Quran",
      "الاختبارات": "Exams",
      "قائمة الاختبار": "Exam list",
      "توليد الأسئلة بالذكاء الاصطناعي": "Generate questions with AI",
      "الواجبات": "Homework",
      "المهام": "Tasks",
      "التسميع": "Recitation",
      "التسجيل الصوتي": "Audio recording",
      "التقارير": "Reports",
      "الحضور والغياب": "Attendance",
      "المواد الدراسية": "Subjects",
      "المواد": "Subjects",
      "مكافحة الغش": "Anti-cheat",
      "فحص الغش لهذا الاختبار": "Anti-cheat for this quiz",
      "تحليل التسجيل": "Analyze recording",
      "مساعد الذكاء الاصطناعي": "AI assistant",
      "المحادثة مع الذكاء الاصطناعي": "AI chat",
      "مخطط التقييم": "Evaluation chart",
      "صندوق التسجيلات": "Recordings inbox",
      "مساعد تطوير الموقع": "Site development assistant",
      "مزامنة GitHub": "GitHub Sync",
      "أدوات المسؤول": "Admin tools",
      "أدوات الطالب": "Student tools",
      "أدوات ولي الأمر": "Parent tools",
      "حفظ": "Save",
      "حفظ الطالب": "Save student",
      "حفظ التغييرات": "Save changes",
      "حفظ التعديلات": "Save changes",
      "إلغاء": "Cancel",
      "حذف": "Delete",
      "تعديل": "Edit",
      "إضافة": "Add",
      "رجوع": "Back",
      "إرسال": "Send",
      "تحميل": "Loading",
      "جار التحميل...": "Loading...",
      "جارٍ التحميل...": "Loading...",
      "تحديث": "Refresh",
      "بحث": "Search",
      "التالي": "Next",
      "السابق": "Previous",
      "إغلاق": "Close",
      "تأكيد": "Confirm",
      "إعادة المحاولة": "Try again",
      "نجح": "Succeeded",
      "فشل": "Failed",
      "مفتوح": "Open",
      "مغلق": "Closed",
      "مفعل": "Enabled",
      "غير مفعل": "Disabled",
      "محظور": "Blocked",
      "لا توجد بيانات": "No data available",
      "حدث خطأ": "An error occurred",
      "خطأ في الشبكة": "Network error",
      "تم الحفظ بنجاح": "Saved successfully",
      "تعذر الحفظ": "Could not save",
      "نعم": "Yes",
      "لا": "No",
      "الاسم": "Name",
      "الاسم بالكامل": "Full name",
      "الاسم بالكامل *": "Full name *",
      "تاريخ الميلاد": "Date of birth",
      "الصف الدراسي": "Grade",
      "السن": "Age",
      "النتيجة": "Result",
      "الوقت المتبقي": "Time remaining",
      "حالة الجلسة": "Session status",
      "استرجاع الحساب": "Account recovery",
      "طلب استرداد الحساب": "Account recovery request",
      "نوع الحساب *": "Account type *",
      "نوع الحساب": "Account type",
      "طالب": "Student",
      "ولي أمر": "Parent",
      "الرقم القومي": "National ID",
      "رقم الهاتف": "Phone number",
      "رقم الموبايل": "Mobile number",
      "اختر الدولة": "Choose country",
      "بحث عن الدولة": "Search countries",
      "الجزء": "Juz",
      "السورة": "Surah",
      "الآية": "Ayah",
      "ملاحظات": "Notes",
      "إرسال الطلب للمسؤول": "Send request to admin",
      "إضافة طالب جديد": "Add new student",
      "تعديل بيانات الطالب": "Edit student data",
      "اسم الطالب": "Student name",
      "البصمة الصوتية": "Voiceprint",
      "بدء التسجيل": "Start recording",
      "إيقاف التسجيل": "Stop recording",
      "تسجيل الصوت": "Record audio",
      "مواقيت الصلاة": "Prayer times",
      "الأذكار": "Dhikr",
      "حصن المسلم": "Muslim Fortress",
      "القبلة": "Qibla",
      "السبحة": "Digital Tasbih",
      "تم الاتصال بالإنترنت": "Connected to the Internet",
      "انقطع الاتصال بالإنترنت": "Internet connection lost",
      "الإنترنت متصل الآن": "Internet is now connected",
      "تعمل المنصة بالوضع غير المتصل": "Working in offline mode",
      "الوضع غير المتصل": "Offline mode",
      "وضع عدم الاتصال": "Offline mode",
      "الوضع المتصل": "Online mode",
      "متصل بالإنترنت": "Connected to Internet",
      "غير متصل بالإنترنت": "Offline",
      "غير متصل": "Offline",
      "متصل": "Online",
      "مزامنة البيانات": "Sync data",
      "جاري المزامنة...": "Syncing...",
      "تمت المزامنة بنجاح": "Synced successfully",
      "محفوظ محلياً": "Saved locally",
      "يعمل بدون إنترنت": "Works offline",
      "يتطلب اتصال بالإنترنت": "Requires internet",
      "قائمة انتظار المزامنة": "Sync queue",
      "مزامنة الآن": "Sync now",
      "أهلاً بك في ثمار": "Welcome to Thimar",
      "سجل دخولك لمتابعة وردك اليومي": "Log in to follow your daily progress",
      "٢٠٢٦ منصة ثمار التعليمية. جميع الحقوق محفوظة.": "2026 Thimar Educational Platform. All rights reserved.",
      "٢٠٢٦ منصة ثمار التعليمية": "2026 Thimar Educational Platform",
      "جميع الحقوق محفوظة": "All rights reserved",
      "مرحباً بك مجدداً في ثمار": "Welcome back to Thimar",
      "اسم المستخدم أو البريد الإلكتروني": "Username or Email",
      "أدخل بريدك الإلكتروني": "Enter your email",
      "تذكرني": "Remember me",
      "نسيت كلمة المرور؟": "Forgot password?",
      "أو عبر": "Or via",
      "جوجل": "Google",
      "فيسبوك": "Facebook",
      "مستخدم جديد": "New user",
      "فشل تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.": "Google login failed. Please try again.",
      "خطأ في تسجيل الدخول": "Login error",
      "بيانات الدخول غير صحيحة": "Invalid login details",
      "أهلاً بك في ثمار! أنا مساعدك الذكي. يمكنك التحدث معي أو طلب التواصل مع المسؤول مباشرة.": "Welcome to Thimar! I am your smart assistant. You can chat with me or request to contact the admin directly.",
      "تواصل مع ثمار": "Contact Thimar",
      "المسؤول والذكاء الاصطناعي": "Admin & AI",
      "اكتب رسالتك هنا...": "Type your message here...",
      "واتساب": "WhatsApp",
      "فشل الاتصال بالذكاء الاصطناعي": "Failed to connect to AI",
      "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.": "Sorry, an error occurred while processing your request. Please try again later.",
      "كلمة المرور": "Password",
      "متصل بـ Supabase": "Connected to Supabase",
      "متصل بـ Neon": "Connected to Neon",
      // Student & Dashboard terms
      "صفحة الطالب": "Student Page",
      "صفحة ولي الأمر": "Parent Page",
      "لوحة التحكم": "Dashboard",
      "مهماتي التعليمية": "My Educational Tasks",
      "مركز المهام اليومية: تسميع الآيات، حل الواجبات، القراءة والمحاكاة، والاختبارات الدورية.": "Daily Tasks Center: Ayat recitation, homework solutions, reading & periodic exams.",
      "مركز المهام اليومية": "Daily Tasks Center",
      "تسميع الآيات": "Ayat Recitation",
      "حل الواجبات": "Homework Solution",
      "القراءة والمحاكاة": "Reading & Simulation",
      "الاختبارات الدورية": "Periodic Exams",
      "تقريري التعليمي وسجل أدائي": "My Educational Report & Performance Record",
      "سجل تفصيلي لنتائج التسميع، نتائج الاختبارات، أرشيف المهام المنجزة، والتسجيلات الصوتية مع التقييم العام لأدائك واجتهادك.": "Detailed record of recitation results, exam scores, completed tasks archive, and voice recordings with overall evaluation.",
      "سجل تفصيلي لنتائج التسميع": "Detailed record of recitation results",
      "جديدة / بانتظار الإنجاز": "New / Pending",
      "جديدة وبانتظار الإنجاز": "New & Pending",
      "قيد المراجعة": "Under Review",
      "مكتملة ومقبولة": "Completed & Accepted",
      "بحاجة لإعادة": "Needs Redo",
      "الكل": "All",
      "بدء الاختبار": "Start Exam",
      "بدء الاختبار الآن": "Start Exam Now",
      "فتح الاختبار": "Open Exam",
      "فتح الاختبار الآن": "Open Exam Now",
      "الاختبار الحالي": "Current Exam",
      "إنجاز المهمة وتسجيل التسميع": "Complete Task & Record",
      "إعادة المحاولة": "Retry",
      "تسجيل صوتي": "Voice Recording",
      "واجب كتابي": "Written Homework",
      "مهمة قراءة": "Reading Task",
      "مهمة دراسية": "Study Task",
      "مهمة مكتملة": "Completed Task",
      "موعد التسليم": "Due Date",
      "اضغط لرفع صورة الواجب": "Click to upload homework photo",
      "اضغط لرفع صورة الواجب الجديدة": "Click to upload new homework photo",
      "تم إرسال الملف للمسؤول - انتظر الموافقة": "File sent to admin - waiting for approval",
      "تم إرسال التسجيل للمسؤول - انتظر الموافقة": "Recording sent to admin - waiting for approval",
      "تسميع اليوم (مسودة)": "Today's Recitation (Draft)",
      "تسميع اليوم (مسودة - قيد التعديل)": "Today's Recitation (Draft - Under Editing)",
      "سجل التسميعات النهائية": "Final Recitations Record",
      "سجل التسميعات المعتمدة": "Approved Recitations Record",
      "المهام المنجزة والمسجلة": "Completed & Recorded Tasks",
      "نتائج وسجلات التسميع": "Recitation Results & Records",
      "نتائج الاختبارات الدورية": "Periodic Exams Results",
      "نتائج وسجلات المهام": "Tasks Results & Records",
      "التسجيلات الصوتية ومحاولات الطالب": "Audio Recordings & Student Attempts",
      "مستوى التقدم ونسبة الإنجاز وسجل النشاط": "Progress Level, Achievement Rate & Activity Record",
      "نسبة إنجاز المصحف الشريف": "Holy Quran Progress Rate",
      "التقييم الشامل والنهائي للطالب": "Comprehensive & Final Student Evaluation",
      "التقييم الشامل والنهائي": "Comprehensive & Final Evaluation",
      "نشاط الطالب وتفاعله": "Student Activity & Interaction",
      "اجتهاد الطالب ومبادرته": "Student Diligence & Initiative",
      "مذاكرته وإتقان الحفظ": "Study & Memorization Mastery",
      "مبني على البيانات الفعلية للنظام": "Based on actual system data",
      "ملاحظات المعلم": "Teacher Notes",
      "جلسة": "Session",
      "اختبار": "Exam",
      "مهمة": "Task",
      "تسجيل": "Recording",
      "درجة": "Grade",
      "المجموع": "Total",
      "التاريخ": "Date",
      "من آية": "From Ayah",
      "إلى آية": "To Ayah",
      "معدل الإتقان": "Mastery Rate",
      "مهام مكتملة": "Completed Tasks",
      "اختبارات مجتازة": "Passed Exams",
      "تسميعات نهائية": "Final Recitations",
      "الجزء الحالي": "Current Juz",
      "السن": "Age",
      "سنة": "years",
      "مظهر التطبيق (السمة)": "App Appearance (Theme)",
      "فاتح": "Light",
      "داكن": "Dark",
      "تلقائي حسب النظام": "System Default",
      "أدوات": "Tools",
      "إغلاق": "Close",
      "تحديث": "Refresh",
      "القسم الإسلامي": "Islamic Section",
      "مواقيت الصلاة": "Prayer Times",
      "الفجر": "Fajr",
      "الشروق": "Sunrise",
      "الظهر": "Dhuhr",
      "العصر": "Asr",
      "المغرب": "Maghrib",
      "العشاء": "Isha",
      "الصلاة القادمة": "Next Prayer",
      "الورد اليومي": "Daily Portion",
      "أذكار الصباح": "Morning Adhkar",
      "أذكار المساء": "Evening Adhkar",
      "تسبيح": "Tasbih",
      "شجرة طيبة": "Good Tree",
      "أصلها ثابت وفرعها في السماء": "Its root is firmly fixed, and its branch reaches to the sky",
      "صدق الله العظيم": "Allah Almighty has spoken the truth",
      "فتح صفحة المهمات والتسميع": "Open Tasks & Recitation",
      "الانتقال إلى المهمات والتسميع": "Go to Tasks & Recitation",
      "عرض التقارير والسجلات": "View Reports & Records",
      "صندوق الرسائل والتواصل": "Messages & Communication Inbox",
      "صندوق الرسائل": "Messages Inbox",
      "فتح المصحف الشريف والتلاوة": "Open Holy Quran & Recitation",
      "فتح المصحف": "Open Holy Quran",
      "مرحباً بك": "Welcome",
      "لديك اختبار نشط": "You have an active exam",
      "أرسله المسؤول ويجب حله": "Sent by admin and needs to be solved",
      "تم إغلاق مهام اليوم": "Today's tasks are closed",
      "اليوم التالي المقرر": "Next scheduled day",
      "اسأل عن بيانات الموقع...": "Ask about site data...",
      "اسألني عن مستواك أو عن القرآن...": "Ask me about your level or about the Quran...",
      "تحدث مع الذكاء الاصطناعي": "Chat with AI",
      "المهمات والواجبات": "Tasks & Homework",
      "التقارير وسجل الأداء": "Reports & Performance Log",
      "مساعدك الذكي في القرآن": "Your Quran Smart Assistant",
      "صندوق التسجيلات": "Audio Recordings Box"
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
    if (!dictionaries._ar) {
      dictionaries._ar = Object.keys(dictionaries.en).reduce(function (result, key) {
        if (!result[dictionaries.en[key]]) result[dictionaries.en[key]] = key;
        return result;
      }, {});
    }
    return dictionaries._ar;
  }

  function escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function translate(value, target) {
    if (!value || typeof value !== 'string') return value;
    var trimmed = value.trim();
    var dict = dictionaryFor(target || locale);
    if (dict[trimmed]) {
      return value.replace(trimmed, dict[trimmed]);
    }
    var result = value;
    var keys = Object.keys(dict).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (result.indexOf(key) === -1) continue;
      var repl = dict[key];
      // Multi-word phrase or long key: safe to replace directly
      if (key.indexOf(' ') !== -1 || key.length > 5) {
        result = result.split(key).join(repl);
      } else {
        // Boundary-safe regex for single short words so we never corrupt inside other words (e.g. 'من' inside 'منصة')
        try {
          var re = new RegExp('(^|[^a-zA-Z0-9_\u0600-\u06FF])' + escapeRegex(key) + '(?=[^a-zA-Z0-9_\u0600-\u06FF]|$)', 'g');
          result = result.replace(re, '$1' + repl);
        } catch (e) {
          result = result.split(key).join(repl);
        }
      }
    }
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
      if (locale === 'ar') {
        // If the original text is already Arabic, restore it directly for 100% precision
        if (/[\u0600-\u06FF]/.test(source)) {
          node.nodeValue = source;
        } else {
          node.nodeValue = translate(source, 'ar');
        }
      } else {
        node.nodeValue = translate(source, 'en');
      }
    }
  }

  function applyAttributes(root) {
    var elements = [];
    if (root && root.nodeType === Node.ELEMENT_NODE) elements.push(root);
    if (root && root.querySelectorAll) {
      elements = elements.concat(Array.prototype.slice.call(root.querySelectorAll('input,textarea,button,select,option,[title],[aria-label],[aria-description],[alt]')));
    }
    elements.forEach(function (element) {
      if (isProtected(element)) return;
      attributeNames.forEach(function (attribute) {
        if (!element.hasAttribute(attribute)) return;
        if (attribute === 'value' && !['button', 'submit', 'reset'].includes(String(element.type || '').toLowerCase())) return;
        var key = 'data-i18n-original-' + attribute;
        if (!element.hasAttribute(key)) element.setAttribute(key, element.getAttribute(attribute) || '');
        var source = element.getAttribute(key) || '';
        if (locale === 'ar') {
          if (/[\u0600-\u06FF]/.test(source)) {
            element.setAttribute(attribute, source);
          } else {
            element.setAttribute(attribute, translate(source, 'ar'));
          }
        } else {
          element.setAttribute(attribute, translate(source, 'en'));
        }
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
      button.setAttribute('aria-label', locale === 'en' ? 'التبديل إلى العربية' : 'Switch to English');
    }
    document.querySelectorAll('.country-search').forEach(function (search) {
      search.placeholder = locale === 'en' ? 'Search countries' : 'بحث عن الدولة';
      search.setAttribute('aria-label', locale === 'en' ? 'Search countries' : 'بحث عن الدولة');
    });
  }

  let isChangingLang = false;
  function setLocale(next) {
    if (isChangingLang) return;
    isChangingLang = true;
    try {
      locale = next === 'en' ? 'en' : 'ar';
      localStorage.setItem('lang', locale);
      apply(document.body);
    } finally {
      isChangingLang = false;
    }
  }

  window.ThimarI18n = {
    apply: apply,
    setLocale: setLocale,
    t: function (value) { return translate(value, locale); },
    getLocale: function () { return locale; }
  };

  window.addEventListener('languagechange', function () {
    if (isChangingLang) return;
    isChangingLang = true;
    try {
      locale = localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
      apply(document.body);
    } finally {
      isChangingLang = false;
    }
  });

  var observerFrame = 0;
  var isApplying = false;
  var pendingRoots = [];
  function scheduleApply(root) {
    if (!root || isApplying) return;
    if (pendingRoots.indexOf(root) === -1) pendingRoots.push(root);
    if (observerFrame) return;
    var flush = function () {
      observerFrame = 0;
      if (isApplying) return;
      isApplying = true;
      try {
        var roots = pendingRoots.splice(0, pendingRoots.length);
        roots.slice(0, 12).forEach(function(r) {
          try { apply(r); } catch(e) {}
        });
        if (roots.length > 12) {
          pendingRoots = roots.slice(12).concat(pendingRoots);
          scheduleApply(pendingRoots[0]);
        }
      } finally {
        isApplying = false;
      }
    };
    observerFrame = typeof requestAnimationFrame === 'function' ? requestAnimationFrame(flush) : setTimeout(flush, 0);
  }

  function init() {
    isApplying = true;
    try {
      apply(document.body);
    } finally {
      isApplying = false;
    }
    var observer = new MutationObserver(function (records) {
      if (isApplying) return;
      records.forEach(function (record) {
        Array.prototype.forEach.call(record.addedNodes, function (added) {
          if (added.nodeType === Node.ELEMENT_NODE || added.nodeType === Node.TEXT_NODE) {
            scheduleApply(added.nodeType === Node.TEXT_NODE ? added.parentElement : added);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
