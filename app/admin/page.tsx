'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, CheckCircle2, XCircle, Bell, MessageSquare, 
  Search, ShieldCheck, Filter, UserCheck, UserX,
  LayoutDashboard, History, Settings, LogOut, Loader2,
  RefreshCw, MoreVertical, Check, X, Brain
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications' | 'messages'>('requests')
  const [showAIWelcome, setShowAIWelcome] = useState(true)
  const [requests, setRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reqRes, notifRes] = await Promise.all([
        fetch('/api/supabase/join-requests'),
        fetch('/api/supabase/notifications')
      ])
      
      const reqData = await reqRes.json()
      const notifData = await notifRes.json()
      
      setRequests(reqData.requests || [])
      setNotifications(notifData.notifications || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/supabase/join-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      if (res.ok) {
        setRequests(prev => prev.filter(r => r.id !== id))
        fetchData() // Refresh notifications for log
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200 flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">ث</div>
          <h1 className="text-2xl font-black text-gray-900">ثمار المسؤول</h1>
        </div>

        <AnimatePresence>
          {showAIWelcome && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden"
            >
              <button onClick={() => setShowAIWelcome(false)} className="absolute top-2 left-2 p-1 opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-widest">تحليل ثمار AI</span>
              </div>
              <p className="text-xs font-medium leading-relaxed italic">
                "مرحباً بك يا مسؤول! في غيابك، تم تقديم ٣ طلبات انضمام جديدة، أحدهم من خارج البلاد. كما تم رصد نشاط غير معتاد في قسم التسميع يحتاج مراجعتك."
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('requests')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'requests' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <UserCheck className="w-5 h-5" /> طلبات الانضمام
            {requests.length > 0 && <span className="mr-auto bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">{requests.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Bell className="w-5 h-5" /> سجل النشاطات
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'messages' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <MessageSquare className="w-5 h-5" /> الرسائل
          </button>
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <button 
            onClick={() => router.push('/login')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <section className="flex-1 overflow-auto p-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'requests' ? 'مراجعة طلبات الانضمام' : activeTab === 'notifications' ? 'سجل التنبيهات والنشاط' : 'صندوق الرسائل'}
            </h2>
            <p className="text-gray-500 mt-2">مرحباً بك مجدداً، المسؤول thimar</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="h-12 w-12 bg-emerald-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">T</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'requests' && (
            <motion.div 
              key="requests" 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 gap-6"
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4" />
                  <p>جاري جلب الطلبات...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                  <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900">لا توجد طلبات معلقة</h3>
                  <p className="text-gray-500 mt-2">لقد تمت معالجة جميع طلبات الانضمام بنجاح.</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                        req.role === 'teacher' ? 'bg-blue-100 text-blue-600' : req.role === 'student' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {req.name?.[0] || '؟'}
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-gray-900">{req.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            req.role === 'teacher' ? 'bg-blue-50 text-blue-700' : req.role === 'student' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {req.role === 'teacher' ? 'معلم' : req.role === 'student' ? 'طالب' : 'ولي أمر'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{req.email} • {req.phone}</p>
                        <p className="text-xs text-gray-400 font-medium">البلد: {req.country} • الهوية: {req.identity_code}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleAction(req.id, 'rejected')}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
                      >
                        <X className="w-5 h-5" /> رفض
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'approved')}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        <Check className="w-5 h-5" /> موافقة
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              key="notifications" 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-xl">آخر النشاطات</h3>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
              <div className="divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-20 text-center text-gray-400">لا توجد تنبيهات حالياً</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                      <div className={`mt-1 p-2 rounded-lg ${
                        notif.type === 'login' ? 'bg-blue-50 text-blue-600' : 
                        notif.type === 'signup' ? 'bg-amber-50 text-amber-600' : 
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {notif.type === 'login' ? <History className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-900">{notif.title}</h5>
                          <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString('ar-EG')}</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div 
              key="messages" 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center py-20 text-gray-400 italic"
            >
              <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
              صندوق الرسائل قيد التطوير...
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <AIChatBubble />
    </main>
  )
}
