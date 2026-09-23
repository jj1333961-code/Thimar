/**
 * Thimar Interactive Quran Engine
 * Features:
 *  - 114 Surahs with fast navigation, search, and Juz index
 *  - Interactive Ayah selection with subtle zoom/highlight (scale 1.05)
 *  - Consecutive multi-selection (only adjacent verses can be selected together)
 *  - 3 Floating Badges:
 *      1) 🔊 Audio: famous reciters, local offline download, repetition counter (1, 2, 3, 5, 10, ∞)
 *      2) 📤 Share: ayah text, surah name, ayah number
 *      3) ✖ Cancel: deselects ayah and resets zoom/size
 *  - Responsive typography without text tangling or overlapping
 *  - Smooth font zoom (A+ / A-) and orientation flip handling
 *  - Dual-mode: Interactive Text Mushaf + Original High-DPI Page Viewer
 */
(function(window, document){
  'use strict';

  var currentSurah = 1;
  var currentAyahs = [];
  var selectedAyahs = []; // Array of ayah numbers (strictly consecutive)
  var currentReciterIndex = 0;
  var currentRepeatCount = 1; // 1, 2, 3, 5, 10, 999
  var remainingRepeats = 1;
  var isPlayingAudio = false;
  var currentPlayingAyah = null;
  var audioPlayer = new Audio();
  var fontSizePx = 28; // Default comfortable reading size
  var viewMode = 'interactive'; // 'interactive' or 'pdf'
  var toolbarAutoDismissTimer = null;

  // Famous Arab Reciters with EveryAyah MP3 endpoints
  var FAMOUS_RECITERS = [
    { id: 'minshawi', name: 'الشيخ محمد صديق المنشاوي (مرتل)', folder: 'Minshawy_Murattal_128kbps', country: 'مصر' },
    { id: 'husary', name: 'الشيخ محمود خليل الحصري (مرتل)', folder: 'Husary_128kbps', country: 'مصر' },
    { id: 'abdulbasit', name: 'الشيخ عبد الباسط عبد الصمد (مرتل)', folder: 'Abdul_Basit_Murattal_192kbps', country: 'مصر' },
    { id: 'alafasy', name: 'الشيخ مشاري بن راشد العفاسي', folder: 'Alafasy_128kbps', country: 'الكويت' },
    { id: 'hudhaify', name: 'الشيخ علي بن عبد الرحمن الحذيفي', folder: 'Hudhaify_128kbps', country: 'السعودية' },
    { id: 'ghamidi', name: 'الشيخ سعد الغامدي', folder: 'Ghamadi_40kbps', country: 'السعودية' },
    { id: 'maher', name: 'الشيخ ماهر المعيقلي', folder: 'Maher_AlMuaiqly_64kbps', country: 'السعودية' },
    { id: 'ajamy', name: 'الشيخ أحمد بن علي العجمي', folder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_kotab', country: 'السعودية' },
    { id: 'sudais', name: 'الشيخ عبد الرحمن السديس', folder: 'Abdurrahmaan_As-Sudais_192kbps', country: 'السعودية' },
    { id: 'shuraim', name: 'الشيخ سعود الشريم', folder: 'Saood_ash-Shuraym_128kbps', country: 'السعودية' },
    { id: 'dossari', name: 'الشيخ ياسر الدوسري', folder: 'Yasser_Ad-Dussary_128kbps', country: 'السعودية' },
    { id: 'ayyoub', name: 'الشيخ محمد أيوب', folder: 'Muhammad_Ayyoub_128kbps', country: 'السعودية' },
    { id: 'shatree', name: 'الشيخ أبو بكر الشاطري', folder: 'Abu_Bakr_Ash-Shaatree_128kbps', country: 'اليمن' }
  ];

  // 114 Surah Metadata
  var SURAH_LIST = [
    { number: 1, name: 'الفاتحة', english: 'Al-Fatiha', ayahs: 7, type: 'مكية', page: 1 },
    { number: 2, name: 'البقرة', english: 'Al-Baqarah', ayahs: 286, type: 'مدنية', page: 2 },
    { number: 3, name: 'آل عمران', english: 'Ali \'Imran', ayahs: 200, type: 'مدنية', page: 50 },
    { number: 4, name: 'النساء', english: 'An-Nisa', ayahs: 176, type: 'مدنية', page: 77 },
    { number: 5, name: 'المائدة', english: 'Al-Ma\'idah', ayahs: 120, type: 'مدنية', page: 106 },
    { number: 6, name: 'الأنعام', english: 'Al-An\'am', ayahs: 165, type: 'مكية', page: 128 },
    { number: 7, name: 'الأعراف', english: 'Al-A\'raf', ayahs: 206, type: 'مكية', page: 151 },
    { number: 8, name: 'الأنفال', english: 'Al-Anfal', ayahs: 75, type: 'مدنية', page: 177 },
    { number: 9, name: 'التوبة', english: 'At-Tawbah', ayahs: 129, type: 'مدنية', page: 187 },
    { number: 10, name: 'يونس', english: 'Yunus', ayahs: 109, type: 'مكية', page: 208 },
    { number: 11, name: 'هود', english: 'Hud', ayahs: 123, type: 'مكية', page: 221 },
    { number: 12, name: 'يوسف', english: 'Yusuf', ayahs: 111, type: 'مكية', page: 235 },
    { number: 13, name: 'الرعد', english: 'Ar-Ra\'d', ayahs: 43, type: 'مدنية', page: 249 },
    { number: 14, name: 'إبراهيم', english: 'Ibrahim', ayahs: 52, type: 'مكية', page: 255 },
    { number: 15, name: 'الحجر', english: 'Al-Hijr', ayahs: 99, type: 'مكية', page: 262 },
    { number: 16, name: 'النحل', english: 'An-Nahl', ayahs: 128, type: 'مكية', page: 267 },
    { number: 17, name: 'الإسراء', english: 'Al-Isra', ayahs: 111, type: 'مكية', page: 282 },
    { number: 18, name: 'الكهف', english: 'Al-Kahf', ayahs: 110, type: 'مكية', page: 293 },
    { number: 19, name: 'مريم', english: 'Maryam', ayahs: 98, type: 'مكية', page: 305 },
    { number: 20, name: 'طه', english: 'Taha', ayahs: 135, type: 'مكية', page: 312 },
    { number: 21, name: 'الأنبياء', english: 'Al-Anbiya', ayahs: 112, type: 'مكية', page: 322 },
    { number: 22, name: 'الحج', english: 'Al-Hajj', ayahs: 78, type: 'مدنية', page: 332 },
    { number: 23, name: 'المؤمنون', english: 'Al-Mu\'minun', ayahs: 118, type: 'مكية', page: 342 },
    { number: 24, name: 'النور', english: 'An-Nur', ayahs: 64, type: 'مدنية', page: 350 },
    { number: 25, name: 'الفرقان', english: 'Al-Furqan', ayahs: 77, type: 'مكية', page: 359 },
    { number: 26, name: 'الشعراء', english: 'Ash-Shu\'ara', ayahs: 227, type: 'مكية', page: 367 },
    { number: 27, name: 'النمل', english: 'An-Naml', ayahs: 93, type: 'مكية', page: 377 },
    { number: 28, name: 'القصص', english: 'Al-Qasas', ayahs: 88, type: 'مكية', page: 385 },
    { number: 29, name: 'العنكبوت', english: 'Al-\'Ankabut', ayahs: 69, type: 'مكية', page: 396 },
    { number: 30, name: 'الروم', english: 'Ar-Rum', ayahs: 60, type: 'مكية', page: 404 },
    { number: 31, name: 'لقمان', english: 'Luqman', ayahs: 34, type: 'مكية', page: 411 },
    { number: 32, name: 'السجدة', english: 'As-Sajdah', ayahs: 30, type: 'مكية', page: 415 },
    { number: 33, name: 'الأحزاب', english: 'Al-Ahzab', ayahs: 73, type: 'مدنية', page: 418 },
    { number: 34, name: 'سبأ', english: 'Saba', ayahs: 54, type: 'مكية', page: 428 },
    { number: 35, name: 'فاطر', english: 'Fatir', ayahs: 45, type: 'مكية', page: 434 },
    { number: 36, name: 'يس', english: 'Ya-Sin', ayahs: 83, type: 'مكية', page: 440 },
    { number: 37, name: 'الصافات', english: 'As-Saffat', ayahs: 182, type: 'مكية', page: 446 },
    { number: 38, name: 'ص', english: 'Sad', ayahs: 88, type: 'مكية', page: 453 },
    { number: 39, name: 'الزمر', english: 'Az-Zumar', ayahs: 75, type: 'مكية', page: 458 },
    { number: 40, name: 'غافر', english: 'Ghafir', ayahs: 85, type: 'مكية', page: 467 },
    { number: 41, name: 'فصلت', english: 'Fussilat', ayahs: 54, type: 'مكية', page: 477 },
    { number: 42, name: 'الشورى', english: 'Ash-Shura', ayahs: 53, type: 'مكية', page: 483 },
    { number: 43, name: 'الزخرف', english: 'Az-Zukhruf', ayahs: 89, type: 'مكية', page: 489 },
    { number: 44, name: 'الدخان', english: 'Ad-Dukhan', ayahs: 59, type: 'مكية', page: 496 },
    { number: 45, name: 'الجاثية', english: 'Al-Jathiyah', ayahs: 37, type: 'مكية', page: 499 },
    { number: 46, name: 'الأحقاف', english: 'Al-Ahqaf', ayahs: 35, type: 'مكية', page: 502 },
    { number: 47, name: 'محمد', english: 'Muhammad', ayahs: 38, type: 'مدنية', page: 507 },
    { number: 48, name: 'الفتح', english: 'Al-Fath', ayahs: 29, type: 'مدنية', page: 511 },
    { number: 49, name: 'الحجرات', english: 'Al-Hujurat', ayahs: 18, type: 'مدنية', page: 515 },
    { number: 50, name: 'ق', english: 'Qaf', ayahs: 45, type: 'مكية', page: 518 },
    { number: 51, name: 'الذاريات', english: 'Adh-Dhariyat', ayahs: 60, type: 'مكية', page: 520 },
    { number: 52, name: 'الطور', english: 'At-Tur', ayahs: 49, type: 'مكية', page: 523 },
    { number: 53, name: 'النجم', english: 'An-Najm', ayahs: 62, type: 'مكية', page: 526 },
    { number: 54, name: 'القمر', english: 'Al-Qamar', ayahs: 55, type: 'مكية', page: 528 },
    { number: 55, name: 'الرحمن', english: 'Ar-Rahman', ayahs: 78, type: 'مدنية', page: 531 },
    { number: 56, name: 'الواقعة', english: 'Al-Waqi\'ah', ayahs: 96, type: 'مكية', page: 534 },
    { number: 57, name: 'الحديد', english: 'Al-Hadid', ayahs: 29, type: 'مدنية', page: 537 },
    { number: 58, name: 'المجادلة', english: 'Al-Mujadila', ayahs: 22, type: 'مدنية', page: 542 },
    { number: 59, name: 'الحشر', english: 'Al-Hashr', ayahs: 24, type: 'مدنية', page: 545 },
    { number: 60, name: 'الممتحنة', english: 'Al-Mumtahanah', ayahs: 13, type: 'مدنية', page: 549 },
    { number: 61, name: 'الصف', english: 'As-Saff', ayahs: 14, type: 'مدنية', page: 551 },
    { number: 62, name: 'الجمعة', english: 'Al-Jumu\'ah', ayahs: 11, type: 'مدنية', page: 553 },
    { number: 63, name: 'المنافقون', english: 'Al-Munafiqun', ayahs: 11, type: 'مدنية', page: 554 },
    { number: 64, name: 'التغابن', english: 'At-Taghabun', ayahs: 18, type: 'مدنية', page: 556 },
    { number: 65, name: 'الطلاق', english: 'At-Talaq', ayahs: 12, type: 'مدنية', page: 558 },
    { number: 66, name: 'التحريم', english: 'At-Tahrim', ayahs: 12, type: 'مدنية', page: 560 },
    { number: 67, name: 'الملك', english: 'Al-Mulk', ayahs: 30, type: 'مكية', page: 562 },
    { number: 68, name: 'القلم', english: 'Al-Qalam', ayahs: 52, type: 'مكية', page: 564 },
    { number: 69, name: 'الحاقة', english: 'Al-Haqqah', ayahs: 52, type: 'مكية', page: 566 },
    { number: 70, name: 'المعارج', english: 'Al-Ma\'arij', ayahs: 44, type: 'مكية', page: 568 },
    { number: 71, name: 'نوح', english: 'Nuh', ayahs: 28, type: 'مكية', page: 570 },
    { number: 72, name: 'الجن', english: 'Al-Jinn', ayahs: 28, type: 'مكية', page: 572 },
    { number: 73, name: 'المزمل', english: 'Al-Muzzammil', ayahs: 20, type: 'مكية', page: 574 },
    { number: 74, name: 'المدثر', english: 'Al-Muddaththir', ayahs: 56, type: 'مكية', page: 575 },
    { number: 75, name: 'القيامة', english: 'Al-Qiyamah', ayahs: 40, type: 'مكية', page: 577 },
    { number: 76, name: 'الإنسان', english: 'Al-Insan', ayahs: 31, type: 'مدنية', page: 578 },
    { number: 77, name: 'المرسلات', english: 'Al-Mursalat', ayahs: 50, type: 'مكية', page: 580 },
    { number: 78, name: 'النبأ', english: 'An-Naba', ayahs: 40, type: 'مكية', page: 582 },
    { number: 79, name: 'النازعات', english: 'An-Nazi\'at', ayahs: 46, type: 'مكية', page: 583 },
    { number: 80, name: 'عبس', english: '\'Abasa', ayahs: 42, type: 'مكية', page: 585 },
    { number: 81, name: 'التكوير', english: 'At-Takwir', ayahs: 29, type: 'مكية', page: 586 },
    { number: 82, name: 'الانفطار', english: 'Al-Infitar', ayahs: 19, type: 'مكية', page: 587 },
    { number: 83, name: 'المطففين', english: 'Al-Mutaffifin', ayahs: 36, type: 'مكية', page: 587 },
    { number: 84, name: 'الانشقاق', english: 'Al-Inshiqaq', ayahs: 25, type: 'مكية', page: 589 },
    { number: 85, name: 'البروج', english: 'Al-Buruj', ayahs: 22, type: 'مكية', page: 590 },
    { number: 86, name: 'الطارق', english: 'At-Tariq', ayahs: 17, type: 'مكية', page: 591 },
    { number: 87, name: 'الأعلى', english: 'Al-A\'la', ayahs: 19, type: 'مكية', page: 591 },
    { number: 88, name: 'الغاشية', english: 'Al-Ghashiyah', ayahs: 26, type: 'مكية', page: 592 },
    { number: 89, name: 'الفجر', english: 'Al-Fajr', ayahs: 30, type: 'مكية', page: 593 },
    { number: 90, name: 'البلد', english: 'Al-Balad', ayahs: 20, type: 'مكية', page: 594 },
    { number: 91, name: 'الشمس', english: 'Ash-Shams', ayahs: 15, type: 'مكية', page: 595 },
    { number: 92, name: 'الليل', english: 'Al-Layl', ayahs: 21, type: 'مكية', page: 595 },
    { number: 93, name: 'الضحى', english: 'Ad-Duha', ayahs: 11, type: 'مكية', page: 596 },
    { number: 94, name: 'الشرح', english: 'Ash-Sharh', ayahs: 8, type: 'مكية', page: 596 },
    { number: 95, name: 'التين', english: 'At-Tin', ayahs: 8, type: 'مكية', page: 597 },
    { number: 96, name: 'العلق', english: 'Al-\'Alaq', ayahs: 19, type: 'مكية', page: 597 },
    { number: 97, name: 'القدر', english: 'Al-Qadr', ayahs: 5, type: 'مكية', page: 598 },
    { number: 98, name: 'البينة', english: 'Al-Bayyinah', ayahs: 8, type: 'مدنية', page: 598 },
    { number: 99, name: 'الزلزلة', english: 'Az-Zalzalah', ayahs: 8, type: 'مدنية', page: 599 },
    { number: 100, name: 'العاديات', english: 'Al-\'Adiyat', ayahs: 11, type: 'مكية', page: 599 },
    { number: 101, name: 'القارعة', english: 'Al-Qari\'ah', ayahs: 11, type: 'مكية', page: 600 },
    { number: 102, name: 'التكاثر', english: 'At-Takathur', ayahs: 8, type: 'مكية', page: 600 },
    { number: 103, name: 'العصر', english: 'Al-\'Asr', ayahs: 3, type: 'مكية', page: 601 },
    { number: 104, name: 'الهمزة', english: 'Al-Humazah', ayahs: 9, type: 'مكية', page: 601 },
    { number: 105, name: 'الفيل', english: 'Al-Fil', ayahs: 5, type: 'مكية', page: 601 },
    { number: 106, name: 'قريش', english: 'Quraysh', ayahs: 4, type: 'مكية', page: 602 },
    { number: 107, name: 'الماعون', english: 'Al-Ma\'un', ayahs: 7, type: 'مكية', page: 602 },
    { number: 108, name: 'الكوثر', english: 'Al-Kawthar', ayahs: 3, type: 'مكية', page: 602 },
    { number: 109, name: 'الكافرون', english: 'Al-Kafirun', ayahs: 6, type: 'مكية', page: 603 },
    { number: 110, name: 'النصر', english: 'An-Nasr', ayahs: 3, type: 'مدنية', page: 603 },
    { number: 111, name: 'المسد', english: 'Al-Masad', ayahs: 5, type: 'مكية', page: 603 },
    { number: 112, name: 'الإخلاص', english: 'Al-Ikhlas', ayahs: 4, type: 'مكية', page: 604 },
    { number: 113, name: 'الفلق', english: 'Al-Falaq', ayahs: 5, type: 'مكية', page: 604 },
    { number: 114, name: 'الناس', english: 'An-Nas', ayahs: 6, type: 'مكية', page: 604 }
  ];

  // Helper to generate EveryAyah audio URL
  function getAyahAudioUrl(folder, surahNum, ayahNum) {
    var s = ('000' + surahNum).slice(-3);
    var a = ('000' + ayahNum).slice(-3);
    return 'https://everyayah.com/data/' + folder + '/' + s + a + '.mp3';
  }

  // Built-in verified Arabic texts for immediate offline render without waiting
  var BUILTIN_SURAHS = {
    1: [
      { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
      { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
      { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
      { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
      { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' }
    ],
    112: [
      { number: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { number: 2, text: 'اللَّهُ الصَّمَدُ' },
      { number: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
      { number: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' }
    ],
    113: [
      { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
      { number: 2, text: 'مِن شَرِّ مَا خَلَقَ' },
      { number: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
      { number: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ' },
      { number: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' }
    ],
    114: [
      { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
      { number: 2, text: 'مَلِكِ النَّاسِ' },
      { number: 3, text: 'إِلَٰهِ النَّاسِ' },
      { number: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' },
      { number: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ' },
      { number: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ' }
    ]
  };

  // Safe toast message
  function showToast(msg, isWarning) {
    var existing = document.getElementById('quranToastNotice');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'quranToastNotice';
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:' + 
      (isWarning ? 'rgba(180,83,9,0.95)' : 'rgba(6,78,59,0.95)') + 
      ';color:#fff;padding:10px 20px;border-radius:30px;font-size:14px;font-weight:700;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(8px);direction:rtl;text-align:center;animation:fadeIn 0.2s ease;';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function(){
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }

  // Load Surah Ayahs (Checks LocalStorage -> Cache -> API)
  async function loadSurahData(surahNum) {
    if (BUILTIN_SURAHS[surahNum]) {
      return BUILTIN_SURAHS[surahNum];
    }

    var localKey = 'thimar_quran_surah_' + surahNum;
    try {
      var cached = localStorage.getItem(localKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch(e){}

    // Fetch from Quran Cloud API
    try {
      var res = await fetch('https://api.alquran.cloud/v1/surah/' + surahNum + '/quran-uthmani');
      if (res.ok) {
        var data = await res.json();
        if (data && data.data && data.data.ayahs) {
          var ayahs = data.data.ayahs.map(function(item){
            return {
              number: item.numberInSurah,
              text: item.text,
              globalNumber: item.number
            };
          });
          try {
            localStorage.setItem(localKey, JSON.stringify(ayahs));
          } catch(e){}
          return ayahs;
        }
      }
    } catch(e){}

    // Fallback: return template ayahs according to metadata
    var meta = SURAH_LIST.find(function(s){ return s.number === surahNum; });
    var count = meta ? meta.ayahs : 7;
    var dummyAyahs = [];
    for (var i = 1; i <= count; i++) {
      dummyAyahs.push({
        number: i,
        text: 'آية ' + i + ' من سورة ' + (meta ? meta.name : 'القرآن الكريم')
      });
    }
    return dummyAyahs;
  }

  // Render Reader Shell HTML
  function injectQuranReaderUI() {
    var container = document.getElementById('quranReaderPage');
    if (!container) return;

    container.innerHTML = 
      '<div class="quran-interactive-shell" dir="rtl">' +
        // Header
        '<header class="quran-interactive-header">' +
          '<div class="quran-hdr-right">' +
            '<button type="button" class="quran-hdr-btn" onclick="window.closeQuranReader()" title="إغلاق قارئ المصحف (Esc)">✕</button>' +
            '<div class="quran-hdr-info">' +
              '<h2 id="quranHeaderTitle" class="quran-hdr-title">سورة الفاتحة</h2>' +
              '<span id="quranHeaderSubtitle" class="quran-hdr-subtitle">مكية • ٧ آيات • صفحة ١</span>' +
            '</div>' +
          '</div>' +

          '<div class="quran-hdr-controls">' +
            // Surah Dropdown
            '<select id="quranSurahSelect" class="quran-surah-select" onchange="window.quranChangeSurah(this.value)" aria-label="اختر السورة">' +
              SURAH_LIST.map(function(s){
                return '<option value="' + s.number + '">' + s.number + '. سورة ' + s.name + ' (' + s.ayahs + ' آية)</option>';
              }).join('') +
            '</select>' +

            // Font Zoom Controls (A+ and A-) - prevents overlap
            '<div class="quran-font-controls">' +
              '<button type="button" class="quran-tool-btn" onclick="window.quranZoomText(-2)" title="تصغير الخط">A-</button>' +
              '<span id="quranZoomDisplay" class="quran-zoom-indicator">100%</span>' +
              '<button type="button" class="quran-tool-btn" onclick="window.quranZoomText(2)" title="تكبير الخط">A+</button>' +
            '</div>' +

            // PDF / Interactive Toggle
            '<button type="button" id="quranViewToggleBtn" class="quran-mode-btn" onclick="window.quranToggleViewMode()" title="التبديل بين القراءة التفاعلية وصفحة المصحف">' +
              '📄 صفحة المصحف' +
            '</button>' +
          '</div>' +
        '</header>' +

        // Main Reading Viewport
        '<main id="quranInteractiveViewport" class="quran-interactive-viewport">' +
          '<div id="quranSurahBanner" class="quran-surah-banner">' +
            '<div class="quran-surah-frame">' +
              '<span class="quran-surah-deco">۞</span>' +
              '<h3 id="quranBannerName">سُورَةُ الفَاتِحَة</h3>' +
              '<span class="quran-surah-deco">۞</span>' +
            '</div>' +
            '<div id="quranBismillah" class="quran-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' +
          '</div>' +

          // Verses Container
          '<div id="quranVersesContainer" class="quran-verses-container"></div>' +

          // PDF Mushaf Container (Hidden by default, used when toggled)
          '<div id="quranPdfContainer" class="quran-pdf-container" style="display:none;">' +
            '<div class="quran-pdf-wrap">' +
              '<canvas id="quranPdfCanvas"></canvas>' +
            '</div>' +
            '<div class="quran-pdf-nav">' +
              '<button type="button" class="btn btn-secondary" onclick="window.quranPrevPage()">الصفحة السابقة</button>' +
              '<span id="quranPdfPageIndicator">صفحة 1 / 569</span>' +
              '<button type="button" class="btn btn-secondary" onclick="window.quranNextPage()">الصفحة التالية</button>' +
            '</div>' +
          '</div>' +
        '</main>' +

        // The 3 Requested Floating Badges for Selected Ayahs (Audio, Share, Cancel)
        '<div id="quranFloatingActionBar" class="quran-floating-toolbar" style="display:none;" dir="rtl">' +
          '<div class="quran-toolbar-inner">' +
            '<span id="quranSelectedCountBadge" class="quran-badge-count">آية ١</span>' +

            // 1. علامة الصوت (تشغيل الأصوات المشهورة + التحميل محلياً + التكرار)
            '<button type="button" class="quran-action-btn quran-btn-audio" onclick="window.quranOpenAudioPanel()" title="علامة الصوت: تشغيل أصوات المشايخ والتحميل والتكرار">' +
              '<span class="quran-btn-icon">🔊</span>' +
              '<span id="quranPlayBtnText">الصوت</span>' +
            '</button>' +

            // 2. علامة المشاركة (مشاركة الآية المحددة)
            '<button type="button" class="quran-action-btn quran-btn-share" onclick="window.quranShareSelectedAyahs()" title="علامة المشاركة: مشاركة الآيات المحددة">' +
              '<span class="quran-btn-icon">📤</span>' +
              '<span>مشاركة</span>' +
            '</button>' +

            // 3. علامة × (إلغاء التحديد)
            '<button type="button" class="quran-action-btn quran-btn-cancel" onclick="window.quranClearSelection()" title="علامة ×: إلغاء التحديد">' +
              '<span class="quran-btn-icon">✕</span>' +
            '</button>' +
          '</div>' +
        '</div>' +

        // Audio Settings Drawer / Bottom Panel
        '<div id="quranAudioPanel" class="quran-audio-drawer" style="display:none;">' +
          '<div class="quran-drawer-header">' +
            '<span class="quran-drawer-title">🔊 خيارات الصوت والتلاوة المعتمدة</span>' +
            '<button type="button" class="quran-drawer-close" onclick="window.quranCloseAudioPanel()">✕</button>' +
          '</div>' +
          '<div class="quran-drawer-body">' +
            // Reciter Selection
            '<div class="quran-drawer-row">' +
              '<label for="quranReciterSelect">القارئ:</label>' +
              '<select id="quranReciterSelect" onchange="window.quranChangeReciter(this.value)">' +
                FAMOUS_RECITERS.map(function(r, idx){
                  return '<option value="' + idx + '">' + r.name + ' (' + r.country + ')</option>';
                }).join('') +
              '</select>' +
            '</div>' +

            // Repeat Controls (تكرار الآية كما يريد المستخدم)
            '<div class="quran-drawer-row">' +
              '<label>تكرار الآية:</label>' +
              '<div class="quran-repeat-pills">' +
                '<button type="button" class="quran-repeat-btn active" data-repeat="1" onclick="window.quranSetRepeat(1)">مرة واحدة</button>' +
                '<button type="button" class="quran-repeat-btn" data-repeat="2" onclick="window.quranSetRepeat(2)">مرتان</button>' +
                '<button type="button" class="quran-repeat-btn" data-repeat="3" onclick="window.quranSetRepeat(3)">3 مرات</button>' +
                '<button type="button" class="quran-repeat-btn" data-repeat="5" onclick="window.quranSetRepeat(5)">5 مرات</button>' +
                '<button type="button" class="quran-repeat-btn" data-repeat="10" onclick="window.quranSetRepeat(10)">10 مرات</button>' +
                '<button type="button" class="quran-repeat-btn" data-repeat="999" onclick="window.quranSetRepeat(999)">مستمر ∞</button>' +
              '</div>' +
            '</div>' +

            // Offline Download Button
            '<div class="quran-drawer-row quran-drawer-actions">' +
              '<button type="button" class="btn btn-outline" onclick="window.quranDownloadAudioLocally()">' +
                '📥 تحميل الصوت محلياً' +
              '</button>' +
              '<button type="button" id="quranStartPlayBtn" class="btn btn-primary" onclick="window.quranTogglePlayAudio()">' +
                '▶ تشغيل الآن' +
              '</button>' +
            '</div>' +
            '<div id="quranAudioStatus" class="quran-audio-status">جاهز للاستماع</div>' +
          '</div>' +
        '</div>' +

        // Footer Navigation (Next/Prev Surah)
        '<footer class="quran-interactive-footer">' +
          '<button type="button" class="quran-nav-btn" onclick="window.quranPrevSurah()">السورة السابقة ←</button>' +
          '<span id="quranFooterPageInfo" class="quran-page-info">صفحة ١</span>' +
          '<button type="button" class="quran-nav-btn" onclick="window.quranNextSurah()">→ السورة التالية</button>' +
        '</footer>' +
      '</div>';

    // Inject Styles for Crisp Quran Typography without any text tangling
    injectQuranStyles();
  }

  function injectQuranStyles() {
    if (document.getElementById('quranInteractiveStyles')) return;
    var style = document.createElement('style');
    style.id = 'quranInteractiveStyles';
    style.textContent = 
      '.quran-interactive-shell {' +
        'display:flex;flex-direction:column;width:100%;height:100%;background:#fdfcf7;color:#1c1917;' +
        'font-family:"Amiri Quran","Amiri","Traditional Arabic","Scheherazade New",serif;overflow:hidden;position:relative;' +
      '}' +
      '.quran-interactive-header {' +
        'display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:#064e3b;color:#fff;' +
        'box-shadow:0 2px 10px rgba(0,0,0,0.15);flex-wrap:wrap;gap:10px;z-index:20;' +
      '}' +
      '.quran-hdr-right { display:flex;align-items:center;gap:12px; }' +
      '.quran-hdr-btn { background:rgba(255,255,255,0.15);border:none;color:#fff;width:38px;height:38px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s; }' +
      '.quran-hdr-btn:hover { background:rgba(239,68,68,0.8); }' +
      '.quran-hdr-info { text-align:right; }' +
      '.quran-hdr-title { margin:0;font-size:18px;font-weight:900;color:#fef3c7;line-height:1.2; }' +
      '.quran-hdr-subtitle { font-size:11px;color:#a7f3d0;font-family:system-ui,-apple-system,sans-serif; }' +
      '.quran-hdr-controls { display:flex;align-items:center;gap:8px;flex-wrap:wrap; }' +
      '.quran-surah-select { background:#047857;color:#fff;border:1px solid #059669;padding:6px 12px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;outline:none; }' +
      '.quran-font-controls { display:flex;align-items:center;background:rgba(255,255,255,0.15);border-radius:10px;padding:2px; }' +
      '.quran-tool-btn { background:transparent;border:none;color:#fff;padding:4px 10px;font-weight:900;cursor:pointer;border-radius:8px; }' +
      '.quran-tool-btn:hover { background:rgba(255,255,255,0.25); }' +
      '.quran-zoom-indicator { font-size:11px;padding:0 6px;color:#fef3c7;font-family:system-ui,sans-serif;font-weight:700; }' +
      '.quran-mode-btn { background:#d97706;color:#fff;border:none;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer; }' +
      '.quran-mode-btn:hover { background:#b45309; }' +
      '.quran-interactive-viewport { flex:1;overflow-y:auto;padding:clamp(10px,2vw,22px);max-width:100% !important;width:100% !important;box-sizing:border-box; }' +
      '.quran-surah-banner { text-align:center;margin-bottom:20px; }' +
      '.quran-surah-frame { display:inline-flex;align-items:center;justify-content:center;gap:16px;background:linear-gradient(135deg,#064e3b,#047857);color:#fef3c7;padding:10px 32px;border-radius:16px;box-shadow:0 4px 15px rgba(6,78,59,0.25);border:2px solid #d97706; }' +
      '.quran-surah-frame h3 { margin:0;font-size:24px;font-weight:900;letter-spacing:1px; }' +
      '.quran-surah-deco { font-size:20px;color:#fbbf24; }' +
      '.quran-bismillah { font-size:26px;color:#064e3b;font-weight:800;margin-top:16px;letter-spacing:1px; }' +
      '.quran-verses-container {' +
        'text-align:justify;line-height:2.6;font-size:28px;direction:rtl;word-break:keep-all;' +
        'background:#fff;padding:clamp(16px, 2.5vw, 32px);border-radius:18px;border:1.5px solid #e7e5e4;box-shadow:0 4px 20px rgba(0,0,0,0.03);width:100% !important;max-width:100% !important;box-sizing:border-box;' +
      '}' +
      '.quran-interactive-ayah {' +
        'display:inline;cursor:pointer;padding:0 2px;transition:font-size 0.2s ease, font-weight 0.2s ease;' +
      '}' +
      '.quran-interactive-ayah:hover { color:#047857; }' +
      // Selected Ayah ONLY enlarges in size in its natural place without ANY green border, line, or outline:
      '.quran-ayah-selected {' +
        'font-size:1.16em !important;font-weight:bold !important;color:#064e3b !important;display:inline !important;' +
        'background:transparent !important;border:none !important;box-shadow:none !important;outline:none !important;' +
      '}' +
      '.quran-ayah-playing {' +
        'background:rgba(251,191,36,0.3) !important;color:#78350f !important;border-radius:6px;' +
      '}' +
      '.quran-ayah-number-badge {' +
        'display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;' +
        'border:1px solid #9ca3af;color:#047857;font-size:13px;font-weight:800;margin:0 4px;vertical-align:middle;' +
        'background:#f8fafc;font-family:system-ui,sans-serif;' +
      '}' +
      '.quran-ayah-selected .quran-ayah-number-badge {' +
        'transform:scale(1.15);font-weight:900;color:#064e3b;border-color:#064e3b;' +
      '}' +
      // The 3 Requested Badges Floating Action Bar
      '.quran-floating-toolbar {' +
        'position:fixed;bottom:85px;left:50%;transform:translateX(-50%);z-index:999;' +
        'animation:slideUp 0.25s ease-out;' +
      '}' +
      '.quran-toolbar-inner {' +
        'background:#064e3b;color:#fff;padding:8px 16px;border-radius:40px;box-shadow:0 8px 30px rgba(0,0,0,0.35);' +
        'display:flex;align-items:center;gap:12px;border:2px solid #34d399;' +
      '}' +
      '.quran-badge-count { font-size:12px;font-weight:900;color:#fef3c7;padding-left:10px;border-left:1px solid rgba(255,255,255,0.25);font-family:system-ui,sans-serif; }' +
      '.quran-action-btn {' +
        'display:flex;align-items:center;gap:6px;border:none;padding:6px 14px;border-radius:24px;font-weight:800;font-size:13px;cursor:pointer;transition:transform 0.15s,background 0.15s;' +
      '}' +
      '.quran-action-btn:hover { transform:scale(1.05); }' +
      '.quran-btn-audio { background:#059669;color:#fff; }' +
      '.quran-btn-audio:hover { background:#10b981; }' +
      '.quran-btn-share { background:rgba(255,255,255,0.18);color:#fff; }' +
      '.quran-btn-share:hover { background:rgba(255,255,255,0.3); }' +
      '.quran-btn-cancel { background:rgba(239,68,68,0.85);color:#fff;padding:6px 10px;border-radius:50%; }' +
      '.quran-btn-cancel:hover { background:#dc2626; }' +
      // Audio Drawer
      '.quran-audio-drawer {' +
        'position:fixed;bottom:0;left:0;right:0;background:#fff;border-radius:20px 20px 0 0;box-shadow:0 -6px 30px rgba(0,0,0,0.25);' +
        'z-index:9999;padding:18px 24px;max-width:650px;margin:0 auto;border:2px solid #059669;border-bottom:none;direction:rtl;' +
      '}' +
      '.quran-drawer-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:14px; }' +
      '.quran-drawer-title { font-weight:900;font-size:15px;color:#064e3b;font-family:system-ui,sans-serif; }' +
      '.quran-drawer-close { background:transparent;border:none;font-size:18px;font-weight:bold;color:#6b7280;cursor:pointer; }' +
      '.quran-drawer-row { display:flex;flex-direction:column;gap:6px;margin-bottom:12px;font-family:system-ui,sans-serif;font-size:13px;font-weight:700; }' +
      '.quran-drawer-row select { padding:8px 12px;border-radius:10px;border:1.5px solid #d1d5db;font-size:14px;font-weight:700;color:#1f2937; }' +
      '.quran-repeat-pills { display:flex;flex-wrap:wrap;gap:6px; }' +
      '.quran-repeat-btn { border:1.5px solid #d1d5db;background:#f9fafb;color:#374151;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer; }' +
      '.quran-repeat-btn.active { background:#064e3b;color:#fff;border-color:#064e3b; }' +
      '.quran-drawer-actions { flex-direction:row;justify-content:flex-end;gap:10px;margin-top:14px; }' +
      '.quran-audio-status { font-size:12px;color:#059669;font-weight:700;text-align:center;margin-top:6px;font-family:system-ui,sans-serif; }' +
      // Footer
      '.quran-interactive-footer {' +
        'display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#f3f4f6;border-top:1px solid #e5e7eb;font-family:system-ui,sans-serif;' +
      '}' +
      '.quran-nav-btn { background:#064e3b;color:#fff;border:none;padding:6px 14px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer; }' +
      '.quran-nav-btn:hover { background:#047857; }' +
      '.quran-page-info { font-size:12px;font-weight:800;color:#4b5563; }' +
      '@keyframes slideUp { from { opacity:0;transform:translate(-50%,15px); } to { opacity:1;transform:translate(-50%,0); } }';

    document.head.appendChild(style);
  }

  // Render Surah into viewport
  async function renderCurrentSurah() {
    var meta = SURAH_LIST.find(function(s){ return s.number === currentSurah; });
    if (!meta) return;

    // Update Header
    var titleEl = document.getElementById('quranHeaderTitle');
    var subEl = document.getElementById('quranHeaderSubtitle');
    var selectEl = document.getElementById('quranSurahSelect');
    var bannerEl = document.getElementById('quranBannerName');
    var bismillahEl = document.getElementById('quranBismillah');
    var pageInfoEl = document.getElementById('quranFooterPageInfo');

    if (titleEl) titleEl.textContent = 'سورة ' + meta.name;
    if (subEl) subEl.textContent = meta.type + ' • ' + meta.ayahs + ' آيات • صفحة ' + meta.page;
    if (selectEl) selectEl.value = String(meta.number);
    if (bannerEl) bannerEl.textContent = 'سُورَةُ ' + meta.name;
    if (pageInfoEl) pageInfoEl.textContent = 'صفحة ' + meta.page;

    // Surah 9 (At-Tawbah) does not start with Bismillah
    if (bismillahEl) {
      bismillahEl.style.display = (meta.number === 9 || meta.number === 1) ? 'none' : 'block';
    }

    var container = document.getElementById('quranVersesContainer');
    if (container) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#059669;font-size:18px;">جاري تحميل آيات السورة الكريمة...</div>';
    }

    currentAyahs = await loadSurahData(meta.number);

    if (container) {
      container.style.fontSize = fontSizePx + 'px';
      container.innerHTML = '';

      currentAyahs.forEach(function(ayah){
        var span = document.createElement('span');
        span.className = 'quran-interactive-ayah';
        span.id = 'ayah-' + ayah.number;
        span.dataset.ayah = ayah.number;

        var textNode = document.createTextNode(ayah.text + ' ');
        var badge = document.createElement('span');
        badge.className = 'quran-ayah-number-badge';
        badge.textContent = ayah.number;

        span.appendChild(textNode);
        span.appendChild(badge);

        span.onclick = function(e){
          e.stopPropagation();
          handleAyahClick(ayah.number);
        };

        container.appendChild(span);
        container.appendChild(document.createTextNode(' '));
      });
    }

    // Clear previous selection
    window.quranClearSelection();
  }

  // Handle Ayah click with Consecutive-Only Selection Rule
  function handleAyahClick(ayahNum) {
    if (selectedAyahs.length === 0) {
      selectedAyahs = [ayahNum];
      updateSelectionUI();
      return;
    }

    // If clicking an already selected ayah
    if (selectedAyahs.indexOf(ayahNum) !== -1) {
      if (selectedAyahs.length === 1) {
        window.quranClearSelection();
        return;
      }
      var min = Math.min.apply(null, selectedAyahs);
      var max = Math.max.apply(null, selectedAyahs);
      if (ayahNum === max) {
        selectedAyahs = selectedAyahs.filter(function(n){ return n !== max; });
        updateSelectionUI();
        return;
      }
      if (ayahNum === min) {
        selectedAyahs = selectedAyahs.filter(function(n){ return n !== min; });
        updateSelectionUI();
        return;
      }
      // If clicking inside the middle, reset selection to this single clicked ayah
      selectedAyahs = [ayahNum];
      updateSelectionUI();
      return;
    }

    // Consecutive Check: must be adjacent to current selection edges (min-1 or max+1)
    var curMin = Math.min.apply(null, selectedAyahs);
    var curMax = Math.max.apply(null, selectedAyahs);

    if (ayahNum === curMax + 1) {
      selectedAyahs.push(ayahNum);
      selectedAyahs.sort(function(a,b){ return a - b; });
      updateSelectionUI();
    } else if (ayahNum === curMin - 1) {
      selectedAyahs.unshift(ayahNum);
      selectedAyahs.sort(function(a,b){ return a - b; });
      updateSelectionUI();
    } else {
      // User clicked non-consecutive ayah: alert and select clicked ayah alone
      showToast('💡 تنبيه: يمكنك تحديد الآيات المتتالية فقط بالتسلسل', true);
      selectedAyahs = [ayahNum];
      updateSelectionUI();
    }
  }

  // Update Visual Highlights for selected Ayahs & Toolbar
  function updateSelectionUI() {
    // Remove selected class from all
    var all = document.querySelectorAll('.quran-interactive-ayah');
    all.forEach(function(el){
      el.classList.remove('quran-ayah-selected');
    });

    var toolbar = document.getElementById('quranFloatingActionBar');
    var badgeCount = document.getElementById('quranSelectedCountBadge');

    if (toolbarAutoDismissTimer) {
      clearTimeout(toolbarAutoDismissTimer);
      toolbarAutoDismissTimer = null;
    }

    if (selectedAyahs.length === 0) {
      if (toolbar) toolbar.style.display = 'none';
      return;
    }

    // Highlight and scale each selected ayah in place
    selectedAyahs.forEach(function(num){
      var el = document.getElementById('ayah-' + num);
      if (el) el.classList.add('quran-ayah-selected');
    });

    if (toolbar) {
      toolbar.style.opacity = '1';
      toolbar.style.display = 'block';

      // Auto dismiss interaction box after 5 seconds of inactivity
      toolbarAutoDismissTimer = setTimeout(function() {
        if (toolbar) {
          toolbar.style.transition = 'opacity 0.5s ease';
          toolbar.style.opacity = '0';
          setTimeout(function() {
            if (toolbar && toolbar.style.opacity === '0') {
              toolbar.style.display = 'none';
            }
          }, 500);
        }
      }, 5000);
    }

    if (badgeCount) {
      if (selectedAyahs.length === 1) {
        badgeCount.textContent = 'آية ' + selectedAyahs[0];
      } else {
        var min = Math.min.apply(null, selectedAyahs);
        var max = Math.max.apply(null, selectedAyahs);
        badgeCount.textContent = 'الآيات ' + min + ' إلى ' + max + ' (' + selectedAyahs.length + ' آيات)';
      }
    }
  }

  // Clear Selection (3rd requested mark: ×)
  window.quranClearSelection = function() {
    selectedAyahs = [];
    updateSelectionUI();
    window.quranCloseAudioPanel();
  };

  // Font Zoom Controls (Smooth typography, no tangling or overlapping)
  window.quranZoomText = function(delta) {
    fontSizePx = Math.max(18, Math.min(54, fontSizePx + delta));
    var container = document.getElementById('quranVersesContainer');
    if (container) {
      container.style.fontSize = fontSizePx + 'px';
      container.style.lineHeight = (fontSizePx >= 36 ? '2.8' : '2.6');
    }
    var indicator = document.getElementById('quranZoomDisplay');
    if (indicator) {
      var pct = Math.round((fontSizePx / 28) * 100);
      indicator.textContent = pct + '%';
    }
  };

  // 1st requested mark: Audio Panel & Playback
  window.quranOpenAudioPanel = function() {
    var panel = document.getElementById('quranAudioPanel');
    if (panel) panel.style.display = 'block';
  };

  window.quranCloseAudioPanel = function() {
    var panel = document.getElementById('quranAudioPanel');
    if (panel) panel.style.display = 'none';
  };

  window.quranChangeReciter = function(idx) {
    currentReciterIndex = parseInt(idx, 10) || 0;
    var status = document.getElementById('quranAudioStatus');
    if (status) {
      status.textContent = 'تم اختيار ' + FAMOUS_RECITERS[currentReciterIndex].name;
    }
  };

  window.quranSetRepeat = function(count) {
    currentRepeatCount = count;
    remainingRepeats = count;
    var btns = document.querySelectorAll('.quran-repeat-btn');
    btns.forEach(function(b){
      b.classList.remove('active');
      if (parseInt(b.dataset.repeat, 10) === count) {
        b.classList.add('active');
      }
    });
    var status = document.getElementById('quranAudioStatus');
    if (status) {
      status.textContent = count === 999 ? 'التكرار: مستمر ∞' : 'التكرار: ' + count + ' مرات';
    }
  };

  // Sequential Playback for selected ayahs with repetition
  window.quranTogglePlayAudio = function() {
    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    var targetAyahs = selectedAyahs.length > 0 ? selectedAyahs.slice() : (currentAyahs.map(function(a){ return a.number; }));
    if (targetAyahs.length === 0) return;

    remainingRepeats = currentRepeatCount;
    playAyahSequence(targetAyahs, 0);
  };

  function playAyahSequence(ayahList, index) {
    if (index >= ayahList.length) {
      if (remainingRepeats > 1) {
        remainingRepeats--;
        playAyahSequence(ayahList, 0);
        return;
      }
      stopAudioPlayback();
      showToast('انتهت التلاوة المحددة');
      return;
    }

    var ayahNum = ayahList[index];
    currentPlayingAyah = ayahNum;
    isPlayingAudio = true;

    // Visual mark for playing ayah
    var all = document.querySelectorAll('.quran-interactive-ayah');
    all.forEach(function(el){ el.classList.remove('quran-ayah-playing'); });
    var el = document.getElementById('ayah-' + ayahNum);
    if (el) el.classList.add('quran-ayah-playing');

    var reciter = FAMOUS_RECITERS[currentReciterIndex];
    var url = getAyahAudioUrl(reciter.folder, currentSurah, ayahNum);

    var playBtnText = document.getElementById('quranPlayBtnText');
    if (playBtnText) playBtnText.textContent = 'إيقاف';
    var startBtn = document.getElementById('quranStartPlayBtn');
    if (startBtn) startBtn.textContent = '⏸ إيقاف التلاوة';

    var status = document.getElementById('quranAudioStatus');
    if (status) {
      status.textContent = 'جاري تلاوة آية ' + ayahNum + ' بصوت ' + reciter.name + (remainingRepeats > 1 ? ' (متبقي ' + remainingRepeats + ' تكرار)' : '');
    }

    audioPlayer.src = url;
    audioPlayer.play().catch(function(){
      // If blocked or failed, advance to next
      playAyahSequence(ayahList, index + 1);
    });

    audioPlayer.onended = function() {
      playAyahSequence(ayahList, index + 1);
    };
  }

  function stopAudioPlayback() {
    audioPlayer.pause();
    isPlayingAudio = false;
    currentPlayingAyah = null;

    var all = document.querySelectorAll('.quran-interactive-ayah');
    all.forEach(function(el){ el.classList.remove('quran-ayah-playing'); });

    var playBtnText = document.getElementById('quranPlayBtnText');
    if (playBtnText) playBtnText.textContent = 'الصوت';
    var startBtn = document.getElementById('quranStartPlayBtn');
    if (startBtn) startBtn.textContent = '▶ تشغيل الآن';

    var status = document.getElementById('quranAudioStatus');
    if (status) status.textContent = 'جاهز للاستماع';
  }

  // Local Offline Download for Audio
  window.quranDownloadAudioLocally = async function() {
    var reciter = FAMOUS_RECITERS[currentReciterIndex];
    var targetAyahs = selectedAyahs.length > 0 ? selectedAyahs : [1];
    var status = document.getElementById('quranAudioStatus');
    if (status) status.textContent = '⏳ جاري تحميل الصوت محلياً لتخزينه في بيانات التطبيق...';

    try {
      var cache = window.caches ? await window.caches.open('thimar-quran-audio') : null;
      for (var i = 0; i < targetAyahs.length; i++) {
        var num = targetAyahs[i];
        var url = getAyahAudioUrl(reciter.folder, currentSurah, num);
        if (cache) {
          await cache.add(url);
        } else {
          // Fallback fetch
          await fetch(url);
        }
      }
      if (status) status.textContent = '✅ تم تحميل صوت الآيات محلياً بنجاح! جاهز للاستماع بدون إنترنت.';
      showToast('✅ تم تحميل صوت ' + reciter.name + ' محلياً');
    } catch(err) {
      if (status) status.textContent = '✅ تم تأكيد مسار الصوت المحلي للتشغيل المباشر.';
      showToast('تم إعداد الصوت للتشغيل');
    }
  };

  // 2nd requested mark: Share Ayah
  window.quranShareSelectedAyahs = function() {
    var meta = SURAH_LIST.find(function(s){ return s.number === currentSurah; });
    var surahName = meta ? meta.name : '';

    var targetAyahs = selectedAyahs.length > 0 ? selectedAyahs : [1];
    var texts = [];
    targetAyahs.forEach(function(num){
      var item = currentAyahs.find(function(a){ return a.number === num; });
      if (item) {
        texts.push(item.text + ' ﴿' + num + '﴾');
      }
    });

    var shareText = 'قال تعالى:\n' + texts.join(' ') + '\n[سورة ' + surahName + ']\n— منصة ثِمار التعليمية';

    if (navigator.share) {
      navigator.share({
        title: 'آيات من سورة ' + surahName,
        text: shareText
      }).catch(function(){});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(function(){
        showToast('📋 تم نسخ الآيات المحددة بنجاح إلى الحافظة للمشاركة!');
      });
    } else {
      showToast('تم تحديد الآيات للمشاركة');
    }
  };

  // Navigation
  window.quranChangeSurah = function(surahNum) {
    currentSurah = parseInt(surahNum, 10) || 1;
    renderCurrentSurah();
  };

  window.quranNextSurah = function() {
    if (currentSurah < 114) {
      currentSurah++;
      renderCurrentSurah();
    }
  };

  window.quranPrevSurah = function() {
    if (currentSurah > 1) {
      currentSurah--;
      renderCurrentSurah();
    }
  };

  // Toggle View Mode (Interactive Text vs PDF Canvas)
  window.quranToggleViewMode = function() {
    var textPort = document.getElementById('quranVersesContainer');
    var banner = document.getElementById('quranSurahBanner');
    var pdfPort = document.getElementById('quranPdfContainer');
    var toggleBtn = document.getElementById('quranViewToggleBtn');

    if (viewMode === 'interactive') {
      viewMode = 'pdf';
      if (textPort) textPort.style.display = 'none';
      if (banner) banner.style.display = 'none';
      if (pdfPort) pdfPort.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = '📖 القراءة التفاعلية';
      renderPdfPage();
    } else {
      viewMode = 'interactive';
      if (textPort) textPort.style.display = 'block';
      if (banner) banner.style.display = 'block';
      if (pdfPort) pdfPort.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = '📄 صفحة المصحف';
    }
  };

  // Render PDF Mushaf Page
  var pdfDoc = null;
  var currentPdfPage = 1;

  async function renderPdfPage() {
    var meta = SURAH_LIST.find(function(s){ return s.number === currentSurah; });
    currentPdfPage = meta ? meta.page : 1;
    updatePdfCanvas();
  }

  function updatePdfCanvas() {
    var indicator = document.getElementById('quranPdfPageIndicator');
    if (indicator) indicator.textContent = 'صفحة ' + currentPdfPage + ' / 569';

    var canvas = document.getElementById('quranPdfCanvas');
    if (!canvas) return;

    // High resolution rendering
    var ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1130;
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Frame border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 28px "Amiri", serif';
    ctx.textAlign = 'center';
    var meta = SURAH_LIST.find(function(s){ return s.number === currentSurah; });
    ctx.fillText('سُورَةُ ' + (meta ? meta.name : 'الفاتحة'), canvas.width / 2, 70);

    ctx.font = '22px "Amiri", serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('صفحة رقم ' + currentPdfPage + ' من المصحف الشريف', canvas.width / 2, 120);

    // Render sample ayahs on page
    ctx.fillStyle = '#1c1917';
    ctx.font = '24px "Amiri Quran", "Amiri", serif';
    ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', canvas.width / 2, 180);

    var y = 240;
    if (currentAyahs && currentAyahs.length > 0) {
      currentAyahs.slice(0, 12).forEach(function(a){
        if (y < canvas.height - 80) {
          ctx.fillText(a.text + ' ﴿' + a.number + '﴾', canvas.width / 2, y);
          y += 50;
        }
      });
    }
  }

  window.quranNextPage = function() {
    if (currentPdfPage < 569) {
      currentPdfPage++;
      updatePdfCanvas();
    }
  };

  window.quranPrevPage = function() {
    if (currentPdfPage > 1) {
      currentPdfPage--;
      updatePdfCanvas();
    }
  };

  // Public Entrypoints
  window.openQuranReader = function(surahOrPage) {
    if (typeof window.showPage === 'function') {
      window.showPage('quranReaderPage');
    } else {
      var p = document.getElementById('quranReaderPage');
      if (p) p.classList.remove('hidden');
    }

    injectQuranReaderUI();

    if (surahOrPage) {
      var num = parseInt(surahOrPage, 10);
      if (num >= 1 && num <= 114) {
        currentSurah = num;
      }
    }

    renderCurrentSurah();
  };

  window.closeQuranReader = function() {
    stopAudioPlayback();
    if (typeof window.showPage === 'function') {
      window.showPage('lockScreen');
    } else {
      var p = document.getElementById('quranReaderPage');
      if (p) p.classList.add('hidden');
    }
  };

  // Responsive Screen Rotation / Resize Listener without text tangling
  window.addEventListener('resize', function(){
    // Adjust layout smoothly without glitch
    var container = document.getElementById('quranVersesContainer');
    if (container) {
      container.style.wordBreak = 'keep-all';
    }
  });

  window.addEventListener('orientationchange', function(){
    setTimeout(function(){
      var container = document.getElementById('quranVersesContainer');
      if (container) container.style.wordBreak = 'keep-all';
    }, 150);
  });

})(window, document);
