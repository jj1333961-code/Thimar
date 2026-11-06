'use client'

import { useState, useEffect, useRef } from 'react'
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
  Sparkles,
  Mic,
  Square,
  Play,
  RotateCcw,
  FileText,
  Calendar,
  Plus,
  Trash2,
  Eye,
  Award,
  BookMarked
} from 'lucide-react'
import { auth, googleProvider, facebookProvider, setGoogleAccessToken } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { PasswordInput } from '@/components/ui/password-input'

interface ChildEntry {
  name: string
  age: string
  targetJuz: string
  targetSurah: string
}

export function SignupForm() {
  const router = useRouter()
  // Role selector: 4 types (Student, Visitor, Teacher, Parent)
  const [role, setRole] = useState<'student' | 'visitor' | 'teacher' | 'parent'>('student')
  const [country, setCountry] = useState<CountryRule>(COUNTRY_RULES[0])
  
  // Common Required & Optional Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    docType: 'national_id' as 'national_id' | 'passport',
    identityCode: '',
    birthDate: '',
    calculatedAge: '',
    // Optional Common Fields
    targetJuz: '',
    targetSurah: '',
    notes: '',
    // Student specific
    parentName: '',
    parentPhone: '',
    // Teacher specific
    teacherSpecialty: '',
    teacherSubjects: '',
    teacherExperience: '',
    teacherQualifications: '',
  })

  // Parent specific: Multiple children
  const [childrenList, setChildrenList] = useState<ChildEntry[]>([
    { name: '', age: '', targetJuz: '1', targetSurah: 'الفاتحة' }
  ])

  // Audio Voice Sample Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [voiceBlobUrl, setVoiceBlobUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
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
  const [adminPhone, setAdminPhone] = useState<string>('01012345678')

  // Set default country on load
  useEffect(() => {
    const eg = COUNTRY_RULES.find(c => c.iso2 === 'EG')
    if (eg) setCountry(eg)
    else setCountry(COUNTRY_RULES[0])
  }, [])

  // Auto calculate age whenever Birth Date changes
  useEffect(() => {
    if (!formData.birthDate) {
      setFormData(prev => ({ ...prev, calculatedAge: '' }))
      return
    }
    try {
      const birth = new Date(formData.birthDate)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      if (age >= 0) {
        setFormData(prev => ({ ...prev, calculatedAge: String(age) }))
      } else {
        setFormData(prev => ({ ...prev, calculatedAge: '0' }))
      }
    } catch {
      setFormData(prev => ({ ...prev, calculatedAge: '' }))
    }
  }, [formData.birthDate])

  // Fetch admin phone from system settings
  useEffect(() => {
    fetch('/api/config/environment')
      .then(res => res.json())
      .then(data => {
        if (data.ADMIN_PHONE || data.adminPhone) {
          setAdminPhone(data.ADMIN_PHONE || data.adminPhone)
        }
      })
      .catch(() => {})
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

        // Immediately check status in DB
        fetch('/api/supabase/join-requests')
          .then(res => res.json())
          .then(data => {
            const match = (data.requests || []).find((r: any) =>
              (parsed.email && r.email?.toLowerCase() === parsed.email.toLowerCase()) ||
              (parsed.identityCode && r.identity_code === parsed.identityCode) ||
              (parsed.identity_code && r.identity_code === parsed.identity_code)
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
        const codeToCheck = activeUserIdentity?.identityCode || activeUserIdentity?.identity_code || formData.identityCode

        // Check local banned list
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
    const roleMap: Record<string, string> = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر', visitor: 'زائر' }
    const roleName = roleMap[user.role] || user.role
    const providerLabel = user.provider === 'google' ? 'Google' : user.provider === 'facebook' ? 'Facebook' : 'التسجيل المباشر'
    
    const starter = `السلام عليكم ورحمة الله وبركاته، أنا ${user.name} قمت بالتسجيل عبر (${providerLabel}) بصفة (${roleName}) وبرقم الوثيقة [${user.identityCode || user.identity_code}]. أرجو مراجعة طلب الاعتماد.`
    
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
        text: `وعليكم السلام ورحمة الله وبركاته يا ${user.name}. مرحباً بك في منصة ثِمار القرآنية! تم استلام طلبك ومراجعة تفاصيل البيانات. المحادثة مفتوحة والتنبيهات نشطة معنا لحين اعتماد التفعيل.`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setVoiceBlobUrl(url)
        // Stop all audio tracks
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      alert('تعذر الوصول للميكروفون لتسجيل العينة الصوتية. يمكنك متابعة إرسال الطلب بدونه.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // Children handling for Parent role
  const handleAddChild = () => {
    setChildrenList(prev => [...prev, { name: '', age: '', targetJuz: '1', targetSurah: 'الفاتحة' }])
  }

  const handleRemoveChild = (index: number) => {
    if (childrenList.length > 1) {
      setChildrenList(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleChildChange = (index: number, field: keyof ChildEntry, value: string) => {
    setChildrenList(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  // Admin chat send handler
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
            text: 'تم استلام رسالتك بنجاح وجاري مراجعة الطلب بواسطة إدارة منصة ثمار.',
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }, 1500)
    } catch {} finally {
      setAdminSending(false)
    }
  }

  // Validate form fields
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('يرجى كتابة الاسم بالكامل.')
      return false
    }
    if (!formData.phone.trim()) {
      setError('يرجى كتابة رقم الهاتف.')
      return false
    }
    if (!formData.identityCode.trim()) {
      setError('يرجى إدخال رقم الهوية أو جواز السفر.')
      return false
    }
    if (!formData.birthDate) {
      setError('يرجى اختيار تاريخ الميلاد.')
      return false
    }
    if (role === 'student' && !formData.parentName.trim()) {
      setError('يرجى كتابة اسم ولي الأمر للطالب.')
      return false
    }
    if (role === 'parent' && (!childrenList[0].name.trim())) {
      setError('يرجى كتابة اسم الابن أو الابنة.')
      return false
    }
    return true
  }

  // Submit Join Request Action (إرسال طلب الانضمام للمسؤول)
  const handleSubmitJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    const fullPhone = `${country?.dialCode || '20'}${formData.phone.replace(/\D/g, '')}`
    const generatedEmail = `user_${formData.identityCode.replace(/[^a-zA-Z0-9]/g, '') || Date.now()}@thimar.app`

    const payload = {
      name: formData.name.trim(),
      email: generatedEmail,
      phone: fullPhone,
      role,
      country: country.nameAr,
      doc_type: formData.docType,
      identity_code: formData.identityCode.trim(),
      birth_date: formData.birthDate,
      age: formData.calculatedAge ? parseInt(formData.calculatedAge) : undefined,
      provider: 'direct',
      target_juz: formData.targetJuz ? parseInt(formData.targetJuz) : undefined,
      target_surah: formData.targetSurah || undefined,
      student_name: role === 'student' ? formData.parentName.trim() : (role === 'parent' ? childrenList[0].name.trim() : undefined),
      teacher_specialty: role === 'teacher' ? formData.teacherSpecialty.trim() : undefined,
      teacher_subjects: role === 'teacher' ? formData.teacherSubjects.trim() : undefined,
      teacher_experience: role === 'teacher' ? formData.teacherExperience.trim() : undefined,
      teacher_qualifications: role === 'teacher' ? formData.teacherQualifications.trim() : undefined,
      parent_children: role === 'parent' ? JSON.stringify(childrenList) : undefined,
      voice_sample_url: voiceBlobUrl || undefined,
      notes: formData.notes.trim() || undefined,
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
      setError(err.message || 'حدث خطأ أثناء إرسال الطلب للمسؤول')
    } finally {
      setLoading(false)
    }
  }

  // Screen 2: Review & Pending Screen with Admin Chat and 2 Icon Buttons
  if (success) {
    const effectiveUser = activeUserIdentity || {
      name: formData.name || 'مستخدم جديد',
      email: activeUserIdentity?.email,
      role: role || 'student',
      identityCode: formData.identityCode
    }
    const roleLabel = effectiveUser.role === 'teacher' ? 'معلم' : effectiveUser.role === 'student' ? 'طالب' : effectiveUser.role === 'parent' ? 'ولي أمر' : 'زائر'

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
            <h2 className="text-xl sm:text-2xl font-black text-emerald-800">
              يسعدنا انضمامك، سيتم الموافقة على حسابك قريباً بإذن الله.
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              {accountStatus === 'approved' 
                ? 'لقد وافق المسؤول على حسابك وتم تفعيل صلاحياتك رسمياً.'
                : accountStatus === 'banned'
                ? 'تم حظر هذا الحساب من قِبل إدارة المنصة.'
                : 'تم حفظ طلب انضمامك في النظام وتنبيه المسؤول، وتبقى المحادثة أدناه نشطة للتواصل.'}
            </p>
          </div>
        </div>

        {/* TWO ICON-ONLY BUTTONS (Phone Call & Thimar Messages) */}
        <div className="flex items-center justify-center gap-6 py-2">
          {/* Phone Call Icon Button */}
          {adminPhone ? (
            <a
              href={`tel:${adminPhone}`}
              aria-label="الاتصال بالمسؤول عبر الهاتف"
              title={`اتصال بالمسؤول (${adminPhone})`}
              className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 transition-all active:scale-95"
            >
              <Phone className="w-7 h-7" />
            </a>
          ) : (
            <button
              disabled
              aria-label="رقم الهاتف غير متاح"
              title="رقم الهاتف غير متاح"
              className="w-14 h-14 bg-gray-200 text-gray-400 rounded-2xl flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              <Phone className="w-7 h-7" />
            </button>
          )}

          {/* Thimar Messages Icon Button (Opens Internal Chat below) */}
          <button
            onClick={() => {
              const chatEl = document.getElementById('adminChatContainer')
              if (chatEl) chatEl.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label="فتح محادثة ثمار الداخلية مع المسؤول"
            title="رسائل ثمار الداخلية"
            className="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 transition-all active:scale-95"
          >
            <Send className="w-7 h-7" />
          </button>
        </div>

        {/* Account Info Box */}
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
        </div>

        {/* Live Admin Chat Window inside Thimar */}
        <div id="adminChatContainer" className="bg-white rounded-3xl border border-emerald-200 shadow-lg overflow-hidden flex flex-col h-[380px]">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center font-black text-white text-base">
                ث
              </div>
              <div>
                <h4 className="font-bold text-sm">محادثة المسؤول المباشرة داخل ثمار</h4>
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
              placeholder="اكتب رسالتك للمسؤول هنا..."
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
              تعديل بيانات الطلب أو تقديم طلب آخر
            </button>
          )}
        </div>

        <AIChatBubble initialRole="guest" />
      </div>
    )
  }

  // Screen 1: Unified Registration Form
  return (
    <div className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden text-right" dir="rtl">
      {/* Header */}
      <div className="bg-emerald-600 p-8 text-white text-center">
        <h1 className="text-3xl font-black">طلب انضمام جديد</h1>
        <p className="opacity-85 mt-2 text-sm sm:text-base font-medium">
          استكمل بياناتك لإرسال طلب الانضمام للمسؤول
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitJoinRequest} className="space-y-6">
          {/* 1. ROLE SELECTION (اختيار نوع الحساب - 4 نوعاً) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              نوع الحساب *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'student', label: 'طالب', icon: User, color: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500' },
                { id: 'visitor', label: 'زائر', icon: Eye, color: 'bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-500' },
                { id: 'teacher', label: 'معلم', icon: GraduationCap, color: 'bg-blue-50 text-blue-800 border-blue-300 ring-2 ring-blue-500' },
                { id: 'parent', label: 'ولي أمر', icon: Users, color: 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as any)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    role === r.id ? r.color : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <r.icon className="w-5 h-5" />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. COMMON REQUIRED FIELDS */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              البيانات الأساسية للمستخدم
            </h3>

            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                الاسم بالكامل *
              </label>
              <input
                type="text"
                required
                placeholder="أدخل الاسم الثلاثي باللغة العربية أو الإنجليزية"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                الدولة *
              </label>
              <div className="relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none text-sm font-medium"
                  value={country.iso2}
                  onChange={(e) => setCountry(COUNTRY_RULES.find(c => c.iso2 === e.target.value) || COUNTRY_RULES[0])}
                >
                  {COUNTRY_RULES.map(c => (
                    <option key={c.iso2} value={c.iso2}>{c.nameAr} (+{c.dialCode})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                رقم الهاتف *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`+${country.dialCode}`}
                  className="w-20 px-2 py-3 bg-gray-100 border border-gray-200 rounded-xl text-center text-gray-600 text-xs font-mono font-bold"
                />
                <div className="relative flex-1">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    placeholder="أدخل رقم الهاتف"
                    className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>
            </div>

            {/* Identity Document Type & Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  نوع الوثيقة *
                </label>
                <select
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  value={formData.docType}
                  onChange={e => setFormData({ ...formData, docType: e.target.value as any })}
                >
                  <option value="national_id">بطاقة الهوية الوطنية</option>
                  <option value="passport">جواز السفر</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  رقم الهوية أو جواز السفر *
                </label>
                <input
                  type="text"
                  required
                  placeholder={country.identityPlaceholderAr || 'أدخل كود الوثيقة'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  value={formData.identityCode}
                  onChange={e => setFormData({ ...formData, identityCode: e.target.value })}
                />
              </div>
            </div>

            {/* Date of Birth & Calculated Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  تاريخ الميلاد *
                </label>
                <input
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  العمر (محسوب تلقائياً)
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formData.calculatedAge ? `${formData.calculatedAge} سنة` : 'تلقائي من تاريخ الميلاد'}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-emerald-800 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* 3. ROLE-SPECIFIC ADDITIONAL FIELDS */}
          
          {/* A. STUDENT SPECIFIC */}
          {role === 'student' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>بيانات الطالب المخصصة</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">اسم ولي الأمر *</label>
                  <input
                    type="text"
                    required
                    placeholder="أدخل اسم ولي الأمر"
                    value={formData.parentName}
                    onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم هاتف ولي الأمر</label>
                  <input
                    type="tel"
                    placeholder="أدخل رقم هاتف ولي الأمر"
                    value={formData.parentPhone}
                    onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* B. TEACHER SPECIFIC */}
          {role === 'teacher' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>بيانات ومؤهلات المعلم</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">التخصص</label>
                  <input
                    type="text"
                    placeholder="مثال: التجويد وقراءات القرآن"
                    value={formData.teacherSpecialty}
                    onChange={e => setFormData({ ...formData, teacherSpecialty: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المواد التي يدرسها</label>
                  <input
                    type="text"
                    placeholder="مثال: تحفيظ، إجازات، المتون"
                    value={formData.teacherSubjects}
                    onChange={e => setFormData({ ...formData, teacherSubjects: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الخبرة التعليمية (بالسنوات)</label>
                  <input
                    type="text"
                    placeholder="مثال: 5 سنوات"
                    value={formData.teacherExperience}
                    onChange={e => setFormData({ ...formData, teacherExperience: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">المؤهلات أو الشهادات</label>
                  <input
                    type="text"
                    placeholder="مثال: إجازة برواية حفص عن عاصم"
                    value={formData.teacherQualifications}
                    onChange={e => setFormData({ ...formData, teacherQualifications: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C. PARENT SPECIFIC (Multiple Children Support) */}
          {role === 'parent' && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>بيانات الأبناء والطلاب التابعين</span>
                </h4>

                <button
                  type="button"
                  onClick={handleAddChild}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة ابن آخر</span>
                </button>
              </div>

              {childrenList.map((child, idx) => (
                <div key={idx} className="p-3 bg-white border border-amber-200 rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-100 pb-1.5">
                    <span>الابن #{idx + 1}</span>
                    {childrenList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChild(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">اسم الابن/الابنة *</label>
                      <input
                        type="text"
                        required
                        placeholder="أدخل اسم الطالب"
                        value={child.name}
                        onChange={e => handleChildChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">العمر</label>
                      <input
                        type="number"
                        placeholder="مثال: 12"
                        value={child.age}
                        onChange={e => handleChildChange(idx, 'age', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">الجزء الحالي</label>
                      <select
                        value={child.targetJuz}
                        onChange={e => handleChildChange(idx, 'targetJuz', e.target.value)}
                        className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
                      >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                          <option key={juz} value={juz}>الجزء {juz}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">السورة الحالية</label>
                      <select
                        value={child.targetSurah}
                        onChange={e => handleChildChange(idx, 'targetSurah', e.target.value)}
                        className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold"
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
          )}

          {/* 4. COMMON OPTIONAL FIELDS */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              بيانات قرآنية واختيارية إضافية
            </h3>

            {/* Quran Juz & Surah for non-parents */}
            {role !== 'parent' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    الجزء الذي تحفظه من القرآن
                  </label>
                  <select
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    value={formData.targetJuz}
                    onChange={e => setFormData({ ...formData, targetJuz: e.target.value })}
                  >
                    <option value="">-- اختياري --</option>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => (
                      <option key={juz} value={juz}>الجزء {juz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    السورة التي وصلت إليها
                  </label>
                  <select
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    value={formData.targetSurah}
                    onChange={e => setFormData({ ...formData, targetSurah: e.target.value })}
                  >
                    <option value="">-- اختياري --</option>
                    {ALL_SURAHS.map(s => (
                      <option key={s.number} value={s.name}>{s.number}. سورة {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Voice Sample Audio Recorder (اختياري) */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>عينة البصمة الصوتية (اختياري)</span>
                </label>
                <span className="text-[10px] text-gray-400">للتأكد من نطق التلاوة</span>
              </div>

              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>تسجيل عينة تلاوة</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold animate-pulse"
                  >
                    <Square className="w-4 h-4" />
                    <span>إيقاف التسجيل</span>
                  </button>
                )}

                {voiceBlobUrl && (
                  <div className="flex items-center gap-2">
                    <audio src={voiceBlobUrl} controls className="h-8 max-w-[200px]" />
                    <button
                      type="button"
                      onClick={() => setVoiceBlobUrl(null)}
                      title="إعادة التسجيل"
                      className="p-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notes textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ملاحظات أو معلومات إضافية للمسؤول (اختياري)
              </label>
              <textarea
                rows={2}
                placeholder="اكتب أي معلومات ترغب في إيصالها للمسؤول..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 5. SUBMIT BUTTON FOR JOIN REQUEST */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>إرسال طلب الانضمام للمسؤول</span>
                </>
              )}
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

      <AIChatBubble initialRole="guest" />
    </div>
  )
}
