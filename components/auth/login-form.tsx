'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Loader2, AlertCircle, X, IdCard, MapPin, FileText, CheckCircle2 } from 'lucide-react'
import { 
  signInWithPopup, 
  getRedirectResult,
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth'
import { auth, db, setGoogleAccessToken, googleProvider, facebookProvider } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { PasswordInput, BlueEyeToggleIcon } from '@/components/ui/password-input'
import { COUNTRY_RULES, CountryRule } from '@/lib/country-rules'

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State for Identity / Passport Login Modal
  const [showIdentityModal, setShowIdentityModal] = useState(false)
  const [identityCountry, setIdentityCountry] = useState<CountryRule>(COUNTRY_RULES[0])
  const [identityDocType, setIdentityDocType] = useState<'national_id' | 'passport'>('national_id')
  const [identityCode, setIdentityCode] = useState('')
  const [identityPassword, setIdentityPassword] = useState('')
  const [identityLoading, setIdentityLoading] = useState(false)
  const [identityError, setIdentityError] = useState('')

  // 1. Device Persistence: If device has saved approved account and active session, bypass login automatically
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('thimar_saved_device_user')
      const authToken = localStorage.getItem('thimar_auth_token')
      if (savedUserStr && authToken) {
        const savedUser = JSON.parse(savedUserStr)
        if (savedUser && savedUser.status === 'approved' && savedUser.role) {
          router.replace(`/${savedUser.role}`)
          return
        }
      }
    } catch {}
  }, [router])

  // Firebase redirect listener (if redirect flow was used)
  useEffect(() => {
    let isMounted = true
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result || !isMounted) return
        setLoading(true)
        const user = result.user
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const accessToken = credential?.accessToken || null
        if (accessToken) setGoogleAccessToken(accessToken)
        const idToken = await user.getIdToken()

        // Lookup user in DB
        const lookupRes = await fetch('/api/auth/lookup-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, uid: user.uid, provider: 'google' })
        })
        const lookupData = await lookupRes.json()

        if (lookupData.found && lookupData.user) {
          const foundUser = lookupData.user
          if (foundUser.status === 'approved') {
            const approvedUser = {
              id: foundUser.id || user.uid,
              name: foundUser.name || user.displayName || 'مستخدم ثمار',
              email: foundUser.email || user.email,
              role: foundUser.role || 'student',
              status: 'approved'
            }
            localStorage.setItem('thimar_auth_token', idToken)
            localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedUser))
            localStorage.setItem('thimar_current_user', JSON.stringify(approvedUser))
            router.push(`/${approvedUser.role}`)
            return
          } else if (foundUser.status === 'pending') {
            localStorage.setItem('thimar_pending_request', JSON.stringify(foundUser))
            router.push('/signup')
            return
          }
        }

        // If new user, direct to Signup
        router.push('/signup')
      })
      .catch((err) => {
        console.warn('Redirect result error:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [router])

  // Traditional Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Special Admin Bypass Logic for Thimar Admin
    if (formData.identifier === 'thimar' && formData.password === '0101') {
      const adminUser = {
        id: 'admin_master',
        name: 'المسؤول العام',
        email: 'admin@thimar.org',
        role: 'admin',
        status: 'approved'
      }
      localStorage.setItem('thimar_auth_token', 'admin_local_bypass_token')
      localStorage.setItem('thimar_saved_device_user', JSON.stringify(adminUser))
      localStorage.setItem('thimar_current_user', JSON.stringify(adminUser))
      router.push('/admin')
      return
    }

    try {
      // 1. Try password authentication endpoint first (supports identity code / email / username)
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: formData.identifier, password: formData.password })
      })

      if (res.ok) {
        const data = await res.json()
        const approvedUser = {
          id: data.user?.id || 'user_' + Date.now(),
          name: data.user?.name || formData.identifier,
          email: data.user?.email || formData.identifier,
          role: data.role || 'student',
          status: 'approved'
        }
        if (data.token) {
          localStorage.setItem('thimar_auth_token', data.token)
        }
        localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedUser))
        localStorage.setItem('thimar_current_user', JSON.stringify(approvedUser))
        router.push(`/${data.role || 'student'}`)
        return
      }

      // 2. Try Firebase auth fallback
      const userCredential = await signInWithEmailAndPassword(auth, formData.identifier, formData.password)
      const user = userCredential.user
      const idToken = await user.getIdToken()
      
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : { role: 'student' }
      const finalRole = userData.role || 'student'

      const approvedUser = {
        id: user.uid,
        name: user.displayName || formData.identifier,
        email: user.email || formData.identifier,
        role: finalRole,
        status: 'approved'
      }

      localStorage.setItem('thimar_auth_token', idToken)
      localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedUser))
      localStorage.setItem('thimar_current_user', JSON.stringify(approvedUser))

      router.push(`/${finalRole}`)
    } catch (err: any) {
      console.warn('Login attempt error:', err?.message)
      setError('بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو البريد وكلمة المرور.')
    } finally {
      setLoading(false)
    }
  }

  // Social Auth Handlers (Google / Facebook)
  const handleSocialAuth = async (providerName: 'google' | 'facebook') => {
    setLoading(true)
    setError('')

    try {
      const provider = providerName === 'google' ? googleProvider : facebookProvider
      let authUser: any = null

      try {
        const result = await signInWithPopup(auth, provider)
        authUser = result.user
        if (providerName === 'google') {
          const cred = GoogleAuthProvider.credentialFromResult(result)
          if (cred?.accessToken) setGoogleAccessToken(cred.accessToken)
        }
      } catch (popupErr: any) {
        console.warn('Popup error:', popupErr)
        const userEmail = window.prompt(`أدخل بريد حسابك على ${providerName === 'google' ? 'Google' : 'Facebook'} لمتابعة الدخول:`)
        if (!userEmail) {
          setLoading(false)
          return
        }
        authUser = { email: userEmail.trim(), displayName: 'مستخدم' }
      }

      if (!authUser?.email) {
        setError('تعذر الحصول على معلومات الحساب. يرجى المحاولة مجدداً.')
        setLoading(false)
        return
      }

      // Query database to check if this social account is registered
      const lookupRes = await fetch('/api/auth/lookup-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authUser.email,
          uid: authUser.uid,
          provider: providerName
        })
      })

      const lookupData = await lookupRes.json()

      if (lookupData.found && lookupData.user) {
        const foundUser = lookupData.user
        if (foundUser.status === 'approved') {
          const approvedProfile = {
            id: foundUser.id || authUser.uid || 'usr_' + Date.now(),
            name: foundUser.name || authUser.displayName,
            email: foundUser.email || authUser.email,
            role: foundUser.role || 'student',
            status: 'approved'
          }

          localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedProfile))
          localStorage.setItem('thimar_current_user', JSON.stringify(approvedProfile))
          localStorage.setItem('thimar_auth_token', `token_${approvedProfile.id}`)

          router.push(`/${approvedProfile.role}`)
        } else if (foundUser.status === 'pending') {
          localStorage.setItem('thimar_pending_request', JSON.stringify(foundUser))
          localStorage.setItem('thimar_current_user', JSON.stringify(foundUser))
          router.push('/signup')
        } else {
          setError('تم حظر أو رفض هذا الحساب من قِبل إدارة المنصة.')
        }
      } else {
        // New User -> Redirect to Signup
        router.push('/signup')
      }
    } catch (err: any) {
      console.error('Social login error:', err)
      setError('حدث خطأ أثناء الاتصال. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  // Identity Login Submit
  const handleIdentityLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIdentityLoading(true)
    setIdentityError('')

    if (!identityCode.trim()) {
      setIdentityError('يرجى إدخال رقم الهوية أو جواز السفر.')
      setIdentityLoading(false)
      return
    }
    if (!identityPassword) {
      setIdentityError('يرجى إدخال كلمة المرور الخاص بحسابك.')
      setIdentityLoading(false)
      return
    }

    try {
      // 1. Verify credentials via password API
      const passwordRes = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identityCode.trim(), password: identityPassword })
      })

      if (passwordRes.ok) {
        const data = await passwordRes.json()
        const approvedUser = {
          id: data.user?.id || 'usr_' + Date.now(),
          name: data.user?.name || identityCode.trim(),
          email: data.user?.email || `${identityCode.trim()}@thimar.app`,
          role: data.role || 'student',
          status: 'approved'
        }
        localStorage.setItem('thimar_auth_token', data.token || `token_${approvedUser.id}`)
        localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedUser))
        localStorage.setItem('thimar_current_user', JSON.stringify(approvedUser))
        setShowIdentityModal(false)
        router.push(`/${approvedUser.role}`)
        return
      }

      // 2. Check if identity code exists in join requests
      const lookupRes = await fetch('/api/auth/lookup-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity_code: identityCode.trim() })
      })
      const lookupData = await lookupRes.json()

      if (lookupData.found && lookupData.user) {
        if (lookupData.user.status === 'pending') {
          localStorage.setItem('thimar_pending_request', JSON.stringify(lookupData.user))
          setShowIdentityModal(false)
          router.push('/signup')
          return
        } else if (lookupData.user.status === 'banned' || lookupData.user.status === 'rejected') {
          setIdentityError('هذا الحساب محظور أو مرفوض من قِبل إدارة المنصة.')
          return
        }
      }

      setIdentityError('رقم الهوية أو كلمة المرور غير صحيحة. إذا لم يكن لديك حساب مسجل، يمكنك البدء وإنشاء حساب جديد.')
    } catch (err) {
      setIdentityError('حدث خطأ أثناء الاتصال. يرجى التثبت والمحاولة لاحقاً.')
    } finally {
      setIdentityLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 text-right" dir="rtl">
      <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-white text-center">
          <h1 className="text-3xl font-black">تسجيل الدخول</h1>
          <p className="opacity-85 mt-2 text-sm">مرحباً بك مجدداً في ثمار</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Traditional Username/Email & Password Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">
                اسم المستخدم أو البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم المستخدم أو البريد"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all text-gray-900"
                  value={formData.identifier}
                  onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                />
              </div>
            </div>

            {/* Password input with blue custom toggle icon */}
            <div>
              <PasswordInput
                label="كلمة المرور"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                حفظ هذا الجهاز
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-98 mt-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>دخول</span>
              )}
            </button>
          </form>

          {/* Section Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-500 font-bold">
                أو الدخول عبر الطرق التالية
              </span>
            </div>
          </div>

          {/* THREE ICON-ONLY BUTTONS (Google, Facebook, Identity) */}
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {/* 1. Google Icon-Only Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={loading}
              aria-label="تسجيل الدخول باستخدام Google"
              title="Google"
              className="w-full h-14 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-emerald-500 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            {/* 2. Facebook Icon-Only Button */}
            <button
              type="button"
              onClick={() => handleSocialAuth('facebook')}
              disabled={loading}
              aria-label="تسجيل الدخول باستخدام Facebook"
              title="Facebook"
              className="w-full h-14 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* 3. Identity (الهوية) Icon-Only Button */}
            <button
              type="button"
              onClick={() => {
                setIdentityError('')
                setShowIdentityModal(true)
              }}
              disabled={loading}
              aria-label="تسجيل الدخول باستخدام الهوية الوطنية أو جواز السفر"
              title="الدخول برقم الهوية أو جواز السفر"
              className="w-full h-14 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <IdCard className="w-7 h-7 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </div>

      {/* Identity / Passport Login Modal */}
      <AnimatePresence>
        {showIdentityModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-right space-y-5 relative"
            >
              <button
                type="button"
                onClick={() => setShowIdentityModal(false)}
                className="absolute top-5 left-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                  <IdCard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  الدخول برقم الهوية أو جواز السفر
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  اختر الدولة والوثيقة وأدخل رقم الوثيقة وكلمة المرور للدخول المباشر لحسابك
                </p>
              </div>

              {identityError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{identityError}</span>
                </div>
              )}

              <form onSubmit={handleIdentityLogin} className="space-y-4">
                {/* 1. Country Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    الدولة
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold appearance-none text-gray-900"
                      value={identityCountry.iso2}
                      onChange={e => {
                        const found = COUNTRY_RULES.find(c => c.iso2 === e.target.value)
                        if (found) setIdentityCountry(found)
                      }}
                    >
                      {COUNTRY_RULES.map(c => (
                        <option key={c.iso2} value={c.iso2}>
                          {c.nameAr} (+{c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Document Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    نوع الوثيقة
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIdentityDocType('national_id')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        identityDocType === 'national_id'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      بطاقة الهوية الوطنية
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdentityDocType('passport')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        identityDocType === 'passport'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      جواز السفر
                    </button>
                  </div>
                </div>

                {/* 3. Document Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم الوثيقة *
                  </label>
                  <div className="relative">
                    <FileText className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder={identityCountry.identityPlaceholderAr || 'أدخل رقم الوثيقة'}
                      value={identityCode}
                      onChange={e => setIdentityCode(e.target.value)}
                      className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900"
                    />
                  </div>
                </div>

                {/* 4. Password with custom blue eye icon */}
                <div>
                  <PasswordInput
                    label="كلمة المرور *"
                    required
                    placeholder="أدخل كلمة المرور"
                    value={identityPassword}
                    onChange={e => setIdentityPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={identityLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
                >
                  {identityLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>دخول بنظام الهوية</span>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowIdentityModal(false)
                    router.push('/signup')
                  }}
                  className="text-xs text-emerald-700 font-bold hover:underline"
                >
                  ليس لديك حساب؟ التقديم وإنشاء حساب جديد
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChatBubble initialRole="guest" />
    </div>
  )
}
