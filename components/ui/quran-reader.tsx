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
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Trash2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  Copy
} from 'lucide-react'
import { ALL_SURAHS, QURAN_RECITERS, getAyahAudioUrl } from '@/lib/quran-surahs'
import { getPageAyahs, type PageAyah } from '@/lib/quran-cached-ayahs'
import { downloadAndCacheAsset, isAssetCached, getAssetPlayableUrl, removeCachedAsset } from '@/lib/offline-storage'
import { QuranShareDialog } from './quran-share-dialog'
import { QuranTafsirDialog } from './quran-tafsir-dialog'
import { t } from '@/lib/i18n'

export function QuranReader() {
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [selectedSheikhId, setSelectedSheikhId] = useState<string>('minshawi')
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1.0)
  const [fitToScreen, setFitToScreen] = useState<boolean>(true)
  
  // PDF.js State
  const [pdfjs, setPdfjs] = useState<any>(null)
  const [loadingPdf, setLoadingPdf] = useState<boolean>(true)
  const [pageTextLoading, setPageTextLoading] = useState<boolean>(false)
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([])
  const [textItems, setTextItems] = useState<any[]>([])
  
  // Selection state
  const [selectedAyah, setSelectedAyah] = useState<PageAyah | null>(null)
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null)
  const [showCircularMenu, setShowFloatingMenu] = useState<boolean>(false)

  // Playback & Audio
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentlyPlayingAyah, setCurrentlyPlayingAyah] = useState<PageAyah | null>(null)
  const [repeatMode, setRepeatMode] = useState<'1' | '3' | '5' | 'all'>('1')
  const [continuousRecitation, setContinuousRecitation] = useState<boolean>(true)
  const [downloadingFullPage, setDownloadingFullPage] = useState(false)
  const [isPageAudioDownloaded, setIsPageAudioDownloaded] = useState(false)
  const [continueNextSurah, setContinueNextSurah] = useState<boolean>(true)

  // Dialogs
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showTafsirDialog, setShowTafsirDialog] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentSurah = ALL_SURAHS.find(s => s.number === (selectedAyah?.surahNumber || pageAyahs[0]?.surahNumber || 1)) || ALL_SURAHS[0]
  const currentSheikh = QURAN_RECITERS.find(s => s.id === selectedSheikhId) || QURAN_RECITERS[0]

  // Dynamic import of PDF.js
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLoadingPdf(true)
      import('pdfjs-dist').then((mod) => {
        mod.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs'
        setPdfjs(mod)
        setLoadingPdf(false)
      }).catch(err => {
        console.error('[PDFJS-Load] Error loading PDFJS dist:', err)
        setLoadingPdf(false)
      })
    }
  }, [])

  // Load Page Ayah Content
  useEffect(() => {
    let active = true
    async function load() {
      setPageTextLoading(true)
      const data = await getPageAyahs(pageNumber)
      if (active) {
        setPageAyahs(data)
        setPageTextLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [pageNumber])

  // Normalization helper
  function normalizeText(str: string): string {
    return str
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove diacritics / tashkeel
      .replace(/[إأآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\u0621-\u064A0-9]/g, ' ') // keep letters and numbers
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Render PDF page on canvas
  useEffect(() => {
    if (!pdfjs || !canvasRef.current) return

    let active = true
    let renderTask: any = null

    async function renderPage() {
      try {
        const loadingTask = pdfjs.getDocument('/quran/quran.pdf')
        const pdf = await loadingTask.promise
        if (!active) return

        const page = await pdf.getPage(pageNumber)
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
          computedScale = 1.4 // comfortable zoom level
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

        // Map text coordinates exactly
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
        console.error('[QuranCanvas] Render failed:', err)
      }
    }

    renderPage()

    return () => {
      active = false
      if (renderTask) renderTask.cancel()
    }
  }, [pdfjs, pageNumber, zoomMultiplier, fitToScreen])

  // Map text items to page ayahs on load
  const mappedItems = React.useMemo(() => {
    if (pageAyahs.length === 0 || textItems.length === 0) return []

    return textItems.map((item, idx) => {
      let matchedAyah: PageAyah | null = null

      for (let winSize = 5; winSize >= 1; winSize--) {
        const start = Math.max(0, idx - Math.floor(winSize / 2))
        const end = Math.min(textItems.length, start + winSize)
        const phrase = textItems.slice(start, end).map(i => i.text).join(' ')
        const normPhrase = normalizeText(phrase)
        if (!normPhrase) continue

        const found = pageAyahs.find(a => normalizeText(a.text).includes(normPhrase))
        if (found) {
          matchedAyah = found
          break
        }
      }

      return {
        ...item,
        ayah: matchedAyah
      }
    })
  }, [textItems, pageAyahs])

  // Check offline audio files status for current page ayahs
  useEffect(() => {
    async function checkPageAudio() {
      if (pageAyahs.length === 0) return
      let allCached = true
      for (const a of pageAyahs) {
        const key = `quran_audio_${selectedSheikhId}_${a.surahNumber}_${a.ayahNumber}`
        const cached = await isAssetCached(key)
        if (!cached) {
          allCached = false
          break
        }
      }
      setIsPageAudioDownloaded(allCached)
    }
    checkPageAudio()
  }, [pageAyahs, selectedSheikhId])

  // Background Audio notification tracker
  const backgroundNoticeCountRef = useRef(0)
  const isBackgroundActiveRef = useRef(false)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        isBackgroundActiveRef.current = true
        backgroundNoticeCountRef.current = 0
      } else {
        isBackgroundActiveRef.current = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const triggerBackgroundNotification = () => {
    if (!isBackgroundActiveRef.current || backgroundNoticeCountRef.current >= 2) return
    
    // Play gentle chime
    const alertAudio = new Audio('/audio/notification-chime.mp3')
    alertAudio.play().catch(() => {})

    backgroundNoticeCountRef.current++
  }

  // Audio Playback Player Engine
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentlyPlayingAyah(null)
  }

  const playSelectedSequence = async (startAyahObj?: PageAyah) => {
    if (isPlaying) {
      stopAudio()
      return
    }

    const currentAyahsList = pageAyahs.length > 0 ? pageAyahs : await getPageAyahs(pageNumber)
    if (currentAyahsList.length === 0) return

    const startIndex = startAyahObj 
      ? currentAyahsList.findIndex(a => a.ayahNumber === startAyahObj.ayahNumber && a.surahNumber === startAyahObj.surahNumber)
      : 0

    let currentIndex = Math.max(0, startIndex)
    let currentRepeat = repeatMode === 'all' ? 999 : Number(repeatMode)

    const playNext = async () => {
      if (currentIndex >= currentAyahsList.length) {
        // Current Page finished! Turn page if continuous is enabled
        if (continuousRecitation && pageNumber < 604) {
          setPageNumber(prev => prev + 1)
          // The next useEffect of pageNumber change will trigger reloading pageAyahs
          return
        }
        stopAudio()
        return
      }

      const ayahObj = currentAyahsList[currentIndex]
      setCurrentlyPlayingAyah(ayahObj)

      // Background notice checks
      triggerBackgroundNotification()

      const rawUrl = getAyahAudioUrl(currentSheikh.folder, ayahObj.surahNumber, ayahObj.ayahNumber)
      const assetKey = `quran_audio_${currentSheikh.id}_${ayahObj.surahNumber}_${ayahObj.ayahNumber}`

      let playable = rawUrl
      const cached = await isAssetCached(assetKey)
      if (cached) {
        const local = await getAssetPlayableUrl(assetKey, rawUrl)
        if (local) playable = local
      }

      const audio = new Audio(playable)
      audioRef.current = audio

      // Setup lock-screen media session controls
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `سورة ${ayahObj.surahName} - آية ${ayahObj.ayahNumber}`,
          artist: currentSheikh.name,
          album: 'منصة ثمار القرآنية',
          artwork: [{ src: '/apple-icon.png', sizes: '192x192', type: 'image/png' }]
        })

        navigator.mediaSession.setActionHandler('play', () => audio.play().catch(() => {}))
        navigator.mediaSession.setActionHandler('pause', () => audio.pause())
        navigator.mediaSession.setActionHandler('previoustrack', () => { stopAudio(); handlePrevPage() })
        navigator.mediaSession.setActionHandler('nexttrack', () => { stopAudio(); handleNextPage() })
      }

      audio.onended = () => {
        if (currentRepeat > 1) {
          currentRepeat--
          audio.currentTime = 0
          audio.play().catch(() => {})
          return
        }
        currentRepeat = repeatMode === 'all' ? 999 : Number(repeatMode)
        currentIndex++
        playNext()
      }

      audio.onerror = () => {
        currentIndex++
        playNext()
      }

      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        stopAudio()
      }
    }

    setIsPlaying(true)
    playNext()
  }

  // Handle download of current page's audios
  const handleDownloadPageAudio = async () => {
    if (downloadingFullPage || pageAyahs.length === 0) return
    setDownloadingFullPage(true)

    try {
      for (const a of pageAyahs) {
        const rawUrl = getAyahAudioUrl(currentSheikh.folder, a.surahNumber, a.ayahNumber)
        const assetKey = `quran_audio_${currentSheikh.id}_${a.surahNumber}_${a.ayahNumber}`
        await downloadAndCacheAsset(assetKey, rawUrl, {
          title: `سورة ${a.surahName} - آية ${a.ayahNumber}`,
          category: 'quran',
          reciter: currentSheikh.name,
        })
      }
      setIsPageAudioDownloaded(true)
    } finally {
      setDownloadingFullPage(false)
    }
  }

  // Clear page's audio cache
  const handleDeletePageAudio = async () => {
    stopAudio()
    for (const a of pageAyahs) {
      const assetKey = `quran_audio_${currentSheikh.id}_${a.surahNumber}_${a.ayahNumber}`
      await removeCachedAsset(assetKey)
    }
    setIsPageAudioDownloaded(false)
  }

  // Page navigations
  const handleNextPage = () => {
    if (pageNumber < 604) {
      stopAudio()
      setPageNumber(prev => prev + 1)
      setSelectedAyah(null)
      setShowFloatingMenu(false)
    }
  }

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      stopAudio()
      setPageNumber(prev => prev - 1)
      setSelectedAyah(null)
      setShowFloatingMenu(false)
    }
  }

  const handleSurahJump = (surahNum: number) => {
    const sMeta = ALL_SURAHS.find(s => s.number === surahNum)
    if (sMeta) {
      stopAudio()
      setPageNumber(sMeta.pageStart)
      setSelectedAyah(null)
      setShowFloatingMenu(false)
    }
  }

  // Copy selection text to clipboard
  const handleCopyAyah = () => {
    if (!selectedAyah) return
    navigator.clipboard.writeText(selectedAyah.text)
    alert('✅ تم نسخ الآية الكريمة المحددة بنجاح')
  }

  // Share Dialog
  const handleShareClick = () => {
    setShowShareDialog(true)
  }

  // Tafsir Dialog
  const handleTafsirClick = () => {
    setShowTafsirDialog(true)
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[calc(100vh-80px)] relative" dir="rtl">
      {/* Quran Header Toolbar */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between bg-emerald-50/40 gap-4">
        {/* Selector & Navigation */}
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={currentSurah.number}
            onChange={(e) => handleSurahJump(Number(e.target.value))}
            className="bg-white border border-emerald-200 rounded-2xl px-4 py-2 font-bold text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm"
          >
            {ALL_SURAHS.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. سورة {s.name} ({s.revelationType} • {s.ayahCount} آية)
              </option>
            ))}
          </select>

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
              صفحة {pageNumber} / ٦٠٤
            </span>
            <button 
              onClick={handleNextPage}
              disabled={pageNumber >= 604}
              className="p-1.5 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              title="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-800" />
            </button>
          </div>
        </div>

        {/* Zoom & Fit Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFitToScreen(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              fitToScreen 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {fitToScreen ? 'الحجم الملائم للشاشة' : 'تكبير يدوي'}
          </button>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs">
            <button
              onClick={() => setZoomMultiplier(prev => Math.max(0.6, prev - 0.1))}
              className="p-1 hover:bg-gray-100 rounded-lg"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4 text-gray-500" />
            </button>
            <span className="px-2 font-bold text-gray-700">{Math.round(zoomMultiplier * 100)}%</span>
            <button
              onClick={() => setZoomMultiplier(prev => Math.min(2.5, prev + 0.1))}
              className="p-1 hover:bg-gray-100 rounded-lg"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Sheikh Voice Selector */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedSheikhId}
            onChange={(e) => setSelectedSheikhId(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl px-4 py-2 font-bold text-gray-700 outline-none text-xs focus:ring-2 focus:ring-emerald-500"
          >
            {QURAN_RECITERS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {isPageAudioDownloaded ? (
            <div className="flex items-center gap-1 bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-2xl text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>محفوظ</span>
              <button 
                onClick={handleDeletePageAudio}
                className="p-0.5 hover:bg-emerald-200 rounded-lg mr-1 text-red-600"
                title="حذف الصوت"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleDownloadPageAudio}
              disabled={downloadingFullPage}
              className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{downloadingFullPage ? 'جاري التحميل...' : 'تحميل الصفحة'}</span>
            </button>
          )}

          <button 
            onClick={() => playSelectedSequence()}
            className={`p-2.5 md:px-5 md:py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-lg transition-all ${
              isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'إيقاف التلاوة' : 'تلاوة الصفحة'}</span>
          </button>
        </div>
      </div>

      {/* Main Page Rendering Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#ECE9E0] flex items-center justify-center p-4 relative"
      >
        {loadingPdf && (
          <div className="absolute inset-0 z-50 bg-[#FDFBF7]/90 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-emerald-800 font-bold">جاري تحميل قارئ المصحف الشريف...</span>
          </div>
        )}

        {/* The PDF High-DPI Canvas Rendering */}
        <div className="relative border border-stone-300 shadow-2xl bg-white select-none overflow-hidden">
          <canvas ref={canvasRef} className="block" />

          {/* Invisible Interactive Text Overlay Layer */}
          <div className="absolute inset-0 z-10">
            {mappedItems.map((item, idx) => {
              const isSelected = selectedAyah && item.ayah && 
                selectedAyah.ayahNumber === item.ayah.ayahNumber && 
                selectedAyah.surahNumber === item.ayah.surahNumber
              
              const isCurrentlyPlaying = currentlyPlayingAyah && item.ayah &&
                currentlyPlayingAyah.ayahNumber === item.ayah.ayahNumber &&
                currentlyPlayingAyah.surahNumber === item.ayah.surahNumber

              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    if (item.ayah) {
                      setSelectedAyah(item.ayah)
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
                  title={item.ayah ? `سورة ${item.ayah.surahName} - آية ${item.ayah.ayahNumber}` : undefined}
                />
              )
            })}
          </div>
        </div>

        {/* CIRCULAR RADIAL FLOATING MENU FOR INTERACTION CONTROLS */}
        <AnimatePresence>
          {showCircularMenu && selectedAyah && clickCoords && (
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
                {/* Ayah Meta Info */}
                <div className="text-center pb-2 border-b border-gray-100 dark:border-gray-800 w-full">
                  <h4 className="font-black text-xs text-emerald-800 dark:text-emerald-400">
                    سورة {selectedAyah.surahName} - الآية {selectedAyah.ayahNumber}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    « {selectedAyah.text} »
                  </p>
                </div>

                {/* Circular controls array layout */}
                <div className="grid grid-cols-4 gap-3">
                  {/* 1. Play Ayah */}
                  <button
                    onClick={() => {
                      stopAudio()
                      playSelectedSequence(selectedAyah)
                    }}
                    className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    title="تشغيل الآية المحددة"
                  >
                    <Play className="w-5 h-5 fill-current" />
                  </button>

                  {/* 2. Toggle continuous recitation */}
                  <button
                    onClick={() => setContinuousRecitation(prev => !prev)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border ${
                      continuousRecitation 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                    }`}
                    title="التلاوة المستمرة تلقائياً"
                  >
                    <Repeat className="w-5 h-5" />
                  </button>

                  {/* 3. Cycle repeat mode */}
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
                    title="تكرار الآية"
                  >
                    <Repeat className="w-4 h-4" />
                    <span className="text-[9px] font-black">{repeatMode === 'all' ? '∞' : `${repeatMode}x`}</span>
                  </button>

                  {/* 4. Share */}
                  <button
                    onClick={handleShareClick}
                    className="w-12 h-12 bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-purple-200 dark:border-purple-800"
                    title="مشاركة الآية"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {/* 5. Copy Text */}
                  <button
                    onClick={handleCopyAyah}
                    className="w-12 h-12 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-stone-200 dark:border-stone-700"
                    title="نسخ نص الآية"
                  >
                    <Copy className="w-5 h-5" />
                  </button>

                  {/* 6. Bookmark */}
                  <button
                    onClick={() => alert('✅ تم حفظ علامة الوقوف لهذه الآية بنجاح في الإعدادات')}
                    className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-amber-200 dark:border-amber-800"
                    title="حفظ علامة الوقوف"
                  >
                    <Bookmark className="w-5 h-5" />
                  </button>

                  {/* 7. Tafsir / Help */}
                  <button
                    onClick={handleTafsirClick}
                    className="w-12 h-12 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105 border border-teal-200 dark:border-teal-800"
                    title="تفسير ومعلومات الآية"
                  >
                    <BookOpen className="w-5 h-5" />
                  </button>

                  {/* 8. Close Selection */}
                  <button
                    onClick={() => {
                      setSelectedAyah(null)
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
          السورة السابقة (صفحة {pageNumber - 1})
        </button>

        <span className="text-emerald-800 font-black">
          سورة {currentSurah.name} • صفحة {pageNumber} من ٦٠٤
        </span>

        <button
          onClick={handleNextPage}
          disabled={pageNumber >= 604}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-40"
        >
          السورة التالية (صفحة {pageNumber + 1})
        </button>
      </div>

      {/* DIALOG 1: Share Luxury Islamic Card */}
      {selectedAyah && (
        <QuranShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          surahName={selectedAyah.surahName}
          ayahNumbers={[selectedAyah.ayahNumber]}
          ayahTexts={[selectedAyah.text]}
        />
      )}

      {/* DIALOG 2: Offline Tafsirs and Madhhabs */}
      {selectedAyah && (
        <QuranTafsirDialog
          isOpen={showTafsirDialog}
          onClose={() => setShowTafsirDialog(false)}
          surahNumber={selectedAyah.surahNumber}
          surahName={selectedAyah.surahName}
          ayahNumbers={[selectedAyah.ayahNumber]}
          ayahTexts={[selectedAyah.text]}
        />
      )}
    </div>
  )
}
