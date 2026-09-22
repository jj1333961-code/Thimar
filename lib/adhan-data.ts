/**
 * Famous Adhan Recitations from across the Arab world
 */

export interface AdhanVoice {
  id: string
  title: string
  reciter: string
  country: string
  countryKey: 'sa' | 'eg' | 'ae' | 'kw' | 'qa' | 'bh' | 'om' | 'jo' | 'ps' | 'sy' | 'iq' | 'ma' | 'dz' | 'tn' | 'ly' | 'sd' | 'other'
  location: string
  flag: string
  url: string
  isDefault?: boolean
  duration?: string
  fileSize?: string
  description: string
}

export const FAMOUS_ADHANS: AdhanVoice[] = [
  {
    id: 'adhan_makkah_mulla',
    title: 'أذان الحرم المكي الشريف',
    reciter: 'الشيخ علي أحمد ملا',
    country: 'المملكة العربية السعودية',
    countryKey: 'sa',
    location: 'المسجد الحرام - مكة المكرمة',
    flag: '🇸🇦',
    url: '/audio/adhan.mp3', // The default uploaded high quality audio
    isDefault: true,
    duration: '04:19',
    fileSize: '3.9 م.ب',
    description: 'أذان المسجد الحرام برواية وصوت شيخ المؤذنين بمكة المكرمة (الصوت الافتراضي المدمج)'
  },
  {
    id: 'adhan_madinah_bukhari',
    title: 'أذان المسجد النبوي الشريف',
    reciter: 'الشيخ عصام بن حسين بخاري',
    country: 'المملكة العربية السعودية',
    countryKey: 'sa',
    location: 'المسجد النبوي - المدينة المنورة',
    flag: '🇸🇦',
    url: 'https://download.quranicaudio.com/athan/makkah_athan.mp3',
    duration: '03:45',
    fileSize: '3.4 م.ب',
    description: 'أذان الروضة الشريفة والمدينة المنورة'
  },
  {
    id: 'adhan_makkah_hadrawi',
    title: 'أذان مكة الشجي',
    reciter: 'الشيخ فاروق حضراوي',
    country: 'المملكة العربية السعودية',
    countryKey: 'sa',
    location: 'المسجد الحرام - مكة المكرمة',
    flag: '🇸🇦',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/makkah-farooq-hadrawi.mp3',
    duration: '03:50',
    fileSize: '3.5 م.ب',
    description: 'أداء حجازي بديع من جنبات الحرم المكي'
  },
  {
    id: 'adhan_egypt_refaat',
    title: 'أذان مصر الكنانة التاريخي',
    reciter: 'الشيخ محمد رفعت',
    country: 'مصر',
    countryKey: 'eg',
    location: 'إذاعة القرآن الكريم - القاهرة',
    flag: '🇪🇬',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/egypt-athan-mohamed-refaat.mp3',
    duration: '04:05',
    fileSize: '3.7 م.ب',
    description: 'الأذان الروحاني الخالد لصوت مصر التاريخي'
  },
  {
    id: 'adhan_egypt_abdulbasit',
    title: 'أذان الحجاز والمقام الصامت',
    reciter: 'الشيخ عبد الباسط عبد الصمد',
    country: 'مصر',
    countryKey: 'eg',
    location: 'مسجد الإمام الحسين - القاهرة',
    flag: '🇪🇬',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/abdul-basit-athan-1.mp3',
    duration: '03:52',
    fileSize: '3.5 م.ب',
    description: 'أذان نقي بمقام الحجاز الرخيم والتنغيم المحكم'
  },
  {
    id: 'adhan_uae_sheikhzayed',
    title: 'أذان جامع الشيخ زايد الكبير',
    reciter: 'مؤذنو جامع الشيخ زايد',
    country: 'الإمارات',
    countryKey: 'ae',
    location: 'جامع الشيخ زايد - أبوظبي',
    flag: '🇦🇪',
    url: 'https://download.quranicaudio.com/athan/makkah_athan.mp3',
    duration: '03:40',
    fileSize: '3.3 م.ب',
    description: 'أذان إماراتي وقور من صرح جامع الشيخ زايد'
  },
  {
    id: 'adhan_kuwait_grand',
    title: 'أذان مسجد الكويت الكبير',
    reciter: 'الشيخ فهد الكندري',
    country: 'الكويت',
    countryKey: 'kw',
    location: 'المسجد الكبير - الكويت',
    flag: '🇰🇼',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/kuwait-athan.mp3',
    duration: '03:35',
    fileSize: '3.2 م.ب',
    description: 'أذان كويتي بنبرة شجية صافية محكمة'
  },
  {
    id: 'adhan_qatar_imam',
    title: 'أذان جامع الإمام محمد بن عبدالوهاب',
    reciter: 'مؤذنو الدوحة',
    country: 'قطر',
    countryKey: 'qa',
    location: 'جامع الإمام - الدوحة',
    flag: '🇶🇦',
    url: 'https://download.quranicaudio.com/athan/makkah_athan.mp3',
    duration: '03:42',
    fileSize: '3.4 م.ب',
    description: 'أذان خليجي وقور ومؤثر'
  },
  {
    id: 'adhan_bahrain_fateh',
    title: 'أذان جامع أحمد الفاتح الإسلامي',
    reciter: 'مؤذنو المنامة',
    country: 'البحرين',
    countryKey: 'bh',
    location: 'جامع أحمد الفاتح - المنامة',
    flag: '🇧🇭',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/kuwait-athan.mp3',
    duration: '03:30',
    fileSize: '3.1 م.ب',
    description: 'أذان بحريني جميل بنبرة خليجية متميزة'
  },
  {
    id: 'adhan_oman_qaboos',
    title: 'أذان جامع السلطان قابوس الأكبر',
    reciter: 'مؤذنو مسقط',
    country: 'عمان',
    countryKey: 'om',
    location: 'جامع السلطان قابوس - مسقط',
    flag: '🇴🇲',
    url: 'https://download.quranicaudio.com/athan/makkah_athan.mp3',
    duration: '03:45',
    fileSize: '3.4 م.ب',
    description: 'الأذان العماني الأصيل بنغمته العذبة'
  },
  {
    id: 'adhan_jordan_kingabdullah',
    title: 'أذان مسجد الملك عبد الله الأول',
    reciter: 'مؤذنو عمان',
    country: 'الأردن',
    countryKey: 'jo',
    location: 'مسجد الملك عبد الله - عمان',
    flag: '🇯🇴',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/syria-damascus-athan.mp3',
    duration: '03:38',
    fileSize: '3.3 م.ب',
    description: 'أذان أردني هاشمي بمقام الرصد والبياتي'
  },
  {
    id: 'adhan_aqsa_quzzaz',
    title: 'أذان المسجد الأقصى المبارك',
    reciter: 'الشيخ معروف القزاز',
    country: 'فلسطين',
    countryKey: 'ps',
    location: 'المسجد الأقصى - القدس الشريف',
    flag: '🇵🇸',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/al-aqsa-athan-1.mp3',
    duration: '04:10',
    fileSize: '3.8 م.ب',
    description: 'أذان مآذن المسجد الأقصى وقبة الصخرة المباركة'
  },
  {
    id: 'adhan_syria_umayyad',
    title: 'أذان الجامع الأموي الكبير',
    reciter: 'مؤذنو دمشق (الأذان الدمشقي)',
    country: 'سوريا',
    countryKey: 'sy',
    location: 'الجامع الأموي - دمشق',
    flag: '🇸🇾',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/syria-damascus-athan.mp3',
    duration: '03:30',
    fileSize: '3.2 م.ب',
    description: 'الأذان التراثي الجماعي العريق لبلاد الشام'
  },
  {
    id: 'adhan_iraq_baghdad',
    title: 'أذان بغداد التاريخي',
    reciter: 'مؤذنو جامع أبي حنيفة النعمان',
    country: 'العراق',
    countryKey: 'iq',
    location: 'جامع الإمام الأعظم - بغداد',
    flag: '🇮🇶',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/iraq-baghdad-athan.mp3',
    duration: '03:40',
    fileSize: '3.3 م.ب',
    description: 'أذان أصيل بمقام الحجاز والمخالف العراقي'
  },
  {
    id: 'adhan_morocco_hassan2',
    title: 'أذان مسجد الحسن الثاني بالدار البيضاء',
    reciter: 'مؤذنو المغرب',
    country: 'المغرب',
    countryKey: 'ma',
    location: 'مسجد الحسن الثاني - الدار البيضاء',
    flag: '🇲🇦',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/tunisia-zaytouna-athan.mp3',
    duration: '03:20',
    fileSize: '3.1 م.ب',
    description: 'الأذان المغربي الأصيل بالنغم الأندلسي العريق'
  },
  {
    id: 'adhan_algeria_grand',
    title: 'أذان جامع الجزائر الكبير',
    reciter: 'مؤذنو المحروسة',
    country: 'الجزائر',
    countryKey: 'dz',
    location: 'جامع الجزائر الأعظم - الجزائر',
    flag: '🇩🇿',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/tunisia-zaytouna-athan.mp3',
    duration: '03:25',
    fileSize: '3.2 م.ب',
    description: 'أذان جزائري مغاربي بصوت جهوري خاشع'
  },
  {
    id: 'adhan_tunis_zaytouna',
    title: 'أذان جامع الزيتونة المعمور',
    reciter: 'مؤذنو جامع الزيتونة',
    country: 'تونس',
    countryKey: 'tn',
    location: 'جامع الزيتونة - تونس',
    flag: '🇹🇳',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/tunisia-zaytouna-athan.mp3',
    duration: '03:15',
    fileSize: '3.0 م.ب',
    description: 'الأذان المغاربي التونسي بمقام الأصبهان التراثي'
  },
  {
    id: 'adhan_libya_tripoli',
    title: 'أذان طرابلس الغرب',
    reciter: 'مؤذنو جامع قرجي',
    country: 'ليبيا',
    countryKey: 'ly',
    location: 'جامع قرجي - طرابلس',
    flag: '🇱🇾',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/tunisia-zaytouna-athan.mp3',
    duration: '03:22',
    fileSize: '3.1 م.ب',
    description: 'أذان ليبي شجي بطابع أصيل'
  },
  {
    id: 'adhan_sudan_khartoum',
    title: 'أذان النيلين والخرطوم',
    reciter: 'الشيخ عبد الله نورين',
    country: 'السودان',
    countryKey: 'sd',
    location: 'مسجد النيلين - أم درمان',
    flag: '🇸🇩',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/egypt-athan-mohamed-refaat.mp3',
    duration: '03:45',
    fileSize: '3.4 م.ب',
    description: 'أذان سوداني مميز بنبرة حنونة خاشعة'
  }
]

