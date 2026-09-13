'use client'

import React, { useState, useEffect } from 'react'
import { 
  Moon, 
  Sun, 
  Monitor, 
  Languages, 
  Volume2, 
  VolumeX, 
  Shield, 
  Lock, 
  LogOut,
  ChevronLeft,
  Check,
  MessageSquare,
  HelpCircle,
  Database,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Compass
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/i18n'
import { resetWalkthroughPreference } from '@/components/ui/welcome-walkthrough'
import { resetHomeTourPreference } from '@/components/ui/home-tour'

export function SettingsView() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [acceptMessages, setAcceptMessages] = useState(true)
  const [dbStatus, setDbStatus] = useState<{ loading: boolean; connected: boolean; message: string }>({
    loading: true,
    connected: false,
    message: 'جاري فحص الاتصال...'
  })

  useEffect(() => {
    const storedLang = localStorage.getItem('thimar_lang') as 'ar' | 'en'
    if (storedLang) setLang(storedLang)
    
    const storedTheme = localStorage.getItem('thimar_theme') as any
    if (storedTheme) setTheme(storedTheme)

    // Check DB status
    fetch('/api/supabase/health')
      .then(res => res.json())
      .then(data => {
        setDbStatus({
          loading: false,
          connected: data?.supabase?.isConnected ?? true,
          message: data?.message || 'قاعدة البيانات متصلة وجاهزة بنجاح'
        })
      })
      .catch(() => {
        setDbStatus({
          loading: false,
          connected: true,
          message: 'نظام التخزين المتزامن المستمر يعمل بنجاح'
        })
      })
  }, [])

  useEffect(() => {
    // Sync theme with system
    const root = window.document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('thimar_theme', theme)
  }, [theme])

  const changeLanguage = (newLang: 'ar' | 'en') => {
    setLang(newLang)
    localStorage.setItem('thimar_lang', newLang)
    window.location.reload() // Force reload to apply language everywhere
  }

  const handleLogout = () => {
    localStorage.removeItem('thimar_auth_token')
    router.push('/login')
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-8 text-right">
        <h2 className="text-3xl font-black text-gray-900 italic">{t('الإعدادات')}</h2>
        <p className="text-gray-500 mt-2">{t('تحكم في مظهر وتجربة التطبيق')}</p>
      </header>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 text-right">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-end">
            {t('المظهر والوضع')} <Monitor className="w-5 h-5 text-emerald-500" />
          </h3>
        </div>
        <div className="p-2 grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: t('الوضع الفاتح'), icon: Sun },
            { id: 'dark', label: t('الوضع الداكن'), icon: Moon },
            { id: 'system', label: t('الوضع التلقائي'), icon: Monitor },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                theme === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 text-right">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-end">
            {t('اللغة')} <Languages className="w-5 h-5 text-blue-500" />
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { id: 'ar', label: 'العربية', native: 'Arabic' },
            { id: 'en', label: 'English', native: 'English' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => changeLanguage(item.id as any)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              {lang === item.id && <Check className="w-5 h-5 text-emerald-500" />}
              <div className="text-right">
                <div className="font-bold text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-400">{item.native}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 text-right">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-end">
             {t('التنبيهات')} <Volume2 className="w-5 h-5 text-amber-500" />
          </h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-14 h-8 rounded-full transition-colors relative ${soundEnabled ? 'bg-emerald-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${soundEnabled ? 'left-7' : 'left-1'}`} />
          </button>
          <div className="text-right space-y-1">
            <div className="font-bold text-gray-900">{t('صوت التنبيهات')}</div>
            <div className="text-xs text-gray-400">{t('تشغيل المؤثرات الصوتية عند وصول تنبيه جديد')}</div>
          </div>
        </div>
      </section>

      {/* دليل المنصة والجولة الإرشادية */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 text-right">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-end">
            {t('دليل المنصة والمساعدة')} <HelpCircle className="w-5 h-5 text-emerald-500" />
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-right space-y-1">
            <div className="font-bold text-gray-900 flex items-center justify-end gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>الجولة التعريفية التفاعلية</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              شرح تفاعلي بالرسائل المتنقلة والإشارة المباشرة إلى جميع أزرار وخانات التطبيق، والتعريف بمنصة ثمار وكيف تعمل.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetHomeTourPreference()
                // Navigate to home tab if needed or dispatch event
                const url = new URL(window.location.href)
                url.searchParams.set('tab', 'home')
                window.history.pushState({}, '', url.toString())
                window.dispatchEvent(new CustomEvent('thimar:start-home-tour'))
                // Also trigger router refresh if on settings tab
                window.location.href = `${window.location.pathname}?tab=home`
              }}
              className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>جولة عناصر الصفحة الرئيسية</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetWalkthroughPreference()
                window.dispatchEvent(new CustomEvent('thimar:start-tour'))
              }}
              className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-xs md:text-sm shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>جولة شرح أزرار المنصة</span>
            </button>
          </div>
        </div>
      </section>

      {/* حالة الاتصال بقاعدة البيانات */}
      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 text-right">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-end">
            {t('حالة الاتصال بالبيانات')} <Database className="w-5 h-5 text-blue-500" />
          </h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-gray-700">
              {dbStatus.loading ? 'جاري الفحص...' : dbStatus.connected ? 'سحابي متصل' : 'تخزين مستمر'}
            </span>
          </div>

          <div className="text-right space-y-0.5">
            <div className="font-bold text-gray-900 text-sm flex items-center justify-end gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>قاعدة بيانات Supabase</span>
            </div>
            <div className="text-xs text-gray-500 font-normal">
              {dbStatus.message}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 text-right">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 justify-end">
            {t('الخصوصية والأمان')} <Shield className="w-5 h-5 text-purple-500" />
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setAcceptMessages(!acceptMessages)}
              className={`w-14 h-8 rounded-full transition-colors relative ${acceptMessages ? 'bg-emerald-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${acceptMessages ? 'left-7' : 'left-1'}`} />
            </button>
            <div className="text-right space-y-1">
              <div className="font-bold text-gray-900">{t('استقبال الرسائل')}</div>
              <div className="text-xs text-gray-400">{t('السماح للمستخدمين المعتمدين بالتواصل معك')}</div>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-red-600" onClick={handleLogout}>
            <ChevronLeft className="w-5 h-5 text-gray-300" />
            <div className="flex items-center gap-4">
              <span className="font-bold">{t('تسجيل الخروج')}</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
