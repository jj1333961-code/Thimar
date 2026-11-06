'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { COUNTRY_RULES, CountryRule } from '@/lib/country-rules'
import { ALL_SURAHS } from '@/lib/quran-surahs'
import { 
  User, 
  Users, 
  GraduationCap, 
  Compass, 
  Phone, 
  MapPin, 
  BadgeCheck, 
  BookOpen, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Send,
  Sparkles,
  Mic,
  Square,
  MessageCircle,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import { auth, googleProvider, facebookProvider, setGoogleAccessToken } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { AIChatBubble } from '@/components/ui/ai-chat-bubble'

export function SignupForm() {
  const router = useRouter()
  const chatSectionRef = useRef<HTMLDivElement>(null)

  // Supported roles: Student, Visitor, Teacher, Parent
  const [role, setRole] = useState<'student' | 'visitor' | 'teacher' | 'parent'>('student')
  const [country, setCountry] = useState<CountryRule | null>(null)
  
  // Common Form Data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    docType: 'national_id' as 'national_id' | 'passport',
    identityCode: '',
    dob: '',
    age: '',
    memorizationJuz: '',
    memorizationSurah: '',
    notes: '',
    // Student specific
    parentName: '',
    parentPhone: '',
    // Teacher specific
    specialization: '',
    experienceYears: '',
    qualifications: '',
  })

  // Parent specific: Multiple children
  const [childrenList, setChildrenList] = useState<Array<{ id: string; name: string; targetJuz: string; targetSurah: string }>>([
    { id: '1', name: '', targetJuz: '1', targetSurah: 'الفاتحة' }
  ])

  // Voice Sample State
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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

  // Default country initialization
  useEffect(() => {
    const eg = COUNTRY_RULES.find(c => c.iso2 === 'EG') || COUNTRY_RULES.find(c => c.iso2 === 'SA')
    if (eg) setCountry(eg)
    else setCountry(COUNTRY_RULES[0])
  }, [])

  // Auto calculate age from Date of Birth
  const handleDobChange = (dobVal: string) => {
    let computedAge = ''
    if (dobVal) {
      const birthDate = new Date(dobVal)
      const today = new Date()
      let ageNum = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        ageNum--
      }
      if (ageNum >= 0 && ageNum < 120) {
        computedAge = String(ageNum)
      }
    }
    setFormData(prev => ({ ...prev, dob: dobVal, age: computedAge }))
  }

  // Voice recording handlers
  const startRecording = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []

      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch {
      setError('تعذر الوصول للميكروفون لتسجيل عينة التلاوة. يرجى إعطاء الصلاحية للمتصفح.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  // Parent Children Helpers
  const addChild = () => {
    setChildrenList(prev => [
      ...prev,
      { id: String(Date.now()), name: '', targetJuz: '1', targetSurah: 'الفاتحة' }
    ])
  }

  const removeChild = (index: number) => {
    if (childrenList.length <= 1) return
    setChildrenList(prev => prev.filter((_, i) => i !== index))
  }

  const updateChild = (index: number, field: string, value: string) => {
    setChildrenList(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

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

  const saveApprovedDeviceSession = (user: any) => {
    try {
      const approvedProfile = { ...user, status: 'approved' }
      localStorage.setItem('thimar_saved_device_user', JSON.stringify(approvedProfile))
      localStorage.setItem('thimar_current_user', JSON.stringify(approvedProfile))
      localStorage.setItem('thimar_auth_token', `token_${user.id || Date.now()}`)
      localStorage.removeItem('thimar_pending_request')
    } catch {}
  }

  // Poll status and admin messages when in review screen
  useEffect(() => {
    if (!success) return

    const interval = setInterval(async () => {
      try {
        const idToCheck = activeUserIdentity?.email
        const codeToCheck = activeUserIdentity?.identityCode || formData.identityCode

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
              setTimeout(() => {
                router.push(`/${matched.role || role || 'student'}`)
              }, 1800)
            }
          }
        }

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
    const roleMap: Record<string, string> = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر', visitor: 'زائر' }
    const roleName = roleMap[user.role] || user.role
    const providerLabel = user.provider === 'google' ? 'Google' : user.provider === 'facebook' ? 'Facebook' : 'التسجيل المباشر'
    const docLabel = user.doc_type === 'passport' ? 'جواز سفر' : 'هوية وطنية'

    const starter = `السلام عليكم ورحمة الله وبركاته، أنا ${user.name} قمت بالتسجيل كـ (${roleName}) بوثيقة (${docLabel}: ${user.identityCode || user.identity_code}). أرجو مراجعة الحساب واعتماده وتفعيله.`
    
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
        text: `وعليكم السلام ورحمة الله وبركاته يا ${user.name}. يسعدنا انضمامك إلى منصة ثِمار القرآنية! تم استلام طلبك ومسؤولو المنصة يراجعون الحساب حالياً.`,
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

      setTimeout(() => {
        setAdminMessages(prev => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'admin',
            text: 'تم استلام رسالتك بنجاح من قِبل إدارة منصة ثمار، وجاري مراجعة طلبك للاعتماد.',
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }, 1500)
    } catch {} finally {
      setAdminSending(false)
    }
  }

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
      setError('يرجى إدخال رقم الهوية الوطنية أو جواز السفر.')
      return false
    }
    // Validate format against selected country pattern
    if (country?.identityPattern) {
      try {
        const regex = new RegExp(country.identityPattern)
        if (!regex.test(formData.identityCode.trim())) {
          setError(country.identityHintAr || 'رقم الوثيقة غير مطابق لشروط الدولة المختارة.')
          return false
        }
      } catch {}
    }
    if (role === 'student' && !formData.parentName.trim()) {
      setError('يرجى كتابة اسم ولي الأمر للطالب.')
      return false
    }
    if (role === 'parent' && childrenList.some(c => !c.name.trim())) {
      setError('يرجى ملء اسم جميع الأبناء المضافين.')
      return false
    }
    return true
  }

  const submitWithLinkedAccount = async (account: { email: string; name?: string; provider: 'google' | 'facebook' | 'direct'; uid?: string }) => {
    setLoading(true)
    setError('')

    const fullPhone = `${country?.dialCode || '966'}${formData.phone.replace(/\D/g, '')}`
    const finalName = formData.name.trim() || account.name || 'مستخدم جديد'

    const payload = {
      name: finalName,
      email: account.email,
      phone: fullPhone,
      role,
      country: country?.nameAr || country?.nameEn || 'السعودية',
      doc_type: formData.docType,
      identity_code: formData.identityCode.trim(),
      dob: formData.dob,
      age: formData.age ? parseInt(formData.age) : undefined,
      provider: account.provider,
      memorization_juz: formData.memorizationJuz ? parseInt(formData.memorizationJuz) : undefined,
      memorization_surah: formData.memorizationSurah,
      notes: formData.notes,
      // Role specific
      parent_name: role === 'student' ? formData.parentName.trim() : undefined,
      parent_phone: role === 'student' ? formData.parentPhone.trim() : undefined,
      specialization: role === 'teacher' ? formData.specialization : undefined,
      experience_years: role === 'teacher' && formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
      qualifications: role === 'teacher' ? formData.qualifications : undefined,
      children: role === 'parent' ? childrenList.map(c => ({ name: c.name.trim(), target_juz: parseInt(c.targetJuz), targetSurah: c.targetSurah })) : undefined,
      voice_sample_url: audioUrl || undefined,
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
        identityCode: formData.identityCode.trim(),
        status: 'pending'
      }

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

  const handleGoogleAuthAndBind = async () => {
    setError('')
    if (!validateForm()) return
    setSocialLoading('google')

    try {
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
    } catch {
      setShowAccountChooser({
        provider: 'google',
        suggestedAccounts: [
          { name: formData.name, email: `${formData.name.replace(/\s+/g, '.').toLowerCase()}@gmail.com` }
        ]
      })
      setSocialLoading(null)
    }
  }

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
    } catch {
      setShowAccountChooser({
        provider: 'facebook',
        suggestedAccounts: [
          { name: formData.name, email: `${formData.name.replace(/\s+/g, '.').toLowerCase()}@facebook.com` }
        ]
      })
      setSocialLoading(null)
    }
  }

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

  // Screen 2: Review & Admin Approval Screen
  if (success) {
    const effectiveUser = activeUserIdentity || {
      name: formData.name || 'مستخدم جديد',
      email: activeUserIdentity?.email,
      role: role || 'student',
      identityCode: formData.identityCode
    }
    const roleLabelMap: Record<string, string> = { student: 'طالب', visitor: 'زائر', teacher: 'معلم', parent: 'ولي أمر' }
    const roleLabel = roleLabelMap[effectiveUser.role] || effectiveUser.role

    return (
      <div className="text-right space-y-6 py-6 px-4 max-w-2xl mx-auto" dir="rtl">
        {/* Requirement 9 exact confirmation message */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-emerald-900 leading-snug">
            يسعدنا انضمامك، سيتم الموافقة على حسابك قريباً بإذن الله
          </h2>
          <p className="text-xs text-emerald-800 font-medium">
            تم تسجيل طلبك بنجاح ومراجعة تفاصيل حسابك قيد التنفيذ من قِبل إدارة منصة ثمار.
          </p>

          {/* Two Icon-Only Contact Options as required in Requirement 9 */}
          <div className="pt-2 flex items-center justify-center gap-4">
            {/* Option 1: Call Administrator Phone */}
            <a
              href="tel:+966500000000"
              className="p-3.5 bg-white text-emerald-700 hover:bg-emerald-100 rounded-2xl border border-emerald-300 shadow-sm transition-all flex items-center justify-center active:scale-95"
              title="اتصال هاتفي برقم مسؤول المنصة"
              aria-label="Call Administrator"
            >
              <Phone className="w-6 h-6" />
            </a>

            {/* Option 2: Open Internal Thimar Chat */}
            <button
              type="button"
              onClick={() => chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="p-3.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-2xl shadow-md transition-all flex items-center justify-center active:scale-95"
              title="فتح المحادثة الفورية مع المسؤول"
              aria-label="Open Internal Chat"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* User Registration Details Card */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-black text-gray-900 text-sm">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{effectiveUser.name}</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">هاتف: {effectiveUser.phone || formData.phone}</p>
            </div>

            <div className="text-left">
              <span className="text-[10px] text-gray-400 block">رقم الوثيقة</span>
              <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {effectiveUser.identityCode || effectiveUser.identity_code}
              </span>
            </div>
          </div>

          {effectiveUser.role === 'parent' && childrenList.length > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs">
              <span className="font-bold text-emerald-900">الأبناء المضافين:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {childrenList.map((c, i) => (
                  <div key={i} className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-emerald-900">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-[10px] text-emerald-700">جزء: {c.targetJuz} • سورة: {c.targetSurah}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Internal Live Thimar Chat Window */}
        <div ref={chatSectionRef} className="bg-white rounded-3xl border border-emerald-200 shadow-lg overflow-hidden flex flex-col h-[380px]">
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-black text-white text-base">
                ث
              </div>
              <div>
                <h4 className="font-bold text-sm">المحادثة الفورية مع المسؤول (إدارة ثمار)</h4>
                <p className="text-[11px] text-emerald-200">
                  {accountStatus === 'approved' ? 'الحساب معتمد ✅' : accountStatus === 'banned' ? 'الحساب محظور' : 'متصل الآن • بانتظار الموافقة'}
                </p>
              </div>
            </div>
          </div>

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

          <form onSubmit={handleSendAdminMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={adminInput}
              onChange={e => setAdminInput(e.target.value)}
              placeholder="اكتب رسالتك المباشرة هنا للمسؤول..."
              disabled={accountStatus === 'banned'}
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
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
              className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>الدخول للواجهة المعتمدة</span>
            </button>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem('thimar_pending_request')
                setSuccess(false)
              }}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs text-center"
            >
              تعديل بيانات طلب الانضمام
            </button>
          )}
        </div>

        <AIChatBubble initialRole="guest" />
      </div>
    )
  }

  // Screen 1: Registration Form supporting 4 roles
  return (
    <div className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden text-right" dir="rtl">
      <div className="bg-emerald-600 p-8 text-white text-center">
        <h1 className="text-3xl font-black">إنشاء حساب جديد في ثمار</h1>
        <p className="opacity-85 mt-2 text-sm sm:text-base font-medium">اختر نوع حسابك وسجل بياناتك الرسمية للبدء</p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDirectSubmit} className="space-y-5">
          {/* Requirement 8: 4 Roles Selector (Student, Visitor, Teacher, Parent) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">نوع الحساب *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'student', label: 'طالب', icon: User, color: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500' },
                { id: 'visitor', label: 'زائر', icon: Compass, color: 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-500' },
                { id: 'teacher', label: 'معلم', icon: GraduationCap, color: 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500' },
                { id: 'parent', label: 'ولي أمر', icon: Users, color: 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    role === r.id ? r.color : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <r.icon className="w-5 h-5 mb-1" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Common Required Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">الاسم بالكامل *</label>
            <input
              type="text"
              required
              placeholder="أدخل الاسم الثلاثي واللقب"
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف *</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={country?.dialCode ? `+${country.dialCode}` : '+966'}
                className="w-20 px-2 py-3.5 bg-gray-100 border border-gray-200 rounded-xl text-center text-gray-600 text-xs font-mono font-bold"
              />
              <div className="relative flex-1">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  required
                  placeholder="أدخل رقم الجوال"
                  className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>
          </div>

          {/* Document Type & Number */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">نوع الوثيقة ورقمها *</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold mb-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, docType: 'national_id' })}
                className={`py-2.5 px-3 rounded-xl border transition-all ${
                  formData.docType === 'national_id'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                هوية وطنية
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, docType: 'passport' })}
                className={`py-2.5 px-3 rounded-xl border transition-all ${
                  formData.docType === 'passport'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                جواز سفر
              </button>
            </div>

            <input
              type="text"
              required
              placeholder={formData.docType === 'passport' ? 'أدخل رقم جواز السفر' : 'أدخل رقم الهوية الوطنية'}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
              value={formData.identityCode}
              onChange={e => setFormData({ ...formData, identityCode: e.target.value })}
            />
            {country?.identityExampleAr && (
              <p className="text-xs text-gray-400 italic">
                مثال: {country.identityExampleAr}
              </p>
            )}
          </div>

          {/* Date of Birth & Auto Age Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">تاريخ الميلاد *</label>
              <input
                type="date"
                required
                className="w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                value={formData.dob}
                onChange={e => handleDobChange(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">السن (محسوب تلقائياً)</label>
              <input
                type="text"
                readOnly
                placeholder="يُحسب بعد اختيار تاريخ الميلاد"
                className="w-full px-3.5 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-emerald-800"
                value={formData.age ? `${formData.age} سنة` : ''}
              />
            </div>
          </div>

          {/* Role-Specific Fields */}
          {/* 1. Student Specifics */}
          {role === 'student' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-emerald-900">بيانات ولي الأمر للطالب:</div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم ولي الأمر *</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسم الأب أو والي الأمر"
                  value={formData.parentName}
                  onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">رقم هاتف ولي الأمر</label>
                <input
                  type="tel"
                  placeholder="أدخل هاتف ولي الأمر للتواصل"
                  value={formData.parentPhone}
                  onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* 2. Teacher Specifics */}
          {role === 'teacher' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-blue-900">مؤهلات وتخصص المعلم:</div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">التخصص والمواد القرآنية</label>
                <input
                  type="text"
                  placeholder="مثال: القراءات العشر / تجويد وحفظ"
                  value={formData.specialization}
                  onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">سنوات الخبرة</label>
                  <input
                    type="number"
                    placeholder="مثال: 5"
                    value={formData.experienceYears}
                    onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المؤهلات والإجازات</label>
                  <input
                    type="text"
                    placeholder="مثال: إجازة برواية حفص"
                    value={formData.qualifications}
                    onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Parent Specifics: Add multiple children */}
          {role === 'parent' && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">إضافة أبناء للتسجيل والمتابعة:</span>
                <button
                  type="button"
                  onClick={addChild}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة ابن آخر</span>
                </button>
              </div>

              <div className="space-y-3">
                {childrenList.map((child, idx) => (
                  <div key={child.id} className="p-3 bg-white rounded-2xl border border-amber-200 space-y-2 relative">
                    {childrenList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(idx)}
                        className="absolute top-2 left-2 text-red-500 hover:bg-red-50 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">اسم الابن/الابنة #{idx + 1} *</label>
                      <input
                        type="text"
                        required
                        placeholder="اسم الطالب التابع"
                        value={child.name}
                        onChange={e => updateChild(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">الجزء المستهدف</label>
                        <select
                          value={child.targetJuz}
                          onChange={e => updateChild(idx, 'targetJuz', e.target.value)}
                          className="w-full p-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs"
                        >
                          {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                            <option key={juz} value={juz}>الجزء {juz}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">السورة المستهدفة</label>
                        <select
                          value={child.targetSurah}
                          onChange={e => updateChild(idx, 'targetSurah', e.target.value)}
                          className="w-full p-2 bg-amber-50/40 border border-amber-200 rounded-xl text-xs"
                        >
                          {ALL_SURAHS.map(s => (
                            <option key={s.number} value={s.name}>سورة {s.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional: Quran Memorization Level */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">الجزء المحفوظ (اختياري)</label>
              <select
                value={formData.memorizationJuz}
                onChange={e => setFormData({ ...formData, memorizationJuz: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value="">اختر الجزء...</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                  <option key={juz} value={juz}>الجزء {juz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">السورة الحالية (اختياري)</label>
              <select
                value={formData.memorizationSurah}
                onChange={e => setFormData({ ...formData, memorizationSurah: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value="">اختر السورة...</option>
                {ALL_SURAHS.map(s => (
                  <option key={s.number} value={s.name}>سورة {s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice Sample Recording (Optional) */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>عينة صوتية لتلاوة الفاتحة (اختياري للمعلم والطالب)</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>بدء التسجيل الصوتي</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>إيقاف التسجيل</span>
                </button>
              )}

              {audioUrl && (
                <div className="flex items-center gap-2 flex-1">
                  <audio src={audioUrl} controls className="h-8 w-full max-w-[200px]" />
                  <span className="text-[10px] text-emerald-700 font-bold">جاهز للرفع</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
            <textarea
              rows={2}
              placeholder="أي ملاحظات تود إبلاغ إدارة المنصة بها..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
            />
          </div>

          {/* Social & Direct Account Submission */}
          <div className="pt-2 space-y-3">
            <div className="text-center">
              <span className="text-xs font-bold text-gray-500">اختر طريقة الاعتماد وإرسال الطلب:</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuthAndBind}
              disabled={loading || socialLoading !== null}
              className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl font-bold text-xs sm:text-sm border-2 border-gray-200 hover:border-emerald-500 transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
            >
              {socialLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>ربط وإرسال عبر Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookAuthAndBind}
              disabled={loading || socialLoading !== null}
              className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
            >
              {socialLoading === 'facebook' ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              <span>ربط وإرسال عبر Facebook</span>
            </button>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>إرسال طلب إنشاء الحساب للمسؤول</span>}
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

      {/* Account Chooser Dialog */}
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
                <p className="text-xs text-gray-500">اختر حساباً لربطه بطلبك الحالي:</p>
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
                <label className="block text-xs font-bold text-gray-700">أو بريد حسابك المراد ربطه:</label>
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
