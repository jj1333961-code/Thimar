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
import { auth, googleProvider, setGoogleAccessToken } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Special Admin Logic
    if (formData.identifier === 'thimar' && formData.password === '0101') {
      localStorage.setItem('thimar_auth_token', 'admin_local_bypass_token')
      setTimeout(() => {
        router.push('/admin')
        setLoading(false)
      }, 1000)
      return
    }

    try {
      // Use Firebase Client Auth
      const userCredential = await signInWithEmailAndPassword(auth, formData.identifier, formData.password)
      const user = userCredential.user
      const idToken = await user.getIdToken()
      
      // Save token
      localStorage.setItem('thimar_auth_token', idToken)

      // Fetch profile to redirect correctly
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      const userData = userDoc.exists() ? userDoc.data() : { role: 'student' }
      
      router.push(`/${userData.role || 'student'}`)
    } catch (err: any) {
      console.error('Login Error:', err)
      setError(err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' 
        ? 'بيانات الدخول غير صحيحة' 
        : 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      let result
      try {
        result = await signInWithPopup(auth, googleProvider)
      } catch (popupErr: any) {
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          // Inside WebView/Capacitor or restricted popup environments, use redirect
          await signInWithRedirect(auth, googleProvider)
          return
        }
        throw popupErr
      }
      const user = result.user
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const accessToken = credential?.accessToken || null
      
      if (accessToken) {
        setGoogleAccessToken(accessToken)
      }

      const idToken = await user.getIdToken()
      
      // Save token for app-core.js and other legacy scripts
      localStorage.setItem('thimar_auth_token', idToken)

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // New user from Google - redirect to role selection or create basic profile
        // For this demo, let's create a student profile if they don't exist
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
        // Update last login
        await setDoc(doc(db, 'users', user.uid), { lastLogin: serverTimestamp() }, { merge: true })
        
        // Redirect based on role
        router.push(`/${userData.role}`)
      }
    } catch (err: any) {
      console.error('Google Login Error:', err)
      setError('فشل تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.')
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
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 uppercase">أو عبر</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <Globe className="w-5 h-5 text-red-500" /> جوجل
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5 text-blue-600" /> فيسبوك
            </button>
          </div>

          <p className="mt-8 text-center text-gray-500">
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
