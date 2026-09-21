'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { isWalkthroughDismissedForever } from '@/components/ui/welcome-walkthrough'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { AdminHome } from '@/components/dashboard/HomeView'
import { ViewSkeleton } from '@/components/dashboard/ViewSkeleton'
import { useSearchParams } from 'next/navigation'
import { requestJson } from '@/lib/api-client'
import { getClientSession } from '@/lib/client-session'

// Lazy loaded views
const MessagesView = dynamic(() => import('@/components/dashboard/MessagesView').then(m => m.MessagesView), {
  loading: () => <ViewSkeleton title="جاري تحميل الرسائل والمحادثات..." />,
  ssr: false,
})

const NotificationsView = dynamic(() => import('@/components/dashboard/NotificationsView').then(m => m.NotificationsView), {
  loading: () => <ViewSkeleton title="جاري تحميل التنبيهات..." />,
  ssr: false,
})

const ReportsView = dynamic(() => import('@/components/dashboard/ReportsView').then(m => m.ReportsView), {
  loading: () => <ViewSkeleton title="جاري استخراج تقارير الطلاب..." />,
  ssr: false,
})

const SettingsView = dynamic(() => import('@/components/dashboard/SettingsView').then(m => m.SettingsView), {
  loading: () => <ViewSkeleton title="جاري فتح الإعدادات..." />,
  ssr: false,
})

const WelcomeWalkthrough = dynamic(() => import('@/components/ui/welcome-walkthrough').then(m => m.WelcomeWalkthrough), {
  ssr: false,
})

const LiveRecitationSession = dynamic(() => import('@/components/ui/live-recitation-session').then(m => m.LiveRecitationSession), {
  ssr: false,
})

const AIChatBubble = dynamic(() => import('@/components/ui/ai-chat-bubble').then(m => m.AIChatBubble), {
  ssr: false,
})

function AdminContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [liveSessionMode, setLiveSessionMode] = useState<'ai' | 'teacher' | null>(null)
  const session = getClientSession()
  const [requests, setRequests] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchData()

    if (!isWalkthroughDismissedForever()) {
      const hasSeen = localStorage.getItem('thimar_walkthrough_seen') || localStorage.getItem('thimar_new_user_welcomed')
      if (!hasSeen) {
        setShowWalkthrough(true)
      }
    }

    const handleRelaunchTour = () => setShowWalkthrough(true)
    window.addEventListener('thimar:start-tour', handleRelaunchTour)
    return () => window.removeEventListener('thimar:start-tour', handleRelaunchTour)
  }, [])

  const closeWalkthrough = () => {
    localStorage.setItem('thimar_walkthrough_seen', 'true')
    localStorage.setItem('thimar_new_user_welcomed', 'true')
    setShowWalkthrough(false)
  }

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
        return <MessagesView currentUser={{ id: session?.id || 'admin', email: session?.email || '', name: session?.name || 'المسؤول العام', role: 'admin' }} />
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
      <AnimatePresence>
        {showWalkthrough && <WelcomeWalkthrough onClose={closeWalkthrough} userRole="admin" />}
      </AnimatePresence>

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

      <section className="max-w-7xl mx-auto px-6 pb-28 pt-6 md:px-12 md:pb-32 md:pt-12">
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
      <AIChatBubble initialRole="admin" />

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
