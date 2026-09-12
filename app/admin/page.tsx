'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, CheckCircle2, XCircle, Bell, MessageSquare, 
  Search, ShieldCheck, Filter, UserCheck, UserX,
  LayoutDashboard, History, Settings, LogOut, Loader2,
  RefreshCw, MoreVertical, Check, X, Brain, Video
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { LiveRecitationSession } from '@/components/ui/live-recitation-session'

import { Suspense } from 'react'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { AdminHome } from '@/components/dashboard/HomeView'
import { MessagesView } from '@/components/dashboard/MessagesView'
import { NotificationsView } from '@/components/dashboard/NotificationsView'
import { ReportsView } from '@/components/dashboard/ReportsView'
import { SettingsView } from '@/components/dashboard/SettingsView'
import { useSearchParams } from 'next/navigation'
import { requestJson } from '@/lib/api-client'

function AdminContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [liveSessionMode, setLiveSessionMode] = useState<'ai' | 'teacher' | null>(null)
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
      const [reqData, notifData] = await Promise.all([
        requestJson<any>('/api/supabase/join-requests'),
        requestJson<any>('/api/supabase/notifications')
      ])
      
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
      await requestJson('/api/supabase/join-requests', {
        method: 'PATCH',
        body: JSON.stringify({ id, status })
      })
      setRequests(prev => prev.filter(r => r.id !== id))
      fetchData() // Refresh notifications for log
    } catch (err) {
      console.error(err)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <AdminHome requests={requests} notifications={notifications} loading={loading} handleAction={handleAction} setLiveSessionMode={setLiveSessionMode} />
      case 'messages':
        return <MessagesView currentUser={{ id: 'admin_id' }} />
      case 'notifications':
        return <NotificationsView />
      case 'reports':
        return <ReportsView role="admin" currentUserId="admin_id" />
      case 'settings':
        return <SettingsView />
      default:
        return <AdminHome requests={requests} notifications={notifications} loading={loading} handleAction={handleAction} setLiveSessionMode={setLiveSessionMode} />
    }
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">ث</div>
            <h1 className="text-xl font-black text-gray-900 italic">ثمار المسؤول</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData}
              className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">T</div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </section>

      <BottomNav role="admin" />
      <AIChatBubble />

      <AnimatePresence>
        {liveSessionMode && (
          <LiveRecitationSession 
            mode={liveSessionMode} 
            onClose={() => setLiveSessionMode(null)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]" dir="rtl">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>}>
        <AdminContent />
      </Suspense>
    </main>
  )
}
