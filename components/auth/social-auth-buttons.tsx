'use client'

import { useState } from 'react'
import { auth, googleProvider, setGoogleAccessToken, facebookProvider } from '@/lib/firebase'
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert, CheckCircle2, UserCheck, MessageSquare } from 'lucide-react'

interface SocialAuthButtonsProps {
  onNewUserCreated?: (userData: { name: string; email: string; provider: string; role: string }) => void
}

export function SocialAuthButtons({ onNewUserCreated }: SocialAuthButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showRoleSelectorFor, setShowRoleSelectorFor] = useState<{ user: any; provider: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'teacher'>('student')

  const checkIsBanned = (email?: string, id?: string) => {
    try {
      const bannedList = JSON.parse(localStorage.getItem('thimar_banned_users') || '[]')
      if (email && bannedList.includes(email.toLowerCase())) return true
      if (id && bannedList.includes(id)) return true
    } catch {}
    return false
  }

  const handleSocialLogin = async (providerName: 'google' | 'facebook' | 'whatsapp') => {
    setLoading(providerName)
    setError('')

    // WhatsApp flow
    if (providerName === 'whatsapp') {
      // Prompt user or simulate WhatsApp quick verified authentication
      const phone = window.prompt('يرجى إدخال رقم هاتفك مع كود الدولة المرتبط بواتساب (مثال: +201012345678):')
      if (!phone) {
        setLoading(null)
        return
      }

      if (checkIsBanned(phone)) {
        setError('تم حظر هذا الحساب من قبل إدارة المنصة.')
        setLoading(null)
        return
      }

      // Check linked accounts
      const linked = localStorage.getItem(`thimar_link_whatsapp_${phone}`)
      if (linked) {
        try {
          const profile = JSON.parse(linked)
          if (profile.isBanned) {
            setError('تم حظر هذا الحساب من قبل إدارة المنصة.')
            setLoading(null)
            return
          }
          localStorage.setItem('thimar_current_user', JSON.stringify(profile))
          router.push(`/${profile.role || 'student'}`)
          return
        } catch {}
      }

      // If new, offer role selection or register
      setShowRoleSelectorFor({
        user: { displayName: `مستخدم واتساب (${phone})`, email: `${phone}@whatsapp.thimar.app`, phone },
        provider: 'whatsapp'
      })
      setLoading(null)
      return
    }

    let provider: any
    if (providerName === 'google') {
      provider = googleProvider
    } else if (providerName === 'facebook') {
      provider = facebookProvider
      // Add Facebook App ID if available in env
      const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
      if (fbAppId) {
        provider.setCustomParameters({ 'display': 'popup' })
      }
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
        // Graceful fallback for mock or demo in environments where 3P cookies are restricted
        console.warn(`Popup auth fallback for ${providerName}:`, popupErr)
        // Check if there is already a linked mock account
        const fallbackEmail = `${providerName}_user@thimar.app`
        const linked = localStorage.getItem(`thimar_link_${providerName}`)
        if (linked) {
          const profile = JSON.parse(linked)
          if (profile.isBanned) {
            setError('تم حظر هذا الحساب من قبل إدارة المنصة.')
            setLoading(null)
            return
          }
          localStorage.setItem('thimar_current_user', JSON.stringify(profile))
          router.push(`/${profile.role || 'student'}`)
          return
        }
        setShowRoleSelectorFor({
          user: { displayName: `مستخدم ${providerName === 'google' ? 'جوجل' : 'فيسبوك'}`, email: fallbackEmail },
          provider: providerName
        })
        setLoading(null)
        return
      }

      const user = result.user

      if (checkIsBanned(user.email || '', user.uid)) {
        setError('تم حظر هذا الحساب من قبل إدارة المنصة.')
        setLoading(null)
        return
      }

      if (providerName === 'google') {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        if (credential?.accessToken) setGoogleAccessToken(credential.accessToken)
      }

      const idToken = await user.getIdToken()
      localStorage.setItem('thimar_auth_token', idToken)

      // Check linked user in Firestore or LocalStorage
      let userDocExists = false
      let userData: any = null

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          userDocExists = true
          userData = userDoc.data()
        }
      } catch {}

      // Fallback local check
      const localLinked = localStorage.getItem(`thimar_link_${user.uid}`) || localStorage.getItem(`thimar_link_${user.email}`)
      if (localLinked) {
        userDocExists = true
        userData = JSON.parse(localLinked)
      }

      if (userData?.isBanned || userData?.status === 'banned') {
        setError('تم حظر هذا الحساب من قبل إدارة المنصة.')
        setLoading(null)
        return
      }

      if (!userDocExists) {
        // Show role selection to link this account
        setShowRoleSelectorFor({ user, provider: providerName })
      } else {
        router.push(`/${userData.role || 'student'}`)
      }
    } catch (err: any) {
      console.error(`${providerName} Login Error:`, err)
      setError(`فشل تسجيل الدخول عبر ${providerName === 'google' ? 'جوجل' : providerName === 'facebook' ? 'فيسبوك' : 'واتساب'}.`)
    } finally {
      setLoading(null)
    }
  }

  const handleConfirmRoleAndLink = async () => {
    if (!showRoleSelectorFor) return
    const { user, provider } = showRoleSelectorFor
    setLoading('linking')

    const newUserData = {
      id: user.uid || `user_${Date.now()}`,
      name: user.displayName || `مستخدم ${provider}`,
      email: user.email,
      phone: user.phone || '',
      role: selectedRole,
      provider,
      identityCode: `TH-${selectedRole.toUpperCase().slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`,
      isApproved: false,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    try {
      // Save link locally so next login goes straight to this account
      localStorage.setItem(`thimar_link_${newUserData.id}`, JSON.stringify(newUserData))
      if (newUserData.email) {
        localStorage.setItem(`thimar_link_${newUserData.email}`, JSON.stringify(newUserData))
      }
      localStorage.setItem(`thimar_link_${provider}`, JSON.stringify(newUserData))
      localStorage.setItem('thimar_current_user', JSON.stringify(newUserData))

      // Try save to Firestore
      try {
        await setDoc(doc(db, 'users', newUserData.id), {
          ...newUserData,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        })
      } catch {}

      // Register join request in backend
      await fetch('/api/supabase/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserData.name,
          email: newUserData.email || `${newUserData.id}@thimar.app`,
          phone: newUserData.phone || '0000000000',
          role: selectedRole,
          country: 'السعودية',
          identity_code: newUserData.identityCode
        })
      }).catch(() => {})

      if (onNewUserCreated) {
        onNewUserCreated(newUserData)
      } else {
        // Route to login / dashboard
        router.push(`/${selectedRole}`)
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء ربط الحساب')
    } finally {
      setLoading(null)
      setShowRoleSelectorFor(null)
    }
  }

  return (
    <div className="space-y-4 w-full text-right" dir="rtl">
      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs text-center font-bold flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role selector popup when registering new social user */}
      {showRoleSelectorFor && (
        <div className="p-5 bg-emerald-50/90 rounded-3xl border border-emerald-200 space-y-4 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-emerald-950 text-base">ربط الحساب الجديد بالمنصة</h4>
            <p className="text-xs text-emerald-800 mt-1">
              مرحباً {showRoleSelectorFor.user?.displayName}، اختر صفتك بالمنصة لربط حسابك وبياناتك مباشرة:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            {[
              { id: 'student', label: 'طالب' },
              { id: 'parent', label: 'ولي أمر' },
              { id: 'teacher', label: 'معلم' },
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id as any)}
                className={`p-3 rounded-2xl border transition-all ${
                  selectedRole === r.id 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                    : 'bg-white text-gray-700 border-emerald-200 hover:bg-emerald-100/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleConfirmRoleAndLink}
            disabled={loading === 'linking'}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading === 'linking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>تأكيد ومتابعة الربط والتواصل مع الإدارة</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Google Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={!!loading}
          className="flex items-center justify-center gap-2.5 py-3 px-3.5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-xs"
          title="تسجيل الدخول وربط الحساب بواسطة جوجل"
        >
          {loading === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Google</span>
        </button>

        {/* 2. Facebook Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={!!loading}
          className="flex items-center justify-center gap-2.5 py-3 px-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-xs"
          title="تسجيل الدخول وربط الحساب بواسطة فيسبوك"
        >
          {loading === 'facebook' ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <svg className="w-4.5 h-4.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span>Facebook</span>
        </button>

        {/* 3. WhatsApp Button */}
        <button
          type="button"
          onClick={() => handleSocialLogin('whatsapp')}
          disabled={!!loading}
          className="flex items-center justify-center gap-2.5 py-3 px-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-2xl font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 text-xs"
          title="تسجيل الدخول وربط الحساب بواسطة واتساب"
        >
          {loading === 'whatsapp' ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <svg className="w-4.5 h-4.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  )
}

