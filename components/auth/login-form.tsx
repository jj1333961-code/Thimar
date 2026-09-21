'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { LogIn, Mail, Lock, Loader2, MessageCircle, HelpCircle, Globe, Share2 } from 'lucide-react'
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signInWithEmailAndPassword 
} from 'firebase/auth'
import { auth, db, setGoogleAccessToken } from '@/lib/firebase'
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

  useEffect(() => {
    let isMounted = true
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result || !isMounted) return
        setLoading(true)
        const user = result.user

        // Check if user is banned
        try {
          const bannedList: string[] = JSON.parse(localStorage.getItem('thimar_banned_users') || '[]')
          if (user.email && bannedList.some(b => b.toLowerCase() === user.email?.toLowerCase().trim())) {
            localStorage.removeItem('thimar_auth_token')
            setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة لمخالفة السياسات والشروط. لا يمكنك تسجيل الدخول.')
            return
          }
        } catch {}

        const credential = GoogleAuthProvider.credentialFromResult(result)
        const accessToken = credential?.accessToken || null
        if (accessToken) setGoogleAccessToken(accessToken)
        const idToken = await user.getIdToken()
        localStorage.setItem('thimar_auth_token', idToken)

        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName || 'مستخدم جديد',
            email: user.email,
            role: 'student',
            isApproved: true,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
          })
          router.push('/student')
        } else {
          const userData = userDoc.data()
          await setDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() }, { merge: true })
          router.push(`/${userData.role || 'student'}`)
        }
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

  const checkIsBanned = (ident?: string) => {
    if (!ident) return false
    try {
      const bannedList: string[] = JSON.parse(localStorage.getItem('thimar_banned_users') || '[]')
      const target = ident.toLowerCase().trim()
      return bannedList.some(b => b.toLowerCase() === target)
    } catch {
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if the entered identifier is in the banned users list
    if (checkIsBanned(formData.identifier)) {
      setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة لمخالفة السياسات والشروط. لا يمكنك تسجيل الدخول.')
      setLoading(false)
      return
    }

    // Special Admin Logic
    if (formData.identifier === 'thimar' && formData.password === '0101') {
      localStorage.setItem('thimar_auth_token', 'admin_local_bypass_token')
      router.push('/admin')
      return
    }

    try {
      // Use Firebase Client Auth if available
      const userCredential = await signInWithEmailAndPassword(auth, formData.identifier, formData.password)
      const user = userCredential.user

      // Check if user is banned by email
      if (checkIsBanned(user.email || '')) {
        localStorage.removeItem('thimar_auth_token')
        setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة لمخالفة السياسات والشروط. لا يمكنك تسجيل الدخول.')
        setLoading(false)
        return
      }

      const idToken = await user.getIdToken()
      
      // Save token
      localStorage.setItem('thimar_auth_token', idToken)

      // Fetch profile to redirect correctly
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : { role: 'student' }

      // Check if account status in Firestore is banned or matches banned list
      if (userData.status === 'banned' || userData.isBanned || checkIsBanned(userData.email)) {
        localStorage.removeItem('thimar_auth_token')
        setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة لمخالفة السياسات والشروط. لا يمكنك تسجيل الدخول.')
        setLoading(false)
        return
      }
      
      router.push(`/${userData.role || 'student'}`)
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
          if (data.status === 'banned' || data.isBanned || checkIsBanned(formData.identifier) || checkIsBanned(data.email)) {
            localStorage.removeItem('thimar_auth_token')
            setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة لمخالفة السياسات والشروط. لا يمكنك تسجيل الدخول.')
            setLoading(false)
            return
          }
          if (data.token) {
            localStorage.setItem('thimar_auth_token', data.token)
          }
          router.push(`/${data.role || 'admin'}`)
          return
        }
      } catch (fallbackErr) {
        console.warn('Password API fallback error:', fallbackErr)
      }

      setError(err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' 
        ? 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو البريد وكلمة المرور.' 
        : 'فشل تسجيل الدخول. يمكنك استخدام أزرار الدخول السريع بالأسفل أو التأكد من البيانات.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold">تسجيل الدخول</h1>
          <p className="opacity-80 mt-2">مرحباً بك مجدداً في ثمار</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المستخدم أو البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.identifier}
                  onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  required
                  placeholder="********"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                تذكرني
              </label>
              <button type="button" className="text-emerald-600 font-bold hover:underline">نسيت كلمة المرور؟</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><LogIn className="w-5 h-5" /> دخول</>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-bold">أو المتابعة السريعة عبر</span></div>
          </div>

          <SocialAuthButtons />

          {/* تجربة سريعة للمعاينة المباشرة */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-3 text-center">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className="text-gray-700">معاينة صفحات المنصة المطلوبة:</span>
              <button 
                type="button" 
                onClick={() => router.push('/signup')}
                className="text-emerald-600 hover:underline flex items-center gap-1 text-[11px] font-black"
              >
                <span>شاشة التسجيل ومحادثة المسؤول ←</span>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('thimar_auth_token', 'demo_student_token')
                  router.push('/student')
                }}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors"
              >
                دخول كطالب
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('thimar_auth_token', 'demo_parent_token')
                  router.push('/parent')
                }}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 transition-colors"
              >
                دخول كولي أمر
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('thimar_auth_token', 'admin_local_bypass_token')
                  router.push('/admin')
                }}
                className="p-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl border border-sky-200 transition-colors"
              >
                دخول كمسؤول
              </button>
            </div>

            {/* Direct Admin Inbox shortcut */}
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('thimar_auth_token', 'admin_local_bypass_token')
                router.push('/admin?tab=messages')
              }}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>معاينة بريد المسؤول ومحادثات وقرارات الحسابات مباشرة</span>
            </button>
          </div>

          <p className="mt-6 text-center text-gray-500 text-xs">
            ليس لديك حساب؟{' '}
            <button onClick={() => router.push('/signup')} className="text-emerald-600 font-bold hover:underline">
              إنشاء حساب جديد
            </button>
          </p>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
            <span className="font-semibold">استفسار أو مساعدة؟</span>
            <span className="text-gray-600">تحدث مع المساعد الذكي أو المسؤول عبر الزر الدائري في الأسفل ↙</span>
          </div>
        </div>
      </div>

      <AIChatBubble initialRole="guest" />
    </div>
  )
}
