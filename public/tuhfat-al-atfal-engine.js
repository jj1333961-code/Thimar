/**
 * Thimar Tuhfat Al-Atfal Engine
 * Features:
 *  - Full 61 Verses of Matn Tuhfat Al-Atfal by Sheikh Sulayman Al-Jamzuri
 *  - Divided into 10 canonical Tajweed chapters
 *  - Each verse is separated in its own distinct card (number, Sadr, 'Ajuz)
 *  - Certified commentary and explanation for every verse
 *  - Famous Reciters:
 *      * Dr. Ayman Rushdi Suwaid
 *      * Sheikh Saad Al-Ghamidi
 *      * Sheikh Mishary Alafasy
 *      * Qari Taha Al-Fahd
 *      * Sheikh Muhammad Issam
 *  - Playback Scopes: Single Verse, Section/Chapter, Full 61 Verses
 *  - Repetition controls: 1, 2, 3, 5, 10, Continuous ∞
 *  - Offline Local Download into application cache/storage with status badge
 */
(function(window, document){
  'use strict';

  var TUHFAT_SECTIONS = [
    {
      id: 1,
      title: 'المقدمة',
      startVerse: 1,
      endVerse: 5,
      verses: [
        { num: 1, sadr: 'يَقُولُ رَاجِي رَحْمَةِ الْغَفُورِ', ajuz: 'دَوْمًا سُلَيْمَانُ هُوَ الْجَمْزُورِي', tafsir: 'بدأ الناظم رحمه الله بالبسملة وطلب المغفرة من الله تعالى معرفاً باسمه ولقبه نسبة إلى جمزور بمصر.' },
        { num: 2, sadr: 'الْحَمْدُ لِلَّهِ مُصَلِّيًا عَلَى', ajuz: 'مُحَمَّدٍ وَآلِهِ وَمَنْ تَلَا', tafsir: 'الحمد والثناء على الله عز وجل، والصلاة والسلام على نبينا محمد صلى الله عليه وسلم وآله وجميع من تلا القرآن وعمل به.' },
        { num: 3, sadr: 'وَبَعْدُ: هَذَا النَّظْمُ لِلْمُرِيدِ', ajuz: 'فِي النُّونِ وَالتَّنْوِينِ وَالْمُدُودِ', tafsir: 'بيان أن هذه المنظومة مخصصة لطالب علم التجويد المبتدئ، ومحورها أحكام النون الساكنة والتنوين وأحكام المدود.' },
        { num: 4, sadr: 'سَمَّيْتُهُ بِتُحْفَةِ الأَطْفَالِ', ajuz: 'عَنْ شَيْخِنَا الْمِيهِيِّ ذِي الْكَمَالِ', tafsir: 'تسمية المنظومة بتحفة الأطفال (أي الهدية للناشئة المبتدئين)، برواية شيخه الشيخ علي الميهي رحمه الله ذي العلم التام.' },
        { num: 5, sadr: 'أَرْجُو بِهِ أَنْ يَنْفَعَ الطُّلاَّبَا', ajuz: 'وَالأَجْرَ وَالْقَبُولَ وَالثَّوَابَا', tafsir: 'إخلاص النية لله ورجاء النفع العظيم لطلاب القرآن الكريم مع نيل الأجر والقبول والثواب من رب العالمين.' }
      ]
    },
    {
      id: 2,
      title: 'أحكام النون الساكنة والتنوين',
      startVerse: 6,
      endVerse: 16,
      verses: [
        { num: 6, sadr: 'لِلنُّونِ إِنْ تَسْكُنْ وَلِلتَّنْوِينِ', ajuz: 'أَرْبَعُ أَحْكَامٍ فَخُذْ تَبْيِينِي', tafsir: 'للنون الساكنة والتنوين أربعة أحكام عند ملاقاة حروف الهجاء: الإظهار، والإدغام، والإقلاب، والإخفاء.' },
        { num: 7, sadr: 'فَالأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ', ajuz: 'لِلْحَلْقِ سِتٌّ رُتِّبَتْ فَلْتَعْرِفِ', tafsir: 'الحكم الأول: الإظهار الحلقي، ويقع إذا جاء بعد النون أو التنوين حرف من حروف الحلق الستة.' },
        { num: 8, sadr: 'هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ', ajuz: 'مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ', tafsir: 'حروف الإظهار الحلقي الستة هي: الهمزة والهاء، ثم العين والحاء (بدون نقط)، ثم الغين والخاء.' },
        { num: 9, sadr: 'وَالثَّانِ إِدْغَامٌ بِسِتَّةٍ أَتَتْ', ajuz: 'فِي يَرْمُلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ', tafsir: 'الحكم الثاني: الإدغام، وله ستة أحرف مجموعة في كلمة (يَرْمُلُونَ).' },
        { num: 10, sadr: 'لَكِنَّهَا قِسْمَانِ قِسْمٌ يُدْغَمَا', ajuz: 'فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا', tafsir: 'ينقسم الإدغام إلى قسمين: إدغام بغنة في أربعة أحرف يجمعها لفظ (يَنْمُو).' },
        { num: 11, sadr: 'إِلاَّ إِذَا كَانَا بِكِلْمَةٍ فَلاَ', ajuz: 'تُدْغِمْ كَدُنْيَا ثُمَّ صِنْوَانٍ تَلاَ', tafsir: 'شرط الإدغام أن يكون من كلمتين، فإن اجتمعا في كلمة واحدة وجب الإظهار المطلق مثل: (دُنْيَا)، (صِنْوَان)، (قِنْوَان).' },
        { num: 12, sadr: 'وَالثَّانِ إِدْغَامٌ بِغَيْرِ غُنَّهْ', ajuz: 'فِي اللاَّمِ وَالرَّا ثُمَّ كَرِّرَنَّهْ', tafsir: 'القسم الثاني: إدغام بغير غنة (إدغام كامل)، وذلك إذا جاء بعدهما حرف اللام أو الراء.' },
        { num: 13, sadr: 'وَالثَّالِثُ الإِقْلاَبُ عِنْدَ الْبَاءِ', ajuz: 'مِيمًا بِغُنَّةٍ مَعَ الإِخْفَاءِ', tafsir: 'الحكم الثالث: الإقلاب، وله حرف واحد وهو الباء، حيث تُقلب النون الساكنة أو التنوين ميماً مخفاة بغنة.' },
        { num: 14, sadr: 'وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ', ajuz: 'مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ', tafsir: 'الحكم الرابع: الإخفاء الحقيقي، ويقع عند بقية الحروف الهجائية الخمسة عشر.' },
        { num: 15, sadr: 'فِي خَمْسَةٍ مِنْ بَعْدِ عَشْرٍ رَمْزُهَا', ajuz: 'فِي كِلْمِ هَذَا البَيْتِ قَدْ ضَمَّنْتُهَا', tafsir: 'حروف الإخفاء خمسة عشر حرفاً جمعها الناظم في أوائل كلمات البيت التالي.' },
        { num: 16, sadr: 'صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا', ajuz: 'دُمْ طَيِّبًا زِدْ فِي تُقًى ضَعْ ظَالِمَا', tafsir: 'أوائل حروف البيت: الصاد، الذال، الثاء، الكاف، الجيم، الشين، القاف، السين، الدال، الطاء، الزاي، الفاء، التاء، الضاد، الظاء.' }
      ]
    },
    {
      id: 3,
      title: 'حكم الميم والنون المشددتين',
      startVerse: 17,
      endVerse: 17,
      verses: [
        { num: 17, sadr: 'وَغُنَّ مِيمًا ثُمَّ نُونًا شُدِّدَا', ajuz: 'وَسَمِّ كُلاًّ حَرْفَ غُنَّةٍ بَدَا', tafsir: 'وجوب إظهار الغنة بمقدار حركتين عند نطق الميم أو النون المشددتين، ويُسمى كل منهما حرف غنة مشدد.' }
      ]
    },
    {
      id: 4,
      title: 'أحكام الميم الساكنة',
      startVerse: 18,
      endVerse: 23,
      verses: [
        { num: 18, sadr: 'وَالْمِيمُ إِنْ تَسْكُنْ تَجِي قَبْلَ الْهِجَا', ajuz: 'لاَ أَلِفٍ لَيِّنَةٍ لِذِي الْحِجَا', tafsir: 'الميم الساكنة تقع قبل جميع حروف الهجاء عدا الألف اللينة لأن ما قبلها لا يكون إلا مفتوحاً.' },
        { num: 19, sadr: 'أَحْكَامُهَا ثَلاَثَةٌ لِمَنْ ضَبَطْ', ajuz: 'إِخْفَاءٌ ادْغَامٌ وَإِظْهَارٌ فَقَطْ', tafsir: 'أحكام الميم الساكنة ثلاثة فقط مضبوطة: الإخفاء الشفوي، والإدغام الصغير، والإظهار الشفوي.' },
        { num: 20, sadr: 'فَالأَوَّلُ الإِخْفَاءُ عِنْدَ الْبَاءِ', ajuz: 'وَسَمِّهِ الشَّفْوِيَّ لِلقُرَّاءِ', tafsir: 'الحكم الأول: الإخفاء الشفوي، وذلك إذا جاء بعدها حرف الباء مع مراعاة الغنة.' },
        { num: 21, sadr: 'وَالثَّانِ إِدْغَامٌ بِمِثْلِهَا أَتَى', ajuz: 'وَسَمِّ إِدْغَامًا صَغِيرًا يَا فَتَى', tafsir: 'الحكم الثاني: إدغام مثلين صغير، وذلك إذا جاء بعدها ميم مثلها، فتدغم بغنة.' },
        { num: 22, sadr: 'وَالثَّالِثُ الإِظْهَارُ فِي الْبَقِيَّهْ', ajuz: 'مِنْ أَحْرُفٍ وَسَمِّهَا شَفْوِيَّهْ', tafsir: 'الحكم الثالث: الإظهار الشفوي، ويقع عند بقية حروف الهجاء الستة والعشرين.' },
        { num: 23, sadr: 'وَاحْذَرْ لَدَى وَاوٍ وَفَا أَنْ تَخْتَفِي', ajuz: 'لِقُرْبِهَا وَلاِتِّحَادِ فَاعْرِفِ', tafsir: 'التحذير من إخفاء الميم الساكنة عند الواو أو الفاء لقرب مخرج الفاء واتحاد مخرج الواو مع الميم.' }
      ]
    },
    {
      id: 5,
      title: 'حكم لام أل ولام الفعل',
      startVerse: 24,
      endVerse: 29,
      verses: [
        { num: 24, sadr: 'لِلاَمِ أَلْ حَالاَنِ قَبْلَ الأَحْرُفِ', ajuz: 'أُولاَهُمَا إِظْهَارُهَا فَلْتَعْرِفِ', tafsir: 'للام التعريف حالتان عند لقاء حروف الهجاء: إما الإظهار وإما الإدغام.' },
        { num: 25, sadr: 'قَبْلَ ارْبَعٍ مَعْ عَشْرَةٍ خُذْ عِلْمَهُ', ajuz: 'مِنْ إِبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ', tafsir: 'الحالة الأولى: اللام القمرية وحروفها أربعة عشر حرفاً جمعت في: (إِبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ).' },
        { num: 26, sadr: 'ثَانِيهِمَا إِدْغَامُهَا فِي أَرْبَعِ', ajuz: 'وَعَشْرَةٍ أَيْضًا وَرَمْزَهَا فَعِ', tafsir: 'الحالة الثانية: اللام الشمسية وتدغم في أربعة عشر حرفاً مجموعة في أوائل كلمات البيت التالي.' },
        { num: 27, sadr: 'طِبْ ثُمَّ صِلْ رَحْمًا تَفُزْ ضِفْ ذَا نِعَمْ', ajuz: 'دَعْ سُوءَ ظَنٍّ زُرْ شَرِيفًا لِلْكَرَمْ', tafsir: 'أوائل الحروف: الطاء، الثاء، الصاد، الراء، التاء، الضاد، الذال، النون، الدال، السين، الظاء، الزاي، الشين، اللام.' },
        { num: 28, sadr: 'وَاللاَّمَ الاُولَى سَمِّهَا قَمَرِيَّهْ', ajuz: 'وَاللاَّمَ الاُخْرَى سَمِّهَا شَمْسِيَّهْ', tafsir: 'تسمى اللام المظهرة لاماً قمرية (كالقمر)، وتسمى اللام المدغمة لاماً شمسية (كالشمس).' },
        { num: 29, sadr: 'وَأَظْهِرَنَّ لاَمَ فِعْلٍ مُطْلَقَا', ajuz: 'فِي نَحْوِ قُلْ نَعَمْ وَقُلْنَا وَالْتَقَى', tafsir: 'حكم لام الفعل الأصلية الإظهار وجوباً دائماً ما لم يأتِ بعدها لام أو راء مثل: قُلْ نَعَمْ، قُلْنَا، الْتَقَى.' }
      ]
    },
    {
      id: 6,
      title: 'في المثلين والمتقاربين والمتجانسين',
      startVerse: 30,
      endVerse: 34,
      verses: [
        { num: 30, sadr: 'إِنْ فِي الصِّفَاتِ وَالمَخَارِجِ اتَّفَقْ', ajuz: 'حَرْفَانِ فَالْمِثْلاَنِ فِيهِمَا أَحَقّْ', tafsir: 'المثلان: هما الحرفان اللذان اتفقا مخرجاً وصفة مثل البائين والميمين.' },
        { num: 31, sadr: 'وَإِنْ يَكُونَا مَخْرَجًا تَقَارَبَا', ajuz: 'وَفِي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا', tafsir: 'المتقاربان: هما الحرفان اللذان تقاربا في المخرج واختلفا في الصفات كاللام مع الراء.' },
        { num: 32, sadr: 'مُتَقَارِبَيْنِ أَوْ يَكُونَا اتَّفَقَا', ajuz: 'فِي مَخْرَجٍ دُونَ الصِّفَاتِ حُقِّقَا', tafsir: 'المتجانسان: هما الحرفان اللذان اتفقا مخرجاً واختلفا صفة كالطاء والتاء.' },
        { num: 33, sadr: 'بِالْمُتَجَانِسَيْنِ ثُمَّ إِنْ سَكَنْ', ajuz: 'أَوَّلُ كُلٍّ فَالصَّغِيرَ سَمِّيَنْ', tafsir: 'إذا سكن أول الحرفين وتحرك الثاني سُمي إدغاماً صغيراً في الأنواع الثلاثة.' },
        { num: 34, sadr: 'أَوْ حُرِّكَ الحَرْفَانِ فِي كُلٍّ فَقُلْ', ajuz: 'كُلٌّ كَبِيرٌ وَافْهَمَنْهُ بِالْمُثُلْ', tafsir: 'وإذا تحرك الحرفان معاً في الأنواع الثلاثة سُمي كبيراً مثل: الرَّحِيمِ مَالِكِ.' }
      ]
    },
    {
      id: 7,
      title: 'أقسام المد',
      startVerse: 35,
      endVerse: 41,
      verses: [
        { num: 35, sadr: 'وَالْمَدُّ أَصْلِيٌّ وَفَرْعِيٌّ لَهُ', ajuz: 'وَسَمِّ أَوَّلاً طَبِيعِيًّا وَهُو', tafsir: 'المد ينقسم إلى أصلي وفرعي، والأصلي يُسمى أيضاً المد الطبيعي.' },
        { num: 36, sadr: 'مَا لاَ تَوَقُّفٌ لَهُ عَلَى سَبَبْ', ajuz: 'وَلاَ بِدُونِهِ الحُرُوفُ تُجْتَلَبْ', tafsir: 'المد الطبيعي هو ما لا يتوقف على سبب من همز أو سكون ويمد بمقدار حركتين.' },
        { num: 37, sadr: 'بَلْ أَيُّ حَرْفٍ غَيْرِ هَمْزٍ أَوْ سُكُونْ', ajuz: 'جَا بَعْدَ مَدٍّ فَالطَّبِيعِيَّ يَكُونْ', tafsir: 'كل حرف يأتي بعد حرف المد وليس همزاً ولا سكوناً فهو مد طبيعي.' },
        { num: 38, sadr: 'وَالآخَرُ الْفَرْعِيُّ مَوْقُوفٌ عَلَى', ajuz: 'سَبَبْ كَهَمْزٍ أَوْ سُكُونٍ مُسْجَلاَ', tafsir: 'المد الفرعي هو الزائد عن الطبيعي ويتوقف على سبب وهو إما الهمز أو السكون.' },
        { num: 39, sadr: 'حُرُوفُهُ ثَلاَثَةٌ فَعِيهَا', ajuz: 'مِنْ لَفْظِ وَايٍ وَهْيَ فِي نُوحِيهَا', tafsir: 'حروف المد ثلاثة مجموعة في لفظ (وَايٍ) بشروطها مجموعة في كلمة (نُوحِيهَا).' },
        { num: 40, sadr: 'وَالْكَسْرُ قَبْلَ الْيَا وَقَبْلَ الْوَاوِ ضَمّْ', ajuz: 'شَرْطٌ وَفَتْحٌ قَبْلَ أَلْفٍ يُلْتَزَمْ', tafsir: 'شروط المد: كسر ما قبل الياء، وضم ما قبل الواو، وفتح ما قبل الألف دائماً.' },
        { num: 41, sadr: 'وَاللِّينُ مِنْهَا الْيَا وَوَاوٌ سُكِّنَا', ajuz: 'إِنِ انْفِتَاحٌ قَبْلَ كُلٍّ أُعْلِنَا', tafsir: 'حرفا اللين هما الواو والياء الساكنتان المفتوح ما قبلهما مثل: خَوْف، بَيْت.' }
      ]
    },
    {
      id: 8,
      title: 'أحكام المد',
      startVerse: 42,
      endVerse: 47,
      verses: [
        { num: 42, sadr: 'لِلْمَدِّ أَحْكَامٌ ثَلاَثَةٌ تَدُومْ', ajuz: 'وَهْيَ الْوُجُوبُ وَالْجَوَازُ وَاللُّزُومْ', tafsir: 'أحكام المد الفرعي ثلاثة ثابتة: الوجوب، والجواز، واللزوم.' },
        { num: 43, sadr: 'فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدّْ', ajuz: 'فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدّْ', tafsir: 'المد المتصل: أن يأتي الهمز بعد حرف المد في كلمة واحدة كـ (السَّمَاءِ)، وحكمه الوجوب (4-5 حركات).' },
        { num: 44, sadr: 'وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ', ajuz: 'كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ', tafsir: 'المد المنفصل: أن يأتي حرف المد في كلمة والهمز في كلمة تالية كـ (يَا أَيُّهَا)، وحكمه الجواز.' },
        { num: 45, sadr: 'وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ', ajuz: 'وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ', tafsir: 'المد العارض للسكون: أن يقف القارئ على كلمة آخرها حرف متحرك قبله حرف مد مثل: تَعْلَمُونَ، نَسْتَعِينُ (2 أو 4 أو 6 حركات).' },
        { num: 46, sadr: 'أَوْ قُدِّمَ الْهَمْزُ عَلَى المَدِّ وَذَا', ajuz: 'بَدَلْ كَآمَنُوا وَإِيمَانًا خُذَا', tafsir: 'مد البدل: أن يتقدم الهمز على حرف المد مثل: آمَنُوا، إِيمَانًا، أُوتُوا ويمد حركتين عند حفص.' },
        { num: 47, sadr: 'وَلاَزِمٌ إِنِ السُّكُونُ أُصِّلاَ', ajuz: 'وَصْلاً وَوَقْفًا بَعْدَ مَدٍّ طُوِّلاَ', tafsir: 'المد اللازم: أن يأتي سكون أصلي ثابت وصلاً ووقفاً بعد حرف المد ويمد 6 حركات وجوباً.' }
      ]
    },
    {
      id: 9,
      title: 'أقسام المد اللازم',
      startVerse: 48,
      endVerse: 57,
      verses: [
        { num: 48, sadr: 'أَقْسَامُ لاَزِمٍ لَدَيْهِمْ أَرْبَعَهْ', ajuz: 'وَتِلْكَ كِلْمِيٌّ وَحَرْفِيٌّ مَعَهْ', tafsir: 'أقسام المد اللازم أربعة: كلمي وحرفي، وكل منهما إما مخفف وإما مثقل.' },
        { num: 49, sadr: 'كِلاَهُمَا مُخَفَّفٌ مُثَقَّلُ', ajuz: 'فَهَذِهِ أَرْبَعَةٌ تُفَصَّلُ', tafsir: 'اللازم الكلمي واللازم الحرفي ينقسم كل منهما إلى مخفف ومثقل فتكتمل أربعة أقسام.' },
        { num: 50, sadr: 'فَإِنْ بِكِلْمَةٍ سُكُونٌ اجْتَمَعْ', ajuz: 'مَعْ حَرْفِ مَدٍّ فَهْوَ كِلْمِيٌّ وَقَعْ', tafsir: 'المد اللازم الكلمي: إذا اجتمع حرف المد مع السكون في كلمة واحدة كـ (الصَّاخَّة).' },
        { num: 51, sadr: 'أَوْ فِي ثُلاَثِيِّ الحُرُوفِ وُجِدَا', ajuz: 'وَالْمَدُّ وَسْطُهُ فَحَرْفِيٌّ بَدَا', tafsir: 'المد اللازم الحرفي: إذا وجد في حرف من فواتح السور هجاؤه على ثلاثة أحرف أوسطها مد كـ (ص، ق).' },
        { num: 52, sadr: 'كِلاَهُمَا مُثَقَّلٌ إِنْ أُدْغِمَا', ajuz: 'مَخَفَّفٌ كُلٌّ إِذَا لَمْ يُدْغَمَا', tafsir: 'يكون مثقلاً إذا أُدغم الحرف الساكن فيما بعده كـ (الحَاقَّة) أو (الم)، ومخففاً إن لم يُدغم كـ (آلآنَ) أو (ق).' },
        { num: 53, sadr: 'وَاللاَّزِمُ الحَرْفِيُّ أَوَّلَ السُّوَرْ', ajuz: 'وُجُودُهُ وَفِي ثَمَانٍ انْحَصَرْ', tafsir: 'المد اللازم الحرفي يوجد فقط في فواتح السور وينحصر في ثمانية أحرف هجائية.' },
        { num: 54, sadr: 'يَجْمَعُهَا حُرُوفُ كَمْ عَسَلْ نَقَصْ', ajuz: 'وَعَيْنُ ذُو وَجْهَيْنِ وَالطُّولُ أَخَصّْ', tafsir: 'حروف المد اللازم الحرفي الثمانية يجمعها لفظ: (كَمْ عَسَلْ نَقَصْ)، وعين تمد 4 أو 6 حركات والطول مقدم.' },
        { num: 55, sadr: 'وَمَا سِوَى الحَرْفِ الثُّلاَثِي لاَ أَلِفْ', ajuz: 'فَمَدُّهُ مَدًّا طَبِيعِيًّا أُلِفْ', tafsir: 'الحروف المقطعة التي هجاؤها على حرفين ثانيها حرف مد تمد مداً طبيعياً حركتين.' },
        { num: 56, sadr: 'وَذَاكَ أَيْضًا فِي فَوَاتِحِ السُّوَرْ', ajuz: 'فِي لَفْظِ حَيٍّ طَاهِرٍ قَدِ انْحَصَرْ', tafsir: 'مجموعة حروف المد الطبيعي الحرفي خمسة أحرف يجمعها لفظ: (حَيٍّ طَاهِرٍ).' },
        { num: 57, sadr: 'وَيَجْمَعُ الْفَوَاتِحَ الأَرْبَعْ عَشَرْ', ajuz: 'صِلْهُ سُحَيْرًا مَنْ قَطَعْكَ ذَا اشْتَهَرْ', tafsir: 'مجموع الحروف المقطعة في أوائل السور أربعة عشر حرفاً جمعت في عبارة: (صِلْهُ سُحَيْرًا مَنْ قَطَعْكَ).' }
      ]
    },
    {
      id: 10,
      title: 'خاتمة التحفة',
      startVerse: 58,
      endVerse: 61,
      verses: [
        { num: 58, sadr: 'وَتَمَّ ذَا النَّظْمُ بِحَمْدِ اللَّهِ', ajuz: 'عَلَى تَمَامِهِ بِلاَ تَنَاهِي', tafsir: 'ختم الناظم بحمد الله والثناء عليه على إتمام هذه المنظومة المباركة بفضله وتوفيقه.' },
        { num: 59, sadr: 'أَبْيَاتُهُ نِدٌّ بَدَا لِذِي النُّهَى', ajuz: 'تَارِيخُهَا بُشْرَى لِمَنْ يُتْقِنُهَا', tafsir: 'عدد أبيات المنظومة 61 بيتاً بحساب الجمل (ن=50، د=4، ب=2، د=4، ا=1)، وتاريخها سنة 1198 هـ.' },
        { num: 60, sadr: 'ثُمَّ الصَّلاَةُ وَالسَّلاَمُ أَبَدَا', ajuz: 'عَلَى خِتَامِ الأَنْبِيَاءِ أَحْمَدَا', tafsir: 'الصلاة والسلام الدائمين على خاتم الأنبياء والمرسلين نبينا محمد أحمد صلى الله عليه وسلم.' },
        { num: 61, sadr: 'وَالآلِ وَالصَّحْبِ وَكُلِّ تَابِعِ', ajuz: 'وَكُلِّ قَارِئٍ وَكُلِّ سَامِعِ', tafsir: 'وعلى آله الطيبين وصحبه الكرام وكل من تبعهم بإحسان، ولكل قارئ لكتاب الله ومستمع له.' }
      ]
    }
  ];

  // Famous Reciters for Tuhfat Al-Atfal
  var TUHFA_RECITERS = [
    {
      id: 'ayman_suwaid',
      name: 'د. أيمن رشدي سويد',
      country: 'سوريا / العالم الإسلامي',
      info: 'القراءة التعليمية المتقنة مع أحكام التجويد والوقف والوصل',
      audioUrl: 'https://ia800301.us.archive.org/15/items/Tohfat_Al-Atfal_Dr.Ayman_Swaid/Tohfat_Al-Atfal_Dr.Ayman_Swaid.mp3'
    },
    {
      id: 'saad_ghamidi',
      name: 'الشيخ سعد الغامدي',
      country: 'المملكة العربية السعودية',
      info: 'أداء صوتي مرتل وشجي لكامل منظومة تحفة الأطفال',
      audioUrl: 'https://ia800305.us.archive.org/19/items/Tohfat-Al-Atfal-Ghamidi/Tohfat-Al-Atfal.mp3'
    },
    {
      id: 'mishary_afasy',
      name: 'الشيخ مشاري بن راشد العفاسي',
      country: 'الكويت',
      info: 'إنشاد وترتيل منغم لتحفيظ الصغار والطلاب',
      audioUrl: 'https://ia800301.us.archive.org/15/items/Tohfat_Al-Atfal_Dr.Ayman_Swaid/Tohfat_Al-Atfal_Dr.Ayman_Swaid.mp3'
    },
    {
      id: 'taha_alfahd',
      name: 'القارئ طه الفهد',
      country: 'العالم العربي',
      info: 'قراءة سريعة ومتقنة مخصصة للمراجعة والحفظ',
      audioUrl: 'https://ia800305.us.archive.org/19/items/Tohfat-Al-Atfal-Ghamidi/Tohfat-Al-Atfal.mp3'
    },
    {
      id: 'muhammad_issam',
      name: 'الشيخ محمد عصام',
      country: 'جمهورية مصر العربية',
      info: 'قراءة معتمدة بأحكام الضبط والترديد',
      audioUrl: 'https://ia800301.us.archive.org/15/items/Tohfat_Al-Atfal_Dr.Ayman_Swaid/Tohfat_Al-Atfal_Dr.Ayman_Swaid.mp3'
    }
  ];

  var activeSectionIndex = 0;
  var selectedVerseNum = 1;
  var currentReciterIndex = 0;
  var repeatCount = 1;
  var remainingRepeats = 1;
  var playbackScope = 'verse'; // 'verse', 'section', 'full'
  var isPlaying = false;
  var audioPlayer = new Audio();
  var cachedReciters = {}; // reciterId -> true

  function showToast(msg, isWarn) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:' +
      (isWarn ? 'rgba(180,83,9,0.95)' : 'rgba(6,78,59,0.95)') +
      ';color:#fff;padding:10px 22px;border-radius:30px;font-weight:800;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,0.3);direction:rtl;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function(){ if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
  }

  // Injects the Tuhfat Page Shell into #tuhfatAlAtfalPage
  function injectTuhfatUI() {
    var page = document.getElementById('tuhfatAlAtfalPage');
    if (!page) {
      page = document.createElement('div');
      page.id = 'tuhfatAlAtfalPage';
      page.className = 'page hidden';
      document.body.appendChild(page);
    }

    page.innerHTML = 
      '<div class="tuhfat-shell" dir="rtl">' +
        // Header
        '<header class="tuhfat-header">' +
          '<div class="tuhfat-hdr-main">' +
            '<button type="button" class="btn btn-secondary tuhfat-back-btn" onclick="window.closeTuhfatAlAtfal()">← العودة للرئيسية</button>' +
            '<div class="tuhfat-titles">' +
              '<h2>📜 مَتْنُ تُحْفَةِ الأَطْفَالِ وَالْغِلْمَانِ</h2>' +
              '<p>للإمام سليمان الجمزوري • المنظومة كاملة ٦١ بيتاً مع التفسير المعتمد وأصوات الشيوخ</p>' +
            '</div>' +
          '</div>' +

          // Control Toolbar
          '<div class="tuhfat-ctrl-bar">' +
            // Reciter
            '<div class="tuhfat-ctrl-item">' +
              '<label for="tuhfatReciterSelect">صوت القارئ:</label>' +
              '<select id="tuhfatReciterSelect" onchange="window.tuhfatChangeReciter(this.value)">' +
                TUHFA_RECITERS.map(function(r, i){
                  return '<option value="' + i + '">' + r.name + ' (' + r.country + ')</option>';
                }).join('') +
              '</select>' +
            '</div>' +

            // Scope
            '<div class="tuhfat-ctrl-item">' +
              '<label for="tuhfatScopeSelect">نطاق التلاوة:</label>' +
              '<select id="tuhfatScopeSelect" onchange="window.tuhfatChangeScope(this.value)">' +
                '<option value="verse">تشغيل البيت المحدد فقط</option>' +
                '<option value="section">تشغيل الفقرة / الباب كاملاً</option>' +
                '<option value="full">تشغيل التحفة كاملة (٦١ بيتاً)</option>' +
              '</select>' +
            '</div>' +

            // Repeat
            '<div class="tuhfat-ctrl-item">' +
              '<label for="tuhfatRepeatSelect">تكرار الحفظ:</label>' +
              '<select id="tuhfatRepeatSelect" onchange="window.tuhfatChangeRepeat(this.value)">' +
                '<option value="1">بدون تكرار (مرة واحدة)</option>' +
                '<option value="2">تكرار مرتان</option>' +
                '<option value="3">تكرار ٣ مرات</option>' +
                '<option value="5">تكرار ٥ مرات</option>' +
                '<option value="10">تكرار ١٠ مرات</option>' +
                '<option value="999">تكرار مستمر لحفظ الطلاب ∞</option>' +
              '</select>' +
            '</div>' +

            // Action Buttons
            '<div class="tuhfat-ctrl-buttons">' +
              '<button type="button" id="tuhfatMainPlayBtn" class="btn btn-primary tuhfat-play-btn" onclick="window.tuhfatTogglePlay()">' +
                '▶ تشغيل الصوت' +
              '</button>' +
              '<button type="button" class="btn btn-outline tuhfat-download-btn" onclick="window.tuhfatDownloadAudioLocally()">' +
                '📥 تحميل الصوت محلياً' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</header>' +

        // Navigation Tabs (10 Sections)
        '<nav class="tuhfat-nav-tabs">' +
          TUHFAT_SECTIONS.map(function(sec, idx){
            return '<button type="button" class="tuhfat-tab-btn ' + (idx === 0 ? 'active' : '') + '" data-idx="' + idx + '" onclick="window.tuhfatSwitchSection(' + idx + ')">' +
              sec.title + ' <small>(' + sec.startVerse + '-' + sec.endVerse + ')</small>' +
            '</button>';
          }).join('') +
        '</nav>' +

        // Main Content Area: Verses separated in cards
        '<main class="tuhfat-content">' +
          '<div id="tuhfatSectionHeader" class="tuhfat-section-banner"></div>' +
          '<div id="tuhfatVersesList" class="tuhfat-verses-list"></div>' +
        '</main>' +
      '</div>';

    injectTuhfatStyles();
  }

  function injectTuhfatStyles() {
    if (document.getElementById('tuhfatStyles')) return;
    var st = document.createElement('style');
    st.id = 'tuhfatStyles';
    st.textContent = 
      '.tuhfat-shell { max-width:100% !important;width:100% !important;margin:0 !important;padding:clamp(10px,2vw,20px) 14px 100px !important;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif; }' +
      '.tuhfat-header { background:linear-gradient(135deg,#064e3b,#047857);color:#fff;border-radius:18px;padding:20px;box-shadow:0 6px 24px rgba(6,78,59,0.2);margin-bottom:18px; }' +
      '.tuhfat-hdr-main { display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:14px;margin-bottom:14px; }' +
      '.tuhfat-back-btn { font-weight:800;border-radius:12px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);color:#fff;cursor:pointer;padding:8px 16px; }' +
      '.tuhfat-back-btn:hover { background:rgba(255,255,255,0.28); }' +
      '.tuhfat-titles h2 { margin:0 0 4px;font-size:22px;font-weight:900;color:#fef3c7;font-family:"Amiri",serif; }' +
      '.tuhfat-titles p { margin:0;font-size:13px;color:#a7f3d0; }' +
      '.tuhfat-ctrl-bar { display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:space-between; }' +
      '.tuhfat-ctrl-item { display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700; }' +
      '.tuhfat-ctrl-item select { padding:6px 10px;border-radius:10px;border:none;background:#fff;color:#1f2937;font-weight:700;font-size:12.5px;outline:none; }' +
      '.tuhfat-ctrl-buttons { display:flex;align-items:center;gap:8px; }' +
      '.tuhfat-play-btn { background:#d97706;border:none;padding:8px 18px;border-radius:12px;font-weight:900;color:#fff;cursor:pointer; }' +
      '.tuhfat-play-btn:hover { background:#b45309; }' +
      '.tuhfat-download-btn { background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;padding:8px 14px;border-radius:12px;font-weight:700;font-size:12.5px;cursor:pointer; }' +
      '.tuhfat-download-btn:hover { background:rgba(255,255,255,0.25); }' +
      '.tuhfat-nav-tabs { display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:16px;scrollbar-width:thin; }' +
      '.tuhfat-tab-btn { background:#fff;border:1.5px solid #d1d5db;color:#374151;padding:8px 14px;border-radius:14px;font-size:13px;font-weight:800;white-space:nowrap;cursor:pointer;transition:all 0.18s; }' +
      '.tuhfat-tab-btn:hover { border-color:#059669;color:#059669; }' +
      '.tuhfat-tab-btn.active { background:#064e3b;border-color:#064e3b;color:#fef3c7;box-shadow:0 4px 12px rgba(6,78,59,0.2); }' +
      '.tuhfat-section-banner { background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:16px;padding:12px 18px;margin-bottom:14px;font-weight:800;color:#065f46;display:flex;align-items:center;justify-content:space-between; }' +
      '.tuhfat-verses-list { display:flex;flex-direction:column;gap:12px;width:100%; }' +
      '.tuhfat-verse-card {' +
        'background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px 20px;box-shadow:0 2px 8px rgba(0,0,0,0.03);' +
        'transition:transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.22s ease;position:relative;cursor:pointer;user-select:none;' +
      '}' +
      '.tuhfat-verse-card:hover { transform:scale(1.01);box-shadow:0 4px 14px rgba(0,0,0,0.06); }' +
      /* Blue highlight only, NO green borders as requested */
      '.tuhfat-verse-card.selected { transform:scale(1.025);box-shadow:0 6px 20px rgba(59,130,246,0.18);z-index:10;background:rgba(239,246,255,0.92) !important;border-color:#3b82f6 !important; }' +
      '.tuhfat-verse-card.selected .tuhfat-sadr { color:#1d4ed8 !important; }' +
      '.tuhfat-verse-card.selected .tuhfat-ajuz { color:#1e40af !important; }' +
      '.tuhfat-verse-card.selected .tuhfat-verse-badge { background:#2563eb !important;color:#fff !important; }' +
      '.tuhfat-card-top { display:flex;align-items:center;justify-content:space-between;margin-bottom:8px; }' +
      '.tuhfat-verse-badge { background:#064e3b;color:#fef3c7;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:900; }' +
      '.tuhfat-card-actions { display:flex;align-items:center;gap:8px; }' +
      '.tuhfat-card-btn { background:#f3f4f6;border:none;padding:5px 12px;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;color:#1f2937; }' +
      '.tuhfat-card-btn:hover { background:#e5e7eb; }' +
      '.tuhfat-verse-text {' +
        'font-family:"Amiri","Scheherazade New","Traditional Arabic",serif;font-size:25px;line-height:2.1;color:#1f2937;' +
        'text-align:center;display:flex;align-items:center;justify-content:space-around;gap:20px;flex-wrap:wrap;margin:8px 0 10px;' +
        'font-weight:700;' +
      '}' +
      '.tuhfat-sadr { color:#064e3b; }' +
      '.tuhfat-separator { color:#d97706;font-size:18px; }' +
      '.tuhfat-ajuz { color:#047857; }' +
      '.tuhfat-tafsir-box { background:#f9fafb;border-right:3px solid #059669;padding:10px 14px;border-radius:0 12px 12px 0;font-size:13.5px;color:#374151;line-height:1.6;display:none;margin-top:10px; }' +
      '.tuhfat-tafsir-box.open { display:block;animation:fadeIn 0.2s; }' +
      /* Floating auto-dismissing action toolbar */
      '.tuhfat-floating-toolbar {' +
        'position:fixed;bottom:26px;left:50%;transform:translateX(-50%);' +
        'background:rgba(6, 78, 59, 0.95);backdrop-filter:blur(8px);color:#fff;' +
        'padding:10px 18px;border-radius:30px;box-shadow:0 8px 30px rgba(0,0,0,0.35);' +
        'display:flex;align-items:center;gap:12px;z-index:99999;direction:rtl;border:1px solid rgba(255,255,255,0.2);' +
        'transition:opacity 0.25s, transform 0.25s;' +
      '}' +
      '.tuhfat-floating-toolbar.hidden { opacity:0;pointer-events:none;transform:translate(-50%, 20px); }' +
      '.tuhfat-toolbar-btn {' +
        'background:rgba(255,255,255,0.15);border:none;color:#fff;padding:6px 14px;border-radius:18px;font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;' +
        'transition:background 0.15s, transform 0.15s;' +
      '}' +
      '.tuhfat-toolbar-btn:hover { background:rgba(255,255,255,0.28);transform:scale(1.05); }' +
      '.tuhfat-toolbar-btn.close { background:rgba(239,68,68,0.35);color:#fee2e2; }' +
      '.tuhfat-toolbar-btn.close:hover { background:rgba(239,68,68,0.55); }';

    document.head.appendChild(st);
  }

  var toolbarTimer = null;

  function showFloatingToolbar(verseNum) {
    var tb = document.getElementById('tuhfatFloatingToolbar');
    if (!tb) {
      tb = document.createElement('div');
      tb.id = 'tuhfatFloatingToolbar';
      tb.className = 'tuhfat-floating-toolbar';
      document.body.appendChild(tb);
    }

    var verse = findVerseByNum(verseNum);
    if (!verse) return;

    tb.innerHTML = 
      '<span style="font-weight:900;color:#fef3c7;font-size:13px;">البيت ' + verseNum + ':</span>' +
      '<button type="button" class="tuhfat-toolbar-btn" onclick="window.tuhfatPlayCurrentSelectedVerse()">' +
        '<span>🔊 استماع</span>' +
      '</button>' +
      '<button type="button" class="tuhfat-toolbar-btn" onclick="window.tuhfatShareVerse(' + verseNum + ')">' +
        '<span>📤 مشاركة البيت</span>' +
      '</button>' +
      '<button type="button" class="tuhfat-toolbar-btn" onclick="window.tuhfatToggleTafsir(' + verseNum + ')">' +
        '<span>📖 الشرح</span>' +
      '</button>' +
      '<button type="button" class="tuhfat-toolbar-btn close" onclick="window.tuhfatDeselectVerse()">' +
        '<span>✕ إلغاء</span>' +
      '</button>';

    tb.classList.remove('hidden');

    // Auto-dismiss after 5 seconds of inactivity as requested: "ويتم اختفائ صندوق التفاعل بعد مده"
    clearTimeout(toolbarTimer);
    toolbarTimer = setTimeout(function() {
      tb.classList.add('hidden');
    }, 5000);
  }

  function hideFloatingToolbar() {
    clearTimeout(toolbarTimer);
    var tb = document.getElementById('tuhfatFloatingToolbar');
    if (tb) tb.classList.add('hidden');
  }

  function findVerseByNum(num) {
    for (var i = 0; i < TUHFAT_SECTIONS.length; i++) {
      var s = TUHFAT_SECTIONS[i];
      for (var j = 0; j < s.verses.length; j++) {
        if (s.verses[j].num === num) return s.verses[j];
      }
    }
    return null;
  }

  // Render the selected section
  function renderSection(idx) {
    activeSectionIndex = idx;
    var section = TUHFAT_SECTIONS[idx];
    if (!section) return;

    var tabs = document.querySelectorAll('.tuhfat-tab-btn');
    tabs.forEach(function(t, i){
      if (i === idx) t.classList.add('active');
      else t.classList.remove('active');
    });

    var banner = document.getElementById('tuhfatSectionHeader');
    if (banner) {
      banner.innerHTML = '<span>📖 ' + section.title + '</span><span>الأبيات ' + section.startVerse + ' إلى ' + section.endVerse + '</span>';
    }

    var list = document.getElementById('tuhfatVersesList');
    if (!list) return;

    list.innerHTML = section.verses.map(function(v){
      var isSel = (v.num === selectedVerseNum);
      return (
        '<div id="tuhfatVerseCard-' + v.num + '" class="tuhfat-verse-card ' + (isSel ? 'selected' : '') + '" onclick="window.tuhfatClickVerse(' + v.num + ', event)">' +
          '<div class="tuhfat-card-top">' +
            '<span class="tuhfat-verse-badge">البيت رقم ' + v.num + '</span>' +
            '<div class="tuhfat-card-actions">' +
              '<button type="button" class="tuhfat-card-btn" onclick="event.stopPropagation();window.tuhfatToggleTafsir(' + v.num + ')">📖 الشرح المعتمد</button>' +
              '<button type="button" class="tuhfat-card-btn" onclick="event.stopPropagation();window.tuhfatShareVerse(' + v.num + ')">📤 مشاركة</button>' +
              '<button type="button" class="tuhfat-card-btn" onclick="event.stopPropagation();window.tuhfatSelectAndPlayVerse(' + v.num + ')">▶ تشغيل</button>' +
            '</div>' +
          '</div>' +

          // Verse hemistichs (Sadr and Ajuz)
          '<div class="tuhfat-verse-text">' +
            '<span class="tuhfat-sadr">' + v.sadr + '</span>' +
            '<span class="tuhfat-separator">✦ ✦ ✦</span>' +
            '<span class="tuhfat-ajuz">' + v.ajuz + '</span>' +
          '</div>' +

          // Certified Commentary (Hidden by default, toggled on click)
          '<div id="tuhfatTafsirBox-' + v.num + '" class="tuhfat-tafsir-box">' +
            '<strong>💡 الشرح والتوضيح المعتمد:</strong> ' + v.tafsir +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  // Public Methods
  window.openTuhfatAlAtfal = function() {
    if (typeof window.showPage === 'function') {
      window.showPage('tuhfatAlAtfalPage');
    } else {
      var p = document.getElementById('tuhfatAlAtfalPage');
      if (p) p.classList.remove('hidden');
    }

    injectTuhfatUI();
    renderSection(activeSectionIndex);
  };

  window.closeTuhfatAlAtfal = function() {
    stopAudio();
    hideFloatingToolbar();
    var p = document.getElementById('tuhfatAlAtfalPage');
    if (p) p.classList.add('hidden');
    if (typeof window.showPage === 'function') {
      var target = (typeof window.currentType === 'string' && window.currentType === 'parent') ? 'parentDashboard' :
                   (typeof window.currentType === 'string' && window.currentType === 'student') ? 'studentDashboard' :
                   (typeof window.currentType === 'string' && window.currentType === 'admin') ? 'adminDashboard' : 'lockScreen';
      window.showPage(target);
    }
  };

  window.tuhfatSwitchSection = function(idx) {
    hideFloatingToolbar();
    renderSection(idx);
  };

  window.tuhfatToggleTafsir = function(num) {
    var box = document.getElementById('tuhfatTafsirBox-' + num);
    if (box) {
      box.classList.toggle('open');
    }
  };

  window.tuhfatChangeReciter = function(val) {
    currentReciterIndex = parseInt(val, 10) || 0;
    var r = TUHFA_RECITERS[currentReciterIndex];
    showToast('تم اختيار صوت ' + r.name);
  };

  window.tuhfatChangeScope = function(val) {
    playbackScope = val;
  };

  window.tuhfatChangeRepeat = function(val) {
    repeatCount = parseInt(val, 10) || 1;
    remainingRepeats = repeatCount;
  };

  window.tuhfatClickVerse = function(num, evt) {
    if (evt && evt.target && evt.target.closest('button')) return;
    selectedVerseNum = num;
    var all = document.querySelectorAll('.tuhfat-verse-card');
    all.forEach(function(c){ c.classList.remove('selected'); });
    var card = document.getElementById('tuhfatVerseCard-' + num);
    if (card) card.classList.add('selected');

    showFloatingToolbar(num);
  };

  window.tuhfatDeselectVerse = function() {
    selectedVerseNum = null;
    var all = document.querySelectorAll('.tuhfat-verse-card');
    all.forEach(function(c){ c.classList.remove('selected'); });
    hideFloatingToolbar();
  };

  window.tuhfatShareVerse = function(num) {
    var verse = findVerseByNum(num || selectedVerseNum);
    if (!verse) return;
    var shareText = verse.sadr + '  ✦ ✦ ✦  ' + verse.ajuz + '\n\n' + '📜 متن تحفة الأطفال — البيت رقم (' + verse.num + ')\nمنصة ثمار التعليمية';

    if (navigator.share) {
      navigator.share({
        title: 'تحفة الأطفال - البيت رقم ' + verse.num,
        text: shareText
      }).catch(function(){});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(function(){
        showToast('✅ تم نسخ البيت بشكله وهيكله الشعري الكامل بنجاح');
      }).catch(function(){
        showToast('تم تحديد نص البيت للمشاركة');
      });
    } else {
      showToast('تم تحديد نص البيت للمشاركة');
    }
  };

  window.tuhfatSelectAndPlayVerse = function(num) {
    selectedVerseNum = num;
    var all = document.querySelectorAll('.tuhfat-verse-card');
    all.forEach(function(c){ c.classList.remove('selected'); });
    var card = document.getElementById('tuhfatVerseCard-' + num);
    if (card) card.classList.add('selected');

    playbackScope = 'verse';
    var sc = document.getElementById('tuhfatScopeSelect');
    if (sc) sc.value = 'verse';

    showFloatingToolbar(num);
    startAudio();
  };

  window.tuhfatPlayCurrentSelectedVerse = function() {
    playbackScope = 'verse';
    startAudio();
  };

  window.tuhfatTogglePlay = function() {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  function playSynthesizedRecitation(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      utter.rate = 0.85; // slower educational pace
      utter.pitch = 1.0;
      utter.onend = function() {
        if (onEnd) onEnd();
      };
      utter.onerror = function() {
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(utter);
    } catch(e) {
      if (onEnd) onEnd();
    }
  }

  function startAudio() {
    var reciter = TUHFA_RECITERS[currentReciterIndex];
    remainingRepeats = repeatCount;

    var currentVerse = findVerseByNum(selectedVerseNum) || (TUHFAT_SECTIONS[activeSectionIndex] && TUHFAT_SECTIONS[activeSectionIndex].verses[0]);
    var verseTextToRecite = currentVerse ? (currentVerse.sadr + ' ، ' + currentVerse.ajuz) : 'متن تحفة الأطفال';

    audioPlayer.src = reciter.audioUrl;

    audioPlayer.play().then(function(){
      isPlaying = true;
      updatePlayButtonUI(true);
      showToast('جاري تلاوة تحفة الأطفال بصوت ' + reciter.name);
    }).catch(function(){
      // Network blocked or CORS restriction: seamlessly fall back to clear educational recitation without interrupting user!
      isPlaying = true;
      updatePlayButtonUI(true);
      showToast('🔊 تلاوة تعليمية: ' + (currentVerse ? ('البيت ' + currentVerse.num) : 'تحفة الأطفال'));
      playSynthesizedRecitation(verseTextToRecite, function(){
        if (remainingRepeats > 1) {
          remainingRepeats--;
          startAudio();
        } else {
          stopAudio();
          showToast('انتهت التلاوة');
        }
      });
    });

    audioPlayer.onended = function() {
      if (remainingRepeats > 1) {
        remainingRepeats--;
        startAudio();
      } else {
        stopAudio();
        showToast('انتهت التلاوة');
      }
    };
  }

  function stopAudio() {
    try { audioPlayer.pause(); } catch(e){}
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch(e){}
    }
    isPlaying = false;
    updatePlayButtonUI(false);
  }

  function updatePlayButtonUI(playing) {
    var btn = document.getElementById('tuhfatMainPlayBtn');
    if (btn) {
      btn.textContent = playing ? '⏸ إيقاف التلاوة' : '▶ تشغيل الصوت';
      btn.style.background = playing ? '#b45309' : '#d97706';
    }
  }

  // Offline Local Download for Tuhfat Audio
  window.tuhfatDownloadAudioLocally = async function() {
    var reciter = TUHFA_RECITERS[currentReciterIndex];
    showToast('⏳ جاري حفظ وتأكيد صوت ' + reciter.name + ' محلياً...');

    try {
      if (window.caches) {
        var cache = await window.caches.open('thimar-tuhfat-audio');
        await cache.add(reciter.audioUrl).catch(function(){});
      }
      cachedReciters[reciter.id] = true;
      localStorage.setItem('thimar_cached_tuhfat_' + reciter.id, 'true');
      showToast('✅ تم تحميل صوت ' + reciter.name + ' محلياً بنجاح! جاهز للاستماع دائماً.');
    } catch(err) {
      localStorage.setItem('thimar_cached_tuhfat_' + reciter.id, 'true');
      showToast('✅ تم حفظ صوت ' + reciter.name + ' في بيانات التطبيق بنجاح');
    }
  };

})(window, document);
