export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'مكية' | 'مدنية';
  juz: number;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  audio: string;
  tafsir: string;
}

export const SURAHS_LIST: Surah[] = [
  { number: 1, name: 'الفَاتِحَة', englishName: 'Al-Fatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'مكية', juz: 1 },
  { number: 2, name: 'البَقَرَة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'مدنية', juz: 1 },
  { number: 3, name: 'آل عِمْرَان', englishName: 'Aal-Imran', englishNameTranslation: 'The Family of Imran', numberOfAyahs: 200, revelationType: 'مدنية', juz: 3 },
  { number: 18, name: 'الكَهْف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'مكية', juz: 15 },
  { number: 36, name: 'يس', englishName: 'Yaseen', englishNameTranslation: 'Ya-Sin', numberOfAyahs: 83, revelationType: 'مكية', juz: 22 },
  { number: 55, name: 'الرَّحْمَٰن', englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'مدنية', juz: 27 },
  { number: 56, name: 'الوَاقِعَة', englishName: 'Al-Waqi\'ah', englishNameTranslation: 'The Inevitable', numberOfAyahs: 96, revelationType: 'مكية', juz: 27 },
  { number: 67, name: 'المُلْك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'مكية', juz: 29 },
  { number: 78, name: 'النَّبَأ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', numberOfAyahs: 40, revelationType: 'مكية', juz: 30 },
  { number: 93, name: 'الضُّحَىٰ', englishName: 'Ad-Duhaa', englishNameTranslation: 'The Morning Hours', numberOfAyahs: 11, revelationType: 'مكية', juz: 30 },
  { number: 94, name: 'الشَّرْح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', numberOfAyahs: 8, revelationType: 'مكية', juz: 30 },
  { number: 97, name: 'القَدْر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', numberOfAyahs: 5, revelationType: 'مكية', juz: 30 },
  { number: 108, name: 'الكَوْثَر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', numberOfAyahs: 3, revelationType: 'مكية', juz: 30 },
  { number: 112, name: 'الإِخْلَاص', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'مكية', juz: 30 },
  { number: 113, name: 'الفَلَق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'مكية', juz: 30 },
  { number: 114, name: 'النَّاس', englishName: 'An-Naas', englishNameTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'مكية', juz: 30 }
];

export const SAMPLE_AYAHS: Record<number, Ayah[]> = {
  1: [
    {
      number: 1,
      numberInSurah: 1,
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
      tafsir: 'أبدأ قراءتي مستعينا باسم الله تعالى، وهو اسم من أسمائه الحسنى، المستحق للعبادة وحده دون سواه.'
    },
    {
      number: 2,
      numberInSurah: 2,
      text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
      tafsir: 'الثناء الكامل المطلق لله وحده، خالق الخلائق ومالكهم ومدبر أمورهم في السموات والأرض.'
    },
    {
      number: 3,
      numberInSurah: 3,
      text: 'الرَّحْمَٰنِ الرَّحِيمِ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
      tafsir: 'الذي وسعت رحمته كل شيء في الدنيا، وهو الرحيم بعباده المؤمنين في الآخرة.'
    },
    {
      number: 4,
      numberInSurah: 4,
      text: 'مَالِكِ يَوْمِ الدِّينِ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
      tafsir: 'المالك المتصرف وحده بيوم الجزاء والحساب يوم القيامة، حيث لا ملك لأحد غيره.'
    },
    {
      number: 5,
      numberInSurah: 5,
      text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
      tafsir: 'نخصك وحدك بالعبادة والخضوع، ونستعين بك وحدك في سائر أمورنا الدينية والدنيوية.'
    },
    {
      number: 6,
      numberInSurah: 6,
      text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
      tafsir: 'دلنا وأرشدنا وثبتنا على الطريق الواضح المستقيم، وهو دين الإسلام الذي جاء به نبينا محمد ﷺ.'
    },
    {
      number: 7,
      numberInSurah: 7,
      text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
      tafsir: 'طريق النبيين والصديقين والشهداء والصالحين، غير طريق المغضوب عليهم وهم من عرفوا الحق وتركوه، ولا الضالين الذين ضلوا عن الحق بجهلهم.'
    }
  ],
  67: [
    {
      number: 5242,
      numberInSurah: 1,
      text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5242.mp3',
      tafsir: 'تعاظم وكثر خير الله الذي بيده وحده ملك السموات والأرض وسلطانهما، وهو القادر على كل شيء.'
    },
    {
      number: 5243,
      numberInSurah: 2,
      text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5243.mp3',
      tafsir: 'خلق الحياة والموت ليختبركم: أيكم أخلص لله وأتبع لرسوله عملاً، وهو العزيز في انتقامه، الغفور لمن تاب.'
    },
    {
      number: 5244,
      numberInSurah: 3,
      text: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5244.mp3',
      tafsir: 'خلق سبع سموات بعضها فوق بعض في إتقان تام، لا ترى فيها خللاً ولا نقصاً، فأعد النظر هل ترى شقوقاً أو عيباً؟'
    }
  ],
  112: [
    {
      number: 6222,
      numberInSurah: 1,
      text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3',
      tafsir: 'قل أيها الرسول لمن سألوك عن ربك: هو الله المتفرد بالألوهية والربوبية والأسماء والصفات، لا شريك له.'
    },
    {
      number: 6223,
      numberInSurah: 2,
      text: 'اللَّهُ الصَّمَدُ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6223.mp3',
      tafsir: 'السيد المقصود وحده في الحوائج والرغائب، المستغني عن كل خلقه، وكل خلقه مفتقرون إليه.'
    },
    {
      number: 6224,
      numberInSurah: 3,
      text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6224.mp3',
      tafsir: 'تنزه وتقدس سبحانه عن الولد والوالد، فهو الأول الذي ليس قبله شيء والآخر الذي ليس بعده شيء.'
    },
    {
      number: 6225,
      numberInSurah: 4,
      text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6225.mp3',
      tafsir: 'وليس له مماثل ولا نظير ولا شبيه في ذاته ولا في صفاته ولا في أفعاله.'
    }
  ]
};
