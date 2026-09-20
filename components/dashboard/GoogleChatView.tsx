'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  Send, 
  Plus, 
  MoreVertical, 
  Phone, 
  Video, 
  ChevronRight,
  MessageCircle,
  Loader2,
  Check,
  CheckCheck,
  AlertCircle,
  LogIn
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { listSpaces, listMessages, sendMessage, ChatSpace, ChatMessage } from '@/lib/chat-service'
import { getGoogleAccessToken } from '@/lib/firebase'
import { t } from '@/lib/i18n'

export function GoogleChatView() {
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null)
  const [spaces, setSpaces] = useState<ChatSpace[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = getGoogleAccessToken()
    if (!token) {
      setNeedsAuth(true)
      setLoading(false)
      return
    }
    fetchSpaces()
  }, [])

  useEffect(() => {
    if (selectedSpace) {
      fetchMessages(selectedSpace.name)
      // Poll for new messages every 10 seconds
      const interval = setInterval(() => fetchMessages(selectedSpace.name), 10000)
      return () => clearInterval(interval)
    }
  }, [selectedSpace])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSpaces = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listSpaces()
      setSpaces(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
      if (err.message.includes('token')) setNeedsAuth(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (spaceName: string) => {
    try {
      const data = await listMessages(spaceName)
      setMessages(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedSpace || sending) return

    setSending(true)
    try {
      const msg = await sendMessage(selectedSpace.name, newMessage)
      setMessages(prev => [...prev, msg])
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  if (needsAuth) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <MessageCircle className="w-10 h-10" />
        </div>
        <div className="max-w-xs">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('تفعيل Google Chat')}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('يرجى تسجيل الدخول باستخدام Google لتفعيل ميزة الدردشة الرسمية والتواصل مع المعلمين.')}
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <LogIn className="w-5 h-5" /> {t('دخول عبر Google')}
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
      <AnimatePresence mode="wait">
        {!selectedSpace ? (
          <motion.div 
            key="spaces"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('غرف الدردشة')}</h3>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={t('ابحث عن غرفة...')}
                  className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm text-right"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">{t('جاري تحميل الغرف...')}</p>
                </div>
              ) : error ? (
                <div className="p-10 text-center space-y-4">
                   <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                   <p className="text-red-500 text-sm">{error}</p>
                   <button onClick={fetchSpaces} className="text-emerald-600 text-xs font-bold underline">{t('إعادة المحاولة')}</button>
                </div>
              ) : spaces.length === 0 ? (
                <div className="p-20 text-center text-gray-400 italic">{t('لا توجد غرف دردشة نشطة')}</div>
              ) : (
                spaces.map((space) => (
                  <button 
                    key={space.name}
                    onClick={() => setSelectedSpace(space)}
                    className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-bold text-xl shadow-sm">
                      {space.displayName?.[0] || 'G'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900 truncate">{space.displayName || t('غرفة عامة')}</h4>
                        <span className="text-[10px] text-gray-400 capitalize">{t(space.spaceType.toLowerCase())}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{t('تواصل مع الفريق عبر هذه الغرفة')}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            className="flex-1 flex flex-col bg-gray-50"
          >
            {/* Chat Header */}
            <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedSpace(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </button>
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold">
                  {selectedSpace.displayName?.[0] || 'G'}
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-gray-900 text-sm">{selectedSpace.displayName}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">{t('نشط الآن')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                  <MessageCircle className="w-16 h-16" />
                  <p className="text-sm font-medium">{t('ابدأ المحادثة في هذه الغرفة')}</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  // This is a simple heuristic, ideally we'd compare sender.name with current user's Google ID
                  const isMine = false 
                  return (
                    <div 
                      key={msg.name}
                      className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        isMine 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'
                      }`}>
                        {!isMine && <p className="text-[10px] font-bold text-emerald-600 mb-1">{msg.sender.displayName}</p>}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-start text-white/50' : 'justify-end text-gray-300'}`}>
                          <span className="text-[9px] font-medium">
                            {new Date(msg.createTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <footer className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button type="button" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 transition-all"><Plus className="w-5 h-5" /></button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={t('اكتب رسالتك هنا...')}
                  className="flex-1 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm text-right"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
