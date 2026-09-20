// 114 Surahs Metadata & Ayah Cache
export interface SurahMeta {
  number: number
  name: string
  englishName: string
  ayahCount: number
  revelationType: 'مكية' | 'مدنية'
  pageStart: number
}

export interface AyahItem {
  number: number // Ayah number in surah
  globalNumber?: number
  text: string
  audioUrl?: string
}

export const ALL_SURAHS: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', ayahCount: 7, revelationType: 'مكية', pageStart: 1 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', ayahCount: 286, revelationType: 'مدنية', pageStart: 2 },
  { number: 3, name: 'آل عمران', englishName: 'Ali \'Imran', ayahCount: 200, revelationType: 'مدنية', pageStart: 50 },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', ayahCount: 176, revelationType: 'مدنية', pageStart: 77 },
  { number: 5, name: 'المائدة', englishName: 'Al-Ma\'idah', ayahCount: 120, revelationType: 'مدنية', pageStart: 106 },
  { number: 6, name: 'الأنعام', englishName: 'Al-An\'am', ayahCount: 165, revelationType: 'مكية', pageStart: 128 },
  { number: 7, name: 'الأعراف', englishName: 'Al-A\'raf', ayahCount: 206, revelationType: 'مكية', pageStart: 151 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', ayahCount: 75, revelationType: 'مدنية', pageStart: 177 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', ayahCount: 129, revelationType: 'مدنية', pageStart: 187 },
  { number: 10, name: 'يونس', englishName: 'Yunus', ayahCount: 109, revelationType: 'مكية', pageStart: 208 },
  { number: 11, name: 'هود', englishName: 'Hud', ayahCount: 123, revelationType: 'مكية', pageStart: 221 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', ayahCount: 111, revelationType: 'مكية', pageStart: 235 },
  { number: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', ayahCount: 43, revelationType: 'مدنية', pageStart: 249 },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', ayahCount: 52, revelationType: 'مكية', pageStart: 255 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', ayahCount: 99, revelationType: 'مكية', pageStart: 262 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', ayahCount: 128, revelationType: 'مكية', pageStart: 267 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', ayahCount: 111, revelationType: 'مكية', pageStart: 282 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', ayahCount: 110, revelationType: 'مكية', pageStart: 293 },
  { number: 19, name: 'مريم', englishName: 'Maryam', ayahCount: 98, revelationType: 'مكية', pageStart: 305 },
  { number: 20, name: 'طه', englishName: 'Taha', ayahCount: 135, revelationType: 'مكية', pageStart: 312 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', ayahCount: 112, revelationType: 'مكية', pageStart: 322 },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', ayahCount: 78, revelationType: 'مدنية', pageStart: 332 },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Mu\'minun', ayahCount: 118, revelationType: 'مكية', pageStart: 342 },
  { number: 24, name: 'النور', englishName: 'An-Nur', ayahCount: 64, revelationType: 'مدنية', pageStart: 350 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', ayahCount: 77, revelationType: 'مكية', pageStart: 359 },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shu\'ara', ayahCount: 227, revelationType: 'مكية', pageStart: 367 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', ayahCount: 93, revelationType: 'مكية', pageStart: 377 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', ayahCount: 88, revelationType: 'مكية', pageStart: 385 },
  { number: 29, name: 'العنكبوت', englishName: 'Al-\'Ankabut', ayahCount: 69, revelationType: 'مكية', pageStart: 396 },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', ayahCount: 60, revelationType: 'مكية', pageStart: 404 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', ayahCount: 34, revelationType: 'مكية', pageStart: 411 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', ayahCount: 30, revelationType: 'مكية', pageStart: 415 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', ayahCount: 73, revelationType: 'مدنية', pageStart: 418 },
  { number: 34, name: 'سبأ', englishName: 'Saba', ayahCount: 54, revelationType: 'مكية', pageStart: 428 },
  { number: 35, name: 'فاطر', englishName: 'Fatir', ayahCount: 45, revelationType: 'مكية', pageStart: 434 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', ayahCount: 83, revelationType: 'مكية', pageStart: 440 },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', ayahCount: 182, revelationType: 'مكية', pageStart: 446 },
  { number: 38, name: 'ص', englishName: 'Sad', ayahCount: 88, revelationType: 'مكية', pageStart: 453 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', ayahCount: 75, revelationType: 'مكية', pageStart: 458 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', ayahCount: 85, revelationType: 'مكية', pageStart: 467 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', ayahCount: 54, revelationType: 'مكية', pageStart: 477 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', ayahCount: 53, revelationType: 'مكية', pageStart: 483 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', ayahCount: 89, revelationType: 'مكية', pageStart: 489 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', ayahCount: 59, revelationType: 'مكية', pageStart: 496 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', ayahCount: 37, revelationType: 'مكية', pageStart: 499 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', ayahCount: 35, revelationType: 'مكية', pageStart: 502 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', ayahCount: 38, revelationType: 'مدنية', pageStart: 507 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', ayahCount: 29, revelationType: 'مدنية', pageStart: 511 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', ayahCount: 18, revelationType: 'مدنية', pageStart: 515 },
  { number: 50, name: 'ق', englishName: 'Qaf', ayahCount: 45, revelationType: 'مكية', pageStart: 518 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', ayahCount: 60, revelationType: 'مكية', pageStart: 520 },
  { number: 52, name: 'الطور', englishName: 'At-Tur', ayahCount: 49, revelationType: 'مكية', pageStart: 523 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', ayahCount: 62, revelationType: 'مكية', pageStart: 526 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', ayahCount: 55, revelationType: 'مكية', pageStart: 528 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', ayahCount: 78, revelationType: 'مدنية', pageStart: 531 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', ayahCount: 96, revelationType: 'مكية', pageStart: 534 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', ayahCount: 29, revelationType: 'مدنية', pageStart: 537 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', ayahCount: 22, revelationType: 'مدنية', pageStart: 542 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', ayahCount: 24, revelationType: 'مدنية', pageStart: 545 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', ayahCount: 13, revelationType: 'مدنية', pageStart: 549 },
  { number: 61, name: 'الصف', englishName: 'As-Saff', ayahCount: 14, revelationType: 'مدنية', pageStart: 551 },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumu\'ah', ayahCount: 11, revelationType: 'مدنية', pageStart: 553 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', ayahCount: 11, revelationType: 'مدنية', pageStart: 554 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', ayahCount: 18, revelationType: 'مدنية', pageStart: 556 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', ayahCount: 12, revelationType: 'مدنية', pageStart: 558 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', ayahCount: 12, revelationType: 'مدنية', pageStart: 560 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', ayahCount: 30, revelationType: 'مكية', pageStart: 562 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', ayahCount: 52, revelationType: 'مكية', pageStart: 564 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', ayahCount: 52, revelationType: 'مكية', pageStart: 566 },
  { number: 70, name: 'المعارج', englishName: 'Al-Ma\'arij', ayahCount: 44, revelationType: 'مكية', pageStart: 568 },
  { number: 71, name: 'نوح', englishName: 'Nuh', ayahCount: 28, revelationType: 'مكية', pageStart: 570 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', ayahCount: 28, revelationType: 'مكية', pageStart: 572 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', ayahCount: 20, revelationType: 'مكية', pageStart: 574 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', ayahCount: 56, revelationType: 'مكية', pageStart: 575 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', ayahCount: 40, revelationType: 'مكية', pageStart: 577 },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', ayahCount: 31, revelationType: 'مدنية', pageStart: 578 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', ayahCount: 50, revelationType: 'مكية', pageStart: 580 },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', ayahCount: 40, revelationType: 'مكية', pageStart: 582 },
  { number: 79, name: 'النازعات', englishName: 'An-Nazi\'at', ayahCount: 46, revelationType: 'مكية', pageStart: 583 },
  { number: 80, name: 'عبس', englishName: '\'Abasa', ayahCount: 42, revelationType: 'مكية', pageStart: 585 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', ayahCount: 29, revelationType: 'مكية', pageStart: 586 },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', ayahCount: 19, revelationType: 'مكية', pageStart: 587 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', ayahCount: 36, revelationType: 'مكية', pageStart: 587 },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', ayahCount: 25, revelationType: 'مكية', pageStart: 589 },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', ayahCount: 22, revelationType: 'مكية', pageStart: 590 },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', ayahCount: 17, revelationType: 'مكية', pageStart: 591 },
  { number: 87, name: 'الأعلى', englishName: 'Al-A\'la', ayahCount: 19, revelationType: 'مكية', pageStart: 591 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', ayahCount: 26, revelationType: 'مكية', pageStart: 592 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', ayahCount: 30, revelationType: 'مكية', pageStart: 593 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', ayahCount: 20, revelationType: 'مكية', pageStart: 594 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', ayahCount: 15, revelationType: 'مكية', pageStart: 595 },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', ayahCount: 21, revelationType: 'مكية', pageStart: 595 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duha', ayahCount: 11, revelationType: 'مكية', pageStart: 596 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', ayahCount: 8, revelationType: 'مكية', pageStart: 596 },
  { number: 95, name: 'التين', englishName: 'At-Tin', ayahCount: 8, revelationType: 'مكية', pageStart: 597 },
  { number: 96, name: 'العلق', englishName: 'Al-\'Alaq', ayahCount: 19, revelationType: 'مكية', pageStart: 597 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', ayahCount: 5, revelationType: 'مكية', pageStart: 598 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', ayahCount: 8, revelationType: 'مدنية', pageStart: 598 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', ayahCount: 8, revelationType: 'مدنية', pageStart: 599 },
  { number: 100, name: 'العاديات', englishName: 'Al-\'Adiyat', ayahCount: 11, revelationType: 'مكية', pageStart: 599 },
  { number: 101, name: 'القارعة', englishName: 'Al-Qari\'ah', ayahCount: 11, revelationType: 'مكية', pageStart: 600 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', ayahCount: 8, revelationType: 'مكية', pageStart: 600 },
  { number: 103, name: 'العصر', englishName: 'Al-\'Asr', ayahCount: 3, revelationType: 'مكية', pageStart: 601 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', ayahCount: 9, revelationType: 'مكية', pageStart: 601 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', ayahCount: 5, revelationType: 'مكية', pageStart: 601 },
  { number: 106, name: 'قريش', englishName: 'Quraysh', ayahCount: 4, revelationType: 'مكية', pageStart: 602 },
  { number: 107, name: 'الماعون', englishName: 'Al-Ma\'un', ayahCount: 7, revelationType: 'مكية', pageStart: 602 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', ayahCount: 3, revelationType: 'مكية', pageStart: 602 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', ayahCount: 6, revelationType: 'مكية', pageStart: 603 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', ayahCount: 3, revelationType: 'مدنية', pageStart: 603 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', ayahCount: 5, revelationType: 'مكية', pageStart: 603 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', ayahCount: 4, revelationType: 'مكية', pageStart: 604 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', ayahCount: 5, revelationType: 'مكية', pageStart: 604 },
  { number: 114, name: 'الناس', englishName: 'An-Nas', ayahCount: 6, revelationType: 'مكية', pageStart: 604 }
]

// Famous reciters with everyayah endpoints for per-ayah audio
export interface QuranReciter {
  id: string
  name: string
  folder: string
  country: string
}

export const QURAN_RECITERS: QuranReciter[] = [
  { id: 'husary', name: 'الشيخ محمود خليل الحصري (مرتل)', folder: 'Husary_128kbps', country: 'مصر' },
  { id: 'minshawi', name: 'الشيخ محمد صديق المنشاوي (مرتل)', folder: 'Minshawy_Murattal_128kbps', country: 'مصر' },
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
  { id: 'shatree', name: 'الشيخ أبو بكر الشاطري', folder: 'Abu_Bakr_Ash-Shaatree_128kbps', country: 'اليمن' },
]

export function getAyahAudioUrl(folder: string, surah: number, ayah: number): string {
  const s = String(surah).padStart(3, '0')
  const a = String(ayah).padStart(3, '0')
  return `https://everyayah.com/data/${folder}/${s}${a}.mp3`
}
