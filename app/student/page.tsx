'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Loader2 } from 'lucide-react'

import { isWalkthroughDismissedForever } from '@/components/ui/welcome-walkthrough'
import { PWAInstallButton } from '@/components/pwa-install-button'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { StudentHome } from '@/components/dashboard/HomeView'
import { ViewSkeleton } from '@/components/dashboard/ViewSkeleton'
import { useSearchParams } from 'next/navigation'
import { getClientSession } from '@/lib/client-session'

// Lazy loaded views to reduce bundle size and speed up initial render
const QuranReader = dynamic(() => import('@/components/ui/quran-reader').then(m => m.QuranReader), {
  loading: () => <ViewSkeleton title="جاري فتح المصحف الشريف..." />,
  ssr: false,
})

const TuhfatAlAtfal = dynamic(() => import('@/components/ui/tuhfat-al-atfal').then(m => m.TuhfatAlAtfal), {
  loading: () => <ViewSkeleton title="جاري فتح متن تحفة الأطفال..." />,
  ssr: false,
})

const MessagesView = dynamic(() => import('@/components/dashboard/MessagesView').then(m => m.MessagesView), {
  loading: () => <ViewSkeleton title="جاري تحميل الرسائل والمحادثات..." />,
  ssr: false,
})

const TasksView = dynamic(() => import('@/components/dashboard/TasksView').then(m => m.TasksView), {
  loading: () => <ViewSkeleton title="جاري تحميل المهام والتكاليف..." />,
  ssr: false,
})

const ReportsView = dynamic(() => import('@/components/dashboard/ReportsView').then(m => m.ReportsView), {
  loading: () => <ViewSkeleton title="جاري استخراج التقارير والنتائج..." />,
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

function StudentContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const session = getClientSession()
  const [liveSessionMode, setLiveSessionMode] = useState<'ai' | 'teacher' | null>(null)

  useEffect(() => {
    if (isWalkthroughDismissedForever()) {
      // Continue to register listener so user can relaunch if clicked from Settings
      const handleRelaunchTour = () => setShowWalkthrough(true)
      window.addEventListener('thimar:start-tour', handleRelaunchTour)
      return () => window.removeEventListener('thimar:start-tour', handleRelaunchTour)
    }
    const hasSeenWalkthrough = localStorage.getItem('thimar_walkthrough_seen') || localStorage.getItem('thimar_new_user_welcomed')
    if (!hasSeenWalkthrough) {
      setShowWalkthrough(true)
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <StudentHome />
      case 'quran':
        return <QuranReader />
      case 'tuhfa':
        return <TuhfatAlAtfal />
      case 'messages':
        return <MessagesView currentUser={{ id: session?.id || 'student', email: session?.email || '', name: session?.name || 'الطالب', role: 'student' }} />
      case 'tasks':
        return <TasksView role="student" currentUserId={session?.id || ''} />
      case 'reports':
        return <ReportsView role="student" currentUserId={session?.id || ''} />
      case 'settings':
        return <SettingsView />
      default:
        return <StudentHome />
    }
  }

  return (
    <>
      <AnimatePresence>
        {showWalkthrough && <WelcomeWalkthrough onClose={closeWalkthrough} userRole="student" />}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">ث</div>
            <h1 className="text-xl font-black text-gray-900 italic">ثمار الطالب</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowWalkthrough(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 transition-colors"
              title="عرض دليل المنصة وجولة الاستخدام"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>جولة المنصة</span>
            </button>
            <PWAInstallButton />
            <div className="flex items-center gap-3 bg-gray-50 p-1 pr-4 rounded-full border border-gray-100">
              <span className="text-sm font-bold text-gray-700">ياسين عمر</span>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">ي</div>
            </div>
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

      <BottomNav role="student" />
      <AIChatBubble initialRole="student" />
      
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

export default function StudentDashboard() {
  return (
    <main id="studentDashboard" className="min-h-screen bg-[#FDFBF7]" dir="rtl">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>}>
        <StudentContent />
      </Suspense>
    </main>
  )
}
