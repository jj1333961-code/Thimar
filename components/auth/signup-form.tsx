'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { COUNTRY_RULES, CountryRule } from '@/lib/country-rules'
import { Check, ChevronRight, Loader2, User, Phone, MapPin, BadgeCheck, GraduationCap, Users } from 'lucide-react'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'

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

  // Default to Egypt or first country
  useEffect(() => {
    const eg = COUNTRY_RULES.find(c => c.iso2 === 'EG')
    if (eg) setCountry(eg)
    else setCountry(COUNTRY_RULES[0])
  }, [])

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

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const waText = encodeURIComponent(`السلام عليكم ورحمة الله، لقد قمت بإنشاء حساب جديد في منصة ثمار باسم: ${formData.name || 'مستخدم جديد'} كـ (${role === 'teacher' ? 'معلم' : role === 'student' ? 'طالب' : 'ولي أمر'})، وأود متابعة حالة تفعيل الحساب.`);

    return (
      <div className="text-center space-y-6 py-8 px-4 max-w-xl mx-auto" dir="rtl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner border border-emerald-200">
          <BadgeCheck className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-100">
            تم استلام طلبك بنجاح
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
            مرحباً بك في أسرة ثِمار القرآنية
          </h2>
          <p className="text-gray-600 text-sm max-w-md mx-auto leading-relaxed">
            تم تسجيل بياناتك بنجاح، وحسابك الآن قيد المراجعة الإدارية السريعة لضمان أفضل بيئة تعليمية وقرآنية.
          </p>
        </div>

        {/* Contact Options Box */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm text-right space-y-4">
          <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>خيارات الرد والتواصل الفوري معك:</span>
          </h4>

          <div className="space-y-3 text-xs">
            {/* Option 1: WhatsApp */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#25D366] text-white rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">المراسلة الفورية عبر واتساب</p>
                  <p className="text-gray-500 text-[11px]">رد سريع من المشرفين وتأكيد الحساب</p>
                </div>
              </div>
              <a
                href={`https://wa.me/201012345678?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#25D366] text-white rounded-xl font-bold hover:brightness-105 transition-all text-center whitespace-nowrap"
              >
                تواصل واتساب
              </a>
            </div>

            {/* Option 2: Google / Email */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">حساب جوجل والبريد الإلكتروني</p>
                  <p className="text-gray-500 text-[11px]">{formData.email || 'سيصلك إشعار القبول على بريدك'}</p>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-white text-blue-700 border border-blue-200 rounded-xl font-bold text-[11px]">
                تم التسجيل
              </span>
            </div>

            {/* Option 3: Circular Chat Bubble */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">الأيقونة الدائرية في الأسفل</p>
                  <p className="text-gray-500 text-[11px]">تحدث مباشرة مع مساعد ثمار أو المسؤول</p>
                </div>
              </div>
              <span className="text-[11px] text-amber-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                زر الدردشة ↙
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => router.push('/login')}
            className="flex-1 py-3.5 px-6 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            الانتقال لتسجيل الدخول
          </button>
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
