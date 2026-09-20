'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { COUNTRY_RULES, CountryRule } from '@/lib/country-rules'
import { Check, ChevronRight, Loader2, User, Phone, MapPin, BadgeCheck, GraduationCap, Users } from 'lucide-react'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { SocialAuthButtons } from './social-auth-buttons'

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'teacher' | 'student' | 'parent' | null>(null)
  const [country, setCountry] = useState<CountryRule | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identityCode: '',
    age: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [activeUserIdentity, setActiveUserIdentity] = useState<any>(null)
  const [accountStatus, setAccountStatus] = useState<'pending' | 'approved' | 'rejected' | 'banned'>('pending')
  const [adminMessages, setAdminMessages] = useState<Array<{ id: string; sender: 'user' | 'admin'; text: string; time: string }>>([])
  const [adminInput, setAdminInput] = useState('')
  const [adminSending, setAdminSending] = useState(false)

  // Default to Egypt or first country
  useEffect(() => {
    const eg = COUNTRY_RULES.find(c => c.iso2 === 'EG')
    if (eg) setCountry(eg)
    else setCountry(COUNTRY_RULES[0])
  }, [])

  // Poll status and admin messages when in success/review screen
  useEffect(() => {
    if (!success) return
    const interval = setInterval(async () => {
      try {
        const idToCheck = activeUserIdentity?.email || formData.email
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
            (activeUserIdentity?.identityCode && r.identity_code === activeUserIdentity.identityCode) ||
            (formData.identityCode && r.identity_code === formData.identityCode)
          )
          if (matched) {
            setAccountStatus(matched.status)
          }
        }

        // Also fetch live chat messages with admin
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
    }, 3000)

    return () => clearInterval(interval)
  }, [success, activeUserIdentity, formData.email, formData.identityCode])

  const setupStarterAdminChat = (user: any) => {
    const roleMap: Record<string, string> = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر' }
    const roleName = roleMap[user.role] || user.role
    const providerLabel = user.provider === 'google' ? 'Google' : user.provider === 'facebook' ? 'Facebook' : user.provider === 'whatsapp' ? 'WhatsApp' : 'التسجيل المباشر'
    const starter = `السلام عليكم ورحمة الله وبركاته، أنا ${user.name} قمت بإنشاء حساب جديد عبر (${providerLabel}) بصفتي (${roleName}) وبرمز هوية [${user.identityCode || user.identity_code}]. أرجو مراجعة الحساب واعتماده وتفعيله.`
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
        text: `وعليكم السلام ورحمة الله وبركاته يا ${user.name}. مرحباً بك في منصة ثِمار القرآنية! تم استلام طلب تسجيلك عبر (${providerLabel})، ومسؤولو المنصة يراجعون الحساب حالياً. يمكنك التحدث وإرسال أي استفسار هنا مباشرة وسنرد عليك فوراً.`,
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
      const email = activeUserIdentity?.email || formData.email
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
      }).catch(() => {})

      setTimeout(() => {
        setAdminMessages(prev => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'admin',
            text: 'شكراً لتواصلك، لقد تم إشعار إدارة المنصة برسالتك وسنرد في أقرب وقت.',
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }, 1200)
    } catch {} finally {
      setAdminSending(false)
    }
  }

  const handleSocialNewUser = (user: any) => {
    setActiveUserIdentity(user)
    setSuccess(true)
    setupStarterAdminChat(user)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/supabase/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: `${country?.dialCode}${formData.phone}`,
          role,
          country: country?.nameEn,
          identity_code: formData.identityCode,
          age: formData.age ? parseInt(formData.age) : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل إرسال الطلب')

      setActiveUserIdentity({
        name: formData.name,
        email: formData.email,
        phone: `${country?.dialCode}${formData.phone}`,
        role,
        identityCode: formData.identityCode
      })
      setupStarterAdminChat({
        name: formData.name,
        email: formData.email,
        role,
        identityCode: formData.identityCode
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const effectiveUser = activeUserIdentity || {
      name: formData.name || 'مستخدم جديد',
      email: formData.email,
      role: role || 'student',
      identityCode: formData.identityCode
    }
    const roleLabel = effectiveUser.role === 'teacher' ? 'معلم' : effectiveUser.role === 'student' ? 'طالب' : 'ولي أمر'
    const waText = encodeURIComponent(`السلام عليكم ورحمة الله، أنا ${effectiveUser.name} قمت بإنشاء حساب جديد كـ (${roleLabel}) بكود الهوية [${effectiveUser.identityCode}]. أرجو مراجعة الحساب واعتماده.`);

    return (
      <div className="text-right space-y-6 py-8 px-4 max-w-2xl mx-auto" dir="rtl">
        {/* Status Header */}
        <div className="text-center space-y-3">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner border transition-all ${
            accountStatus === 'banned' 
              ? 'bg-red-100 text-red-700 border-red-200' 
              : accountStatus === 'approved' 
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
              : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
            <BadgeCheck className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black">
              {accountStatus === 'banned' ? (
                <span className="bg-red-50 text-red-700 border border-red-200 px-3.5 py-1 rounded-full">
                  ⛔ تم حظر هذا الحساب من قبل إدارة المنصة
                </span>
              ) : accountStatus === 'approved' ? (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full">
                  ✅ تهانينا! تم قبول وتفعيل حسابك رسمياً
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3.5 py-1 rounded-full">
                  ⏳ الحساب قيد المراجعة الإدارية
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              مرحباً بك يا {effectiveUser.name} في منصة ثِمار
            </h2>
            <p className="text-gray-600 text-sm max-w-lg mx-auto leading-relaxed">
              {accountStatus === 'approved' 
                ? 'لقد تم اعتماد حسابك من قبل الإدارة، يمكنك الآن التوجه إلى لوحة التحكم واستخدام المنصة بالكامل.'
                : accountStatus === 'banned'
                ? 'نأسف، تم حظر هذا الحساب من قِبل إدارة المنصة لمخالفة الشروط أو السياسات.'
                : 'تم استلام طلب تسجيلك وبياناتك بنجاح، ويمكنك التحدث والتواصل المباشر مع إدارة المنصة أدناه حتى يتم تأكيد الحساب.'}
            </p>
          </div>
        </div>

        {/* Account Info Box */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-black text-gray-900 text-sm">
              <User className="w-4 h-4 text-emerald-600" />
              <span>{effectiveUser.name}</span>
              <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200">
                {roleLabel}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{effectiveUser.email}</p>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-gray-400 block">كود الهوية المسجل</span>
            <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {effectiveUser.identityCode}
            </span>
          </div>
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
                <h4 className="font-bold text-sm">إدارة منصة ثمار (المسؤول)</h4>
                <p className="text-[11px] text-emerald-200">
                  {accountStatus === 'approved' ? 'الحساب معتمد' : accountStatus === 'banned' ? 'الحساب محظور' : 'متصل الآن • قيد مراجعة الحساب'}
                </p>
              </div>
            </div>

            <a
              href={`https://wa.me/201012345678?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </a>
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
              {adminSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>إرسال</span>}
            </button>
          </form>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {accountStatus === 'approved' ? (
            <button
              onClick={() => router.push(`/${effectiveUser.role || 'student'}`)}
              className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              الدخول إلى المنصة الآن
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="flex-1 py-3.5 px-6 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-center"
            >
              الانتقال لتسجيل الدخول
            </button>
          )}
        </div>

        <AIChatBubble initialRole="guest" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
      <div className="bg-emerald-600 p-8 text-white text-center">
        <h1 className="text-3xl font-bold">إنشاء حساب جديد</h1>
        <p className="opacity-80 mt-2 text-lg">انضم إلى مجتمع ثمار القرآني</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center">
            {error}
          </div>
        )}

        <div className="mb-8">
          <SocialAuthButtons onNewUserCreated={handleSocialNewUser} />
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-4 bg-white text-gray-400 font-medium">أو التسجيل اليدوي</span></div>
          </div>
        </div>

        <form onSubmit={handleSignup} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <label className="block text-xl font-bold text-gray-800 mb-6 text-center">من أنت؟</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'teacher', label: 'معلم', icon: GraduationCap, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                    { id: 'student', label: 'طالب', icon: User, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                    { id: 'parent', label: 'ولي أمر', icon: Users, color: 'bg-amber-50 text-amber-600 border-amber-200' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group ${
                        role === r.id ? `${r.color} scale-105 shadow-md` : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-emerald-200'
                      }`}
                    >
                      <r.icon className={`w-12 h-12 mb-3 group-hover:scale-110 transition-transform`} />
                      <span className="font-bold text-lg">{r.label}</span>
                      {role === r.id && <Check className="absolute top-2 right-2 w-5 h-5" />}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!role}
                  onClick={() => setStep(2)}
                  className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-all shadow-lg"
                >
                  التالي <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">البلد</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none text-lg"
                      value={country?.iso2}
                      onChange={(e) => setCountry(COUNTRY_RULES.find(c => c.iso2 === e.target.value) || null)}
                    >
                      {COUNTRY_RULES.map(c => (
                        <option key={c.iso2} value={c.iso2}>{c.nameAr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم بالكامل</label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسمك الثلاثي"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      placeholder="example@email.com"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder={country?.dialCode ? `+${country.dialCode}` : ''}
                      readOnly
                      className="w-24 px-2 py-4 bg-gray-100 border border-gray-200 rounded-xl text-center text-gray-500"
                    />
                    <div className="relative flex-1">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        required
                        placeholder="رقم الهاتف بدون كود الدولة"
                        className="w-full pr-12 pl-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {country?.identityHintAr || 'كود الهوية أو جواز السفر'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={country?.identityPlaceholderAr}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    value={formData.identityCode}
                    onChange={e => setFormData({ ...formData, identityCode: e.target.value })}
                  />
                  <p className="mt-2 text-xs text-gray-500 italic flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin opacity-0" />
                    مثال: {country?.identityExampleAr}
                  </p>
                </div>

                {role === 'student' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">السن</label>
                    <input
                      type="number"
                      required
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                  >
                    السابق
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'إرسال طلب الانضمام'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="mt-8 text-center text-gray-500">
          لديك حساب بالفعل؟{' '}
          <button onClick={() => router.push('/login')} className="text-emerald-600 font-bold hover:underline">
            تسجيل الدخول
          </button>
        </p>
      </div>
      <AIChatBubble initialRole="guest" />
    </div>
  )
}
