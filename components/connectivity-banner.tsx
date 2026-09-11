'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

type StatusType = 'online' | 'offline' | null

export function ConnectivityBanner() {
  const [status, setStatus] = useState<StatusType>(null)
  const [visible, setVisible] = useState<boolean>(false)
  const [isEn, setIsEn] = useState<boolean>(false)

  useEffect(() => {
    const checkLang = () => setIsEn(localStorage.getItem('lang') === 'en')
    checkLang()
    window.addEventListener('languagechange', checkLang)

    // Register Service Worker for PWA offline capabilities
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    }

    let hideTimer: NodeJS.Timeout | null = null

    const showToast = (type: 'online' | 'offline') => {
      setStatus(type)
      setVisible(true)
      if (hideTimer) clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        setVisible(false)
      }, 4500)
    }

    const handleOnline = () => showToast('online')
    const handleOffline = () => showToast('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial state
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      showToast('offline')
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('languagechange', checkLang)
    }
  }, [])

  if (!visible || !status) return null

  const isOnline = status === 'online'

  return (
    <div
      role="status"
      aria-live="polite"
      id="connectivity-top-banner"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999999] flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none max-w-[92vw] border ${
        isOnline
          ? 'bg-emerald-700/95 border-emerald-500/40 shadow-emerald-900/30'
          : 'bg-amber-600/95 border-amber-400/40 shadow-amber-950/30'
      }`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <span className="flex-shrink-0">
        {isOnline ? <Wifi className="w-4 h-4 text-emerald-100 animate-pulse" /> : <WifiOff className="w-4 h-4 text-amber-100" />}
      </span>
      <span className="tracking-tight text-white">
        {isOnline
          ? isEn
            ? 'Connected to Internet — You are now online'
            : 'تم الاتصال بالإنترنت — المتصفح متصل الآن'
          : isEn
            ? 'Internet disconnected — Working in offline mode'
            : 'انقطع الاتصال بالإنترنت — تعمل المنصة بالوضع غير المتصل (أوفلاين)'}
      </span>
    </div>
  )
}
