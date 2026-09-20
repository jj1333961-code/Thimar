# تعليمات دفع التعديلات إلى المستودع (GitHub)

تم تجهيز جميع الملفات وإجراء عملية **Commit** بنجاح في المستودع المحلي على فرع `main`:

```bash
commit: "feat: complete Thimar updates - draggable AI bubble, Adhan sounds, Tuhfat Al-Atfal, Quran reader redesign, messaging overhaul, and Prayer/Qibla location services"
```

---

## الخيار الأول: الدفع المباشر من خلال بيئة AI Studio
إذا كنت ترغب في أن أقوم أنا بدفع الكود مباشرة إلى مستودع GitHub الخاص بك:
1. قم بإنشاء **Personal Access Token (Classic)** بصلاحية `repo` من إعدادات حسابك في GitHub:
   `GitHub -> Settings -> Developer Settings -> Personal access tokens`
2. زوّدني بالرمز (Token) في المحادثة، وسأقوم بتنفيذ الأمر:
   ```bash
   git push https://<TOKEN>@github.com/jj1333961-code/Thimar.git main
   ```

---

## الخيار الثاني: الدفع يدوياً عبر جهازك
إذا قمت بتنزيل المشروع أو ربطه على جهازك:
```bash
git remote set-url origin https://github.com/jj1333961-code/Thimar.git
git push -u origin main
```
(أو إذا كان هناك تعارض في السجل البعيد: `git push -u origin main --force`)
