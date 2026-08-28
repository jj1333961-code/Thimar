export type Locale = 'ar' | 'en'

export const translations = {
  'منصة المعلّم الذكية': 'Smart Teacher Platform',
  'صفحة التسميع': 'Recitation page',
  'متصل بـ Neon': 'Connected to Neon',
  'فحص الغش لهذا الاختبار': 'Anti-cheat for this quiz',
  'سؤال عميق': 'Deep question',
  'حذف الاختبار': 'Delete quiz',
  'السؤال': 'Question',
  'من': 'of',
  'ابدأ الاختبار': 'Start quiz',
  'السؤال التالي': 'Next question',
  'إضافة سؤال': 'Add question',
  'تحليل التسجيل': 'Analyze recording',
  'جاري التحليل...': 'Analyzing...',
  'تم إرسال الطلب': 'Request sent',
  'تعذر تنفيذ الأمر': 'Unable to execute the request',
  'حفظ': 'Save',
  'إلغاء': 'Cancel',
  'حذف': 'Delete',
  'تعديل': 'Edit',
  'إضافة': 'Add',
  'رجوع': 'Back',
  'إرسال': 'Send',
  'تحميل': 'Loading',
  'جار التحميل...': 'Loading...',
  'لا توجد بيانات': 'No data available',
  'حدث خطأ': 'An error occurred',
  'خطأ في الشبكة': 'Network error',
  'إعادة المحاولة': 'Try again',
  'الإعدادات': 'Settings',
  'إعدادات المسؤول': 'Admin settings',
  'المسؤول': 'Admin',
  'الطالب': 'Student',
  'المعلم': 'Teacher',
  'ولي الأمر': 'Parent',
  'الاختبارات': 'Exams',
  'المهام': 'Tasks',
  'التسميع': 'Recitation',
  'التسجيل الصوتي': 'Audio recording',
  'مكافحة الغش': 'Anti-cheat',
  'نجح': 'Succeeded',
  'فشل': 'Failed',
  'محظور': 'Blocked',
  'مفعل': 'Enabled',
  'غير مفعل': 'Disabled',
  'الوقت المتبقي': 'Time remaining',
  'النتيجة': 'Result',
  'حالة الجلسة': 'Session status',
  'مفتوح': 'Open',
  'مغلق': 'Closed',
  'تأكيد': 'Confirm',
  'هل تريد حذف الاختبار بالكامل؟': 'Do you want to delete the entire quiz?',
  'تحديث': 'Refresh',
  'تسجيل الدخول': 'Log in',
  'تسجيل الخروج': 'Log out',
  'اسم المستخدم': 'Username',
  'الرقم السري': 'Password',
} as const

export const arabicToEnglish: Record<string, string> = translations
export const englishToArabic: Record<string, string> = Object.fromEntries(Object.entries(translations).map(([ar, en]) => [en, ar]))

export function translate(value: string, locale: Locale) {
  const dictionary = locale === 'en' ? arabicToEnglish : englishToArabic
  let result = value
  for (const key of Object.keys(dictionary).sort((a, b) => b.length - a.length)) result = result.split(key).join(dictionary[key])
  return result
}
