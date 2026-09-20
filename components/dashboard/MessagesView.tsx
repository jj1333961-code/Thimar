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
  ArrowRight,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Users,
  Copy,
  PhoneOff,
  VideoOff,
  Play,
  Pause,
  X,
  Hash,
  UserCheck,
  Radio
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { requestJson } from '@/lib/api-client'
import { GoogleChatView } from './GoogleChatView'
import { AdminInboxView } from './AdminInboxView'
import { t } from '@/lib/i18n'

interface MessageAttachment {
  name: string
  size?: string
  type: 'image' | 'file' | 'voice'
  url?: string
  duration?: string
}

interface CallLog {
  type: 'audio' | 'video'
  duration: string
  status: 'completed' | 'missed'
}

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
  attachment?: MessageAttachment
  callLog?: CallLog
}

interface Contact {
  id: string
  identityCode: string
  name: string
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'group'
  roleLabel: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  avatar?: string
  online?: boolean
  isGroup?: boolean
  membersCount?: number
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
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'groups' | 'direct' | 'teachers'>('all')

  // Modals state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDesc, setNewGroupDesc] = useState('')
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([])

  const [showIdSearchModal, setShowIdSearchModal] = useState(false)
  const [searchIdCode, setSearchIdCode] = useState('')
  const [idSearchError, setIdSearchError] = useState('')

  // Attachment & Voice Recording state
  const [pendingAttachment, setPendingAttachment] = useState<MessageAttachment | null>(null)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Voice playback
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)

  // Calling Modal state
  const [activeCall, setActiveCall] = useState<{
    contact: Contact
    type: 'audio' | 'video'
    duration: number
    isMuted: boolean
    isVideoOff: boolean
  } | null>(null)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const myId = currentUser?.id || currentUser?.email || 'admin@thimar.org'
  const myName = currentUser?.name || (role === 'admin' ? 'المسؤول العام' : role === 'student' ? 'ياسين عمر' : 'ولي الأمر')
  const myIdentityCode = '#THM-' + (role === 'admin' ? '1001' : role === 'student' ? '8294' : '5512')

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

  // Call timer effect
  useEffect(() => {
    if (activeCall) {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null)
      }, 1000)
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
  }, [activeCall?.contact?.id])

  // Voice recording timer effect
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [isRecordingVoice])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      let contactList: Contact[] = [
        // Groups & Halqas
        {
          id: 'group_nour',
          identityCode: '#GRP-771',
          name: 'حلقة النور والفرقان (المستوى المتقدم)',
          role: 'group',
          roleLabel: 'حلقة تسميع جماعية',
          lastMessage: 'أ. أحمد علي: بارك الله فيكم، موعد التسميع غداً بعد صلاة العصر',
          lastMessageTime: '١١:٣٠ ص',
          unreadCount: 3,
          avatar: 'ن',
          online: true,
          isGroup: true,
          membersCount: 14
        },
        {
          id: 'group_tuhfa',
          identityCode: '#GRP-402',
          name: 'مدارسة تحفة الأطفال وأحكام التجويد',
          role: 'group',
          roleLabel: 'مجموعة دراسة المتون',
          lastMessage: 'تم رفع التسجيل الصوتي لباب أحكام النون الساكنة والتنوين',
          lastMessageTime: 'أمس',
          unreadCount: 0,
          avatar: 'ت',
          online: true,
          isGroup: true,
          membersCount: 22
        },
        // Teachers
        {
          id: 'teacher_ahmed@thimar.org',
          identityCode: '#TCH-310',
          name: 'الشيخ أ. أحمد علي',
          role: 'teacher',
          roleLabel: 'معلم القراءات وإجازة حفص',
          lastMessage: 'تم مراجعة الورد القرآني، نفع الله بك وبهمتك',
          lastMessageTime: '١٠:٤٥ ص',
          unreadCount: 1,
          avatar: 'أ',
          online: true
        },
        {
          id: 'teacher_sarah@thimar.org',
          identityCode: '#TCH-512',
          name: 'المعلمة أ. سارة خالد',
          role: 'teacher',
          roleLabel: 'معلمة حلقة التجويد والإتقان',
          lastMessage: 'أداء ممتاز في اختبار التجويد الأخير',
          lastMessageTime: 'أمس',
          unreadCount: 0,
          avatar: 'س',
          online: false
        },
        // Direct students & parents
        {
          id: 'student_yassine@thimar.org',
          identityCode: '#STU-8294',
          name: 'ياسين عمر',
          role: 'student',
          roleLabel: 'طالب مسجل • جزء عمّ',
          lastMessage: 'السلام عليكم يا شيخنا، هل يمكن إعادة تسميع الآيات؟',
          lastMessageTime: '٠٩:٢٠ ص',
          unreadCount: 0,
          avatar: 'ي',
          online: true
        },
        {
          id: 'parent_omar@thimar.app',
          identityCode: '#PAR-9921',
          name: 'أبو عمر (ولي أمر)',
          role: 'parent',
          roleLabel: 'ولي أمر ياسين ولينا',
          lastMessage: 'جزاكم الله كل خير على المتابعة الدقيقة لمستوى الأبناء',
          lastMessageTime: 'منذ يومين',
          unreadCount: 0,
          avatar: 'و',
          online: true
        },
        {
          id: 'admin@thimar.org',
          identityCode: '#ADM-1001',
          name: 'إدارة منصة ثمار',
          role: 'admin',
          roleLabel: 'الدعم الفني والإشراف العام',
          lastMessage: 'أهلاً بك دائماً في منصة ثمار، نحن في خدمتك',
          lastMessageTime: 'منذ ٣ أيام',
          unreadCount: 0,
          avatar: 'ث',
          online: true
        }
      ]

      // Load any custom created groups from localStorage
      try {
        const storedCustom = localStorage.getItem('thimar_custom_groups')
        if (storedCustom) {
          const parsed = JSON.parse(storedCustom)
          if (Array.isArray(parsed)) {
            contactList = [...parsed, ...contactList]
          }
        }
      } catch {}

      setContacts(contactList)
      if (contactList.length > 0 && !selectedContact && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setSelectedContact(contactList[0])
      }
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
        // Initial welcome messages with a voice sample and an introductory note
        setMessages([
          {
            id: 'welcome_1',
            sender_id: contactId,
            sender_name: selectedContact?.name,
            body: `السلام عليكم ورحمة الله وبركاته، مرحباً بك يا ${myName} في منصة ثمار. نسعد بالتواصل معك ومتابعة مسيرتك المباركة.`,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            read: true
          },
          {
            id: 'welcome_voice',
            sender_id: contactId,
            sender_name: selectedContact?.name,
            body: 'تسجيل صوتي لملاحظات التسميع والتجويد',
            created_at: new Date(Date.now() - 1800000).toISOString(),
            read: true,
            attachment: {
              type: 'voice',
              name: 'ملاحظة صوتية.m4a',
              duration: '0:24',
              size: '340 KB'
            }
          }
        ])
      }
    } catch {
      // Fallback
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!newMessage.trim() && !pendingAttachment) || !selectedContact || sending) return

    const messageText = newMessage.trim()
    const attachmentToSend = pendingAttachment
    setNewMessage('')
    setPendingAttachment(null)
    setSending(true)

    const tempMsg: Message = {
      id: `local_${Date.now()}`,
      sender_id: myId,
      sender_name: myName,
      sender_role: role,
      receiver_id: selectedContact.id,
      receiver_name: selectedContact.name,
      body: messageText || (attachmentToSend?.type === 'voice' ? 'تسجيل صوتي' : attachmentToSend?.name || 'مرفق'),
      created_at: new Date().toISOString(),
      read: false,
      attachment: attachmentToSend || undefined
    }

    setMessages(prev => [...prev, tempMsg])

    try {
      await requestJson<any>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: selectedContact.id,
          recipientName: selectedContact.name,
          recipientRole: selectedContact.role === 'teacher' ? 'admin' : selectedContact.role,
          body: tempMsg.body,
          senderRole: role
        })
      })
    } catch {
      // Offline fallback
    } finally {
      setSending(false)
    }
  }

  // Handle file attachment selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImg = file.type.startsWith('image/')
    const sizeFormatted = (file.size / 1024).toFixed(0) + ' KB'

    setPendingAttachment({
      name: file.name,
      size: sizeFormatted,
      type: isImg ? 'image' : 'file',
      url: URL.createObjectURL(file)
    })
  }

  // Handle voice recording finish
  const handleStopAndSendVoice = () => {
    if (!isRecordingVoice) return
    setIsRecordingVoice(false)

    const durationMin = Math.floor(recordingSeconds / 60)
    const durationSec = recordingSeconds % 60
    const durationFormatted = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`

    const voiceAttachment: MessageAttachment = {
      name: `رسالة صوتية (${durationFormatted})`,
      size: `${Math.max(1, recordingSeconds * 12)} KB`,
      type: 'voice',
      duration: durationFormatted
    }

    setPendingAttachment(voiceAttachment)
    // Send directly
    setTimeout(() => {
      const tempMsg: Message = {
        id: `voice_${Date.now()}`,
        sender_id: myId,
        sender_name: myName,
        sender_role: role,
        receiver_id: selectedContact?.id,
        receiver_name: selectedContact?.name,
        body: 'تسجيل صوتي',
        created_at: new Date().toISOString(),
        read: false,
        attachment: voiceAttachment
      }
      setMessages(prev => [...prev, tempMsg])
      setPendingAttachment(null)
    }, 100)
  }

  // Start Call
  const handleStartCall = (type: 'audio' | 'video') => {
    if (!selectedContact) return
    setActiveCall({
      contact: selectedContact,
      type,
      duration: 0,
      isMuted: false,
      isVideoOff: false
    })
  }

  // End Call
  const handleEndCall = () => {
    if (!activeCall) return
    const durationMin = Math.floor(activeCall.duration / 60)
    const durationSec = activeCall.duration % 60
    const durationFormatted = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`

    const callMessage: Message = {
      id: `call_${Date.now()}`,
      sender_id: myId,
      sender_name: myName,
      receiver_id: activeCall.contact.id,
      body: activeCall.type === 'video' ? 'مكالمة مرئية' : 'مكالمة صوتية',
      created_at: new Date().toISOString(),
      read: true,
      callLog: {
        type: activeCall.type,
        duration: activeCall.duration > 0 ? durationFormatted : 'لم يتم الرد',
        status: activeCall.duration > 0 ? 'completed' : 'missed'
      }
    }
    setMessages(prev => [...prev, callMessage])
    setActiveCall(null)
  }

  // Create New Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    const randomId = '#GRP-' + Math.floor(100 + Math.random() * 900)
    const newGroup: Contact = {
      id: `custom_group_${Date.now()}`,
      identityCode: randomId,
      name: newGroupName.trim(),
      role: 'group',
      roleLabel: newGroupDesc.trim() || 'مجموعة قرآنية جديدة',
      lastMessage: 'تم إنشاء المجموعة بنجاح، أهلاً بالأعضاء الكرام',
      lastMessageTime: 'الآن',
      unreadCount: 0,
      avatar: newGroupName.trim()[0] || 'م',
      online: true,
      isGroup: true,
      membersCount: selectedGroupMembers.length + 1
    }

    const updated = [newGroup, ...contacts]
    setContacts(updated)
    setSelectedContact(newGroup)
    setShowCreateGroupModal(false)
    setNewGroupName('')
    setNewGroupDesc('')
    setSelectedGroupMembers([])

    try {
      const existing = JSON.parse(localStorage.getItem('thimar_custom_groups') || '[]')
      localStorage.setItem('thimar_custom_groups', JSON.stringify([newGroup, ...existing]))
    } catch {}
  }

  // Search by Identity Code
  const handleSearchByIdCode = (e: React.FormEvent) => {
    e.preventDefault()
    const targetCode = searchIdCode.trim().toUpperCase()
    if (!targetCode) return

    const found = contacts.find(c => c.identityCode.toUpperCase() === targetCode)
    if (found) {
      setSelectedContact(found)
      setShowIdSearchModal(false)
      setSearchIdCode('')
      setIdSearchError('')
    } else {
      // Generate a newly linked contact on the fly with this identity code
      const generatedContact: Contact = {
        id: `user_${targetCode.replace(/[^A-Z0-9]/g, '')}`,
        identityCode: targetCode.startsWith('#') ? targetCode : '#' + targetCode,
        name: `مستخدم (${targetCode})`,
        role: 'student',
        roleLabel: 'عضو عبر رمز الهوية',
        lastMessage: 'تم الربط عبر رمز الهوية بنجاح',
        lastMessageTime: 'الآن',
        unreadCount: 0,
        avatar: 'ق',
        online: true
      }
      setContacts(prev => [generatedContact, ...prev])
      setSelectedContact(generatedContact)
      setShowIdSearchModal(false)
      setSearchIdCode('')
      setIdSearchError('')
    }
  }

  // Filter Contacts
  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.identityCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roleLabel.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilterTab === 'groups') return c.isGroup
    if (activeFilterTab === 'teachers') return c.role === 'teacher'
    if (activeFilterTab === 'direct') return !c.isGroup
    return true
  })

  return (
    <div className="space-y-6 pb-24 text-right" dir="rtl">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx"
      />

      {/* Header with Mode Toggle & My Identity Badge */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900 italic flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-emerald-600" />
              {t('الرسائل والمحادثات')}
            </h2>

            {/* My Personal Identity Badge */}
            <div 
              onClick={() => {
                navigator.clipboard?.writeText(myIdentityCode)
                setCopiedCode(true)
                setTimeout(() => setCopiedCode(false), 2000)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-mono font-black cursor-pointer hover:bg-emerald-100 transition-colors shadow-xs"
              title="انقر لنسخ رمز معرف هويتك ومشاركته مع زملائك"
            >
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              <span>معرفي: {myIdentityCode}</span>
              {copiedCode ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-emerald-500" />
              )}
            </div>
          </div>
          <p className="text-gray-500 mt-1">
            {role === 'admin' ? t('التواصل المباشر مع المعلمين والطلاب وأولياء الأمور') :
             role === 'student' ? t('تواصل مع معلم الحلقة، زملائك وإدارة المنصة') :
             t('متابعة التواصل مع معلمي الأبناء والحلقات والإدارة')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Create Group Button */}
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>إنشاء مجموعة جديدة</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
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
        </div>
      </header>

      {/* Main View Area */}
      {activeMode === 'google_chat' ? (
        <GoogleChatView />
      ) : activeMode === 'admin_inbox' ? (
        <AdminInboxView />
      ) : (
        <div className="h-[calc(100vh-16rem)] min-h-[580px] flex bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden relative">
          {/* Contacts Sidebar */}
          <div className={`${
            selectedContact ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-84 xl:w-96 flex-col border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900`}>
            
            {/* Search & Add by ID Bar */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو كود المعرف..."
                    className="w-full pr-10 pl-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={() => setShowIdSearchModal(true)}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 transition-colors shadow-xs"
                  title="البحث عن شخص برمز الهوية"
                >
                  <Hash className="w-4 h-4" />
                </button>
              </div>

              {/* Categorization Tabs (الكل / الحلقات والمجموعات / المباشر / المعلمون) */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-bold">
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'groups', label: 'المجموعات' },
                  { id: 'direct', label: 'المحادثات' },
                  { id: 'teachers', label: 'المعلمون' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterTab(tab.id as any)}
                    className={`px-3 py-1 rounded-xl whitespace-nowrap transition-all ${
                      activeFilterTab === tab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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
                      className={`w-full p-3.5 sm:p-4 flex items-center gap-3.5 transition-all text-right ${
                        isSelected 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-r-4 border-emerald-600' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm ${
                          contact.isGroup 
                            ? 'bg-gradient-to-tr from-sky-600 to-indigo-500' 
                            : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                        }`}>
                          {contact.isGroup ? <Users className="w-5 h-5 text-white" /> : contact.avatar}
                        </div>
                        {contact.online && (
                          <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                            {contact.roleLabel}
                          </span>
                          <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.2 rounded font-mono">
                            {contact.identityCode}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className={`${
            !selectedContact ? 'hidden lg:flex' : 'flex'
          } flex-1 flex-col bg-gray-50/50 dark:bg-gray-950/30 overflow-hidden relative`}>
            
            {selectedContact ? (
              <>
                {/* Active Chat Header */}
                <header className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10 shadow-xs">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedContact(null)}
                      className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      title="الرجوع للقائمة"
                    >
                      <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-sm shrink-0 ${
                      selectedContact.isGroup 
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-500' 
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                    }`}>
                      {selectedContact.isGroup ? <Users className="w-5 h-5 text-white" /> : selectedContact.avatar}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">{selectedContact.name}</h4>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          {selectedContact.identityCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {selectedContact.roleLabel} • {selectedContact.isGroup ? `${selectedContact.membersCount || 10} عضواً` : selectedContact.online ? 'متصل الآن' : 'غير متصل'}
                      </p>
                    </div>
                  </div>

                  {/* Audio & Video Call Action Buttons */}
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <button 
                      onClick={() => handleStartCall('audio')}
                      className="p-2.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition-colors border border-gray-100 shadow-xs"
                      title="اتصال صوتي مباشر"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleStartCall('video')}
                      className="p-2.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-2xl transition-colors border border-gray-100 shadow-xs"
                      title="اتصال فيديو مرئي"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </header>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messages.map((msg, i) => {
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
                          {/* Sender name for group chats */}
                          {selectedContact.isGroup && !isMine && msg.sender_name && (
                            <div className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 mb-1">
                              {msg.sender_name}
                            </div>
                          )}

                          {/* Call Log Bubble if present */}
                          {msg.callLog && (
                            <div className="flex items-center gap-3 p-3 bg-black/10 dark:bg-white/10 rounded-2xl mb-2 text-xs">
                              {msg.callLog.type === 'video' ? <Video className="w-5 h-5 text-amber-300" /> : <Phone className="w-5 h-5 text-emerald-300" />}
                              <div>
                                <p className="font-black">{msg.body}</p>
                                <p className="text-[10px] opacity-80">المدة: {msg.callLog.duration}</p>
                              </div>
                            </div>
                          )}

                          {/* Attachment preview if present */}
                          {msg.attachment && (
                            <div className="mb-2.5">
                              {msg.attachment.type === 'voice' ? (
                                /* Voice Message Player */
                                <div className="flex items-center gap-3 p-2.5 bg-black/10 dark:bg-white/10 rounded-2xl min-w-[200px]">
                                  <button
                                    onClick={() => setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)}
                                    className="w-8 h-8 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xs shrink-0"
                                  >
                                    {playingVoiceId === msg.id ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                  </button>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-1 h-3">
                                      {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 30, 65, 85].map((h, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`w-1 rounded-full ${playingVoiceId === msg.id ? 'bg-amber-300 animate-pulse' : 'bg-current opacity-60'}`}
                                          style={{ height: `${h}%` }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] mt-1 opacity-80">
                                      <span>تسجيل صوتي</span>
                                      <span>{msg.attachment.duration || '0:18'}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : msg.attachment.type === 'image' ? (
                                <div className="rounded-2xl overflow-hidden border border-white/20">
                                  {msg.attachment.url ? (
                                    <img src={msg.attachment.url} alt="attachment" className="max-h-56 w-full object-cover" />
                                  ) : (
                                    <div className="p-4 bg-black/10 flex items-center gap-2">
                                      <ImageIcon className="w-5 h-5" />
                                      <span>{msg.attachment.name}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* Document / PDF File */
                                <div className="flex items-center gap-3 p-3 bg-black/10 dark:bg-white/10 rounded-2xl text-xs">
                                  <FileText className="w-6 h-6 text-amber-300 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold truncate">{msg.attachment.name}</p>
                                    <p className="text-[10px] opacity-75">{msg.attachment.size}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message Text */}
                          {msg.body && !msg.callLog && (
                            <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          )}

                          {/* Message Timestamp & Ticks */}
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
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Pending Attachment Banner */}
                {pendingAttachment && (
                  <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        مرفق جاهز: {pendingAttachment.name} ({pendingAttachment.size})
                      </span>
                    </div>
                    <button 
                      onClick={() => setPendingAttachment(null)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Voice Recording Bar */}
                {isRecordingVoice ? (
                  <div className="p-4 bg-emerald-700 text-white flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="font-bold text-xs">
                        جاري تسجيل الصوت: {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? '0' : ''}{recordingSeconds % 60}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsRecordingVoice(false)}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-bold"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleStopAndSendVoice}
                        className="px-4 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 rotate-180" />
                        <span>إرسال التسجيل</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Message Input Box */
                  <footer className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      {/* Attachment Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors"
                        title="إرفاق ملف أو صورة أو واجب قرآني"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      {/* Text Input */}
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="اكتب رسالتك أو استفسارك القرآني هنا..."
                        className="flex-1 py-3 px-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      />

                      {/* Voice Record Button */}
                      <button
                        type="button"
                        onClick={() => setIsRecordingVoice(true)}
                        className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-colors"
                        title="تسجيل رسالة صوتية أو تسميع"
                      >
                        <Mic className="w-5 h-5" />
                      </button>

                      {/* Send Button */}
                      <button 
                        type="submit"
                        disabled={(!newMessage.trim() && !pendingAttachment) || sending}
                        className="p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                        title="إرسال"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
                      </button>
                    </form>
                  </footer>
                )}
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

      {/* CALL OVERLAY MODAL */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[120] bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-4 text-white"
            dir="rtl"
          >
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl space-y-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-4xl font-black shadow-2xl ring-4 ring-emerald-500/30">
                  {activeCall.contact.avatar || 'ث'}
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-600 shadow-md">
                  {activeCall.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black">{activeCall.contact.name}</h3>
                <p className="text-xs text-emerald-400 mt-1">
                  {activeCall.duration > 0 ? (
                    `متصل (${Math.floor(activeCall.duration / 60)}:${activeCall.duration % 60 < 10 ? '0' : ''}${activeCall.duration % 60})`
                  ) : (
                    'جاري الاتصال والربط المباشر...'
                  )}
                </p>
              </div>

              {/* Call Controls */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  onClick={() => setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null)}
                  className={`p-4 rounded-2xl transition-all ${
                    activeCall.isMuted ? 'bg-red-500/30 text-red-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                  title="كتم الميكروفون"
                >
                  {activeCall.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {activeCall.type === 'video' && (
                  <button
                    onClick={() => setActiveCall(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null)}
                    className={`p-4 rounded-2xl transition-all ${
                      activeCall.isVideoOff ? 'bg-red-500/30 text-red-300' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    title="إيقاف الكاميرا"
                  >
                    {activeCall.isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                )}

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-xl transition-all active:scale-95"
                  title="إنهاء المكالمة"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE GROUP MODAL */}
      <AnimatePresence>
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-[115] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-emerald-100 text-right space-y-5"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">إنشاء حلقة / مجموعة جديدة</h3>
                    <p className="text-xs text-gray-500">حلقة تسميع جماعية أو مجموعة مدارسة قرآنية</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">اسم المجموعة أو الحلقة *</label>
                  <input 
                    type="text"
                    required
                    value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}
                    placeholder="مثال: حلقة الفردوس - رواية حفص"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">وصف ونشاط الحلقة</label>
                  <input 
                    type="text"
                    value={newGroupDesc}
                    onChange={e => setNewGroupDesc(e.target.value)}
                    placeholder="مثال: متابعة الحفظ اليومي لطلاب المستوى الثاني"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroupModal(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20"
                  >
                    تأكيد الإنشاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEARCH BY IDENTITY CODE MODAL */}
      <AnimatePresence>
        {showIdSearchModal && (
          <div className="fixed inset-0 z-[115] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-emerald-100 text-right space-y-5"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">التواصل برمز الهوية</h3>
                    <p className="text-xs text-gray-500">أدخل رمز معرف الطالب أو المعلم للربط المباشر</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowIdSearchModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchByIdCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">رمز الهوية (Identity Code) *</label>
                  <input 
                    type="text"
                    required
                    value={searchIdCode}
                    onChange={e => setSearchIdCode(e.target.value)}
                    placeholder="#THM-1234 أو #TCH-310"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {idSearchError && (
                    <p className="text-xs text-red-500 mt-1">{idSearchError}</p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowIdSearchModal(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>بدء المحادثة</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
