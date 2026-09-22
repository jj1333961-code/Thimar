'use client'

import { useState } from 'react'
import { auth, googleProvider, setGoogleAccessToken, facebookProvider } from '@/lib/firebase'
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert, CheckCircle2, UserCheck, Phone, Check, ArrowLeft } from 'lucide-react'

interface SocialAuthButtonsProps {
  onNewUserCreated?: (userData: { 
    name: string; 
    email: string; 
    provider: string; 
    role: string;
    identityCode: string;
    phone?: string;
  }) => void
}

export function SocialAuthButtons({ onNewUserCreated }: SocialAuthButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showRoleSelectorFor, setShowRoleSelectorFor] = useState<{ user: any; provider: 'google' | 'facebook' } | null>(null)
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'teacher'>('student')
  const [customName, setCustomName] = useState('')
  const [customPhone, setCustomPhone] = useState('')

  // Check if banned
  const checkIsBanned = (identifier?: string) => {
    if (!identifier) return false
    try {
      const bannedList = JSON.parse(localStorage.getItem('thimar_banned_users') || '[]')
      return bannedList.includes(identifier.toLowerCase())
    } catch {
      return false
    }
  }

  // Get already linked profile
  const getLinkedProfile = (key: string) => {
    try {
      const stored = localStorage.getItem('thimar_social_links')
      if (stored) {
        const map = JSON.parse(stored)
        if (map[key.toLowerCase()]) return map[key.toLowerCase()]
      }
      // Fallback keys
      const single = localStorage.getItem(`thimar_link_${key}`)
      if (single) return JSON.parse(single)
    } catch {}
    return null
  }

  // Save linked profile
  const saveLinkedProfile = (keys: string[], profile: any) => {
    try {
      let map: Record<string, any> = {}
      const stored = localStorage.getItem('thimar_social_links')
      if (stored) {
        map = JSON.parse(stored)
      }
      keys.forEach(k => {
        if (k) map[k.toLowerCase()] = profile
      })
      localStorage.setItem('thimar_social_links', JSON.stringify(map))
      localStorage.setItem('thimar_current_user', JSON.stringify(profile))
      localStorage.setItem('thimar_auth_token', `token_${profile.id}`)
    } catch {}
  }

  const handleSocialLogin = async (providerName: 'google' | 'facebook') => {
    setLoading(providerName)
    setError('')

    // Google / Facebook Flow
    let provider: any
    if (providerName === 'google') {
      provider = googleProvider
    } else {
      provider = facebookProvider
      // Check Facebook App ID
      const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
      if (fbAppId) {
        provider.setCustomParameters({
          client_id: fbAppId,
          display: 'popup'
        })
      }
    }

    try {
      let result: any
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

        // Demo fallback if 3P third-party cookies or popups are blocked by sandbox iframe
        console.warn(`Popup fallback for ${providerName}:`, popupErr)
        const mockEmail = `${providerName}_user@thimar.app`
        const existing = getLinkedProfile(mockEmail) || getLinkedProfile(providerName)
        if (existing) {
          if (existing.status === 'banned' || checkIsBanned(existing.email)) {
            setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة.')
            setLoading(null)
            return
          }
          localStorage.setItem('thimar_current_user', JSON.stringify(existing))
          localStorage.setItem('thimar_auth_token', `token_${existing.id}`)
          router.push(`/${existing.role || 'student'}`)
          return
        }

        setCustomName(providerName === 'google' ? 'مستخدم جوجل الجديد' : 'مستخدم فيسبوك الجديد')
        setShowRoleSelectorFor({
          user: { displayName: providerName === 'google' ? 'مستخدم جوجل الجديد' : 'مستخدم فيسبوك الجديد', email: mockEmail },
          provider: providerName
        })
        setLoading(null)
        return
      }

      const user = result.user

      // Check Banned
      if (checkIsBanned(user.email || '') || checkIsBanned(user.uid)) {
        setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة.')
        setLoading(null)
        return
      }

      if (providerName === 'google') {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        if (credential?.accessToken) setGoogleAccessToken(credential.accessToken)
      }

      // Check existing link with email or uid
      const existing = getLinkedProfile(user.email || '') || getLinkedProfile(user.uid) || getLinkedProfile(providerName)
      if (existing) {
        if (existing.status === 'banned') {
          setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة.')
          setLoading(null)
          return
        }
        localStorage.setItem('thimar_current_user', JSON.stringify(existing))
        localStorage.setItem('thimar_auth_token', `token_${existing.id}`)
        router.push(`/${existing.role || 'student'}`)
        return
      }

      // Check Firestore doc
      let userDocExists = false
      let firestoreData: any = null
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          userDocExists = true
          firestoreData = userDoc.data()
        }
      } catch {}

      if (userDocExists && firestoreData) {
        if (firestoreData.status === 'banned' || firestoreData.isBanned) {
          setError('⛔ تم حظر هذا الحساب من قبل إدارة المنصة.')
          setLoading(null)
          return
        }
        saveLinkedProfile([user.uid, user.email || ''], firestoreData)
        router.push(`/${firestoreData.role || 'student'}`)
        return
      }

      // First time registration: show role & profile linker
      setCustomName(user.displayName || '')
      setShowRoleSelectorFor({ user, provider: providerName })
    } catch (err: any) {
      console.error(`${providerName} Login Error:`, err)
      setError(`فشل تسجيل الدخول عبر ${providerName === 'google' ? 'Google' : providerName === 'facebook' ? 'Facebook' : 'WhatsApp'}.`)
    } finally {
      setLoading(null)
    }
  }

  // Confirm role selection and link permanently
  const handleConfirmRoleAndLink = async () => {
    if (!showRoleSelectorFor) return
    const { user, provider } = showRoleSelectorFor
    setLoading('linking')

    const roleCodePrefix = selectedRole === 'student' ? 'STU' : selectedRole === 'teacher' ? 'TCH' : 'PAR'
    const generatedIdCode = `#THM-${roleCodePrefix}-${Math.floor(1000 + Math.random() * 9000)}`
    const displayName = customName.trim() || user.displayName || `مستخدم ${provider}`
    const displayEmail = user.email || `${provider}_${Date.now()}@thimar.app`
    const displayPhone = customPhone.trim() || user.phone || ''

    const newProfile = {
      id: user.uid || `user_${Date.now()}`,
      name: displayName,
      email: displayEmail,
      phone: displayPhone,
      role: selectedRole,
      provider,
      identityCode: generatedIdCode,
      isApproved: false,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    try {
      // 1. Save link in persistent map
      const linkKeys = [
        newProfile.id,
        newProfile.email,
        displayPhone,
        provider,
        `social_${provider}_${displayEmail}`
      ].filter(Boolean)
      saveLinkedProfile(linkKeys, newProfile)

      // 2. Save in Firestore if available
      try {
        await setDoc(doc(db, 'users', newProfile.id), {
          ...newProfile,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        })
      } catch {}

      // 3. Register join request in backend
      const roleArabic = selectedRole === 'student' ? 'طالب' : selectedRole === 'teacher' ? 'معلم' : 'ولي أمر'
      const providerArabic = provider === 'google' ? 'Google' : provider === 'facebook' ? 'Facebook' : 'WhatsApp'

      await fetch('/api/supabase/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfile.name,
          email: newProfile.email,
          phone: newProfile.phone || '0000000000',
          role: selectedRole,
          country: 'السعودية',
          identity_code: newProfile.identityCode,
          provider: provider,
        })
      }).catch(() => {})

      // 4. Send introductory ready message to Admin
      const initialMessage = `السلام عليكم ورحمة الله وبركاته، أنا ${newProfile.name} قمت بإنشاء حساب جديد عبر (${providerArabic}) بصفتي (${roleArabic}) وبرمز هوية [${newProfile.identityCode}]. أرجو مراجعة الحساب وتفعيله واعتماده.`
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'admin@thimar.org',
          recipientName: 'إدارة منصة ثمار',
          recipientRole: 'admin',
          body: initialMessage,
          senderRole: selectedRole,
          senderEmail: newProfile.email,
          senderName: newProfile.name
        })
      }).catch(() => {})

      // 5. Notify parent callback to open the live admin chat window
      if (onNewUserCreated) {
        onNewUserCreated({
          name: newProfile.name,
          email: newProfile.email,
          provider,
          role: selectedRole,
          identityCode: newProfile.identityCode,
          phone: newProfile.phone
        })
      } else {
        router.push(`/${selectedRole}`)
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ أثناء إتمام ربط الحساب')
    } finally {
      setLoading(null)
      setShowRoleSelectorFor(null)
    }
  }

  return (
    <div className="space-y-4 w-full text-right" dir="rtl">
      {error && (
        <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs text-center font-bold flex items-center justify-center gap-2 shadow-xs">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection & Data Binding Modal */}
      {showRoleSelectorFor && (
        <div className="p-5 bg-gradient-to-b from-emerald-50/90 to-white rounded-3xl border-2 border-emerald-200 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm md:text-base">
                ربط حساب {showRoleSelectorFor.provider === 'google' ? 'Google' : showRoleSelectorFor.provider === 'facebook' ? 'Facebook' : 'WhatsApp'} بالمنصة
              </h4>
              <p className="text-xs text-emerald-800">
                سيتم ربط حسابك ببياناتك القرآنية لمنع تكرار الدخول بحسابات متعددة.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكريم في المنصة:</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="أدخل اسمك كما يظهر للمعلم والحلقة..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">اختر صفتك في المنصة للربط الدائم:</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { id: 'student', label: 'طالب قرآن', icon: '📖' },
                  { id: 'parent', label: 'ولي أمر', icon: '👨‍👩‍👧' },
                  { id: 'teacher', label: 'معلم مجاز', icon: '🎓' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id as any)}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                      selectedRole === r.id 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="text-base">{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmRoleAndLink}
            disabled={loading === 'linking'}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading === 'linking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>تأكيد الربط وبدء المحادثة مع الإدارة</span>
          </button>
        </div>
      )}

      {/* The 2 Social Auth Options: Google & Facebook */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. Google with distinct badge */}
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={!!loading}
          className="relative flex flex-col items-center justify-center p-3.5 bg-white border border-gray-200 hover:border-blue-300 rounded-2xl transition-all shadow-xs hover:shadow-md disabled:opacity-50 group text-right"
          title="تسجيل سريع وربط مباشر بواسطة حساب Google"
        >
          <span className="absolute -top-2 left-2 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-black rounded-full shadow-2xs">
            سريع ومباشر
          </span>
          <div className="flex items-center gap-2.5 mt-1">
            {loading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span className="font-bold text-gray-800 text-xs">Google</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1">حساب جوجل الموثق</span>
        </button>

        {/* 2. Facebook with distinct badge */}
        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={!!loading}
          className="relative flex flex-col items-center justify-center p-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl transition-all shadow-xs hover:shadow-md disabled:opacity-50 text-right group"
          title="تسجيل وربط بواسطة حساب Facebook"
        >
          <span className="absolute -top-2 left-2 px-2 py-0.5 bg-white text-[#1877F2] border border-blue-200 text-[9px] font-black rounded-full shadow-2xs">
            موثّق
          </span>
          <div className="flex items-center gap-2 mt-1">
            {loading === 'facebook' ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            )}
            <span className="font-bold text-xs">Facebook</span>
          </div>
          <span className="text-[10px] text-blue-100 mt-1">حساب فيسبوك الرسمي</span>
        </button>
      </div>
    </div>
  )
}
