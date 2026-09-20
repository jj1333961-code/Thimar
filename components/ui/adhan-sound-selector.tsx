'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Check, 
  CheckCircle2, 
  WifiOff, 
  Globe2, 
  Radio, 
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react'
import { FAMOUS_ADHANS, type AdhanVoice } from '@/lib/adhan-data'
import { downloadAndCacheAsset, isAssetCached, getAssetPlayableUrl } from '@/lib/offline-storage'
import { t } from '@/lib/i18n'

export function AdhanSoundSelector() {
  const [selectedId, setSelectedId] = useState<string>('adhan_makkah_mulla')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [cachedStatus, setCachedStatus] = useState<Record<string, boolean>>({
    adhan_makkah_mulla: true // Default is bundled locally
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Load saved adhan
    const saved = localStorage.getItem('thimar_selected_adhan_id') || 'adhan_makkah_mulla'
    setSelectedId(saved)

    // Check offline status for all
    async function checkCaches() {
      const statuses: Record<string, boolean> = { adhan_makkah_mulla: true }
      for (const adhan of FAMOUS_ADHANS) {
        if (adhan.id === 'adhan_makkah_mulla') continue
        const isCached = await isAssetCached(`adhan_${adhan.id}`)
        statuses[adhan.id] = isCached
      }
      setCachedStatus(statuses)
    }
    checkCaches()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleTogglePlay = async (adhan: AdhanVoice) => {
    if (playingId === adhan.id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlayingId(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }

    // Try offline cached audio URL first, or fallback to remote
    let playableUrl = adhan.url
    if (adhan.id !== 'adhan_makkah_mulla' && cachedStatus[adhan.id]) {
      const localUrl = await getAssetPlayableUrl(`adhan_${adhan.id}`, adhan.url)
      if (localUrl) playableUrl = localUrl
    }

    const audio = new Audio(playableUrl)
    audioRef.current = audio
    setPlayingId(adhan.id)

    audio.onended = () => setPlayingId(null)
    audio.onerror = () => {
      // If failed and not default, fallback to default
      if (playableUrl !== '/audio/adhan.mp3') {
        const fallback = new Audio('/audio/adhan.mp3')
        audioRef.current = fallback
        fallback.play().catch(() => {})
      }
    }

    try {
      await audio.play()
    } catch {
      setPlayingId(null)
    }
  }

  const handleDownload = async (adhan: AdhanVoice) => {
    if (downloadingId || adhan.id === 'adhan_makkah_mulla') return
    setDownloadingId(adhan.id)

    const success = await downloadAndCacheAsset(`adhan_${adhan.id}`, adhan.url, {
      title: adhan.title,
      category: 'adhan',
      reciter: adhan.reciter,
    })

    if (success) {
      setCachedStatus(prev => ({ ...prev, [adhan.id]: true }))
    }
    setDownloadingId(null)
  }

  const handleSelectAdhan = async (adhan: AdhanVoice) => {
    setSelectedId(adhan.id)
    localStorage.setItem('thimar_selected_adhan_id', adhan.id)

    let activeSrc = adhan.url
    if (adhan.id !== 'adhan_makkah_mulla' && cachedStatus[adhan.id]) {
      const localUrl = await getAssetPlayableUrl(`adhan_${adhan.id}`, adhan.url)
      if (localUrl) activeSrc = localUrl
    }

    localStorage.setItem('thimar_selected_adhan_src', activeSrc)
    localStorage.setItem('thimar_selected_adhan_title', adhan.title)
    localStorage.setItem('thimar_selected_adhan_reciter', adhan.reciter)

    window.dispatchEvent(new CustomEvent('thimar:adhan-voice-changed', {
      detail: { id: adhan.id, src: activeSrc, title: adhan.title }
    }))
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-700 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Radio className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-black">{t('أصوات الأذان في العالم الإسلامي')}</h3>
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {t('أصوات مشهورة')}
              </span>
            </div>
            <p className="text-xs md:text-sm text-emerald-100 mt-1">
              {t('اختر صوت الأذان المفضل مع إمكانية التحميل محلياً للعمل بدون إنترنت')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold border border-white/15">
          <WifiOff className="w-4 h-4 text-emerald-200" />
          <span>{t('كل صوت يتم تحميله يعمل بدون نت')}</span>
        </div>
      </div>

      {/* Voice List */}
      <div className="p-6 md:p-8 space-y-4">
        {FAMOUS_ADHANS.map((adhan) => {
          const isSelected = selectedId === adhan.id
          const isPlaying = playingId === adhan.id
          const isDownloading = downloadingId === adhan.id
          const isDownloaded = cachedStatus[adhan.id] || adhan.isDefault

          return (
            <motion.div
              key={adhan.id}
              layout
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isSelected 
                  ? 'bg-emerald-50/60 border-emerald-300 shadow-md ring-1 ring-emerald-300' 
                  : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-gray-50/50'
              }`}
            >
              {/* Voice Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="text-3xl p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  {adhan.flag}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-gray-900 text-base md:text-lg">
                      {adhan.title}
                    </h4>
                    {adhan.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-lg">
                        {t('الصوت التلقائي المدمج')}
                      </span>
                    )}
                    {isDownloaded && !adhan.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('محفوظ محلياً')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm font-bold text-gray-600">
                    {adhan.reciter} • <span className="text-gray-400 font-normal">{adhan.location}</span>
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {adhan.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                {/* Preview Button */}
                <button
                  type="button"
                  onClick={() => handleTogglePlay(adhan)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    isPlaying 
                      ? 'bg-amber-500 text-white hover:bg-amber-600 animate-pulse' 
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-800'
                  }`}
                  title={isPlaying ? t('إيقاف المعاينة') : t('استماع تجريبي')}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>{isPlaying ? t('إيقاف') : t('معاينة')}</span>
                </button>

                {/* Download Button (if not already local) */}
                {!isDownloaded ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(adhan)}
                    disabled={isDownloading}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    title="تحميل الصوت على الجهاز للعمل بدون إنترنت"
                  >
                    {isDownloading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloading ? t('جاري التحميل...') : t('تحميل للجهاز')}</span>
                  </button>
                ) : null}

                {/* Select / Active Button */}
                <button
                  type="button"
                  onClick={() => handleSelectAdhan(adhan)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-600 hover:text-white'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{isSelected ? t('الصوت الحالي') : t('اختيار هذا الأذان')}</span>
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
