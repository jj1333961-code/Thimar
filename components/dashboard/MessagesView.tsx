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
  CheckCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Message {
  id: number
  sender_id: string
  recipient_id: string
  body: string
  created_at: string
  read_at?: string
}

interface Contact {
  id: string
  name: string
  role: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  avatar?: string
}

export function MessagesView({ currentUser }: { currentUser: any }) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id)
    }
  }, [selectedContact])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchContacts = async () => {
    setLoading(true)
    try {
      // In a real app, we'd fetch actual contacts based on the user's role and relations
      // For now, let's fetch students if admin, or teachers if student/parent
      const res = await fetch('/api/supabase/students') // Example endpoint
      const data = await res.json()
      
      const formattedContacts = (data.students || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        lastMessage: 'أهلاً بك...',
        lastMessageTime: '١٠:٣٠ ص',
        unreadCount: Math.floor(Math.random() * 3),
        avatar: s.name[0]
      }))
      setContacts(formattedContacts)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await fetch(`/api/messages?contactId=${contactId}`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedContact.id,
          body: newMessage
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedContact ? (
          <motion.div 
            key="contacts"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">الرسائل</h3>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="ابحث عن اسم..."
                  className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">جاري تحميل المحادثات...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-20 text-center text-gray-400 italic">لا توجد محادثات نشطة</div>
              ) : (
                contacts.map((contact) => (
                  <button 
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-bold text-xl shadow-sm">
                      {contact.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900 truncate">{contact.name}</h4>
                        <span className="text-[10px] text-gray-400">{contact.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                        {contact.unreadCount! > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
            className="flex-1 flex flex-col bg-gray-50"
          >
            {/* Chat Header */}
            <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </button>
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold">
                  {selectedContact.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedContact.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold">متصل الآن</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><Video className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                  <MessageCircle className="w-16 h-16" />
                  <p className="text-sm font-medium">ابدأ المحادثة الآن مع {selectedContact.name}</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender_id === currentUser.id
                  return (
                    <div 
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        isMine 
                        ? 'bg-emerald-600 text-white rounded-tl-none' 
                        : 'bg-white text-gray-900 rounded-tr-none border border-gray-100'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.body}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end text-white/50' : 'justify-start text-gray-300'}`}>
                          <span className="text-[9px] font-medium">
                            {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            msg.read_at ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                          )}
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
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <button type="button" className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 transition-all"><Plus className="w-5 h-5" /></button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
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
