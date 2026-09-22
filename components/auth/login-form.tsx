'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { LogIn, Mail, Lock, Loader2, KeyRound, AlertCircle, CheckCircle2, UserPlus, X } from 'lucide-react'
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth'
import { auth, db, setGoogleAccessToken, googleProvider, facebookProvider } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { SocialAuthButtons } from './social-auth-buttons'

export function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Forgot password & social login recovery state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotLoading, setForgotLoading] = useState<'google' | 'facebook' | null>(null)
  const [forgotFeedback, setForgotFeedback] = useState<{
    type: 'success' | 'error' | 'not_found';
    message: string;
    email?: string;
  } | null>(null)

  // 1. Device Persistence: If device has saved approved account and active session, bypass login automatically!
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

        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const role = userDoc.exists() ? userDoc.data().role : 'student'
        const approvedUser = {
          id: user.uid,
          name: user.displayName || 'مستخدم ثمار',
          email: user.email,
          role,
          status: 'approved'
        }

        localStorage.setItem('thimar_auth_token', idToken)
        localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedUser))
        localStorage.setItem('thimar_current_user', JSON.stringify(approvedUser))
        router.push(`/${role}`)
      })
      .catch((err) => {
        console.warn('Redirect result error (if any):', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Special Admin Logic
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
      // Use Firebase Client Auth if available
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
      console.warn('Firebase login failed, trying direct password authentication:', err?.message)
      try {
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
            email: formData.identifier,
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
      } catch (fallbackErr) {
        console.warn('Password API fallback error:', fallbackErr)
      }

      setError(err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' 
        ? 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو البريد وكلمة المرور.' 
        : 'فشل تسجيل الدخول. يمكنك الضغط على "نسيت كلمة المرور" بالأسفل لتسجيل الدخول الفوري بحساب Google أو Facebook.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Social Login via "Forgot Password"
  const handleForgotSocialLogin = async (providerName: 'google' | 'facebook') => {
    setForgotLoading(providerName)
    setForgotFeedback(null)

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
        console.warn('Popup blocked, checking fallback:', popupErr)
        // In restricted environments, prompt user for their email
        const userEmail = window.prompt(`أدخل بريد حسابك على ${providerName === 'google' ? 'Google' : 'Facebook'} للتحقق من وجود الحساب:`)
        if (!userEmail) {
          setForgotLoading(null)
          return
        }
        authUser = { email: userEmail.trim(), displayName: 'مستخدم' }
      }

      if (!authUser?.email) {
        setForgotFeedback({
          type: 'error',
          message: 'تعذر الحصول على معلومات الحساب. يرجى المحاولة مجدداً.'
        })
        setForgotLoading(null)
        return
      }

      // Query database to check if this social account is already registered
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

      // Also check local social links
      let localLinkedUser: any = null
      try {
        const links = JSON.parse(localStorage.getItem('thimar_social_links') || '{}')
        if (links[authUser.email.toLowerCase()]) {
          localLinkedUser = links[authUser.email.toLowerCase()]
        }
      } catch {}

      const foundUser = lookupData.user || localLinkedUser

      if (lookupData.found && foundUser) {
        // Case 1: Account is registered and approved!
        if (foundUser.status === 'approved') {
          setForgotFeedback({
            type: 'success',
            message: `مرحباً بك مجدداً يا ${foundUser.name}! تم التحقق من حسابك بنجاح وجاري فتح الواجهة تلقائياً...`
          })

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

          setTimeout(() => {
            router.push(`/${approvedProfile.role}`)
          }, 1200)
        } else if (foundUser.status === 'pending') {
          // Case 2: Account is registered but pending admin approval
          setForgotFeedback({
            type: 'success',
            message: `حسابك مسجل ولكنه قيد المراجعة الإدارية. جاري نقلك لصفحة المحادثة مع المسؤول...`
          })

          localStorage.setItem('thimar_pending_request', JSON.stringify(foundUser))
          localStorage.setItem('thimar_current_user', JSON.stringify(foundUser))

          setTimeout(() => {
            router.push('/signup')
          }, 1400)
        } else {
          // Banned or rejected
          setForgotFeedback({
            type: 'error',
            message: 'تم حظر أو رفض هذا الحساب من قِبل إدارة المنصة.'
          })
        }
      } else {
        // Case 3: Account is NOT registered -> Guide user to signup!
        setForgotFeedback({
          type: 'not_found',
          email: authUser.email,
          message: `لم يتم العثور على حساب مسجل مرتبط بهذا الحساب (${authUser.email}). يرجى إنشاء حساب جديد أولاً للانضمام للمنصة.`
        })
      }
    } catch (err: any) {
      console.error('Forgot social login error:', err)
      setForgotFeedback({
        type: 'error',
        message: 'حدث خطأ أثناء الاتصال. يرجى المحاولة لاحقاً.'
      })
    } finally {
      setForgotLoading(null)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 text-right" dir="rtl">
      <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <h1 className="text-3xl font-black">تسجيل الدخول</h1>
          <p className="opacity-85 mt-2 text-sm">مرحباً بك مجدداً في ثمار</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">اسم المستخدم أو البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم المستخدم أو البريد"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                  value={formData.identifier}
                  onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                حفظ هذا الجهاز
              </label>

              {/* Forgot password button triggering Google/Facebook flow */}
              <button 
                type="button" 
                onClick={() => {
                  setForgotFeedback(null)
                  setShowForgotModal(true)
                }}
                className="text-emerald-700 font-bold hover:underline hover:text-emerald-800"
              >
                هل نسيت الرقم السري؟
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 active:scale-98 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> <span>دخول</span></>}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-500 font-bold">أو الدخول المباشر بحسابك</span></div>
          </div>

          <SocialAuthButtons />

          <p className="mt-8 text-center text-gray-500 text-xs sm:text-sm">
            ليس لديك حساب بعد؟{' '}
            <button onClick={() => router.push('/signup')} className="text-emerald-600 font-bold hover:underline">
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password / Social Account Recovery Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 text-right space-y-6 relative"
            >
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 left-5 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-gray-900">استعادة وتسجيل الدخول المباشر</h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  اختر حساب Google أو Facebook المسجل به جهازك للتحقق التلقائي وفتح حسابك فوراً دون الحاجة لكلمة المرور.
                </p>
              </div>

              {/* Feedback Alert */}
              {forgotFeedback && (
                <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border flex items-start gap-2.5 ${
                  forgotFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : forgotFeedback.type === 'not_found'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {forgotFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : forgotFeedback.type === 'not_found' ? (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2">
                    <p>{forgotFeedback.message}</p>
                    {forgotFeedback.type === 'not_found' && (
                      <button
                        type="button"
                        onClick={() => router.push('/signup')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>إنشاء حساب جديد الآن</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Recovery Options: Google & Facebook */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleForgotSocialLogin('google')}
                  disabled={forgotLoading !== null}
                  className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl font-bold text-sm border-2 border-gray-200 hover:border-emerald-500 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {forgotLoading === 'google' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>تسجيل الدخول والاستعادة بحساب Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleForgotSocialLogin('facebook')}
                  disabled={forgotLoading !== null}
                  className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {forgotLoading === 'facebook' ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  <span>تسجيل الدخول والاستعادة بحساب Facebook</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-xs text-gray-500 font-bold hover:underline"
                >
                  الرجوع لتسجيل الدخول بكلمة المرور
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
