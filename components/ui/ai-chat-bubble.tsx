'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, X, Send, User, Brain, ShieldCheck, Globe, MessageSquare } from 'lucide-react'

export function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<{ role: 'user' | 'ai' | 'admin', text: string }[]>([
    { role: 'ai', text: 'أهلاً بك في ثمار! أنا مساعدك الذكي. يمكنك التحدث معي أو طلب التواصل مع المسؤول مباشرة.' }
  ])

  const handleSend = () => {
    if (!message.trim()) return
    const newChat: { role: 'user' | 'ai' | 'admin', text: string }[] = [...chat, { role: 'user', text: message }]
    setChat(newChat)
    setMessage('')

    // Simulate AI or Admin Response
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'ai', text: 'تم استلام رسالتك. سيقوم المسؤول بمراجعة طلبك والرد عليك في أقرب وقت عبر واتساب أو البريد الإلكتروني.' }])
    }, 1000)
  }

  const openWhatsApp = () => {
    window.open('https://wa.me/201012345678', '_blank')
  }

  return (
    <div className="fixed bottom-8 left-8 z-[110] flex flex-col items-end gap-4" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 md:w-96 bg-white rounded-[2.5rem] shadow-2xl border border-emerald-100 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold">تواصل مع ثمار</h4>
                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">المسؤول والذكاء الاصطناعي</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 shadow-sm border border-emerald-50 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 bg-white space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> واتساب
                </button>
                <button className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                  <Globe className="w-4 h-4" /> جوجل
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-bounce">
          ١
        </div>
      </button>
    </div>
  )
}
