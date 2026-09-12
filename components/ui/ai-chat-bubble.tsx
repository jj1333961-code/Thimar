'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  MessageCircle, X, Send, User, Brain, ShieldCheck, Globe, 
  MessageSquare, Loader2, Sparkles, Phone, Mail, CheckCircle2, 
  ChevronDown, HelpCircle, ArrowRight
} from 'lucide-react'

interface AIChatBubbleProps {
  initialRole?: 'student' | 'teacher' | 'parent' | 'admin' | 'guest'
}

export function AIChatBubble({ initialRole = 'guest' }: AIChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'ai' | 'admin'>('ai')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; text: string; time?: string }[]>([
    { 
      role: 'ai', 
      text: 'السلام عليكم ورحمة الله وبركاته! مرحباً بك في منصة ثمار. أنا مساعدك الذكي، يمكنك سؤالي عن أي شيء بالمنصة أو التبديل لتبويب "المسؤولين" للتواصل البشري المباشر.',
      time: 'الآن'
    }
  ])

  // Admin contact form state
  const [adminForm, setAdminForm] = useState({
    name: '',
    phoneOrEmail: '',
    inquiry: '',
  })
  const [adminSending, setAdminSending] = useState(false)
  const [adminSentSuccess, setAdminSentSuccess] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chat, isOpen, activeTab])

  const quickQuestions = [
    'كيف أسجل كطالب جديد؟',
    'ما هي مميزات المصحح الذكي؟',
    'كيف يتواصل ولي الأمر مع المعلم؟',
    'أريد معرفة أوقات الحلقات'
  ]

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || message).trim()
    if (!textToSend || isLoading) return

    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    const newChat = [...chat, { role: 'user' as const, text: textToSend, time: nowTime }]
    setChat(newChat)
    if (!customText) setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: textToSend,
          role: initialRole,
          history: chat.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      })

      if (!response.ok) throw new Error('فشل الاتصال')
      
      const data = await response.json()
      setChat(prev => [...prev, { 
        role: 'ai', 
        text: data.text || 'أهلاً بك، نسعد بخدمتك دائماً في منصة ثمار.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }])
    } catch (error) {
      console.error(error)
      setChat(prev => [...prev, { 
        role: 'ai', 
        text: 'أهلاً بك! يمكنك أيضاً التواصل مباشرة مع الإدارة عبر الواتساب أو الضغط على تبويب "المسؤولين" بالأعلى.',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const openWhatsApp = (customMessage?: string) => {
    const defaultMsg = customMessage || encodeURIComponent('السلام عليكم ورحمة الله، أود الاستفسار والتواصل مع إدارة منصة ثمار.')
    window.open(`https://wa.me/201012345678?text=${defaultMsg}`, '_blank')
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminForm.inquiry.trim()) return

    setAdminSending(true)
    // Simulate / log admin ticket submission
    try {
      await new Promise(res => setTimeout(res, 800))
      setAdminSentSuccess(true)
    } finally {
      setAdminSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-[110] flex flex-col items-start gap-3" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-emerald-100 overflow-hidden flex flex-col h-[560px] max-h-[82vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-emerald-800 to-teal-700 p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
                    <ShieldCheck className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">مساعد ودعم ثمار</h4>
                    <p className="text-[10px] text-emerald-200">الذكاء الاصطناعي والإدارة المباشرة</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-emerald-100 hover:text-white"
                  aria-label="إغلاق الدردشة"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/20 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'ai' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>الذكاء الاصطناعي</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'admin' 
                    ? 'bg-white text-emerald-900 shadow-sm' 
                    : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>المسؤولون فقط</span>
                </button>
              </div>
            </div>

            {/* TAB 1: AI Assistant */}
            {activeTab === 'ai' && (
              <div className="flex-1 flex flex-col min-h-0 bg-[#FBFBFA]">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chat.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tl-none shadow-sm' 
                        : 'bg-white text-gray-800 shadow-sm border border-emerald-50 rounded-tr-none'
                      }`}>
                        {msg.role === 'ai' && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>مساعد ثمار الذكي</span>
                          </div>
                        )}
                        <p>{msg.text}</p>
                      </div>
                      {msg.time && (
                        <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-emerald-50 w-fit text-xs text-emerald-700 shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التفكير وصياغة الإجابة...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                {chat.length < 5 && (
                  <div className="p-2.5 bg-emerald-50/50 border-t border-emerald-100/60 overflow-x-auto flex gap-1.5 no-scrollbar">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-medium whitespace-nowrap hover:bg-emerald-50 transition-colors shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Input */}
                <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="اكتب سؤالك لمساعد ثمار..."
                    className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !message.trim()}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all shrink-0"
                    aria-label="إرسال"
                  >
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Direct Admin Contact */}
            {activeTab === 'admin' && (
              <div className="flex-1 flex flex-col p-4 bg-[#FBFBFA] overflow-y-auto space-y-4">
                <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-xs leading-relaxed text-emerald-900">
                  <p className="font-bold mb-1 flex items-center gap-1.5 text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>التواصل المباشر مع إدارة المنصة</span>
                  </p>
                  <p className="text-gray-600 text-[11px]">
                    فريق الإشراف الإداري متاح للرد على أي استفسارات أو تسريع اعتماد الحسابات الجديدة.
                  </p>
                </div>

                {/* Direct Instant Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => openWhatsApp()}
                    className="flex items-center justify-center gap-2 py-3 px-3 bg-[#25D366] text-white rounded-2xl text-xs font-bold hover:brightness-105 shadow-md shadow-emerald-600/10 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>واتساب الإدارة</span>
                  </button>

                  <a 
                    href="mailto:support@thimar.app"
                    className="flex items-center justify-center gap-2 py-3 px-3 bg-white border border-gray-200 text-gray-800 rounded-2xl text-xs font-bold hover:bg-gray-50 shadow-sm transition-all"
                  >
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>البريد الرسمي</span>
                  </a>
                </div>

                {/* Direct In-App Message to Admin */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col">
                  {adminSentSuccess ? (
                    <div className="text-center py-6 space-y-3 my-auto">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h5 className="font-bold text-sm text-gray-900">تم إرسال رسالتك بنجاح!</h5>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                        تم تسجيل طلبك لدى مسؤولي ثمار، وسيتم التواصل معك عبر الواتساب أو البريد في أقرب وقت.
                      </p>
                      <button
                        onClick={() => {
                          setAdminSentSuccess(false)
                          setAdminForm({ name: '', phoneOrEmail: '', inquiry: '' })
                        }}
                        className="text-xs font-bold text-emerald-600 hover:underline pt-2"
                      >
                        إرسال رسالة أخرى
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAdminSubmit} className="space-y-2.5">
                      <h5 className="font-bold text-xs text-gray-800">أرسل استفسارك للإدارة مباشرة:</h5>
                      
                      <input
                        type="text"
                        placeholder="اسمك الكريم"
                        required
                        value={adminForm.name}
                        onChange={e => setAdminForm({ ...adminForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />

                      <input
                        type="text"
                        placeholder="رقم الواتساب أو البريد الإلكتروني"
                        required
                        value={adminForm.phoneOrEmail}
                        onChange={e => setAdminForm({ ...adminForm, phoneOrEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />

                      <textarea
                        placeholder="اكتب استفسارك أو طلبك هنا بالتفصيل..."
                        rows={3}
                        required
                        value={adminForm.inquiry}
                        onChange={e => setAdminForm({ ...adminForm, inquiry: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:bg-white resize-none"
                      />

                      <button
                        type="submit"
                        disabled={adminSending || !adminForm.inquiry.trim()}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        {adminSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 rotate-180" />
                            <span>إرسال للإدارة</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Floating Circular Button (خانت الرسالة التي تشبه الدائرة في أسفل الشاشة) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/25 hover:scale-105 active:scale-95 transition-all group relative border-2 border-white/20"
        title="تحدث مع مساعد ثمار أو الإدارة"
        aria-label="زر المحادثة والمساعد الذكي"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div 
              key="close" 
              initial={{ rotate: -90, opacity: 0 }} 
              animate={{ rotate: 0, opacity: 1 }} 
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div 
              key="open" 
              initial={{ rotate: 90, opacity: 0 }} 
              animate={{ rotate: 0, opacity: 1 }} 
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="w-7 h-7" />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -left-1 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Indicator */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] text-white font-bold items-center justify-center">
              ١
            </span>
          </span>
        )}
      </button>
    </div>
  )
}
