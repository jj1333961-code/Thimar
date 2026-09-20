/**
 * Famous Adhan Recitations from across the Arab world
 */

export interface AdhanVoice {
  id: string
  title: string
  reciter: string
  country: string
  location: string
  flag: string
  url: string
  isDefault?: boolean
  duration?: string
  description: string
}

export const FAMOUS_ADHANS: AdhanVoice[] = [
  {
    id: 'adhan_makkah_mulla',
    title: 'أذان الحرم المكي الشريف',
    reciter: 'الشيخ علي أحمد ملا',
    country: 'المملكة العربية السعودية',
    location: 'المسجد الحرام - مكة المكرمة',
    flag: '🇸🇦',
    url: '/audio/adhan.mp3', // The default uploaded high quality audio
    isDefault: true,
    duration: '04:19',
    description: 'أذان المسجد الحرام برواية وصوت شيخ المؤذنين بمكة المكرمة'
  },
  {
    id: 'adhan_madinah_bukhari',
    title: 'أذان المسجد النبوي الشريف',
    reciter: 'الشيخ عصام بن حسين بخاري',
    country: 'المملكة العربية السعودية',
    location: 'المسجد النبوي - المدينة المنورة',
    flag: '🇸🇦',
    url: 'https://download.quranicaudio.com/athan/makkah_athan.mp3',
    duration: '03:45',
    description: 'أذان الروضة الشريفة والمدينة المنورة'
  },
  {
    id: 'adhan_aqsa_quzzaz',
    title: 'أذان المسجد الأقصى المبارك',
    reciter: 'الشيخ معروف القزاز',
    country: 'فلسطين',
    location: 'المسجد الأقصى - القدس الشريف',
    flag: '🇵🇸',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/al-aqsa-athan-1.mp3',
    duration: '04:10',
    description: 'أذان مآذن المسجد الأقصى وقبة الصخرة المباركة'
  },
  {
    id: 'adhan_egypt_refaat',
    title: 'أذان مصر الكنانة التاريخي',
    reciter: 'الشيخ محمد رفعت',
    country: 'مصر',
    location: 'إذاعة القرآن الكريم - القاهرة',
    flag: '🇪🇬',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/egypt-athan-mohamed-refaat.mp3',
    duration: '04:05',
    description: 'الأذان الروحاني الخالد لصوت مصر التاريخي'
  },
  {
    id: 'adhan_egypt_abdulbasit',
    title: 'أذان الحجاز والمقام الصامت',
    reciter: 'الشيخ عبد الباسط عبد الصمد',
    country: 'مصر',
    location: 'مسجد الإمام الحسين - القاهرة',
    flag: '🇪🇬',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/abdul-basit-athan-1.mp3',
    duration: '03:52',
    description: 'أذان نقي بمقام الحجاز الرخيم والتنغيم المحكم'
  },
  {
    id: 'adhan_syria_umayyad',
    title: 'أذان الجامع الأموي الكبير',
    reciter: 'مؤذنو دمشق (الأذان الدمشقي)',
    country: 'سوريا',
    location: 'الجامع الأموي - دمشق',
    flag: '🇸🇾',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/syria-damascus-athan.mp3',
    duration: '03:30',
    description: 'الأذان التراثي الجماعي العريق لبلاد الشام'
  },
  {
    id: 'adhan_makkah_hadrawi',
    title: 'أذان مكة الشجي',
    reciter: 'الشيخ فاروق حضراوي',
    country: 'المملكة العربية السعودية',
    location: 'المسجد الحرام - مكة المكرمة',
    flag: '🇸🇦',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/makkah-farooq-hadrawi.mp3',
    duration: '03:50',
    description: 'أداء حجازي بديع من جنبات الحرم المكي'
  },
  {
    id: 'adhan_tunis_zaytouna',
    title: 'أذان جامع الزيتونة المعمور',
    reciter: 'مؤذنو جامع الزيتونة',
    country: 'تونس / المغرب العربي',
    location: 'جامع الزيتونة - تونس',
    flag: '🇹🇳',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/tunisia-zaytouna-athan.mp3',
    duration: '03:15',
    description: 'الأذان المغاربي التونسي بمقام الأصبهان التراثي'
  },
  {
    id: 'adhan_iraq_baghdad',
    title: 'أذان بغداد التاريخي',
    reciter: 'مؤذنو جامع أبي حنيفة النعمان',
    country: 'العراق',
    location: 'جامع الإمام الأعظم - بغداد',
    flag: '🇮🇶',
    url: 'https://media.blubrry.com/muslim_central_audio/podcasts.qurancentral.com/athan/iraq-baghdad-athan.mp3',
    duration: '03:40',
    description: 'أذان أصيل بمقام الحجاز والمخالف العراقي'
  }
]
