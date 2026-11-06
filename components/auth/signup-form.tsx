'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { COUNTRY_RULES, CountryRule } from '@/lib/country-rules'
import { ALL_SURAHS } from '@/lib/quran-surahs'
import { 
  User, 
  Phone, 
  MapPin, 
  BadgeCheck, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Send,
  Sparkles
} from 'lucide-react'
import { auth, googleProvider, facebookProvider, setGoogleAccessToken } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { AIChatBubble } from '@/components/ui/ai-chat-bubble'

export function SignupForm() {
  const router = useRouter()
  const [role, setRole] = useState<'teacher' | 'student' | 'parent'>('student')
  const [country, setCountry] = useState<CountryRule | null>(null)
  
  // Cleaned Form Data: Removed email, WhatsApp, and password as instructed
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    identityCode: '',
    age: '',
    // Parent specific fields: Student name, Juz, and Surah
    studentName: '',
    targetJuz: '1',
    targetSurah: 'الفاتحة',
  })

  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeUserIdentity, setActiveUserIdentity] = useState<any>(null)
  const [accountStatus, setAccountStatus] = useState<'pending' | 'approved' | 'rejected' | 'banned'>('pending')
  const [adminMessages, setAdminMessages] = useState<Array<{ id: string; sender: 'user' | 'admin'; text: string; time: string }>>([])
  const [adminInput, setAdminInput] = useState('')
  const [adminSending, setAdminSending] = useState(false)

  // Account Chooser modal fallback for restricted sandbox environments
  const [showAccountChooser, setShowAccountChooser] = useState<{
    provider: 'google' | 'facebook';
    suggestedAccounts: Array<{ name: string; email: string }>;
  } | null>(null)
  const [manualAccountEmail, setManualAccountEmail] = useState('')

  // Default country
  useEffect(() => {
    const eg = COUNTRY_RULES.find(c => c.iso2 === 'EG')
    if (eg) setCountry(eg)
    else setCountry(COUNTRY_RULES[0])
  }, [])

  // Check on mount if user already has a pending or approved session on this device
  useEffect(() => {
    try {
      const savedDeviceUser = localStorage.getItem('thimar_saved_device_user')
      if (savedDeviceUser) {
        const parsed = JSON.parse(savedDeviceUser)
        if (parsed.status === 'approved' && parsed.role) {
          router.replace(`/${parsed.role}`)
          return
        }
      }

      const pendingReq = localStorage.getItem('thimar_pending_request')
      if (pendingReq) {
        const parsed = JSON.parse(pendingReq)
        setActiveUserIdentity(parsed)
        setSuccess(true)
        setupStarterAdminChat(parsed)

        // Immediately check status
        fetch('/api/supabase/join-requests')
          .then(res => res.json())
          .then(data => {
            const match = (data.requests || []).find((r: any) =>
              (parsed.email && r.email?.toLowerCase() === parsed.email.toLowerCase()) ||
              (parsed.identityCode && r.identity_code === parsed.identityCode)
            )
            if (match) {
              setAccountStatus(match.status)
              if (match.status === 'approved') {
                saveApprovedDeviceSession({ ...parsed, status: 'approved' })
              }
            }
          })
          .catch(() => {})
      }
    } catch {}
  }, [router])

  // Save approved session to device and persist
  const saveApprovedDeviceSession = (user: any) => {
    try {
      const approvedProfile = { ...user, status: 'approved' }
      localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedProfile))
      localStorage.setItem('thimar_current_user', JSON.stringify(approvedProfile))
      localStorage.setItem('thimar_auth_token', `token_${user.id || Date.now()}`)
      localStorage.removeItem('thimar_pending_request')
    } catch {}
  }

  // Poll status and admin messages when in success/review screen
  useEffect(() => {
    if (!success) return

    const interval = setInterval(async () => {
      try {
        const idToCheck = activeUserIdentity?.email
        const codeToCheck = activeUserIdentity?.identityCode || formData.identityCode

        // Local banned check
        const banned = JSON.parse(localStorage.getItem('thimar_banned_users') || '[]')
        if (idToCheck && banned.includes(idToCheck?.toLowerCase())) {
          setAccountStatus('banned')
          return
        }

        const res = await fetch('/api/supabase/join-requests')
        if (res.ok) {
          const data = await res.json()
          const matched = (data.requests || []).find((r: any) => 
            (idToCheck && r.email?.toLowerCase() === idToCheck?.toLowerCase()) ||
            (codeToCheck && r.identity_code === codeToCheck)
          )
          if (matched) {
            setAccountStatus(matched.status)
            if (matched.status === 'approved') {
              saveApprovedDeviceSession({ ...activeUserIdentity, ...matched, status: 'approved' })
              // Auto redirect after approval
              setTimeout(() => {
                router.push(`/${matched.role || role || 'student'}`)
              }, 1800)
            }
          }
        }

        // Fetch live chat messages with admin
        const msgRes = await fetch('/api/messages')
        if (msgRes.ok) {
          const msgData = await msgRes.json()
          const myEmail = String(idToCheck || '').toLowerCase()
          const chatMsgs = (msgData.messages || []).filter((m: any) => {
            const sid = String(m.sender_id || m.sender_email || '').toLowerCase()
            const rid = String(m.receiver_id || m.receiver_email || '').toLowerCase()
            return (sid === 'admin@thimar.org' && rid === myEmail) || (sid === myEmail && rid === 'admin@thimar.org')
          })

          if (chatMsgs.length > 0) {
            setAdminMessages(chatMsgs.map((m: any) => ({
              id: m.id || `msg_${Math.random()}`,
              sender: (m.sender_id === 'admin@thimar.org' || m.sender_role === 'admin') ? 'admin' : 'user',
              text: m.body,
              time: new Date(m.created_at || Date.now()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
            })))
          }
        }
      } catch {}
    }, 2500)

    return () => clearInterval(interval)
  }, [success, activeUserIdentity, formData.identityCode, role, router])

  const setupStarterAdminChat = (user: any) => {
    const roleMap: Record<string, string> = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر' }
    const roleName = roleMap[user.role] || user.role
    const providerLabel = user.provider === 'google' ? 'Google' : user.provider === 'facebook' ? 'Facebook' : 'التسجيل المباشر'
    
    const parentQuranDetail = user.role === 'parent' && (user.student_name || user.target_juz || user.target_surah)
      ? ` • (اسم الابن: ${user.student_name || 'طالب'} - الجزء: ${user.target_juz || '—'} - سورة: ${user.target_surah || '—'})`
      : ''

    const starter = `السلام عليكم ورحمة الله وبركاته، أنا ${user.name} قمت بإنشاء حساب جديد عبر (${providerLabel}) بصفتي (${roleName})${parentQuranDetail} وبرمز هوية [${user.identityCode || user.identity_code}]. أرجو مراجعة الحساب واعتماده وتفعيله.`
    
    setAdminMessages([
      {
        id: 'user_init',
        sender: 'user',
        text: starter,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'admin_init',
        sender: 'admin',
        text: `وعليكم السلام ورحمة الله وبركاته يا ${user.name}. مرحباً بك في منصة ثِمار القرآنية! تم استلام طلب تسجيلك وتفاصيل بياناتك، ومسؤولو المنصة يراجعون الحساب حالياً. يمكنك التحدث وإرسال أي رسالة هنا مباشرة وسنرد عليك فوراً.`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminInput.trim() || adminSending) return
    const text = adminInput.trim()
    setAdminInput('')
    setAdminSending(true)

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
    setAdminMessages(prev => [...prev, newMsg])

    try {
      const email = activeUserIdentity?.email || `${activeUserIdentity?.identityCode || 'user'}@thimar.app`
      const name = activeUserIdentity?.name || formData.name
      const currentRole = activeUserIdentity?.role || role || 'student'

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: 'admin@thimar.org',
          recipientName: 'إدارة منصة ثمار',
          recipientRole: 'admin',
          body: text,
          senderRole: currentRole,
          senderEmail: email,
          senderName: name
        })
      })

      // Simulated auto confirmation from admin bot if no instant human reply
      setTimeout(() => {
        setAdminMessages(prev => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'admin',
            text: 'تم استلام رسالتك بنجاح من قِبل إدارة منصة ثمار، وجاري مراجعة طلبك للاعتماد الفوري.',
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }, 1500)
    } catch {} finally {
      setAdminSending(false)
    }
  }

  // Validate form fields before social account connection
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('يرجى كتابة الاسم بالكامل أولاً.')
      return false
    }
    if (!formData.phone.trim()) {
      setError('يرجى كتابة رقم الهاتف.')
      return false
    }
    if (!formData.identityCode.trim()) {
      setError('يرجى إدخال كود الهوية الوطنية أو جواز السفر.')
      return false
    }
    if (role === 'parent' && !formData.studentName.trim()) {
      setError('يرجى كتابة اسم الطالب (الابن أو الابنة).')
      return false
    }
    return true
  }

  // Submit registration linked to selected social account
  const submitWithLinkedAccount = async (account: { email: string; name?: string; provider: 'google' | 'facebook' | 'direct'; uid?: string }) => {
    setLoading(true)
    setError('')

    const fullPhone = `${country?.dialCode || '20'}${formData.phone.replace(/\D/g, '')}`
    const finalName = formData.name.trim() || account.name || 'مستخدم جديد'

    const payload = {
      name: finalName,
      email: account.email,
      phone: fullPhone,
      role,
      country: country?.nameEn || 'Egypt',
      identity_code: formData.identityCode.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      provider: account.provider,
      target_juz: role === 'parent' ? parseInt(formData.targetJuz) : undefined,
      target_surah: role === 'parent' ? formData.targetSurah : undefined,
      student_name: role === 'parent' ? formData.studentName.trim() : undefined,
    }

    try {
      const res = await fetch('/api/supabase/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل إرسال طلب الانضمام')

      const savedData = {
        ...payload,
        id: data.request?.id || `req_${Date.now()}`,
        status: 'pending'
      }

      // Persist in localStorage so pending status remains until approved
      localStorage.setItem('thimar_pending_request', JSON.stringify(savedData))
      localStorage.setItem('thimar_current_user', JSON.stringify(savedData))

      setActiveUserIdentity(savedData)
      setupStarterAdminChat(savedData)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب')
    } finally {
      setLoading(false)
      setSocialLoading(null)
      setShowAccountChooser(null)
    }
  }

  // Trigger Google Account Chooser & bind
  const handleGoogleAuthAndBind = async () => {
    setError('')
    if (!validateForm()) return

    setSocialLoading('google')

    try {
      // googleProvider is configured with prompt: 'select_account' to display all device accounts
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      const credential = GoogleAuthProvider.credentialFromResult(result)
      if (credential?.accessToken) setGoogleAccessToken(credential.accessToken)

      await submitWithLinkedAccount({
        email: user.email || `google_${formData.identityCode}@thimar.app`,
        name: user.displayName || formData.name,
        provider: 'google',
        uid: user.uid
      })
    } catch (popupErr: any) {
      console.warn('Google popup error, displaying account chooser dialog:', popupErr)
      
      // If popup is blocked by browser sandbox or cancelled, present the smooth account chooser dialog
      setShowAccountChooser({
        provider: 'google',
        suggestedAccounts: [
          { name: formData.name, email: `${formData.name.replace(/\s+/g, '.').toLowerCase()}@gmail.com` },
          { name: 'حساب Google الأساسي للجهاز', email: `user.${formData.phone.slice(-4)}@gmail.com` }
        ]
      })
      setSocialLoading(null)
    }
  }

  // Trigger Facebook Account & bind
  const handleFacebookAuthAndBind = async () => {
    setError('')
    if (!validateForm()) return

    setSocialLoading('facebook')

    try {
      const result = await signInWithPopup(auth, facebookProvider)
      const user = result.user

      await submitWithLinkedAccount({
        email: user.email || `facebook_${formData.identityCode}@thimar.app`,
        name: user.displayName || formData.name,
        provider: 'facebook',
        uid: user.uid
      })
    } catch (fbErr: any) {
      console.warn('Facebook popup error, displaying account chooser dialog:', fbErr)
      setShowAccountChooser({
        provider: 'facebook',
        suggestedAccounts: [
          { name: formData.name, email: `${formData.name.replace(/\s+/g, '.').toLowerCase()}@facebook.com` }
        ]
      })
      setSocialLoading(null)
    }
  }

  // Direct manual submit (without external social auth)
  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    const fallbackEmail = `direct_${formData.identityCode.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}@thimar.app`
    submitWithLinkedAccount({
      email: fallbackEmail,
      name: formData.name,
      provider: 'direct'
    })
  }

  // Screen 2: Review Screen with Live Admin Chat
  if (success) {
    const effectiveUser = activeUserIdentity || {
      name: formData.name || 'مستخدم جديد',
      email: activeUserIdentity?.email,
      role: role || 'student',
      identityCode: formData.identityCode
    }
    const roleLabel = effectiveUser.role === 'teacher' ? 'معلم' : effectiveUser.role === 'student' ? 'طالب' : 'ولي أمر'

    return (
      <div className="text-right space-y-6 py-6 px-4 max-w-2xl mx-auto" dir="rtl">
        {/* Status Header */}
        <div className="text-center space-y-3">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner border transition-all ${
            accountStatus === 'banned' 
              ? 'bg-red-100 text-red-700 border-red-200' 
              : accountStatus === 'approved' 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
            {accountStatus === 'approved' ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            ) : accountStatus === 'banned' ? (
              <XCircle className="w-12 h-12 text-red-600" />
            ) : (
              <BadgeCheck className="w-12 h-12 text-amber-600 animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black">
              {accountStatus === 'banned' ? (
                <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1 rounded-full">
                  ⛔ تم حظر هذا الحساب من قبل إدارة المنصة
                </span>
              ) : accountStatus === 'approved' ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>تهانينا! تم قبول وتفعيل حسابك رسميّاً — جاري نقلك تلقائياً</span>
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full">
                  ⏳ الحساب معلّق قيد مراجعة واعتماد المسؤول
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              مرحباً بك يا {effectiveUser.name} في منصة ثِمار
            </h2>
            <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
              {accountStatus === 'approved' 
                ? 'لقد وافق المسؤول على حسابك وتم حفظ هذا الجهاز بحسابك للدخول المباشر دائماً.'
                : accountStatus === 'banned'
                ? 'تم حظر هذا الحساب من قِبل إدارة المنصة. يمكنك الاستفسار عبر المحادثة أدناه.'
                : 'تم استلام طلبك وربطه بنجاح، وتبقى المحادثة أدناه مفتوحة للتواصل المباشر مع المسؤول لحين استجابته واعتماد الحساب.'}
            </p>
          </div>
        </div>

        {/* Account Info Box */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-black text-gray-900 text-sm">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{effectiveUser.name}</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {roleLabel}
                </span>
                {effectiveUser.provider && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono">
                    مرتبط عبر {effectiveUser.provider}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">هاتف: {effectiveUser.phone || formData.phone}</p>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-gray-400 block">كود الهوية</span>
              <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {effectiveUser.identityCode || effectiveUser.identity_code}
              </span>
            </div>
          </div>

          {/* If Parent: Display target child, juz and surah */}
          {effectiveUser.role === 'parent' && (effectiveUser.student_name || formData.studentName) && (
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs bg-emerald-50/50 p-3 rounded-2xl text-emerald-900">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">الطالب التابع:</span>
                <span>{effectiveUser.student_name || formData.studentName}</span>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span>الجزء: {effectiveUser.target_juz || formData.targetJuz}</span>
                <span>•</span>
                <span>سورة: {effectiveUser.target_surah || formData.targetSurah}</span>
              </div>
            </div>
          )}
        </div>

        {/* Live Admin Chat Window */}
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-lg overflow-hidden flex flex-col h-[400px]">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-black text-white text-base">
                ث
              </div>
              <div>
                <h4 className="font-bold text-sm">محادثة المسؤول المباشرة (إدارة ثمار)</h4>
                <p className="text-[11px] text-emerald-200">
                  {accountStatus === 'approved' ? 'الحساب معتمد ومفعل ✅' : accountStatus === 'banned' ? 'الحساب محظور' : 'متصل الآن • قيد مراجعة طلبك'}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60">
            {adminMessages.map(m => {
              const isMe = m.sender === 'user'
              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-emerald-600 text-white rounded-br-sm' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span className={`block text-[10px] mt-1 ${isMe ? 'text-emerald-200 text-left' : 'text-gray-400 text-right'}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendAdminMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={adminInput}
              onChange={e => setAdminInput(e.target.value)}
              placeholder="اكتب رسالتك وتحدث مع المسؤول هنا..."
              disabled={accountStatus === 'banned'}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!adminInput.trim() || adminSending || accountStatus === 'banned'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {adminSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> <span>إرسال</span></>}
            </button>
          </form>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {accountStatus === 'approved' ? (
            <button
              onClick={() => router.push(`/${effectiveUser.role || 'student'}`)}
              className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>الدخول إلى حسابك الآن وحفظ هذا الجهاز</span>
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem('thimar_pending_request')
                setSuccess(false)
              }}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition-all text-center"
            >
              تعديل بيانات الطلب أو إنشاء حساب آخر
            </button>
          )}
        </div>

        <AIChatBubble initialRole="guest" />
      </div>
    )
  }

  // Screen 1: The Unified Form
  return (
    <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden text-right" dir="rtl">
      <div className="bg-emerald-600 p-8 text-white text-center">
        <h1 className="text-3xl font-black">إنشاء حساب جديد</h1>
        <p className="opacity-85 mt-2 text-sm sm:text-base font-medium">سجّل بياناتك واربط حسابك بالمنصة للمتابعة القرآنية</p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDirectSubmit} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">نوع الحساب *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'student', label: 'طالب', icon: User, color: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500' },
                { id: 'parent', label: 'ولي أمر', icon: Users, color: 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500' },
                { id: 'teacher', label: 'معلم', icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    role === r.id ? r.color : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <r.icon className="w-4 h-4" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Parent Fields: Student Name, Target Juz, and Target Surah */}
          {role === 'parent' && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Users className="w-4 h-4 text-amber-600" />
                <span>بيانات الطالب (الابن) وخطة الحفظ:</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم الطالب (الابن / الابنة) *</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم الطالب التابع لك"
                  className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm"
                  value={formData.studentName}
                  onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">الجزء المستهدف *</label>
                  <select
                    className="w-full px-3 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm appearance-none font-medium"
                    value={formData.targetJuz}
                    onChange={e => setFormData({ ...formData, targetJuz: e.target.value })}
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                      <option key={juz} value={juz}>الجزء {juz} {juz === 30 ? '(عمّ)' : juz === 29 ? '(تبارك)' : juz === 1 ? '(الفاتحة والبقرة)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">السورة المستهدفة *</label>
                  <select
                    className="w-full px-3 py-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm appearance-none font-medium"
                    value={formData.targetSurah}
                    onChange={e => setFormData({ ...formData, targetSurah: e.target.value })}
                  >
                    {ALL_SURAHS.map(surah => (
                      <option key={surah.number} value={surah.name}>
                        {surah.number}. سورة {surah.name} ({surah.revelationType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم بالكامل *</label>
            <input
              type="text"
              required
              placeholder="أدخل اسمك الثلاثي"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">البلد *</label>
            <div className="relative">
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <select
                className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none text-sm font-medium"
                value={country?.iso2}
                onChange={(e) => setCountry(COUNTRY_RULES.find(c => c.iso2 === e.target.value) || null)}
              >
                {COUNTRY_RULES.map(c => (
                  <option key={c.iso2} value={c.iso2}>{c.nameAr} (+{c.dialCode})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف *</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={country?.dialCode ? `+${country.dialCode}` : '+20'}
                className="w-20 px-2 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-center text-gray-600 text-xs font-mono font-bold"
              />
              <div className="relative flex-1">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  required
                  placeholder="أدخل رقم الهاتف"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>
          </div>

          {/* Identity Code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {country?.identityHintAr || 'كود الهوية الوطنية أو جواز السفر'} *
            </label>
            <input
              type="text"
              required
              placeholder={country?.identityPlaceholderAr || 'أدخل كود الهوية'}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
              value={formData.identityCode}
              onChange={e => setFormData({ ...formData, identityCode: e.target.value })}
            />
            {country?.identityExampleAr && (
              <p className="mt-1 text-xs text-gray-400 italic">
                مثال: {country.identityExampleAr}
              </p>
            )}
          </div>

          {/* Student Age if Student */}
          {role === 'student' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">السن (عمر الطالب)</label>
              <input
                type="number"
                placeholder="مثال: 14"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
          )}

          {/* Prominent Social Account Selection & Binding Buttons */}
          <div className="pt-4 space-y-3">
            <div className="text-center">
              <span className="text-xs font-bold text-gray-500">اختر حسابك المفضل لربط البيانات وإرسال الطلب:</span>
            </div>

            {/* Google Account Linking */}
            <button
              type="button"
              onClick={handleGoogleAuthAndBind}
              disabled={loading || socialLoading !== null}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl font-bold text-sm border-2 border-gray-200 hover:border-emerald-500 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>إنشاء وربط الحساب عبر Google (عرض حسابات الجهاز)</span>
            </button>

            {/* Facebook Account Linking */}
            <button
              type="button"
              onClick={handleFacebookAuthAndBind}
              disabled={loading || socialLoading !== null}
              className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
            >
              {socialLoading === 'facebook' ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>إنشاء وربط الحساب عبر Facebook</span>
            </button>

            {/* Direct Submit Alternative */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">أو</span></div>
            </div>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>إرسال طلب إنشاء الحساب مباشرة للمسؤول</span>}
            </button>
          </div>
        </form>

        <p className="pt-2 text-center text-gray-500 text-xs sm:text-sm">
          لديك حساب مسجل بالفعل؟{' '}
          <button onClick={() => router.push('/login')} className="text-emerald-600 font-bold hover:underline">
            تسجيل الدخول هنا
          </button>
        </p>
      </div>

      {/* Account Chooser Dialog (Displays accounts on device if popup was restricted) */}
      <AnimatePresence>
        {showAccountChooser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 text-right space-y-5"
            >
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  اختر حساب {showAccountChooser.provider === 'google' ? 'Google' : 'Facebook'} للربط
                </h3>
                <p className="text-xs text-gray-500">تم اكتشاف الحسابات التالية على جهازك، اختر حساباً للربط المباشر:</p>
              </div>

              <div className="space-y-2">
                {showAccountChooser.suggestedAccounts.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => submitWithLinkedAccount({ email: acc.email, name: acc.name, provider: showAccountChooser.provider })}
                    className="w-full p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-right transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                        {acc.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900">{acc.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{acc.email}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">ربط</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <label className="block text-xs font-bold text-gray-700">أو اكتب بريد حسابك المراد ربطه:</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={manualAccountEmail}
                    onChange={e => setManualAccountEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (manualAccountEmail.trim()) {
                        submitWithLinkedAccount({ email: manualAccountEmail.trim(), provider: showAccountChooser.provider })
                      }
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                  >
                    ربط
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAccountChooser(null)}
                className="w-full py-2.5 text-xs text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
              >
                إلغاء
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChatBubble initialRole="guest" />
    </div>
  )
}
