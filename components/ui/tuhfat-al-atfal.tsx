'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Download, 
  Share2, 
  BookOpen,
  X,
  Repeat,
  CheckCircle2,
  Bookmark,
  SkipForward,
  SkipBack,
  Trash2,
  ZoomIn,
  ZoomOut,
  Copy,
  Info
} from 'lucide-react'
import { downloadAndCacheAsset, isAssetCached, getAssetPlayableUrl, removeCachedAsset } from '@/lib/offline-storage'
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
      'Wَمِثْلُ ذَا إِنْ عَرَضَ السُّكُونُ ** وَقْفًا كَتَعْلَمُونَ نَسْتَعِينُ',
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
      'يَجْمَعُهَا حُرُوفُ كَمْ عَسَلْ نَقاصْ ** وَعَيْنُ ذُو وَجْهَيْنِ وَالطُّولُ أَخَصّْ',
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

export interface TuhfaReciter {
  id: string
  name: string
  country: string
  info: string
  audioUrl: string
  fileSize: string
  avatarText: string
}

export const TUHFA_RECITERS: TuhfaReciter[] = [
  {
    id: 'ayman_suwaid',
    name: 'الدكتور أيمن رشدي سويد',
    country: 'سوريا / العالم الإسلامي',
    info: 'القراءة التعليمية المتقنة مع أحكام التجويد والوقف',
    audioUrl: 'https://archive.org/download/Tohfat_Al-Atfal_Dr.Ayman_Swaid/Tohfat_Al-Atfal_Dr.Ayman_Swaid.mp3',
    fileSize: '4.5 م.ب',
    avatarText: 'أس',
  },
  {
    id: 'saad_ghamidi',
    name: 'الشيخ سعد الغامدي',
    country: 'المملكة العربية السعودية',
    info: 'أداء صوتي شجي ومرتل للمتن كاملاً بنغمة عذبة',
    audioUrl: 'https://archive.org/download/Tohfat-Al-Atfal-Ghamidi/Tohfat-Al-Atfal.mp3',
    fileSize: '3.8 م.ب',
    avatarText: 'سغ',
  },
  {
    id: 'taha_alfahd',
    name: 'القارئ طه الفهد',
    country: 'العالم العربي',
    info: 'إنشاد وتجويد المنظومة بطريقة الحفظ والترديد السريع',
    audioUrl: 'https://archive.org/download/Tohfat_Al-Atfal_Taha/Tohfat_Al-Atfal.mp3',
    fileSize: '3.5 م.ب',
    avatarText: 'طف',
  },
  {
    id: 'khalil_husary',
    name: 'الشيخ محمود خليل الحصري',
    country: 'مصر',
    info: 'نطق مخارج الحروف الفصيح لطلبة علم التجويد',
    audioUrl: 'https://archive.org/download/Tohfat_Al-Atfal_Husary/Tohfat_Al-Atfal.mp3',
    fileSize: '4.1 م.ب',
    avatarText: 'مح',
  }
]

// Flattened verses mapping helper
const ALL_VERSES_FLAT: { num: number; text: string; sadr: string; ajuz: string }[] = []
TUHFAT_SECTIONS.forEach(s => {
  s.verses.forEach((vText, idx) => {
    const vNum = s.startVerse + idx
    const [sadr, ajuz] = vText.split('**')
    ALL_VERSES_FLAT.push({
      num: vNum,
      text: vText.replace(/\*\*/g, ' '),
      sadr: sadr?.trim() || '',
      ajuz: ajuz?.trim() || ''
    })
  })
})

export function TuhfatAlAtfal() {
  const [pageNumber, setPageNumber] = useState<number>(4) // child.pdf starts text at page 4 usually
  const [selectedReciterId, setSelectedReciterId] = useState(TUHFA_RECITERS[0].id)
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1.0)
  const [fitToScreen, setFitToScreen] = useState<boolean>(true)
  
  // PDF.js State
  const [pdfjs, setPdfjs] = useState<any>(null)
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true)
  const [textItems, setTextItems] = useState<any[]>([])
  
  // Selection state
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(null)
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null)
  const [showCircularMenu, setShowFloatingMenu] = useState<boolean>(false)

  // Playback & Audio
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentlyPlayingVerse, setCurrentlyPlayingVerse] = useState<number | null>(null)
  const [repeatMode, setRepeatMode] = useState<'1' | '3' | '5' | 'all'>('1')
  const [continuousRecitation, setContinuousRecitation] = useState<boolean>(true)
  const [isAudioDownloaded, setIsAudioDownloaded] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentReciter = TUHFA_RECITERS.find(r => r.id === selectedReciterId) || TUHFA_RECITERS[0]
  const currentSelectedVerse = selectedVerseNum ? ALL_VERSES_FLAT.find(v => v.num === selectedVerseNum) : null

  // Dynamic import of PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoadingPdf(true)
      import('pdfjs-dist').then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs'
        setPdfjs(mod)
        setLoadingPdf(false)
      }).catch(err => {
        console.error('[PDFJS-Tuhfa] Error loading PDFJS dist:', err)
        setLoadingPdf(false)
      })
    }
  }, [])

  // Check cached audio status
  useEffect(() => {
    async function checkCache() {
      const cached = await isAssetCached(`tuhfa_${selectedReciterId}`)
      setIsCached(cached)
    }
    checkCache()
  }, [selectedReciterId])

  const [isCached, setIsCached] = useState(false)

  // Render Tuhfat PDF page on canvas
  useEffect(() => {
    if (!pdfjs || !canvasRef.current) return

    let active = true
    let renderTask: any = null

    async function renderPage() {
      try {
        const loadingTask = pdfjs.getDocument('/child.pdf')
        const pdf = await loadingTask.promise
        if (!active) return

        // child.pdf has 11 pages
        const pageCount = pdf.numPages
        const currentPage = Math.max(1, Math.min(pageCount, pageNumber))

        const page = await pdf.getPage(currentPage)
        if (!active) return

        const textContent = await page.getTextContent()
        if (!active) return

        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!

        const viewportOne = page.getViewport({ scale: 1.0 })
        const parent = canvas.parentElement!
        const parentWidth = parent.clientWidth || 800
        const parentHeight = parent.clientHeight || 900

        let computedScale = 1.0
        if (fitToScreen) {
          const scaleWidth = parentWidth / viewportOne.width
          const scaleHeight = parentHeight / viewportOne.height
          computedScale = Math.min(scaleWidth, scaleHeight) * 0.96
        } else {
          computedScale = 1.4
        }

        const scale = computedScale * zoomMultiplier
        const viewport = page.getViewport({ scale })

        canvas.width = viewport.width * window.devicePixelRatio
        canvas.height = viewport.height * window.devicePixelRatio
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`
        context.scale(window.devicePixelRatio, window.devicePixelRatio)

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }

        renderTask = page.render(renderContext)
        await renderTask.promise

        const items = textContent.items.map((item: any, idx: number) => {
          const [scaleX, skewY, skewX, scaleY, tx, ty] = item.transform
          const [x, y] = viewport.convertToViewportPoint(tx, ty)
          const itemHeight = item.height * scale
          const itemWidth = item.width * scale

          return {
            text: item.str,
            left: x,
            top: y - itemHeight,
            width: itemWidth,
            height: itemHeight,
            index: idx
          }
        })

        if (active) {
          setTextItems(items)
        }
      } catch (err) {
        console.error('[TuhfatCanvas] Render failed:', err)
      }
    }

    renderPage()

    return () => {
      active = false
      if (renderTask) renderTask.cancel()
    }
  }, [pdfjs, pageNumber, zoomMultiplier, fitToScreen])

  // Normalization helper
  function normalizeText(str: string): string {
    return str
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove diacritics
      .replace(/[إأآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\u0621-\u064A0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Map text items to verses dynamically
  const mappedItems = React.useMemo(() => {
    if (textItems.length === 0) return []

    return textItems.map((item, idx) => {
      let matchedVerse: typeof ALL_VERSES_FLAT[0] | null = null

      for (let winSize = 5; winSize >= 1; winSize--) {
        const start = Math.max(0, idx - Math.floor(winSize / 2))
        const end = Math.min(textItems.length, start + winSize)
        const phrase = textItems.slice(start, end).map(i => i.text).join(' ')
        const normPhrase = normalizeText(phrase)
        if (!normPhrase) continue

        const found = ALL_VERSES_FLAT.find(v => normalizeText(v.text).includes(normPhrase))
        if (found) {
          matchedVerse = found
          break
        }
      }

      return {
        ...item,
        verse: matchedVerse
      }
    })
  }, [textItems])

  // Download full audio locally
  const handleDownloadAudio = async () => {
    if (downloading) return
    setDownloading(true)
    const success = await downloadAndCacheAsset(`tuhfa_${selectedReciterId}`, currentReciter.audioUrl, {
      title: `متن تحفة الأطفال - ${currentReciter.name}`,
      category: 'tuhfa',
      reciter: currentReciter.name,
    })
    if (success) setIsCached(true)
    setDownloading(false)
  }

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentlyPlayingVerse(null)
  }

  const handleDeleteAudio = async () => {
    stopAudio()
    await removeCachedAsset(`tuhfa_${selectedReciterId}`)
    setIsCached(false)
  }


  // Playback Control Engine (using continuous track timestamp offsets)
  // Dr. Ayman Suwaid total duration ~ 270s, so each verse is approx 4.4 seconds
  const getVerseTimeRange = (vNum: number) => {
    const verseDuration = 4.4
    const start = (vNum - 1) * verseDuration
    const end = vNum * verseDuration
    return { start, end }
  }

  const playSequence = async (startVerseNum?: number) => {
    if (isPlaying) {
      stopAudio()
      return
    }

    let currentVerseNum = startVerseNum || selectedVerseNum || 1
    let currentRepeat = repeatMode === 'all' ? 999 : Number(repeatMode)

    // Try offline cached audio URL
    let src = currentReciter.audioUrl
    if (isCached) {
      const local = await getAssetPlayableUrl(`tuhfa_${selectedReciterId}`, currentReciter.audioUrl)
      if (local) src = local
    }

    const playVerseNode = () => {
      if (currentVerseNum > 61) {
        stopAudio()
        return
      }

      setCurrentlyPlayingVerse(currentVerseNum)

      const audio = new Audio(src)
      audioRef.current = audio

      const { start, end } = getVerseTimeRange(currentVerseNum)
      audio.currentTime = start

      // Set lock screen media session metadata
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `تحفة الأطفال - بيت ${currentVerseNum}`,
          artist: currentReciter.name,
          album: 'متن تجويد القرآن الكريم',
          artwork: [{ src: '/apple-icon.png', sizes: '192x192', type: 'image/png' }]
        })
      }

      audio.play().catch(() => {})

      const timeCheckInterval = setInterval(() => {
        if (audio.currentTime >= end) {
          clearInterval(timeCheckInterval)
          audio.pause()

          if (currentRepeat > 1) {
            currentRepeat--
            playVerseNode()
            return
          }

          currentRepeat = repeatMode === 'all' ? 999 : Number(repeatMode)

          if (continuousRecitation) {
            currentVerseNum++
            // Auto flip child.pdf pages proportionally based on verse number
            // 61 verses distributed over page 4 to page 8 (approx 12 verses per page)
            const approxPage = 4 + Math.floor((currentVerseNum - 1) / 12.5)
            setPageNumber(Math.min(8, approxPage))
            playVerseNode()
          } else {
            stopAudio()
          }
        }
      }, 100)

      audio.onerror = () => {
        clearInterval(timeCheckInterval)
        stopAudio()
      }
    }

    setIsPlaying(true)
    playVerseNode()
  }

  const handleNextPage = () => {
    if (pageNumber < 11) {
      stopAudio()
      setPageNumber(prev => prev + 1)
      setSelectedVerseNum(null)
      setShowFloatingMenu(false)
    }
  }

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      stopAudio()
      setPageNumber(prev => prev - 1)
      setSelectedVerseNum(null)
      setShowFloatingMenu(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-80px)] relative" dir="rtl">
      {/* Tuhfa Header Toolbar */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between bg-emerald-50/40 gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-xl md:text-2xl font-black text-emerald-950">مَتْنُ تُحْفَةِ الأَطْفَالِ</h3>
            <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
              PDF التفاعلي
            </span>
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm text-xs font-bold">
            <button 
              onClick={handlePrevPage}
              disabled={pageNumber <= 1}
              className="p-1.5 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              title="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4 text-emerald-800" />
            </button>
            <span className="px-2 text-emerald-800">
              صفحة {pageNumber} / ١١
            </span>
            <button 
              onClick={handleNextPage}
              disabled={pageNumber >= 11}
              className="p-1.5 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-800" />
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFitToScreen(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              fitToScreen 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {fitToScreen ? 'الحجم الملائم' : 'تكبير يدوي'}
          </button>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoomMultiplier(prev => Math.max(0.6, prev - 0.1))}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="px-2 font-bold text-gray-700">{Math.round(zoomMultiplier * 100)}%</span>
            <button
              onClick={() => setZoomMultiplier(prev => Math.min(2.5, prev + 0.1))}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Reciters & Caching */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-2 font-bold text-gray-700 outline-none text-xs focus:ring-2 focus:ring-emerald-500"
          >
            {TUHFA_RECITERS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {isCached ? (
            <div className="flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-2xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>محمل</span>
              <button 
                onClick={handleDeleteAudio}
                className="p-0.5 hover:bg-emerald-200 rounded-lg mr-1 text-red-600"
                title="حذف الصوت"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleDownloadAudio}
              disabled={downloading}
              className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'تحميل...' : 'تحميل المتن'}</span>
            </button>
          )}

          <button 
            onClick={() => playSequence()}
            className={`p-2.5 md:px-5 md:py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg transition-all ${
              isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'إيقاف' : 'تشغيل الصوت'}</span>
          </button>
        </div>
      </div>

      {/* PDF Pages Rendering Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#ECE9E0] flex items-center justify-center p-4 relative"
      >
        {loadingPdf && (
          <div className="absolute inset-0 z-50 bg-[#FDFBF7]/90 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-emerald-800 font-bold">جاري تحميل صفحات تحفة الأطفال...</span>
          </div>
        )}

        <div className="relative border border-stone-300 shadow-2xl bg-white select-none overflow-hidden">
          <canvas ref={canvasRef} className="block" />

          {/* Interactive Text layer of child.pdf */}
          <div className="absolute inset-0 z-10">
            {mappedItems.map((item, idx) => {
              const isSelected = selectedVerseNum && item.verse && selectedVerseNum === item.verse.num
              const isCurrentlyPlaying = currentlyPlayingVerse && item.verse && currentlyPlayingVerse === item.verse.num

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    if (item.verse) {
                      setSelectedVerseNum(item.verse.num)
                      setClickCoords({ x: item.left, y: item.top })
                      setShowFloatingMenu(true)
                    }
                  }}
                  className={`absolute cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-500/25 border-b-2 border-blue-500/50' 
                      : isCurrentlyPlaying
                      ? 'bg-amber-500/30'
                      : 'bg-transparent hover:bg-emerald-500/10'
                  }`}
                  style={{
                    left: `${item.left}px`,
                    top: `${item.top}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`
                  }}
                  title={item.verse ? `البيت رقم ${item.verse.num}` : undefined}
                />
              )
            })}
          </div>
        </div>

        {/* RADIAL FLOATING CIRCULAR CONTROLS */}
        <AnimatePresence>
          {showCircularMenu && selectedVerseNum && currentSelectedVerse && clickCoords && (
            <div 
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${clickCoords.x}px`,
                top: `${clickCoords.y - 120}px`,
              }}
            >
              <motion.div 
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 45 }}
                className="pointer-events-auto bg-white/95 dark:bg-gray-900/95 border border-emerald-100 rounded-3xl p-4 shadow-2xl flex flex-col items-center gap-3 backdrop-blur-md max-w-sm"
              >
                <div className="text-center pb-2 border-b border-gray-100 dark:border-gray-800 w-full">
                  <h4 className="font-black text-xs text-emerald-800 dark:text-emerald-400">
                    البيت رقم {selectedVerseNum}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 font-amiri">
                    « {currentSelectedVerse.text} »
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {/* 1. Play Verse */}
                  <button
                    onClick={() => {
                      stopAudio()
                      playSequence(selectedVerseNum)
                    }}
                    className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    title="تشغيل البيت الحالي"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </button>

                  {/* 2. Continuous recitation */}
                  <button
                    onClick={() => setContinuousRecitation(prev => !prev)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border ${
                      continuousRecitation 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                    title="التلاوة المستمرة للأبيات"
                  >
                    <Repeat className="w-5 h-5" />
                  </button>

                  {/* 3. Repeat Mode */}
                  <button
                    onClick={() => {
                      setRepeatMode(prev => {
                        if (prev === '1') return '3'
                        if (prev === '3') return '5'
                        if (prev === '5') return 'all'
                        return '1'
                      })
                    }}
                    className="w-12 h-12 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 rounded-full flex flex-col items-center justify-center shadow-md transition-transform hover:scale-105 border border-sky-200 dark:border-sky-800"
                    title="تكرار البيت"
                  >
                    <Repeat className="w-4 h-4" />
                    <span className="text-[9px] font-black">{repeatMode === 'all' ? '∞' : `${repeatMode}x`}</span>
                  </button>

                  {/* 4. Copy */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentSelectedVerse.text)
                      alert('✅ تم نسخ البيت بنجاح')
                    }}
                    className="w-12 h-12 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-stone-200 dark:border-stone-700"
                    title="نسخ البيت"
                  >
                    <Copy className="w-5 h-5" />
                  </button>

                  {/* 5. Previous Verse */}
                  <button
                    onClick={() => {
                      if (selectedVerseNum > 1) {
                        setSelectedVerseNum(prev => prev! - 1)
                      }
                    }}
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105"
                    title="البيت السابق"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* 6. Next Verse */}
                  <button
                    onClick={() => {
                      if (selectedVerseNum < 61) {
                        setSelectedVerseNum(prev => prev! + 1)
                      }
                    }}
                    className="w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105"
                    title="البيت التالي"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* 7. Share */}
                  <button
                    onClick={() => alert(`مشاركة البيت: ${currentSelectedVerse.text}`)}
                    className="w-12 h-12 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-purple-200 dark:border-purple-800"
                    title="مشاركة البيت"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {/* 8. Close Selection */}
                  <button
                    onClick={() => {
                      setSelectedVerseNum(null)
                      setShowFloatingMenu(false)
                    }}
                    className="w-12 h-12 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-red-200 dark:border-red-800"
                    title="إغلاق التحديد"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Page Footer Navigation */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500">
        <button
          onClick={handlePrevPage}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40"
        >
          الصفحة السابقة
        </button>

        <span className="text-emerald-800 font-black">
          متن تحفة الأطفال • صفحة {pageNumber} من ١١
        </span>

        <button
          onClick={handleNextPage}
          disabled={pageNumber >= 11}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40"
        >
          الصفحة التالية
        </button>
      </div>
    </div>
  )
}
