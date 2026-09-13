'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, Search, Trash2, CheckCircle, 
  MessageSquare, UserX, ShieldAlert,
  Loader2, Filter, MoreVertical, 
  ChevronLeft, ChevronRight, User, Clock,
  CheckCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface AdminMessage {
  id: string
  senderName: string
  senderId?: string
  senderEmail?: string
  body: string
  status: 'read' | 'unread'
  createdAt: string
}

export function AdminInboxView() {
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('thimar_auth_token')
      const response = await fetch('/api/admin/messages', {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      })
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Fetch Messages Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: 'read' | 'unread') => {
    setActionLoading(id + '_status')
    try {
      const token = localStorage.getItem('thimar_auth_token')
      await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      })
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    setActionLoading(id + '_delete')
    try {
      const token = localStorage.getItem('thimar_auth_token')
      await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      })
      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBlock = async (userId: string | undefined, name: string) => {
    if (!userId) {
      alert('هذا المستخدم غير مسجل، لا يمكن حظره برمجياً من هنا.')
      return
    }
    if (!confirm(`هل أنت متأكد من حظر المستخدم ${name} من مراسلة المسؤول؟`)) return
    
    setActionLoading(userId + '_block')
    try {
      const token = localStorage.getItem('thimar_auth_token')
      await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId, block: true })
      })
      alert(`تم حظر ${name} بنجاح.`)
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredMessages = messages.filter(m => {
    const matchesSearch = m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.body.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || m.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="h-[calc(100vh-16rem)] min-h-[550px] flex bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
      {/* Messages List Sidebar */}
      <div className={`${selectedMessage ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 flex-col border-l border-gray-100 bg-white`}>
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في الرسائل..."
              className="w-full pr-11 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-xs"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {f === 'all' ? 'الكل' : f === 'unread' ? 'غير مقروء' : 'مقروء'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin mb-3 text-emerald-600" />
              <p className="text-xs font-bold">جاري تحميل صندوق الوارد...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs italic">
              لا توجد رسائل متطابقة
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <button 
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg)
                  if (msg.status === 'unread') handleUpdateStatus(msg.id, 'read')
                }}
                className={`w-full p-4 flex items-center gap-3.5 transition-all text-right ${
                  selectedMessage?.id === msg.id 
                    ? 'bg-emerald-50/70 border-r-4 border-emerald-600' 
                    : 'hover:bg-gray-50'
                } ${msg.status === 'unread' ? 'bg-white font-bold' : 'opacity-80'}`}
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold shrink-0">
                  {msg.senderName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm truncate text-gray-900">{msg.senderName}</h4>
                    <span className="text-[9px] text-gray-400">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: ar })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{msg.body}</p>
                </div>
                {msg.status === 'unread' && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Content Area */}
      <div className={`${!selectedMessage ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-gray-50/30 overflow-hidden`}>
        {selectedMessage ? (
          <>
            <header className="p-4 bg-white border-b border-gray-100 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-base">
                  {selectedMessage.senderName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{selectedMessage.senderName}</h4>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(selectedMessage.createdAt), 'EEEE, do MMMM yyyy (HH:mm)', { locale: ar })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleUpdateStatus(selectedMessage.id, selectedMessage.status === 'read' ? 'unread' : 'read')}
                  disabled={!!actionLoading}
                  className="p-2.5 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-colors"
                  title={selectedMessage.status === 'read' ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                >
                  {selectedMessage.status === 'read' ? <Mail className="w-5 h-5" /> : <CheckCheck className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => handleDelete(selectedMessage.id)}
                  disabled={!!actionLoading}
                  className="p-2.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                  title="حذف الرسالة"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {selectedMessage.senderId && (
                  <button 
                    onClick={() => handleBlock(selectedMessage.senderId, selectedMessage.senderName)}
                    disabled={!!actionLoading}
                    className="p-2.5 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-xl transition-colors"
                    title="حظر المستخدم"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-3xl mx-auto bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mb-1 block">تفاصيل المرسل</span>
                    <h3 className="text-lg font-black text-gray-900">{selectedMessage.senderName}</h3>
                    {selectedMessage.senderEmail && (
                      <p className="text-xs text-gray-500">{selectedMessage.senderEmail}</p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[10px] text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedMessage.senderId ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {selectedMessage.senderId ? 'مستخدم مسجل' : 'زائر'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 block">نص الرسالة</span>
                  <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 min-h-[150px]">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                      {selectedMessage.body}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center space-y-4">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center">
              <Mail className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 italic">بريد المسؤول</h3>
              <p className="text-xs text-gray-500 mt-2 max-w-xs">انقر على أي رسالة في القائمة الجانبية لقراءتها والتحكم بها أو حظر مرسلها.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
