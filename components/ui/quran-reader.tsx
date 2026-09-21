'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Search, 
  Headphones, 
  BookOpen,
  Volume2, 
  Download, 
  Share2, 
  Sparkles,
  FileText,
  X,
  RotateCcw,
  Repeat,
  Layers,
  CheckCircle2,
  Bookmark,
  WifiOff,
  Maximize2
} from 'lucide-react'
import { ALL_SURAHS, QURAN_RECITERS, getAyahAudioUrl, type SurahMeta, type QuranReciter, type AyahItem } from '@/lib/quran-surahs'
import { getSurahAyahs } from '@/lib/quran-cached-ayahs'
import { downloadAndCacheAsset, isAssetCached, getAssetPlayableUrl, saveOfflineData } from '@/lib/offline-storage'
import { QuranShareDialog } from './quran-share-dialog'
import { QuranTafsirDialog } from './quran-tafsir-dialog'
import { t } from '@/lib/i18n'

export function QuranReader() {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(1)
  const [selectedSheikhId, setSelectedSheikhId] = useState<string>('minshawi')
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive')
  const [fontSize, setFontSize] = useState<number>(34)
  
  // Ayahs & Content
  const [ayahs, setAyahs] = useState<AyahItem[]>([])
  const [loadingAyahs, setLoadingAyahs] = useState(false)
  
  // Selection state
  const [selectedAyahNumbers, setSelectedAyahNumbers] = useState<number[]>([])
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isLongPressTriggered = useRef(false)

  // Floating Bottom Card visibility
  const [showBottomCard, setShowBottomCard] = useState(false)
  const bottomCardRef = useRef<HTMLDivElement | null>(null)

  // Playback & Audio
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentlyPlayingAyah, setCurrentlyPlayingAyah] = useState<number | null>(null)
  const [repeatMode, setRepeatMode] = useState<'1' | '3' | '5' | 'all'>('1')
  const [repeatScope, setRepeatScope] = useState<'single' | 'paragraph'>('paragraph')
  const [repeatRemaining, setRepeatRemaining] = useState<number>(1)
  const [downloadingFullQuran, setDownloadingFullQuran] = useState(false)
  const [isFullQuranDownloaded, setIsFullQuranDownloaded] = useState(false)

  // Dialogs
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showTafsirDialog, setShowTafsirDialog] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentSurah = ALL_SURAHS.find(s => s.number === selectedSurahNumber) || ALL_SURAHS[0]
  const currentSheikh = QURAN_RECITERS.find(s => s.id === selectedSheikhId) || QURAN_RECITERS[0]

  // Load Ayahs when Surah changes
  useEffect(() => {
    let active = true
    async function load() {
      setLoadingAyahs(true)
      setSelectedAyahNumbers([])
      stopAudio()
      const data = await getSurahAyahs(selectedSurahNumber)
      if (active) {
        setAyahs(data)
        setLoadingAyahs(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [selectedSurahNumber])

  // Check if Sheikh's Surah is cached
  useEffect(() => {
    async function checkSheikhCache() {
      const key = `full_quran_${selectedSheikhId}_surah_${selectedSurahNumber}`
      const cached = await isAssetCached(key)
      setIsFullQuranDownloaded(cached)
    }
    checkSheikhCache()
  }, [selectedSheikhId, selectedSurahNumber])

  // Click outside to dismiss floating bottom card
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        bottomCardRef.current && 
        !bottomCardRef.current.contains(e.target as Node)
      ) {
        // Also don't dismiss if clicking interactive ayah button
        const target = e.target as HTMLElement
        if (!target.closest('.quran-interactive-ayah') && !target.closest('.quran-bottom-card-trigger')) {
          setShowBottomCard(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Long press handler for Ayahs
  const handleTouchStart = (ayahNum: number) => {
    isLongPressTriggered.current = false
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true
      toggleAyahSelection(ayahNum)
      setShowBottomCard(true)
    }, 280) // Quick and responsive long-press
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleAyahClick = (ayahNum: number) => {
    if (isLongPressTriggered.current) return

    // If we already have a selection active, clicking another Ayah toggles it in/out
    if (selectedAyahNumbers.length > 0) {
      toggleAyahSelection(ayahNum)
      setShowBottomCard(true)
    } else {
      // Just select this single ayah and show floating card
      setSelectedAyahNumbers([ayahNum])
      setShowBottomCard(true)
    }
  }

  const toggleAyahSelection = (ayahNum: number) => {
    setSelectedAyahNumbers(prev => {
      if (prev.includes(ayahNum)) {
        const next = prev.filter(n => n !== ayahNum)
        if (next.length === 0) setShowBottomCard(false)
        return next
      } else {
        return [...prev, ayahNum].sort((a, b) => a - b)
      }
    })
  }

  const clearSelection = () => {
    setSelectedAyahNumbers([])
    setShowBottomCard(false)
  }

  // Audio playback
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentlyPlayingAyah(null)
  }

  const playSelectedAyahs = async () => {
    if (isPlaying) {
      stopAudio()
      return
    }

    const targetAyahs = selectedAyahNumbers.length > 0 
      ? selectedAyahNumbers 
      : ayahs.map(a => a.number)

    if (targetAyahs.length === 0) return

    let currentIndex = 0
    const repeatsTotal = repeatMode === 'all' ? 999 : Number(repeatMode)
    let currentRepeat = repeatsTotal

    const playNext = async () => {
      if (currentIndex >= targetAyahs.length) {
        // Finished paragraph or block! Check repeat
        if (repeatScope === 'paragraph' && currentRepeat > 1) {
          currentRepeat--
          currentIndex = 0
          playNext()
          return
        }
        stopAudio()
        return
      }

      const ayahNum = targetAyahs[currentIndex]
      setCurrentlyPlayingAyah(ayahNum)

      const rawUrl = getAyahAudioUrl(currentSheikh.folder, selectedSurahNumber, ayahNum)
      const assetKey = `quran_audio_${currentSheikh.id}_${selectedSurahNumber}_${ayahNum}`

      // Check if cached offline
      let playable = rawUrl
      const cached = await isAssetCached(assetKey)
      if (cached) {
        const local = await getAssetPlayableUrl(assetKey, rawUrl)
        if (local) playable = local
      }

      const audio = new Audio(playable)
      audioRef.current = audio

      audio.onended = () => {
        if (repeatScope === 'single' && currentRepeat > 1) {
          currentRepeat--
          audio.currentTime = 0
          audio.play().catch(() => {})
          return
        }
        currentRepeat = repeatsTotal
        currentIndex++
        playNext()
      }

      audio.onerror = () => {
        // Fallback to next
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

  // Download entire Surah for this Sheikh
  const handleDownloadFullSurah = async () => {
    if (downloadingFullQuran) return
    setDownloadingFullQuran(true)

    try {
      for (const a of ayahs) {
        const rawUrl = getAyahAudioUrl(currentSheikh.folder, selectedSurahNumber, a.number)
        const assetKey = `quran_audio_${currentSheikh.id}_${selectedSurahNumber}_${a.number}`
        await downloadAndCacheAsset(assetKey, rawUrl, {
          title: `سورة ${currentSurah.name} - الآية ${a.number}`,
          category: 'quran',
          reciter: currentSheikh.name,
        })
      }
      setIsFullQuranDownloaded(true)
    } finally {
      setDownloadingFullQuran(false)
    }
  }

  // Get selected ayahs texts for dialogs
  const selectedTexts = ayahs
    .filter(a => selectedAyahNumbers.includes(a.number))
    .map(a => a.text)

  return (
    <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full relative" dir="rtl">
      {/* Reader Header */}
      <div className="p-4 md:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between bg-[#F7FAF8] gap-4">
        {/* Surah & Navigation Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <select 
            value={selectedSurahNumber}
            onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
            className="bg-white border border-emerald-200 rounded-2xl px-4 py-2 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm text-sm"
          >
            {ALL_SURAHS.map(s => (
              <option key={s.number} value={s.number}>
                {s.number}. سورة {s.name} ({s.revelationType} • {s.ayahCount} آية)
              </option>
            ))}
          </select>

          {/* Surah stepper */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm text-xs font-bold">
            <button 
              onClick={() => setSelectedSurahNumber(prev => Math.max(1, prev - 1))}
              disabled={selectedSurahNumber <= 1}
              className="p-1.5 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              title="السورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-2 text-emerald-800">
              صفحة {currentSurah.pageStart}
            </span>
            <button 
              onClick={() => setSelectedSurahNumber(prev => Math.min(114, prev + 1))}
              disabled={selectedSurahNumber >= 114}
              className="p-1.5 hover:bg-gray-100 rounded-xl disabled:opacity-30"
              title="السورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle: Interactive vs Uploaded PDF */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-2xl flex text-xs font-bold">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'interactive'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>المصحف التفاعلي</span>
            </button>

            <button
              onClick={() => setViewMode('pdf')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'pdf'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>نسخة المصحف المرفوعة (PDF)</span>
            </button>
          </div>
        </div>

        {/* Sheikh & Fast Play */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 shadow-sm text-xs">
            <Headphones className="w-4 h-4 text-emerald-600" />
            <select 
              value={selectedSheikhId}
              onChange={(e) => setSelectedSheikhId(e.target.value)}
              className="bg-transparent font-bold text-gray-700 outline-none text-xs"
            >
              {QURAN_RECITERS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={playSelectedAyahs}
            className={`p-2.5 md:px-4 md:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all ${
              isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            title={isPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span className="hidden md:inline">{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Uploaded Quran PDF View */}
      {viewMode === 'pdf' ? (
        <div className="flex-1 bg-gray-100 flex flex-col p-4">
          <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-2xl border border-gray-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-700">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>نسخة المصحف الشريف المرفوعة من النظام (/quran/quran.pdf)</span>
            </div>
            <a 
              href="/quran/quran.pdf" 
              target="_blank" 
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-emerald-700"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>فتح في نافذة كاملة</span>
            </a>
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-inner">
            <iframe
              src="/quran/quran.pdf"
              title="المصحف الشريف PDF"
              className="w-full h-full min-h-[600px] border-0"
            />
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: Interactive Quran Reader with Long Press Selection */
        <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[#FDFBF7] relative select-none">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Surah Header Card */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full mb-6 border border-emerald-100 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>سورة {currentSurah.name} ({currentSurah.revelationType} • {currentSurah.ayahCount} آية)</span>
              </div>
              
              {/* Bismillah (except At-Tawbah) */}
              {selectedSurahNumber !== 9 && (
                <div 
                  className="text-3xl md:text-5xl font-black text-emerald-950 pb-4" 
                  style={{ fontFamily: 'var(--font-amiri)' }}
                >
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}
            </div>

            {/* Ayahs Display */}
            {loadingAyahs ? (
              <div className="py-20 text-center text-emerald-700 font-bold animate-pulse text-sm">
                جاري تحميل آيات سورة {currentSurah.name}...
              </div>
            ) : (
              <div 
                className="leading-[4.2rem] md:leading-[5.2rem] text-justify text-gray-800"
                style={{ fontFamily: 'var(--font-amiri)', fontSize: `${fontSize}px` }}
              >
                {ayahs.map((ayah) => {
                  const isSelected = selectedAyahNumbers.includes(ayah.number)
                  const isCurrentlyPlaying = currentlyPlayingAyah === ayah.number

                  return (
                    <span
                      key={ayah.number}
                      onMouseDown={() => handleTouchStart(ayah.number)}
                      onMouseUp={handleTouchEnd}
                      onTouchStart={() => handleTouchStart(ayah.number)}
                      onTouchEnd={handleTouchEnd}
                      onClick={() => handleAyahClick(ayah.number)}
                      className={`quran-interactive-ayah inline cursor-pointer transition-all duration-200 px-1 py-0.5 rounded-2xl mx-0.5 ${
                        isSelected 
                          ? 'bg-white text-gray-950 font-black shadow-2xl ring-4 ring-black/15 border-2 border-gray-300 rounded-2xl px-2 py-1 mx-1 inline-block scale-[1.02]'
                          : isCurrentlyPlaying
                          ? 'bg-amber-100/70 text-amber-900 border border-amber-300 rounded-xl'
                          : 'hover:bg-emerald-50/60'
                      }`}
                    >
                      {ayah.text}{' '}
                      <span className={`inline-flex items-center justify-center min-w-[2.2rem] h-[2.2rem] rounded-full border text-base font-black mx-1 align-middle ${
                        isSelected 
                          ? 'border-2 border-emerald-700 bg-white text-emerald-950 shadow-md ring-2 ring-emerald-500' 
                          : 'border-emerald-200 text-emerald-700 bg-white/80'
                      }`}>
                        {ayah.number}
                      </span>{' '}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION TOOLBAR OVER SELECTED AYAHS (when ayahs are selected) */}
      <AnimatePresence>
        {selectedAyahNumbers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/95 text-white px-5 py-3 rounded-full shadow-2xl border border-emerald-500/40 backdrop-blur-md flex items-center gap-3 md:gap-4 text-xs font-bold"
          >
            <span className="text-amber-300 font-black pl-2 border-l border-white/20">
              {selectedAyahNumbers.length === 1 
                ? `آية ${selectedAyahNumbers[0]}` 
                : `${selectedAyahNumbers.length} آيات مختارة`}
            </span>

            {/* 1. علامة تفسير الآية */}
            <button
              type="button"
              onClick={() => setShowTafsirDialog(true)}
              className="p-2 hover:bg-white/15 rounded-full text-emerald-100 hover:text-white flex items-center gap-1.5 transition-colors"
              title="تفسير الآيات (اختر الشيخ أو المذهب وحمل محلياً)"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">التفسير</span>
            </button>

            {/* 2. علامة مشاركة الآية (صورة فاخرة بالاسم والوصف) */}
            <button
              type="button"
              onClick={() => setShowShareDialog(true)}
              className="p-2 hover:bg-white/15 rounded-full text-emerald-100 hover:text-white flex items-center gap-1.5 transition-colors"
              title="مشاركة بطاقة الآية بصورة فاخرة مع اسم المنصة"
            >
              <Share2 className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">مشاركة</span>
            </button>

            {/* 3. علامة تشغيل الصوت */}
            <button
              type="button"
              onClick={playSelectedAyahs}
              className="p-2 hover:bg-white/15 rounded-full text-emerald-100 hover:text-white flex items-center gap-1.5 transition-colors"
              title="تشغيل صوت الآيات المختارة مع التكرار"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-300 fill-current" /> : <Play className="w-4 h-4 text-emerald-300 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
            </button>

            {/* 4. علامة × لإلغاء التعليم أو المعاينة */}
            <button
              type="button"
              onClick={clearSelection}
              className="p-2 hover:bg-red-500/30 rounded-full text-red-200 hover:text-white transition-colors mr-1 border-r border-white/20 pr-3"
              title="إلغاء التحديد (×)"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BOTTOM CARD (البطاقة العائمة اسفل الصفحة قليلا بلون ازرق مائل الى الابيض) */}
      <AnimatePresence>
        {showBottomCard && (
          <motion.div
            ref={bottomCardRef}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-2.5rem)] max-w-2xl bg-[#F0F7FF]/95 text-slate-800 p-5 md:p-6 rounded-[2rem] shadow-2xl border border-sky-200 backdrop-blur-md"
            dir="rtl"
          >
            <div className="flex flex-col gap-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-sky-200/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-inner">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm md:text-base text-sky-950">
                        الشيخ: {currentSheikh.name}
                      </h4>
                      <span className="text-[10px] bg-sky-200/70 text-sky-900 px-2 py-0.5 rounded-full font-bold">
                        {currentSheikh.country}
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-700">
                      سورة {currentSurah.name} • {selectedAyahNumbers.length > 0 ? `${selectedAyahNumbers.length} آية محددة` : 'كامل السورة'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Close card button */}
                  <button
                    onClick={() => setShowBottomCard(false)}
                    className="p-1.5 text-sky-700 hover:text-sky-950 hover:bg-sky-200/50 rounded-lg transition-colors"
                    title="إغلاق البطاقة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Repetition & Scope Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* 1. Reciter Changer */}
                <div>
                  <label className="block text-[11px] font-bold text-sky-800 mb-1">القارئ:</label>
                  <select
                    value={selectedSheikhId}
                    onChange={(e) => setSelectedSheikhId(e.target.value)}
                    className="w-full bg-white border border-sky-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    {QURAN_RECITERS.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Repetition count */}
                <div>
                  <label className="block text-[11px] font-bold text-sky-800 mb-1">عدد التكرار:</label>
                  <select
                    value={repeatMode}
                    onChange={(e) => setRepeatMode(e.target.value as any)}
                    className="w-full bg-white border border-sky-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="1">تكرار مرة واحدة (١x)</option>
                    <option value="3">تكرار ٣ مرات (٣x)</option>
                    <option value="5">تكرار ٥ مرات (٥x)</option>
                    <option value="all">تكرار دائم (∞)</option>
                  </select>
                </div>

                {/* 3. Repetition scope: Single Ayah vs Full Paragraph */}
                <div>
                  <label className="block text-[11px] font-bold text-sky-800 mb-1">نظام التكرار:</label>
                  <div className="flex bg-white rounded-xl border border-sky-200 p-0.5">
                    <button
                      type="button"
                      onClick={() => setRepeatScope('single')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${
                        repeatScope === 'single' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      الآية الواحدة
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepeatScope('paragraph')}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${
                        repeatScope === 'paragraph' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      الفقرة دفعة واحدة
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Bottom Card */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sky-200/80">
                {/* Download full surah for this reciter */}
                <div className="flex items-center gap-2">
                  {isFullQuranDownloaded ? (
                    <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>صوت السورة محمل محلياً</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDownloadFullSurah}
                      disabled={downloadingFullQuran}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingFullQuran ? 'جاري التحميل...' : 'تحميل السورة لهذا الشيخ'}</span>
                    </button>
                  )}
                </div>

                {/* View Tafsir & Play Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTafsirDialog(true)}
                    className="px-4 py-1.5 rounded-xl bg-white border border-sky-300 text-sky-900 hover:bg-sky-100 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                    <span>عرض التفسير</span>
                  </button>

                  <button
                    type="button"
                    onClick={playSelectedAyahs}
                    className="px-5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-all"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'إيقاف التلاوة' : 'بدء التلاوة'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIALOG 1: Share Luxury Islamic Card */}
      <QuranShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        surahName={currentSurah.name}
        ayahNumbers={selectedAyahNumbers}
        ayahTexts={selectedTexts}
      />

      {/* DIALOG 2: Offline Tafsirs and Madhhabs */}
      <QuranTafsirDialog
        isOpen={showTafsirDialog}
        onClose={() => setShowTafsirDialog(false)}
        surahNumber={selectedSurahNumber}
        surahName={currentSurah.name}
        ayahNumbers={selectedAyahNumbers.length > 0 ? selectedAyahNumbers : [1]}
        ayahTexts={selectedTexts.length > 0 ? selectedTexts : [ayahs[0]?.text || '']}
      />
    </div>
  )
}
