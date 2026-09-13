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
  Mail,
  Loader2,
  Check,
  CheckCheck,
  Sparkles,
  Globe,
  ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { requestJson } from '@/lib/api-client'
import { GoogleChatView } from './GoogleChatView'
import { AdminInboxView } from './AdminInboxView'
import { t } from '@/lib/i18n'

interface Message {
  id: string
  sender_id: string
  sender_name?: string
  sender_role?: string
  receiver_id?: string
  receiver_name?: string
  body: string
  created_at: string
  read?: boolean
  read_at?: string
}

interface Contact {
  id: string
  name: string
  role: string
  roleLabel: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  avatar?: string
  online?: boolean
}

export function MessagesView({ currentUser }: { currentUser?: { id?: string; email?: string; name?: string; role?: string } }) {
  const role = currentUser?.role || 'admin'
  const [activeMode, setActiveMode] = useState<'direct' | 'google_chat' | 'admin_inbox'>(role === 'admin' ? 'admin_inbox' : 'direct')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const myId = currentUser?.id || currentUser?.email || 'admin@thimar.org'
  const myName = currentUser?.name || (role === 'admin' ? 'المسؤول العام' : role === 'student' ? 'ياسين عمر' : 'ولي الأمر')

  useEffect(() => {
    fetchContacts()
  }, [role])

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id)
      const interval = setInterval(() => {
        fetchMessages(selectedContact.id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedContact])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      let contactList: Contact[] = []

      if (role === 'admin') {
        // Admin communicates with students, teachers, parents
        try {
          const data = await requestJson<any>('/api/supabase/students')
          const apiStudents = (data.students || []).map((s: any) => ({
            id: s.email || s.id,
            name: s.name,
            role: 'student',
            roleLabel: 'طالب مسجل',
            lastMessage: 'السلام عليكم يا أستاذ، لدي استفسار بخصوص الورد',
            lastMessageTime: '١١:١٥ ص',
            unreadCount: 1,
            avatar: s.name?.[0] || 'ط',
            online: true
          }))
          contactList = [...apiStudents]
        } catch {
          // fallback contacts
        }

        // Add pre-set contacts for admin
        contactList = [
          ...contactList,
          {
            id: 'teacher_ahmed@thimar.org',
            name: 'أ. أحمد علي',
            role: 'teacher',
            roleLabel: 'معلم حلقة النور',
            lastMessage: 'تم الانتهاء من تقييم تسميع اليوم لجميع طلاب الحلقة',
            lastMessageTime: '١٠:٤٥ ص',
            unreadCount: 2,
            avatar: 'أ',
            online: true
          },
          {
            id: 'parent_omar@thimar.app',
            name: 'أبو عمر (ولي أمر)',
            role: 'parent',
            roleLabel: 'ولي أمر ياسين ولينا',
            lastMessage: 'شكراً جزيلاً لاهتمامكم ومتابعتكم المستمرة',
            lastMessageTime: 'أمس',
            unreadCount: 0,
            avatar: 'و',
            online: false
          }
        ]
      } else if (role === 'student') {
        // Student communicates with their teacher and admin
        contactList = [
          {
            id: 'teacher_ahmed@thimar.org',
            name: 'أ. أحمد علي',
            role: 'teacher',
            roleLabel: 'معلم الحلقة المشرف',
            lastMessage: 'بارك الله فيك يا ياسين، أحسنت في تسميع اليوم',
            lastMessageTime: '١١:٠٠ ص',
            unreadCount: 1,
            avatar: 'أ',
            online: true
          },
          {
            id: 'admin@thimar.org',
            name: 'إدارة منصة ثمار',
            role: 'admin',
            roleLabel: 'الدعم الفني والإشراف',
            lastMessage: 'مرحباً بك في منصة ثمار لتعليم القرآن الكريم',
            lastMessageTime: 'أمس',
            unreadCount: 0,
            avatar: 'ث',
            online: true
          }
        ]
      } else {
        // Parent communicates with teachers of children and administration
        contactList = [
          {
            id: 'teacher_ahmed@thimar.org',
            name: 'أ. أحمد علي',
            role: 'teacher',
            roleLabel: 'معلم حلقة ياسين',
            lastMessage: 'ياسين متميز جداً وحفظه في سورة النور متقن',
            lastMessageTime: '١٠:١٥ ص',
            unreadCount: 1,
            avatar: 'أ',
            online: true
          },
          {
            id: 'teacher_sarah@thimar.org',
            name: 'أ. سارة خالد',
            role: 'teacher',
            roleLabel: 'معلمة حلقة لينا',
            lastMessage: 'لينا أتمت حفظ تحفة الأطفال بنجاح',
            lastMessageTime: 'أمس',
            unreadCount: 0,
            avatar: 'س',
            online: false
          },
          {
            id: 'admin@thimar.org',
            name: 'إدارة منصة ثمار',
            role: 'admin',
            roleLabel: 'خدمة أولياء الأمور',
            lastMessage: 'يسعدنا دائماً استقبال استفساراتكم واقتراحاتكم',
            lastMessageTime: 'منذ يومين',
            unreadCount: 0,
            avatar: 'ث',
            online: true
          }
        ]
      }

      setContacts(contactList)
      if (contactList.length > 0 && !selectedContact && window.innerWidth >= 1024) {
        setSelectedContact(contactList[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (contactId: string) => {
    try {
      const data = await requestJson<any>('/api/messages')
      const all: Message[] = data.messages || []
      
      const filtered = all.filter((m: any) => {
        const sid = String(m.sender_id || m.sender_email || '').toLowerCase()
        const rid = String(m.receiver_id || m.receiver_email || '').toLowerCase()
        const target = contactId.toLowerCase()
        return sid === target || rid === target
      })

      if (filtered.length > 0) {
        setMessages(filtered)
      } else {
        // Provide starter greeting message
        setMessages([
          {
            id: 'welcome_1',
            sender_id: contactId,
            sender_name: selectedContact?.name,
            body: `السلام عليكم ورحمة الله وبركاته، أهلاً بك يا ${myName}. يسعدني التواصل معك عبر منصة ثمار.`,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read: true
          }
        ])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedContact || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    const tempMsg: Message = {
      id: `local_${Date.now()}`,
      sender_id: myId,
      sender_name: myName,
      sender_role: role,
      receiver_id: selectedContact.id,
      receiver_name: selectedContact.name,
      body: messageText,
      created_at: new Date().toISOString(),
      read: false
    }

    setMessages(prev => [...prev, tempMsg])

    try {
      await requestJson<any>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: selectedContact.id,
          recipientName: selectedContact.name,
          recipientRole: selectedContact.role === 'teacher' ? 'admin' : selectedContact.role,
          body: messageText,
          senderRole: role
        })
      })
    } catch (err) {
      console.error('Send message failed:', err)
    } finally {
      setSending(false)
    }
  }

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roleLabel.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-24 text-right" dir="rtl">
      {/* Header with Mode Toggle */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 italic flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
            {t('الرسائل والمحادثات')}
          </h2>
          <p className="text-gray-500 mt-1">
            {role === 'admin' ? t('التواصل المباشر مع المعلمين والطلاب وأولياء الأمور') :
             role === 'student' ? t('تواصل مع معلم الحلقة وإدارة المنصة') :
             t('متابعة التواصل مع معلمي الأبناء والإدارة')}
          </p>
        </div>

        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 self-start">
          {role === 'admin' && (
            <button
              onClick={() => setActiveMode('admin_inbox')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeMode === 'admin_inbox'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>بريد المسؤول</span>
            </button>
          )}
          <button
            onClick={() => setActiveMode('direct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeMode === 'direct'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>رسائل المنصة</span>
          </button>
          <button
            onClick={() => setActiveMode('google_chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeMode === 'google_chat'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Google Chat</span>
          </button>
        </div>
      </header>

      {/* View Switcher */}
      {activeMode === 'google_chat' ? (
        <GoogleChatView />
      ) : activeMode === 'admin_inbox' ? (
        <AdminInboxView />
      ) : (
        <div className="h-[calc(100vh-16rem)] min-h-[550px] flex bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Contacts Sidebar (List) */}
          <div className={`${
            selectedContact ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-80 xl:w-96 flex-col border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900`}>
            
            {/* Search Box */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('ابحث عن اسم أو دور...')}
                  className="w-full pr-11 pl-4 py-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-7 h-7 animate-spin mb-3 text-emerald-600" />
                  <p className="text-xs font-bold">{t('جاري تحميل المحادثات...')}</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs italic">
                  {t('لا توجد محادثات متطابقة')}
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContact?.id === contact.id
                  return (
                    <button 
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`w-full p-4 flex items-center gap-3.5 transition-all text-right ${
                        isSelected 
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-r-4 border-emerald-600' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm">
                          {contact.avatar}
                        </div>
                        {contact.online && (
                          <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{contact.name}</h4>
                          <span className="text-[10px] text-gray-400">{contact.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[170px]">{contact.lastMessage}</p>
                          {contact.unreadCount && contact.unreadCount > 0 ? (
                            <span className="bg-emerald-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                              {contact.unreadCount}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 inline-block">
                          {contact.roleLabel}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Window Area */}
          <div className={`${
            !selectedContact ? 'hidden lg:flex' : 'flex'
          } flex-1 flex-col bg-gray-50/50 dark:bg-gray-950/30 overflow-hidden`}>
            
            {selectedContact ? (
              <>
                {/* Active Chat Header */}
                <header className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedContact(null)}
                      className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      title="الرجوع للقائمة"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    <div className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm">
                      {selectedContact.avatar}
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{selectedContact.name}</h4>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {selectedContact.roleLabel} • {selectedContact.online ? 'متصل الآن' : 'غير متصل'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-gray-400">
                    <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors hover:text-emerald-600">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors hover:text-emerald-600">
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </header>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                      <MessageCircle className="w-14 h-14 text-emerald-300 stroke-1" />
                      <p className="text-xs font-bold">ابدأ محادثتك المباركة مع {selectedContact.name}</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender_id === myId || msg.sender_role === role
                      return (
                        <div 
                          key={msg.id || i}
                          className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-3xl shadow-sm text-right ${
                            isMine 
                              ? 'bg-emerald-600 text-white rounded-br-sm' 
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-700'
                          }`}>
                            <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                            <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] ${
                              isMine ? 'text-emerald-100 justify-start' : 'text-gray-400 justify-end'
                            }`}>
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMine && (
                                <CheckCheck className="w-3 h-3 text-emerald-200" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                  <form onSubmit={sendMessage} className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={t('اكتب رسالتك هنا...')}
                      className="flex-1 py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
                    </button>
                  </form>
                </footer>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center">
                  <MessageCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{t('اختر محادثة')}</h3>
                  <p className="text-xs text-gray-500 mt-1">{t('انقر على أي جهة اتصال لبدء الدردشة ومتابعة السجل')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
