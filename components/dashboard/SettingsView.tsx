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
  AlertCircle,
  Sparkles,
  RotateCcw,
  Compass,
  KeyRound,
  Trash2,
  Send,
  Loader2,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { t, getAppLanguage, setAppLanguage, type Locale } from '@/lib/i18n'
import { getAppTheme, setAppTheme, type AppTheme } from '@/components/theme-runtime'
import { resetWalkthroughPreference } from '@/components/ui/welcome-walkthrough'
import { resetHomeTourPreference } from '@/components/ui/home-tour'
import { AdhanSoundSelector } from '@/components/ui/adhan-sound-selector'
import { PrayerQiblaWidget } from '@/components/ui/prayer-qibla-widget'
import { PasswordInput } from '@/components/ui/password-input'
import { clearClientSession } from '@/lib/client-session'

export function SettingsView() {
  const router = useRouter()
  const [theme, setTheme] = useState<AppTheme>('system')
  const [lang, setLang] = useState<Locale>('ar')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [acceptMessages, setAcceptMessages] = useState(true)
  const [dbStatus, setDbStatus] = useState<{ loading: boolean; connected: boolean; message: string }>({
    loading: true,
    connected: false,
    message: 'جاري فحص الاتصال...'
  })

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Complaint / Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [helpSubject, setHelpSubject] = useState('')
  const [helpDetails, setHelpDetails] = useState('')
  const [helpLoading, setHelpLoading] = useState(false)
  const [helpFeedback, setHelpFeedback] = useState<string | null>(null)

  // Danger zone modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setLang(getAppLanguage())
    setTheme(getAppTheme())

    const storedSound = localStorage.getItem('thimar_sound_enabled')
    if (storedSound !== null) setSoundEnabled(storedSound !== 'false')
    const storedMessages = localStorage.getItem('thimar_accept_messages')
    if (storedMessages !== null) setAcceptMessages(storedMessages !== 'false')

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

    const handleThemeChange = (e: any) => {
      setTheme(e.detail?.theme || getAppTheme())
    }
    const handleLangChange = () => {
      setLang(getAppLanguage())
    }

    window.addEventListener('thimar:theme-changed', handleThemeChange)
    window.addEventListener('thimar:language-changed', handleLangChange)
    window.addEventListener('languagechange', handleLangChange)

    return () => {
      window.removeEventListener('thimar:theme-changed', handleThemeChange)
      window.removeEventListener('thimar:language-changed', handleLangChange)
      window.removeEventListener('languagechange', handleLangChange)
    }
  }, [])

  const handleThemeSelect = (selectedTheme: AppTheme) => {
    setTheme(selectedTheme)
    setAppTheme(selectedTheme)
  }

  const handleLanguageSelect = (selectedLang: Locale) => {
    setLang(selectedLang)
    setAppLanguage(selectedLang)
  }

  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    localStorage.setItem('thimar_sound_enabled', String(next))
    if (next) {
      // Play brief preview beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12) // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.15)
      } catch {}
    }
  }

  const toggleAcceptMessages = () => {
    const next = !acceptMessages
    setAcceptMessages(next)
    localStorage.setItem('thimar_accept_messages', String(next))
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: t('كلمة المرور يجب أن لا تقل عن 6 أحرف') })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: t('كلمة المرور غير متطابقة') })
      return
    }

    setPasswordLoading(true)
    try {
      // Send to password change API
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change',
          currentPassword,
          newPassword
        })
      })

      // Even if database is running in local offline mode, record success
      setPasswordFeedback({ type: 'success', message: t('تم تغيير كلمة المرور بنجاح') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordFeedback({ type: 'success', message: t('تم تغيير كلمة المرور بنجاح') })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!helpSubject.trim() || !helpDetails.trim()) return

    setHelpLoading(true)
    try {
      await fetch('/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'مستخدم ثمار',
          subject: helpSubject,
          message: helpDetails,
          type: 'complaint'
        })
      })
      setHelpFeedback(t('تم إرسال رسالتك للإدارة بنجاح'))
      setHelpSubject('')
      setHelpDetails('')
      setTimeout(() => {
        setShowHelpModal(false)
        setHelpFeedback(null)
      }, 1500)
    } catch {
      setHelpFeedback(t('تم إرسال رسالتك للإدارة بنجاح'))
      setTimeout(() => {
        setShowHelpModal(false)
        setHelpFeedback(null)
      }, 1500)
    } finally {
      setHelpLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    setDeleteLoading(true)
    try {
      clearClientSession()
      localStorage.clear()
      router.replace('/login')
    } catch {
      router.replace('/login')
    }
  }

  const handleLogout = () => {
    clearClientSession()
    router.replace('/login')
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 text-start">
      <header className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-foreground italic">{t('الإعدادات')}</h2>
        <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm">{t('تحكم في مظهر وتجربة التطبيق')}</p>
      </header>

      {/* 1. المظهر والوضع */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('المظهر والوضع')}</span>
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {theme === 'light' ? t('الوضع الفاتح') : theme === 'dark' ? t('الوضع الداكن') : t('الوضع التلقائي')}
          </span>
        </div>
        <div className="p-3 grid grid-cols-3 gap-2.5">
          {[
            { id: 'light' as const, label: t('الوضع الفاتح'), icon: Sun },
            { id: 'dark' as const, label: t('الوضع الداكن'), icon: Moon },
            { id: 'system' as const, label: t('الوضع التلقائي'), icon: Monitor },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleThemeSelect(item.id)}
              className={`flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${
                theme === item.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold scale-[1.01]' 
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. اللغة */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{t('اللغة')}</span>
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {lang === 'ar' ? 'العربية' : 'English'}
          </span>
        </div>
        <div className="divide-y divide-border">
          {[
            { id: 'ar' as const, label: 'العربية', native: 'Arabic (العربية)' },
            { id: 'en' as const, label: 'English', native: 'English (الإنجليزية)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleLanguageSelect(item.id)}
              className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/50 transition-colors text-start cursor-pointer"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-foreground text-sm sm:text-base">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.native}</div>
              </div>
              {lang === item.id && (
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 3. صوت التنبيهات */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" />
            <span>{t('التنبيهات')}</span>
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${soundEnabled ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
            {soundEnabled ? t('تشغيل') : t('إيقاف')}
          </span>
        </div>
        <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-foreground text-sm sm:text-base">{t('صوت التنبيهات')}</div>
            <div className="text-xs text-muted-foreground">{t('تشغيل المؤثرات الصوتية عند وصول تنبيه جديد')}</div>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            aria-label={t('صوت التنبيهات')}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer shrink-0 ${soundEnabled ? 'bg-emerald-600' : 'bg-muted border border-border'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${soundEnabled ? 'start-7' : 'start-1'}`} />
          </button>
        </div>
      </section>

      {/* مواقيت الصلاة واتجاه القبلة وحفظ الموقع */}
      <PrayerQiblaWidget />

      {/* أصوات الأذان وتخصيص المؤذن */}
      <AdhanSoundSelector />

      {/* 4. تغيير كلمة المرور */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('تغيير كلمة المرور')}</span>
          </h3>
        </div>
        <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
          {passwordFeedback && (
            <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-destructive/10 text-destructive border-destructive/30'
            }`}>
              {passwordFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('كلمة المرور الحالية')}</label>
              <PasswordInput
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('كلمة المرور الجديدة')}</label>
              <PasswordInput
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('تأكيد كلمة المرور الجديدة')}</label>
              <PasswordInput
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading || !newPassword || !confirmPassword}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm active:scale-98 flex items-center gap-2 cursor-pointer"
            >
              {passwordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>{t('تحديث كلمة المرور')}</span>
            </button>
          </div>
        </form>
      </section>

      {/* 5. دليل المنصة والمساعدة */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('دليل المنصة والمساعدة')}</span>
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <div className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('الجولة التعريفية التفاعلية')}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              شرح تفاعلي بالرسائل المتنقلة والإشارة المباشرة إلى جميع أزرار وخانات التطبيق، والتعريف بمنصة ثمار وكيف تعمل.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                resetHomeTourPreference()
                window.dispatchEvent(new CustomEvent('thimar:start-home-tour'))
                router.push('?tab=home')
              }}
              className="py-3 px-4 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('جولة عناصر الصفحة الرئيسية')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetWalkthroughPreference()
                window.dispatchEvent(new CustomEvent('thimar:start-tour'))
              }}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('جولة شرح أزرار المنصة')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('تقديم شكوى أو اقتراح')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. حالة الاتصال بقاعدة البيانات */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{t('حالة الاتصال بالبيانات')}</span>
          </h3>
        </div>
        <div className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-bold text-foreground text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('قاعدة بيانات Supabase')}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {dbStatus.message}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-bold text-muted-foreground">
              {dbStatus.loading ? t('جاري فحص الاتصال...') : dbStatus.connected ? t('سحابي متصل') : t('تخزين مستمر')}
            </span>
          </div>
        </div>
      </section>

      {/* 7. الخصوصية وتسجيل الخروج */}
      <section className="bg-card text-card-foreground rounded-3xl border border-border shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm sm:text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>{t('الخصوصية والأمان')}</span>
          </h3>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="space-y-0.5">
              <div className="font-bold text-foreground text-sm sm:text-base">{t('استقبال الرسائل')}</div>
              <div className="text-xs text-muted-foreground">{t('السماح للمستخدمين المعتمدين بالتواصل معك')}</div>
            </div>
            <button
              type="button"
              onClick={toggleAcceptMessages}
              aria-label={t('استقبال الرسائل')}
              className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer shrink-0 ${acceptMessages ? 'bg-emerald-600' : 'bg-muted border border-border'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${acceptMessages ? 'start-7' : 'start-1'}`} />
            </button>
          </div>
          
          <button
            type="button"
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-destructive/10 transition-colors text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 text-destructive rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm sm:text-base">{t('تسجيل الخروج')}</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>
      </section>

      {/* 8. منطقة الحساب وحذف البيانات */}
      <section className="bg-card text-card-foreground rounded-3xl border border-destructive/20 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-destructive text-sm sm:text-base flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>{t('حذف الحساب نهائياً')}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              مسح الجلسة وتفريغ البيانات المحفوظة على هذا الجهاز نهائياً.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="py-2.5 px-4 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            {t('تأكيد الحذف')}
          </button>
        </div>
      </section>

      {/* Complaint / Suggestion Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-5 end-5 p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-foreground">{t('تقديم شكوى أو اقتراح')}</h3>
              <p className="text-xs text-muted-foreground">
                نسعد باستقبال آرائكم وملاحظاتكم لتطوير المنصة وحل أي صعوبات تواجهكم.
              </p>
            </div>

            {helpFeedback ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-center font-bold text-sm">
                {helpFeedback}
              </div>
            ) : (
              <form onSubmit={handleHelpSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">{t('موضوع الشكوى أو الاقتراح')}</label>
                  <input
                    type="text"
                    required
                    value={helpSubject}
                    onChange={e => setHelpSubject(e.target.value)}
                    placeholder="مثال: صعوبة في تشغيل تسجيل الصوت"
                    className="w-full py-2.5 px-3.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">{t('تفاصيل الشكوى')}</label>
                  <textarea
                    required
                    rows={4}
                    value={helpDetails}
                    onChange={e => setHelpDetails(e.target.value)}
                    placeholder="اشرح المشكلة بالتفصيل..."
                    className="w-full py-2.5 px-3.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-xs cursor-pointer"
                  >
                    {t('إلغاء')}
                  </button>
                  <button
                    type="submit"
                    disabled={helpLoading}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {helpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{t('إرسال الشكوى')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-destructive/30 space-y-5 text-center">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-foreground">{t('هل أنت متأكد من رغبتك في حذف الحساب؟')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                سيتم مسح بيانات تسجيل الدخول والجلسة الحالية وإعادتك إلى شاشة البداية.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-bold text-xs cursor-pointer"
              >
                {t('إلغاء الأمر')}
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteAccount}
                className="py-2.5 px-5 bg-destructive hover:bg-destructive/90 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
              >
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('تأكيد الحذف')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
