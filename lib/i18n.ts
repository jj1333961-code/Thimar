export type Locale = 'ar' | 'en'

export const translations: Record<string, string> = {
  // المنصة والهوية
  'منصة ثمار': 'Thimar Platform',
  'منصة ثِمار': 'Thimar Platform',
  'أهلاً بك في ثمار': 'Welcome to Thimar',
  'منصة المعلّم الذكية': 'Smart Teacher Platform',
  'منصة القرآن والتعليم': 'Quran & Education Platform',
  'لحفظ القرآن الكريم': 'for memorizing the Holy Quran',
  'نظام إدارة الطلاب': 'Student Management System',
  'المصحف الشريف': 'Holy Quran',
  'القرآن الكريم': 'The Holy Quran',
  'ثمار | منصة القرآن والتعليم': 'Thimar | Quran & Education Platform',
  '٢٠٢٦ منصة ثمار التعليمية. جميع الحقوق محفوظة.': '2026 Thimar Educational Platform. All rights reserved.',
  '٢٠٢٦ منصة ثمار التعليمية': '2026 Thimar Educational Platform',
  'جميع الحقوق محفوظة': 'All rights reserved',
  'بصمة الصوت': 'Voice Fingerprint',
  'بصمة': 'Fingerprint',
  'الميكروفون': 'Microphone',
  'السماح بصلاحية الميكروفون': 'Allow microphone access',
  'تسميعات نشطة': 'Active Recitations',
  'إدارة المسؤولين': 'Manage Admins',
  'عدد المعلمين': 'Number of Teachers',
  'عدد الطلاب': 'Number of Students',
  'أدوات المسؤول': 'Admin Tools',
  'أدوات الطالب': 'Student Tools',
  'أدوات ولي الأمر': 'Parent Tools',
  'مرحباً بك مجدداً، المسؤول thimar': 'Welcome back, Admin thimar',
  'تحليل ثمار AI': 'Thimar AI Analysis',
  'طلبات الانضمام المعلقة': 'Pending Join Requests',
  'لا توجد طلبات حالياً': 'No requests currently',
  'جلسات مباشرة': 'Live Sessions',
  'ابدأ جلسة تسميع مباشرة مع أحد الطلاب الآن': 'Start a live recitation session with a student now',
  'فتح غرفة اتصال': 'Open communication room',
  'مهمة اليوم': 'Today\'s Task',
  'سورة': 'Surah',
  'النور': 'An-Nur',
  'من الآية': 'From Ayah',
  'إلى الآية': 'To Ayah',
  'متبقي': 'Remaining',
  'ساعات': 'Hours',
  'مراجعة': 'Review',
  'ابدأ التسميع': 'Start Recitation',
  'استمع للمقرئين': 'Listen to Reciters',
  'الشيخ': 'Sheikh',
  'الحصري': 'Al-Husary',
  'المنشاوي': 'Al-Minshawi',
  'عبدالباسط': 'Abdul-Basit',
  'رسائل المعلم': 'Teacher Messages',
  '"أحسنت في تسميع الأمس يا ياسين، ركز اليوم على مخارج حرف الضاد في سورة النور."': '"Well done on yesterday\'s recitation, Yassin. Focus today on the articulation of the letter Dad in Surah An-Nur."',
  'أبنائي': 'My Children',
  'إضافة ابن جديد +': 'Add New Child +',
  'التقدم': 'Progress',
  'آخر نشاطات': 'Latest Activities',
  'المعلم المباشر': 'Direct Teacher',
  'معلم القرآن': 'Quran Teacher',
  'نصيحة اليوم': 'Tip of the Day',
  '"أفضل هدية تقدمها لطفلك هي تشجيعه على ملازمة القرآن."': '"The best gift you can give your child is encouraging them to stay close to the Quran."',
  'اقرأ المزيد': 'Read More',
  'أرسل طلب انضمام للمسؤول': 'Send a join request to the admin',
  'بيانات طلب الانضمام': 'Join Request Data',
  'تم إرسال الطلب للمسؤول': 'Request sent to admin',
  'أدخل اسمك كما سجله المسؤول': 'Enter your name as registered by the admin',
  'الرقم بدون كود الدولة': 'Number without country code',
  'الرقم الدولي': 'International number',
  'كود دولة الهاتف': 'Phone country code',
  'كود دولة الواتساب': 'WhatsApp country code',
  'تحليل البصمة الصوتية': 'Voiceprint Analysis',
  'مزامنة البيانات السحابية': 'Cloud Data Sync',
  'محفوظ في Neon أو التخزين المحلي': 'Saved in Neon or local storage',
  'تعذر الاتصال بقاعدة البيانات': 'Could not connect to database',
  'الوضع الأخضر': 'Green Mode',
  'الوضع الفاتح': 'Light Mode',
  'الوضع الداكن': 'Dark Mode',

  // الاتصال والإنترنت والوضع غير المتصل (PWA & Offline)
  'تم الاتصال بالإنترنت': 'Connected to the Internet',
  'انقطع الاتصال بالإنترنت': 'Internet connection lost',
  'الإنترنت متصل الآن': 'Internet is now connected',
  'تعمل المنصة بالوضع غير المتصل': 'Working in offline mode',
  'الوضع غير المتصل': 'Offline mode',
  'وضع عدم الاتصال': 'Offline mode',
  'الوضع المتصل': 'Online mode',
  'متصل بالإنترنت': 'Connected to Internet',
  'غير متصل بالإنترنت': 'Offline',
  'غير متصل': 'Offline',
  'متصل': 'Online',
  'مزامنة البيانات': 'Sync data',
  'جاري المزامنة...': 'Syncing...',
  'تمت المزامنة بنجاح': 'Synced successfully',
  'محفوظ محلياً': 'Saved locally',
  'يعمل بدون إنترنت': 'Works offline',
  'يتطلب اتصال بالإنترنت': 'Requires internet',
  'قائمة انتظار المزامنة': 'Sync queue',
  'مزامنة الآن': 'Sync now',

  // المصادقة والحسابات
  'دخول النظام': 'System Login',
  'دخول': 'Log in',
  'تسجيل الدخول': 'Log in',
  'تسجيل الخروج': 'Log out',
  'خروج': 'Log out',
  'إنشاء حساب جديد': 'Create account',
  'إنشاء حساب': 'Create account',
  'ليس لديك حساب؟': "Don't have an account?",
  'أليس لديك حساب؟': "Don't have an account?",
  'لديك حساب بالفعل؟': 'Already have an account?',
  'هل نسيت الرقم السري؟': 'Forgot your password?',
  'نسيت كلمة المرور؟': 'Forgot your password?',
  'استرجاع الحساب': 'Account recovery',
  'طلب استرداد الحساب': 'Account recovery request',
  'اسم المستخدم': 'Username',
  'الرقم السري': 'Password',
  'كلمة المرور': 'Password',
  'الرقم السري الحالي': 'Current password',
  'الرقم السري الجديد': 'New password',
  'تأكيد الرقم السري': 'Confirm password',
  'إظهار الرقم السري': 'Show password',
  'إخفاء الرقم السري': 'Hide password',
  'أدخل الرقم السري': 'Enter your password',
  'أدخل اسم المستخدم': 'Enter username',
  'أدخل اسم المستخدم والرقم السري': 'Enter username and password',
  'أو رقم الموبايل للمسؤول': 'or admin mobile number',
  'التسجيل بحساب جوجل': 'Sign in with Google',
  'التسجيل برقم الهاتف': 'Sign in with phone',
  'كود التحقق': 'Verification code',
  'تأكيد الهوية': 'Identity confirmation',
  'سجل دخولك لمتابعة وردك اليومي': 'Log in to follow your daily progress',
  'مرحباً بك مجدداً في ثمار': 'Welcome back to Thimar',
  'اسم المستخدم أو البريد الإلكتروني': 'Username or Email',
  'أدخل بريدك الإلكتروني': 'Enter your email',
  'تذكرني': 'Remember me',
  'أو عبر': 'Or via',
  'جوجل': 'Google',
  'فيسبوك': 'Facebook',
  'مستخدم جديد': 'New user',
  'فشل تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.': 'Google login failed. Please try again.',
  'خطأ في تسجيل الدخول': 'Login error',
  'بيانات الدخول غير صحيحة': 'Invalid login details',

  // مساعد الذكاء الاصطناعي والدردشة
  'أهلاً بك في ثمار! أنا مساعدك الذكي. يمكنك التحدث معي أو طلب التواصل مع المسؤول مباشرة.': 'Welcome to Thimar! I am your smart assistant. You can chat with me or request to contact the admin directly.',
  'تواصل مع ثمار': 'Contact Thimar',
  'المسؤول والذكاء الاصطناعي': 'Admin & AI',
  'اكتب رسالتك هنا...': 'Type your message here...',
  'واتساب': 'WhatsApp',
  'فشل الاتصال بالذكاء الاصطناعي': 'Failed to connect to AI',
  'عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة لاحقاً.': 'Sorry, an error occurred while processing your request. Please try again later.',

  // الأدوار والمستخدمين
  'المسؤول': 'Admin',
  'المسؤولون': 'Admins',
  'المسؤول الرئيسي': 'Main Admin',
  'مسؤول فرعي': 'Sub-admin',
  'الطالب': 'Student',
  'الطلاب': 'Students',
  'المعلم': 'Teacher',
  'المعلمون': 'Teachers',
  'المعلمين': 'Teachers',
  'ولي الأمر': 'Parent',
  'أولياء الأمور': 'Parents',
  'نوع الحساب': 'Account type',

  // التنقل والواجهة الرئيسية
  'الرئيسية': 'Home',
  'الصفحة الرئيسية': 'Home',
  'لوحة التحكم': 'Dashboard',
  'الإعدادات': 'Settings',
  'إعدادات المسؤول': 'Admin settings',
  'إعدادات العرض': 'Display settings',
  'تبديل الوضع': 'Toggle theme',
  'الرسائل': 'Messages',
  'الرسائل الواردة': 'Inbox',
  'محادثة': 'Chat',
  'التواصل': 'Contact',
  'التنبيهات': 'Notifications',
  'الأدوات': 'Tools',
  'فتح قائمة الأدوات': 'Open tools menu',
  'إغلاق القائمة': 'Close menu',
  'الملفات': 'Files',
  'الملفات المرفوعة': 'Uploaded files',
  'الملفات المرسلة لي': 'Files sent to me',
  'تغيير اللغة': 'Change language',
  'تبديل اللغة': 'Switch language',
  'تغيير اللغة / Change language': 'Change language',

  // التعليم والقرآن والمهام
  'صفحة التسميع': 'Recitation page',
  'التسميع': 'Recitation',
  'التسجيل الصوتي': 'Audio recording',
  'تحليل التسجيل': 'Analyze recording',
  'جاري التحليل...': 'Analyzing...',
  'صندوق التسجيلات': 'Recordings inbox',
  'البصمة الصوتية': 'Voiceprint',
  'الاختبارات': 'Exams',
  'قائمة الاختبار': 'Exam list',
  'ابدأ الاختبار': 'Start quiz',
  'حذف الاختبار': 'Delete quiz',
  'السؤال التالي': 'Next question',
  'السؤال السابق': 'Previous question',
  'إضافة سؤال': 'Add question',
  'توليد الأسئلة بالذكاء الاصطناعي': 'Generate questions with AI',
  'سؤال عميق': 'Deep question',
  'مكافحة الغش': 'Anti-cheat',
  'فحص الغش لهذا الاختبار': 'Anti-cheat for this quiz',
  'المهام': 'Tasks',
  'الواجبات': 'Homework',
  'المواد الدراسية': 'Subjects',
  'المواد': 'Subjects',
  'التقارير': 'Reports',
  'الحضور والغياب': 'Attendance',
  'مخطط التقييم': 'Evaluation chart',
  'مساعد الذكاء الاصطناعي': 'AI assistant',
  'المحادثة مع الذكاء الاصطناعي': 'AI chat',
  'مساعد تطوير الموقع': 'Site development assistant',
  'مزامنة GitHub': 'GitHub Sync',
  'مواقيت الصلاة': 'Prayer times',
  'الأذكار': 'Dhikr',
  'حصن المسلم': 'Muslim Fortress',
  'القبلة': 'Qibla',
  'السبحة': 'Digital Tasbih',
  'السورة': 'Surah',
  'الجزء': 'Juz',
  'الآية': 'Ayah',

  // الأزرار والعمليات الشائعة
  'حفظ': 'Save',
  'حفظ التغييرات': 'Save changes',
  'حفظ التعديلات': 'Save changes',
  'حفظ الطالب': 'Save student',
  'إلغاء': 'Cancel',
  'حذف': 'Delete',
  'تعديل': 'Edit',
  'إضافة': 'Add',
  'رجوع': 'Back',
  'إرسال': 'Send',
  'تحميل': 'Loading',
  'جار التحميل...': 'Loading...',
  'جارٍ التحميل...': 'Loading...',
  'تحديث': 'Refresh',
  'بحث': 'Search',
  'التالي': 'Next',
  'السابق': 'Previous',
  'إغلاق': 'Close',
  'تأكيد': 'Confirm',
  'إعادة المحاولة': 'Try again',
  'تم إرسال الطلب': 'Request sent',
  'تعذر تنفيذ الأمر': 'Unable to execute request',
  'تم الحفظ بنجاح': 'Saved successfully',
  'تعذر الحفظ': 'Could not save',
  'نجح': 'Succeeded',
  'فشل': 'Failed',
  'مفتوح': 'Open',
  'مغلق': 'Closed',
  'مفعل': 'Enabled',
  'غير مفعل': 'Disabled',
  'محظور': 'Blocked',
  'لا توجد بيانات': 'No data available',
  'حدث خطأ': 'An error occurred',
  'خطأ في الشبكة': 'Network error',
  'نعم': 'Yes',
  'لا': 'No',
  'الاسم': 'Name',
  'الاسم بالكامل': 'Full name',
  'تاريخ الميلاد': 'Date of birth',
  'الصف الدراسي': 'Grade',
  'السن': 'Age',
  'النتيجة': 'Result',
  'الوقت المتبقي': 'Time remaining',
  'حالة الجلسة': 'Session status',
  'ملاحظات': 'Notes',
  'رقم الهاتف': 'Phone number',
  'رقم الموبايل': 'Mobile number',
  'الرقم القومي': 'National ID',
  'كود الهوية': 'National ID code',
  'اختر الدولة': 'Choose country',
  'بحث عن الدولة': 'Search countries',
  'متصل بـ Supabase': 'Connected to Supabase',
  'متصل بـ Neon': 'Connected to Neon',
}

export const arabicToEnglish: Record<string, string> = { ...translations }
export const englishToArabic: Record<string, string> = Object.fromEntries(
  Object.entries(translations).map(([ar, en]) => [en, ar])
)

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Builds regex matcher ensuring short words match boundaries only
function buildRegex(key: string): RegExp {
  const escaped = escapeRegExp(key)
  // If the key has multiple words or whitespace, direct match is safe
  if (/\s/.test(key) || key.length > 5) {
    return new RegExp(escaped, 'g')
  }
  // Single short words must be word-bounded so they don't corrupt substrings (e.g. 'من' inside 'منصة' or 'of' inside 'office')
  return new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}(?=[^\\p{L}\\p{N}_]|$)`, 'gu')
}

export function translate(value: string, locale: Locale): string {
  if (!value || typeof value !== 'string') return value
  const isEn = locale === 'en'
  const dictionary = isEn ? arabicToEnglish : englishToArabic

  // Sort keys descending by length so longer phrases get matched before single words
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length)

  let result = value
  for (const key of sortedKeys) {
    if (!result.includes(key) && key.length > 3) continue
    const target = dictionary[key]
    if (/\s/.test(key) || key.length > 5) {
      result = result.split(key).join(target)
    } else {
      // Use boundary matcher to avoid corrupting substrings
      const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegExp(key)}(?=[^\\p{L}\\p{N}_]|$)`, 'gu')
      result = result.replace(regex, `$1${target}`)
    }
  }

  return result
}

/**
 * Shorthand translation function that uses the stored language preference.
 * Defaults to Arabic if no preference is set or if running on server.
 */
export function t(key: string): string {
  if (typeof window === 'undefined') return key;
  const lang = (localStorage.getItem('thimar_lang') as Locale) || 'ar';
  return translate(key, lang);
}
