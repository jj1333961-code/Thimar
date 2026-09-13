'use client'

import { useState } from 'react'
import { auth, googleProvider, setGoogleAccessToken } from '@/lib/firebase'
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function SocialAuthButtons() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'apple') => {
    setLoading(providerName)
    setError('')
    
    let provider
    if (providerName === 'google') {
      provider = googleProvider
    } else if (providerName === 'facebook') {
      provider = new FacebookAuthProvider()
    } else if (providerName === 'apple') {
      provider = new OAuthProvider('apple.com')
    } else {
      return
    }

    try {
      let result
      try {
        result = await signInWithPopup(auth, provider)
      } catch (popupErr: any) {
        if (
          popupErr.code === 'auth/popup-blocked' ||
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          await signInWithRedirect(auth, provider)
          return
        }
        throw popupErr
      }

      const user = result.user
      
      if (providerName === 'google') {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        if (credential?.accessToken) setGoogleAccessToken(credential.accessToken)
      }

      const idToken = await user.getIdToken()
      localStorage.setItem('thimar_auth_token', idToken)

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // New user - default to student role
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
    } catch (err: any) {
      console.error(`${providerName} Login Error:`, err)
      setError(`فشل تسجيل الدخول عبر ${providerName === 'google' ? 'جوجل' : providerName === 'facebook' ? 'فيسبوك' : 'آبل'}.`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4 w-full">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs text-center">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-3">
        {/* Google Button */}
        <button
          onClick={() => handleSocialLogin('google')}
          disabled={!!loading}
          className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {loading === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>المتابعة باستخدام Google</span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={() => handleSocialLogin('facebook')}
          disabled={!!loading}
          className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-[#1877F2] text-white rounded-2xl font-bold hover:bg-[#166fe5] transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {loading === 'facebook' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span>المتابعة باستخدام Facebook</span>
        </button>

        {/* Apple Button */}
        <button
          onClick={() => handleSocialLogin('apple')}
          disabled={!!loading}
          className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {loading === 'apple' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05 1.79-3.48 1.79-1.42 0-1.88-.88-3.48-.88s-2.12.86-3.48.86c-1.43 0-2.61-1.07-3.55-2.43-1.93-2.77-2.91-7.22-1.02-10.45.94-1.6 2.58-2.61 4.38-2.61 1.38 0 2.45.85 3.32.85s2.11-.98 3.7-.84c1.67.14 2.96.76 3.84 2.05-3.15 1.85-2.64 6.13.48 7.39-.77 1.86-1.81 3.51-2.81 4.27zM14.93 4.66c-.84 1.02-2.21 1.73-3.52 1.63-.16-1.28.46-2.63 1.25-3.55.84-.98 2.29-1.74 3.48-1.74.16 1.34-.37 2.64-1.21 3.66z" />
            </svg>
          )}
          <span>المتابعة باستخدام Apple</span>
        </button>
      </div>
    </div>
  )
}
