'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Music, 
  Volume2, 
  Sparkles, 
  BookOpen, 
  Download, 
  CheckCircle2, 
  RotateCcw, 
  Repeat, 
  Headphones, 
  WifiOff, 
  ListOrdered,
  Layers,
  ChevronDown
} from 'lucide-react'
import { downloadAndCacheAsset, isAssetCached, getAssetPlayableUrl } from '@/lib/offline-storage'
import { t } from '@/lib/i18n'

export interface TuhfaSection {
  id: number
  title: string
  startVerse: number
  endVerse: number
  verses: string[]
}

export const TUHFAT_SECTIONS: TuhfaSection[] = [
  {
    id: 1,
    title: 'المقدمة',
    startVerse: 1,
    endVerse: 5,
    verses: [
      'يَقُولُ رَاجِي رَحْمَةِ الْغَفُورِ ** دَوْمًا سُلَيْمَانُ هُوَ الْجَمْزُورِي',
      'الْحَمْدُ لِلَّهِ مُصَلِّيًا عَلَى ** مُحَمَّدٍ وَآلِهِ وَمَنْ تَلَا',
      'وَبَعْدُ: هَذَا النَّظْمُ لِلْمُرِيدِ ** فِي النُّونِ وَالتَّنْوِينِ وَالْمُدُودِ',
      'سَمَّيْتُهُ بِتُحْفَةِ الأَطْفَالِ ** عَنْ شَيْخِنَا الْمِيهِيِّ ذِي الْكَمَالِ',
      'أَرْجُو بِهِ أَنْ يَنْفَعَ الطُّلاَّبَا ** وَالأَجْرَ وَالْقَبُولَ وَالثَّوَابَا'
    ]
  },
  {
    id: 2,
    title: 'أحكام النون الساكنة والتنوين',
    startVerse: 6,
    endVerse: 16,
    verses: [
      'لِلنُّونِ إِنْ تَسْكُنْ وَلِلتَّنْوِينِ ** أَرْبَعُ أَحْكَامٍ فَخُذْ تَبْيِينِي',
      'فَالأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ ** لِلْحَلْقِ سِتٌّ رُتِّبَتْ فَلْتَعْرِفِ',
      'هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ ** مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ',
      'وَالثَّانِ إِدْغَامٌ بِسِتَّةٍ أَتَتْ ** فِي يَرْمُلُونَ عِنْدَهُمْ قَدْ ثَبَتَتْ',
      'لَكِنَّهَا قِسْمَانِ قِسْمٌ يُدْغَمَا ** فِيهِ بِغُنَّةٍ بِيَنْمُو عُلِمَا',
      'إِلاَّ إِذَا كَانَا بِكِلْمَةٍ فَلاَ ** تُدْغِمْ كَدُنْيَا ثُمَّ صِنْوَانٍ تَلاَ',
      'وَالثَّانِ إِدْغَامٌ بِغَيْرِ غُنَّهْ ** فِي اللاَّمِ وَالرَّا ثُمَّ كَرِّرَنَّهْ',
      'وَالثَّالِثُ الإِقْلاَبُ عِنْدَ الْبَاءِ ** مِيمًا بِغُنَّةٍ مَعَ الإِخْفَاءِ',
      'وَالرَّابِعُ الإِخْفَاءُ عِنْدَ الْفَاضِلِ ** مِنَ الحُرُوفِ وَاجِبٌ لِلْفَاضِلِ',
      'فِي خَمْسَةٍ مِنْ بَعْدِ عَشْرٍ رَمْزُهَا ** فِي كِلْمِ هَذَا البَيْتِ قَدْ ضَمَّنْتُهَا',
      'صِفْ ذَا ثَنَا كَمْ جَادَ شَخْصٌ قَدْ سَمَا ** دُمْ طَيِّبًا زِدْ فِي تُقًى ضَعْ ظَالِمَا'
    ]
  },
  {
    id: 3,
    title: 'حكم الميم والنون المشددتين',
    startVerse: 17,
    endVerse: 17,
    verses: [
      'وَغُنَّ مِيمًا ثُمَّ نُونًا شُدِّدَا ** وَسَمِّ كُلاًّ حَرْفَ غُنَّةٍ بَدَا'
    ]
  },
  {
    id: 4,
    title: 'أحكام الميم الساكنة',
    startVerse: 18,
    endVerse: 23,
    verses: [
      'وَالْمِيمُ إِنْ تَسْكُنْ تَجِي قَبْلَ الْهِجَا ** لاَ أَلِفٍ لَيِّنَةٍ لِذِي الْحِجَا',
      'أَحْكَامُهَا ثَلاَثَةٌ لِمَنْ ضَبَطْ ** إِخْفَاءٌ ادْغَامٌ وَإِظْهَارٌ فَقَطْ',
      'فَالأَوَّلُ الإِخْفَاءُ عِنْدَ الْبَاءِ ** وَسَمِّهِ الشَّفْوِيَّ لِلقُرَّاءِ',
      'وَالثَّانِ إِدْغَامٌ بِمِثْلِهَا أَتَى ** وَسَمِّ إِدْغَامًا صَغِيرًا يَا فَتَى',
      'وَالثَّالِثُ الإِظْهَارُ فِي الْبَقِيَّهْ ** مِنْ أَحْرُفٍ وَسَمِّهَا شَفْوِيَّهْ',
      'وَاحْذَرْ لَدَى وَاوٍ وَفَا أَنْ تَخْتَفِي ** لِقُرْبِهَا وَلاِتِّحَادِ فَاعْرِفِ'
    ]
  },
  {
    id: 5,
    title: 'حكم لام أل ولام الفعل',
    startVerse: 24,
    endVerse: 29,
    verses: [
      'لِلاَمِ أَلْ حَالاَنِ قَبْلَ الأَحْرُفِ ** أُولاَهُمَا إِظْهَارُهَا فَلْتَعْرِفِ',
      'قَبْلَ ارْبَعٍ مَعْ عَشْرَةٍ خُذْ عِلْمَهُ ** مِنْ إِبْغِ حَجَّكَ وَخَفْ عَقِيمَهُ',
      'ثَانِيهِمَا إِدْغَامُهَا فِي أَرْبَعِ ** وَعَشْرَةٍ أَيْضًا وَرَمْزَهَا فَعِ',
      'طِبْ ثُمَّ صِلْ رَحْمًا تَفُزْ ضِفْ ذَا نِعَمْ ** دَعْ سُوءَ ظَنٍّ زُرْ شَرِيفًا لِلْكَرَمْ',
      'وَاللاَّمَ الاُولَى سَمِّهَا قَمَرِيَّهْ ** وَاللاَّمَ الاُخْرَى سَمِّهَا شَمْسِيَّهْ',
      'وَأَظْهِرَنَّ لاَمَ فِعْلٍ مُطْلَقَا ** فِي نَحْوِ قُلْ نَعَمْ وَقُلْنَا وَالْتَقَى'
    ]
  },
  {
    id: 6,
    title: 'في المثلين والمتقاربين والمتجانسين',
    startVerse: 30,
    endVerse: 34,
    verses: [
      'إِنْ فِي الصِّفَاتِ وَالمَخَارِجِ اتَّفَقْ ** حَرْفَانِ فَالْمِثْلاَنِ فِيهِمَا أَحَقّْ',
      'وَإِنْ يَكُونَا مَخْرَجًا تَقَارَبَا ** وَفِي الصِّفَاتِ اخْتَلَفَا يُلَقَّبَا',
      'مُتَقَارِبَيْنِ أَوْ يَكُونَا اتَّفَقَا ** فِي مَخْرَجٍ دُونَ الصِّفَاتِ حُقِّقَا',
      'بِالْمُتَجَانِسَيْنِ ثُمَّ إِنْ سَكَنْ ** أَوَّلُ كُلٍّ فَالصَّغِيرَ سَمِّيَنْ',
      'أَوْ حُرِّكَ الحَرْفَانِ فِي كُلٍّ فَقُلْ ** كُلٌّ كَبِيرٌ وَافْهَمَنْهُ بِالْمُثُلْ'
    ]
  },
  {
    id: 7,
    title: 'أقسام المد',
    startVerse: 35,
    endVerse: 41,
    verses: [
      'وَالْمَدُّ أَصْلِيٌّ وَفَرْعِيٌّ لَهُ ** وَسَمِّ أَوَّلاً طَبِيعِيًّا وَهُو',
      'مَا لاَ تَوَقُّفٌ لَهُ عَلَى سَبَبْ ** وَلاَ بِدُونِهِ الحُرُوفُ تُجْتَلَبْ',
      'بَلْ أَيُّ حَرْفٍ غَيْرِ هَمْزٍ أَوْ سُكُونْ ** جَا بَعْدَ مَدٍّ فَالطَّبِيعِيَّ يَكُونْ',
      'وَالآخَرُ الْفَرْعِيُّ مَوْقُوفٌ عَلَى ** سَبَبْ كَهَمْزٍ أَوْ سُكُونٍ مُسْجَلاَ',
      'حُرُوفُهُ ثَلاَثَةٌ فَعِيهَا ** مِنْ لَفْظِ وَايٍ وَهْيَ فِي نُوحِيهَا',
      'وَالْكَسْرُ قَبْلَ الْيَا وَقَبْلَ الْوَاوِ ضَمّْ ** شَرْطٌ وَفَتْحٌ قَبْلَ أَلْفٍ يُلْتَزَمْ',
      'وَاللِّينُ مِنْهَا الْيَا وَوَاوٌ سُكِّنَا ** إِنِ انْفِتَاحٌ قَبْلَ كُلٍّ أُعْلِنَا'
    ]
  },
  {
    id: 8,
    title: 'أحكام المد',
    startVerse: 42,
    endVerse: 47,
    verses: [
      'لِلْمَدِّ أَحْكَامٌ ثَلاَثَةٌ تَدُومْ ** وَهْيَ الْوُجُوبُ وَالْجَوَازُ وَاللُّزُومْ',
      'فَوَاجِبٌ إِنْ جَاءَ هَمْزٌ بَعْدَ مَدّْ ** فِي كِلْمَةٍ وَذَا بِمُتَّصِلٍ يُعَدّْ',
      'وَجَائِزٌ مَدٌّ وَقَصْرٌ إِنْ فُصِلْ ** كُلٌّ بِكِلْمَةٍ وَهَذَا المُنْفَصِلْ',
      'وَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ ** وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ',
      'أَوْ قُدِّمَ الْهَمْزُ عَلَى المَدِّ وَذَا ** بَدَلْ كَآمَنُوا وَإِيمَانًا خُذَا',
      'وَلاَزِمٌ إِنِ السُّكُونُ أُصِّلاَ ** وَصْلاً وَوَقْفًا بَعْدَ مَدٍّ طُوِّلاَ'
    ]
  },
  {
    id: 9,
    title: 'أقسام المد اللازم',
    startVerse: 48,
    endVerse: 57,
    verses: [
      'أَقْسَامُ لاَزِمٍ لَدَيْهِمْ أَرْبَعَهْ ** وَتِلْكَ كِلْمِيٌّ وَحَرْفِيٌّ مَعَهْ',
      'كِلاَهُمَا مُخَفَّفٌ مُثَقَّلُ ** فَهَذِهِ أَرْبَعَةٌ تُفَصَّلُ',
      'فَإِنْ بِكِلْمَةٍ سُكُونٌ اجْتَمَعْ ** مَعْ حَرْفِ مَدٍّ فَهْوَ كِلْمِيٌّ وَقَعْ',
      'أَوْ فِي ثُلاَثِيِّ الحُرُوفِ وُجِدَا ** وَالْمَدُّ وَسْطُهُ فَحَرْفِيٌّ بَدَا',
      'كِلاَهُمَا مُثَقَّلٌ إِنْ أُدْغِمَا ** مَخَفَّفٌ كُلٌّ إِذَا لَمْ يُدْغَمَا',
      'وَاللاَّزِمُ الحَرْفِيُّ أَوَّلَ السُّوَرْ ** وُجُودُهُ وَفِي ثَمَانٍ انْحَصَرْ',
      'يَجْمَعُهَا حُرُوفُ كَمْ عَسَلْ نَقَصْ ** وَعَيْنُ ذُو وَجْهَيْنِ وَالطُّولُ أَخَصّْ',
      'وَمَا سِوَى الحَرْفِ الثُّلاَثِي لاَ أَلِفْ ** فَمَدُّهُ مَدًّا طَبِيعِيًّا أُلِفْ',
      'وَذَاكَ أَيْضًا فِي فَوَاتِحِ السُّوَرْ ** فِي لَفْظِ حَيٍّ طَاهِرٍ قَدِ انْحَصَرْ',
      'وَيَجْمَعُ الْفَوَاتِحَ الأَرْبَعْ عَشَرْ ** صِلْهُ سُحَيْرًا مَنْ قَطَعْكَ ذَا اشْتَهَرْ'
    ]
  },
  {
    id: 10,
    title: 'خاتمة التحفة',
    startVerse: 58,
    endVerse: 61,
    verses: [
      'وَتَمَّ ذَا النَّظْمُ بِحَمْدِ اللَّهِ ** عَلَى تَمَامِهِ بِلاَ تَنَاهِي',
      'أَبْيَاتُهُ نِدٌّ بَدَا لِذِي النُّهَى ** تَارِيخُهَا بُشْرَى لِمَنْ يُتْقِنُهَا',
      'ثُمَّ الصَّلاَةُ وَالسَّلاَمُ أَبَدَا ** عَلَى خِتَامِ الأَنْبِيَاءِ أَحْمَدَا',
      'وَالآلِ وَالصَّحْبِ وَكُلِّ تَابِعِ ** وَكُلِّ قَارِئٍ وَكُلِّ سَامِعِ'
    ]
  }
]

export const TUHFA_RECITERS = [
  {
    id: 'ayman_suwaid',
    name: 'الدكتور أيمن رشدي سويد',
    info: 'القراءة التعليمية المتقنة مع أحكام التجويد',
    audioUrl: 'https://archive.org/download/Tohfat_Al-Atfal_Dr.Ayman_Swaid/Tohfat_Al-Atfal_Dr.Ayman_Swaid.mp3',
  },
  {
    id: 'saad_ghamidi',
    name: 'الشيخ سعد الغامدي',
    info: 'أداء صوتي شجي ومرتل للمتن كاملاً',
    audioUrl: 'https://archive.org/download/Tohfat-Al-Atfal-Ghamidi/Tohfat-Al-Atfal.mp3',
  },
  {
    id: 'taha_alfahd',
    name: 'القارئ طه الفهد',
    info: 'إنشاد وتجويد المنظومة بطريقة الحفظ السريع',
    audioUrl: 'https://archive.org/download/Tohfat_Al-Atfal_Taha/Tohfat_Al-Atfal.mp3',
  },
  {
    id: 'khalil_husary',
    name: 'الشيخ محمود خليل الحصري',
    info: 'نطق مخارج الحروف الفصيح لطلبة العلم',
    audioUrl: 'https://archive.org/download/Tohfat_Al-Atfal_Husary/Tohfat_Al-Atfal.mp3',
  }
]

export function TuhfatAlAtfal() {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0)
  const [selectedReciterId, setSelectedReciterId] = useState(TUHFA_RECITERS[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeVerseIndex, setActiveVerseIndex] = useState(0)
  const [repeatMode, setRepeatMode] = useState<'1' | '3' | '5' | 'all'>('1')
  const [repeatCountRemaining, setRepeatCountRemaining] = useState(1)
  const [scopeMode, setScopeMode] = useState<'verse' | 'section' | 'all'>('section')
  const [isCached, setIsCached] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSection = TUHFAT_SECTIONS[activeSectionIdx]
  const currentReciter = TUHFA_RECITERS.find(r => r.id === selectedReciterId) || TUHFA_RECITERS[0]

  useEffect(() => {
    // Check if current reciter audio is cached locally
    async function checkLocalCache() {
      const cached = await isAssetCached(`tuhfa_${selectedReciterId}`)
      setIsCached(cached)
    }
    checkLocalCache()
  }, [selectedReciterId])

  const handleDownload = async () => {
    if (downloading) return
    setDownloading(true)
    const ok = await downloadAndCacheAsset(`tuhfa_${selectedReciterId}`, currentReciter.audioUrl, {
      title: `تحفة الأطفال - ${currentReciter.name}`,
      category: 'tuhfa',
      reciter: currentReciter.name,
    })
    if (ok) setIsCached(true)
    setDownloading(false)
  }

  const togglePlay = async () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    // Try offline URL
    let src = currentReciter.audioUrl
    if (isCached) {
      const local = await getAssetPlayableUrl(`tuhfa_${selectedReciterId}`, currentReciter.audioUrl)
      if (local) src = local
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(src)
    } else {
      if (audioRef.current.src !== src) {
        audioRef.current.src = src
      }
    }

    audioRef.current.playbackRate = playbackSpeed

    audioRef.current.onended = () => {
      if (scopeMode === 'verse') {
        if (repeatMode !== '1' && repeatCountRemaining > 1) {
          setRepeatCountRemaining(prev => prev - 1)
          audioRef.current?.play().catch(() => {})
          return
        }
      } else if (scopeMode === 'section') {
        if (activeVerseIndex < currentSection.verses.length - 1) {
          setActiveVerseIndex(prev => prev + 1)
          audioRef.current?.play().catch(() => {})
          return
        }
      } else if (scopeMode === 'all') {
        if (activeVerseIndex < currentSection.verses.length - 1) {
          setActiveVerseIndex(prev => prev + 1)
          audioRef.current?.play().catch(() => {})
          return
        } else if (activeSectionIdx < TUHFAT_SECTIONS.length - 1) {
          setActiveSectionIdx(prev => prev + 1)
          setActiveVerseIndex(0)
          audioRef.current?.play().catch(() => {})
          return
        }
      }
      setIsPlaying(false)
    }

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      // If network audio error or blocked, synthesize TTS recitation
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const verseText = currentSection.verses[activeVerseIndex]
        const utt = new SpeechSynthesisUtterance(verseText)
        utt.lang = 'ar-SA'
        utt.rate = 0.85
        utt.onend = () => setIsPlaying(false)
        window.speechSynthesis.speak(utt)
        setIsPlaying(true)
      } else {
        setIsPlaying(false)
      }
    }
  }

  const handleNextVerse = () => {
    if (activeVerseIndex < currentSection.verses.length - 1) {
      setActiveVerseIndex(prev => prev + 1)
    } else if (activeSectionIdx < TUHFAT_SECTIONS.length - 1) {
      setActiveSectionIdx(prev => prev + 1)
      setActiveVerseIndex(0)
    }
  }

  const handlePrevVerse = () => {
    if (activeVerseIndex > 0) {
      setActiveVerseIndex(prev => prev - 1)
    } else if (activeSectionIdx > 0) {
      setActiveSectionIdx(prev => prev - 1)
      setActiveVerseIndex(TUHFAT_SECTIONS[activeSectionIdx - 1].verses.length - 1)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[720px]" dir="rtl">
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
            <BookOpen className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl md:text-3xl font-black italic">تحفة الأطفال والغلمان</h3>
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                ٦١ بيتاً كاملاً
              </span>
            </div>
            <p className="text-xs md:text-sm text-emerald-100 font-bold mt-1">
              متن الشيخ سليمان الجمزوري في علم تجويد القرآن الكريم
            </p>
          </div>
        </div>

        {/* Offline Badge & Download Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isCached ? (
            <span className="bg-emerald-500/30 border border-emerald-300/40 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>محمل ويعمل بلا إنترنت</span>
            </span>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="bg-white/15 hover:bg-white/25 active:scale-95 border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              title="تحميل صوت المتن كاملاً على جهازك ليعمل بلا إنترنت"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>{downloading ? t('جاري التحميل...') : t('تحميل الصوت بلا إنترنت')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Reciter & Scope Selection Bar */}
      <div className="p-4 bg-emerald-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Reciter selector */}
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-gray-700">القارئ:</span>
          <select
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(e.target.value)}
            className="bg-white border border-emerald-200 rounded-xl px-3 py-1.5 font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs shadow-sm"
          >
            {TUHFA_RECITERS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scope selector: البيت / الباب / كامل المتن */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-gray-700">نطاق التلاوة:</span>
          <div className="flex bg-white rounded-xl border border-emerald-200 p-1 shadow-sm">
            {[
              { id: 'verse', label: 'بيت واحد' },
              { id: 'section', label: 'الباب كاملاً' },
              { id: 'all', label: 'المتن كاملاً' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setScopeMode(mode.id as any)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  scopeMode === mode.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-emerald-700'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Repeat selector */}
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-gray-700">التكرار:</span>
          <select
            value={repeatMode}
            onChange={(e) => {
              setRepeatMode(e.target.value as any)
              setRepeatCountRemaining(Number(e.target.value) || 999)
            }}
            className="bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 font-bold text-emerald-900 outline-none text-xs shadow-sm"
          >
            <option value="1">مرة واحدة (١x)</option>
            <option value="3">٣ مرات (٣x)</option>
            <option value="5">٥ مرات (٥x)</option>
            <option value="all">تكرار دائم (∞)</option>
          </select>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Sidebar: All 10 Chapters */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-gray-100 bg-gray-50/70 overflow-y-auto max-h-48 md:max-h-none">
          <div className="p-3 font-black text-xs text-gray-400 tracking-wider uppercase flex items-center justify-between border-b border-gray-100">
            <span>أبواب المنظومة (١٠ أبواب)</span>
            <ListOrdered className="w-4 h-4 text-emerald-600" />
          </div>
          {TUHFAT_SECTIONS.map((sec, idx) => {
            const isCurrent = activeSectionIdx === idx
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSectionIdx(idx)
                  setActiveVerseIndex(0)
                }}
                className={`w-full text-right p-4 transition-all border-b border-gray-100 flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-white text-emerald-700 shadow-sm font-black border-r-4 border-r-emerald-600'
                    : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200/70 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs md:text-sm leading-snug block">{sec.title}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      الأبيات: {sec.startVerse} - {sec.endVerse}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Verses Content View */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-y-auto bg-[#FDFBF7]">
          <div className="space-y-8 flex-1">
            {/* Chapter Heading */}
            <div className="text-center pb-4 border-b border-emerald-100/60">
              <span className="text-emerald-700 bg-emerald-50 px-4 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-2 mb-2 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                الباب {activeSectionIdx + 1} من ١٠ • الأبيات {currentSection.startVerse} إلى {currentSection.endVerse}
              </span>
              <h4 className="text-2xl md:text-3xl font-black text-gray-900">
                {currentSection.title}
              </h4>
            </div>

            {/* Verses display */}
            <div className="space-y-6 max-w-2xl mx-auto">
              {currentSection.verses.map((verse, vIdx) => {
                const verseNumber = currentSection.startVerse + vIdx
                const isSelectedVerse = activeVerseIndex === vIdx
                const [firstHalf, secondHalf] = verse.split('**')

                return (
                  <motion.div
                    key={vIdx}
                    onClick={() => setActiveVerseIndex(vIdx)}
                    className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer text-center relative ${
                      isSelectedVerse
                        ? 'bg-white border-emerald-400 shadow-lg shadow-emerald-900/5 ring-2 ring-emerald-400/50 scale-[1.02]'
                        : 'bg-white/60 border-gray-100 hover:bg-white hover:border-emerald-200'
                    }`}
                  >
                    {/* Verse Number Badge */}
                    <div className="absolute top-3 right-4 flex items-center gap-1">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">
                        {verseNumber}
                      </span>
                    </div>

                    {/* Poetry Verse Line */}
                    <div 
                      className="text-xl sm:text-2xl md:text-3xl font-bold leading-loose text-gray-800 space-y-2"
                      style={{ fontFamily: 'var(--font-amiri)' }}
                    >
                      <div className="text-emerald-950 font-black">
                        {firstHalf?.trim()}
                      </div>
                      <div className="text-gray-500 text-xs tracking-widest font-mono">
                        ~ • ~
                      </div>
                      <div className="text-emerald-900 font-black">
                        {secondHalf?.trim()}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Bottom Player Controller */}
          <div className="mt-8 p-6 bg-white rounded-3xl border border-emerald-100 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black shadow-inner">
                <Music className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400 font-bold">يقرأ الآن:</p>
                <p className="font-black text-gray-800 text-sm md:text-base">
                  {currentReciter.name}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  {currentSection.title} (البيت {currentSection.startVerse + activeVerseIndex})
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevVerse}
                className="p-3 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-colors"
                title="البيت السابق"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 scale-105' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 active:scale-95'
                }`}
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل المنظومة'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current mr-0.5" />
                )}
              </button>

              <button
                onClick={handleNextVerse}
                className="p-3 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-colors"
                title="البيت التالي"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
