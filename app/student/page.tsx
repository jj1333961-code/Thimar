'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Book, Mic, Trophy, Calendar, 
  Play, CheckCircle2, Star, Brain,
  ChevronLeft, MessageSquare, Headphones,
  Search, Award, Sparkles, Clock, Users, X, Music, Loader2
} from 'lucide-react'

import { WelcomeWalkthrough, isWalkthroughDismissedForever } from '@/components/ui/welcome-walkthrough'
import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { WelcomeMessage } from '@/components/ui/welcome-message'
import { PWAInstallButton } from '@/components/pwa-install-button'
import { TuhfatAlAtfal } from '@/components/ui/tuhfat-al-atfal'
import { QuranReader } from '@/components/ui/quran-reader'
import { LiveRecitationSession } from '@/components/ui/live-recitation-session'

import { Suspense } from 'react'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { StudentHome } from '@/components/dashboard/HomeView'
import { MessagesView } from '@/components/dashboard/MessagesView'
import { ReportsView } from '@/components/dashboard/ReportsView'
import { SettingsView } from '@/components/dashboard/SettingsView'
import { TasksView } from '@/components/dashboard/TasksView'
import { useSearchParams } from 'next/navigation'

function StudentContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [liveSessionMode, setLiveSessionMode] = useState<'ai' | 'teacher' | null>(null)

  useEffect(() => {
    if (isWalkthroughDismissedForever()) {
      return
    }
    const hasSeenWalkthrough = localStorage.getItem('thimar_walkthrough_seen')
    if (!hasSeenWalkthrough) {
      setShowWalkthrough(true)
    }
  }, [])

  const closeWalkthrough = () => {
    localStorage.setItem('thimar_walkthrough_seen', 'true')
    setShowWalkthrough(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <StudentHome />
      case 'messages':
        return <MessagesView currentUser={{ id: 'y@thimar.app', email: 'y@thimar.app', name: 'ياسين عمر', role: 'student' }} />
      case 'tasks':
        return <TasksView role="student" currentUserId="student_id" />
      case 'reports':
        return <ReportsView role="student" currentUserId="student_id" />
      case 'settings':
        return <SettingsView />
      default:
        return <StudentHome />
    }
  }

  return (
    <>
      <AnimatePresence>
        {showWalkthrough && <WelcomeWalkthrough onClose={closeWalkthrough} />}
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
