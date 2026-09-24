import pypdf
import re

surah_names = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس'
]

def normalize(text):
    if not text:
        return ""
    text = re.sub(r'[\u064B-\u065F\u0670\u06D6-\u06ED]', '', text)
    text = re.sub(r'[إأآٱ]', 'ا', text)
    text = text.replace('ى', 'ي')
    text = text.replace('ة', 'ه')
    text = re.sub(r'[^\u0621-\u064A\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

reader = pypdf.PdfReader('public/quran/repaired_quran.pdf')
num_pages = len(reader.pages)
print(f"Total pages: {num_pages}")

surah_starts = {}

for idx, page in enumerate(reader.pages):
    page_num = idx + 1
    try:
        text = page.extract_text()
    except Exception as e:
        print(f"Error on page {page_num}: {e}")
        continue
    norm_text = normalize(text)
    
    # Check if a surah starts on this page
    for surah_idx, name in enumerate(surah_names):
        surah_num = surah_idx + 1
        norm_name = normalize(name)
        # Check both with and without prefix 'سورة'
        if f"سورة {norm_name}" in norm_text or f"سورة{norm_name}" in norm_text:
            if surah_num not in surah_starts:
                surah_starts[surah_num] = page_num
                print(f"Surah {surah_num} ({name}) found starting on Page {page_num}")

print("\n--- Summary ---")
for s in range(1, 115):
    p = surah_starts.get(s, None)
    name = surah_names[s-1]
    print(f"{s}:{p}")
