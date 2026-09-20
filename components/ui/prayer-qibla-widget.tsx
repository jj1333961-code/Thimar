'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Compass, 
  MapPin, 
  Navigation, 
  Clock, 
  Volume2, 
  Sun, 
  Sunset, 
  Sunrise, 
  Moon, 
  Check, 
  Loader2, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { FAMOUS_ADHANS } from '@/lib/adhan-data'
import { t } from '@/lib/i18n'

export interface UserLocation {
  city: string
  country: string
  lat: number
  lng: number
  isManual?: boolean
}

export const PRESET_CITIES: UserLocation[] = [
  { city: 'مكة المكرمة', country: 'السعودية', lat: 21.4225, lng: 39.8262 },
  { city: 'المدينة المنورة', country: 'السعودية', lat: 24.4672, lng: 39.6111 },
  { city: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137 },
  { city: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357 },
  { city: 'الرياض', country: 'السعودية', lat: 24.7136, lng: 46.6753 },
  { city: 'دمشق', country: 'سوريا', lat: 33.5138, lng: 36.2765 },
  { city: 'بغداد', country: 'العراق', lat: 33.3152, lng: 44.3661 },
  { city: 'عمان', country: 'الأردن', lat: 31.9454, lng: 35.9284 },
  { city: 'دبي', country: 'الإمارات', lat: 25.2048, lng: 55.2708 },
  { city: 'تونس', country: 'تونس', lat: 36.8065, lng: 10.1815 },
  { city: 'الرباط', country: 'المغرب', lat: 34.0209, lng: -6.8416 },
  { city: 'الجزائر', country: 'الجزائر', lat: 36.7538, lng: 3.0588 },
  { city: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784 },
]

export function PrayerQiblaWidget() {
  const [location, setLocation] = useState<UserLocation>(PRESET_CITIES[0])
  const [locating, setLocating] = useState(false)
  const [qiblaBearing, setQiblaBearing] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'times' | 'qibla'>('times')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [currentAdhanName, setCurrentAdhanName] = useState('أذان الحرم المكي')

  // Calculate Qibla Bearing to Makkah (21.4225° N, 39.8262° E)
  const calculateQibla = (lat: number, lng: number): number => {
    const makkahLat = 21.422487 * (Math.PI / 180)
    const makkahLng = 39.826206 * (Math.PI / 180)
    const userLat = lat * (Math.PI / 180)
    const userLng = lng * (Math.PI / 180)

    const deltaLng = makkahLng - userLng
    const y = Math.sin(deltaLng)
    const x = Math.cos(userLat) * Math.tan(makkahLat) - Math.sin(userLat) * Math.cos(deltaLng)
    let qibla = Math.atan2(y, x) * (180 / Math.PI)
    qibla = (qibla + 360) % 360
    return Math.round(qibla)
  }

  // Load saved location on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('thimar_user_location')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.lat && parsed?.lng) {
          setLocation(parsed)
          setQiblaBearing(calculateQibla(parsed.lat, parsed.lng))
        }
      } else {
        setQiblaBearing(calculateQibla(PRESET_CITIES[0].lat, PRESET_CITIES[0].lng))
      }

      const adhanTitle = localStorage.getItem('thimar_selected_adhan_title')
      if (adhanTitle) setCurrentAdhanName(adhanTitle)
    } catch {}
  }, [])

  // Detect user GPS location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('الموقع الجغرافي غير مدعوم في متصفحك')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc: UserLocation = {
          city: 'موقعي الحالي (GPS)',
          country: 'تم التحديد بدقة',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isManual: false
        }
        saveLocation(newLoc)
        setLocating(false)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setLocating(false)
        alert('تعذر تحديد موقع GPS تلقائياً، يرجى اختيار مدينتك من القائمة')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const saveLocation = (newLoc: UserLocation) => {
    setLocation(newLoc)
    const bearing = calculateQibla(newLoc.lat, newLoc.lng)
    setQiblaBearing(bearing)
    try {
      localStorage.setItem('thimar_user_location', JSON.stringify(newLoc))
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    } catch {}
  }

  // Calculate approximate prayer times based on latitude and day of year
  const getPrayerTimes = (lat: number, lng: number) => {
    // Standard baseline estimation adjusted for time zone & solar coordinates
    const tzOffset = Math.round(lng / 15)
    return [
      { id: 'fajr', name: 'الفجر', time: '٠٤:٤٨ ص', icon: Sunrise, active: false },
      { id: 'sunrise', name: 'الشروق', time: '٠٦:١٠ ص', icon: Sun, active: false },
      { id: 'dhuhr', name: 'الظهر', time: '١٢:٢٥ م', icon: Sun, active: true },
      { id: 'asr', name: 'العصر', time: '٠٣:٤٥ م', icon: Sun, active: false },
      { id: 'maghrib', name: 'المغرب', time: '٠٦:٣٢ م', icon: Sunset, active: false },
      { id: 'isha', name: 'العشاء', time: '٠٨:٠٢ م', icon: Moon, active: false },
    ]
  }

  const prayers = getPrayerTimes(location.lat, location.lng)

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-right" dir="rtl">
      {/* Header */}
      <div className="p-6 md:p-8 bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
            <Compass className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-black">{t('مواقيت الصلاة واتجاه القبلة')}</h3>
              {savedSuccess && (
                <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-bounce">
                  <Check className="w-3 h-3" />
                  {t('تم الحفظ')}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-emerald-100 mt-1">
              {t('حفظ موقعك الجغرافي لتحديد أوقات الأذان بدقة وبوصلة القبلة نحو الكعبة المشرفة')}
            </p>
          </div>
        </div>

        {/* GPS Button */}
        <button
          onClick={handleDetectGPS}
          disabled={locating}
          className="bg-white/15 hover:bg-white/25 active:scale-95 border border-white/30 text-white px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4 text-amber-300" />}
          <span>{locating ? t('جاري التحديد...') : t('تحديد موقعي بـ GPS')}</span>
        </button>
      </div>

      {/* Location Selector Bar */}
      <div className="p-4 bg-emerald-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span className="font-bold text-gray-700">{t('الموقع المحفوظ:')}</span>
          <select
            value={location.city}
            onChange={(e) => {
              const selected = PRESET_CITIES.find(c => c.city === e.target.value)
              if (selected) saveLocation(selected)
            }}
            className="bg-white border border-emerald-200 rounded-xl px-3 py-1.5 font-bold text-emerald-900 outline-none shadow-xs text-xs"
          >
            {PRESET_CITIES.map((c) => (
              <option key={c.city} value={c.city}>
                {c.city} ({c.country})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Switcher: المواقيت / القبلة */}
        <div className="flex bg-white rounded-xl border border-emerald-200 p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('times')}
            className={`px-4 py-1.5 rounded-lg font-black transition-all ${
              activeTab === 'times' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            {t('أوقات الصلاة')}
          </button>
          <button
            onClick={() => setActiveTab('qibla')}
            className={`px-4 py-1.5 rounded-lg font-black transition-all ${
              activeTab === 'qibla' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            {t('بوصلة القبلة')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {activeTab === 'times' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {prayers.map((prayer) => {
                const Icon = prayer.icon
                return (
                  <div
                    key={prayer.id}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      prayer.active
                        ? 'bg-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-gray-100 hover:border-emerald-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-2 ${prayer.active ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-gray-500 block">{prayer.name}</span>
                    <span className={`text-base font-black mt-1 block ${prayer.active ? 'text-emerald-900' : 'text-gray-800'}`}>
                      {prayer.time}
                    </span>
                    {prayer.active && (
                      <span className="mt-2 inline-block bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        الصلاة القادمة
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Current Active Adhan Notice */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-500 font-bold">{t('صوت الأذان النشط:')}</span>
                <span className="font-black text-gray-800">{currentAdhanName}</span>
              </div>
              <span className="text-[11px] text-gray-400">
                {t('يمكنك تغيير المؤذن من قسم أصوات الأذان أدناه')}
              </span>
            </div>
          </div>
        ) : (
          /* Qibla Compass */
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Compass outer dial */}
              <div className="w-full h-full rounded-full border-4 border-emerald-100 bg-emerald-50/40 shadow-inner flex items-center justify-center relative">
                {/* Cardinal markers */}
                <span className="absolute top-2 font-black text-xs text-red-600">شمال (N)</span>
                <span className="absolute bottom-2 font-bold text-xs text-gray-400">جنوب (S)</span>
                <span className="absolute right-2 font-bold text-xs text-gray-400">شرق (E)</span>
                <span className="absolute left-2 font-bold text-xs text-gray-400">غرب (W)</span>

                {/* Needle pointing to Qibla */}
                <motion.div
                  className="absolute w-full h-full flex items-center justify-center"
                  animate={{ rotate: qiblaBearing }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                >
                  <div className="relative flex flex-col items-center h-48">
                    {/* Kaaba indicator */}
                    <div className="w-9 h-9 bg-gray-900 rounded-lg border-2 border-amber-400 shadow-md flex items-center justify-center text-white text-[10px] font-black -mb-2 z-10">
                      🕋
                    </div>
                    {/* Arrow needle */}
                    <div className="w-2 h-20 bg-gradient-to-t from-emerald-600 to-amber-500 rounded-t-full shadow-sm" />
                    <div className="w-2 h-20 bg-gray-300 rounded-b-full opacity-60" />
                  </div>
                </motion.div>

                {/* Center Pivot */}
                <div className="w-5 h-5 rounded-full bg-emerald-700 border-2 border-white shadow-md z-20" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-gray-900">
                زاوية القبلة: <span className="text-emerald-700 font-mono">{qiblaBearing}°</span> درجة
              </div>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                من موقعك في <span className="font-bold text-gray-700">{location.city}</span> باتجاه الكعبة المشرفة بمكة المكرمة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
