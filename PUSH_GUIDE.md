# تعليمات دفع التعديلات إلى GitHub

لقد قمت بتجهيز جميع التعديلات وإجراء عملية `commit` محلياً. نظراً لمتطلبات الأمان في GitHub، يجب إجراء عملية الدفع (Push) باستخدام صلاحياتك.

## الخيار الأول: استخدام الـ Terminal في AI Studio
إذا كنت ترغب في أن أقوم أنا بالدفع، يرجى تزويدي بـ **Personal Access Token** من إعدادات GitHub الخاصة بك، وسأستخدمه لإتمام العملية.

## الخيار الثاني: الدفع يدوياً من جهازك
إذا قمت بتحميل المشروع (Download ZIP) أو استخدامه محلياً، اتبع الآتي:

1. افتح المجلد في الجهاز.
2. تأكد من تهيئة git:
   ```bash
   git init
   git remote add origin https://github.com/jj1333961-code/Thimar.git
   ```
3. أضف الملفات واعمل commit:
   ```bash
   git add .
   git commit -m "Fix: Firebase auth integration, full localization (AR/EN), and API client stability"
   ```
4. ادفع الكود:
   ```bash
   git push -u origin main
   ```

**ملاحظة:** تم حفظ جميع التعديلات (المصادقة، الترجمة، استقرار النظام) في المستودع المحلي داخل هذه البيئة.
