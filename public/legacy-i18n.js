(function () {
  'use strict';
  var dictionary = {
    'تسجيل الدخول':'Log in','تسجيل الخروج':'Log out','أليس لديك حساب؟':'Don\'t have an account?','أDon\'t have an account?':'Don\'t have an account?','منصة ثمار':'Thimar Platform','منصة ثِمار':'Thimar Platform','لحفظ القرآن الكريم':'for memorizing the Holy Quran','قال تعالى:':'Allah Almighty said:','إنشاء حساب جديد':'Create new account','تغيير اللغة / Change language':'Change language','تبديل الوضع':'Toggle theme','محادثة':'Chat','الرئيسية':'Home','تسجيل الدخول':'Log in','تسجيل الخروج':'Log out','اسم المستخدم':'Username','الرقم السري':'Password','المسؤول':'Admin','الطالب':'Student','المعلم':'Teacher','ولي الأمر':'Parent','الإعدادات':'Settings','الرسائل':'Messages','المصحف الشريف':'Holy Quran','حفظ':'Save','إلغاء':'Cancel','حذف':'Delete','تعديل':'Edit','إضافة':'Add','رجوع':'Back','إرسال':'Send','تحديث':'Refresh','بحث':'Search','التالي':'Next','السابق':'Previous','إغلاق':'Close','تأكيد':'Confirm','تحميل':'Loading','جار التحميل...':'Loading...','لا توجد بيانات':'No data available','حدث خطأ':'An error occurred','نجح':'Succeeded','فشل':'Failed','الطلاب':'Students','المعلمين':'Teachers','أولياء الأمور':'Parents','الاختبارات':'Exams','الواجبات':'Homework','التقارير':'Reports','الحضور والغياب':'Attendance','المواد الدراسية':'Subjects','الاسم':'Name','رقم الهاتف':'Phone number','تاريخ الميلاد':'Date of birth','الصف الدراسي':'Grade','القرآن الكريم':'The Holy Quran','الرئيسية':'Home','لوحة التحكم':'Dashboard','نعم':'Yes','لا':'No','مفتوح':'Open','مغلق':'Closed'
  };
  var broken = {'الر��م السري':'الرقم السري','��يس لديك حساب؟':'أليس لديك حساب؟','الن��اق':'النطاق','ال��وية':'الهوية','د��ول':'دخول','المو��ايل':'الموبايل','ا��كويت':'الكويت','��قم':'رقم','الموبا��ل':'الموبايل','البي��نات':'البيانات','اءءقومي':'القومي','تءءديل':'تعديل','التحق':'التحقق','البص��ة':'البصمة','ا��شخصي':'الشخصي','ل�� يتم':'لن يتم','الكو��':'الكود','مزوده��':'مزوده','تغّرت':'تغيرت','مسر الملف':'مسار الملف','ا��ضمام':'الانضمام','يمءءن':'يمكن','اءءُءءشئ':'ينشئ'};
  var locale = localStorage.getItem('lang') === 'en' ? 'en' : 'ar';
  function fix(value) { Object.keys(broken).forEach(function (key) { value = value.split(key).join(broken[key]); }); return value.replace(/��/g, ''); }
  function translate(value) { if (locale === 'ar') return value; var keys = Object.keys(dictionary).sort(function(a,b){return b.length-a.length;}); keys.forEach(function(key){value=value.split(key).join(dictionary[key]);}); return value; }
  function apply(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) { if (!node.nodeValue.trim() || node.parentElement.closest('script,style,code,pre')) continue; if (!node.__i18nOriginal) node.__i18nOriginal = fix(node.nodeValue); node.nodeValue = translate(node.__i18nOriginal); }
    root.querySelectorAll && root.querySelectorAll('input,textarea,select,button,[title],[aria-label]').forEach(function(el){['placeholder','title','aria-label'].forEach(function(a){if(el.hasAttribute(a)){var k='data-i18n-original-'+a;if(!el.hasAttribute(k))el.setAttribute(k,fix(el.getAttribute(a)));el.setAttribute(a,translate(el.getAttribute(k)));}});});
    document.documentElement.lang=locale; document.documentElement.dir=locale==='en'?'ltr':'rtl';
    var btn=document.getElementById('langToggleBtn'); if(btn) btn.textContent=locale==='en'?'AR':'EN';
  }
  window.addEventListener('languagechange', function(){ locale=localStorage.getItem('lang')==='en'?'en':'ar'; apply(document.body); });
  var observer = new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)apply(n);});});});
  document.addEventListener('DOMContentLoaded',function(){apply(document.body);observer.observe(document.body,{childList:true,subtree:true});});
})();
