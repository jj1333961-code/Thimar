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
import { RoleNavHeader } from '@/components/dashboard/RoleNavHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { StudentHome } from '@/components/dashboard/HomeView'
import { MessagesView } from '@/components/dashboard/MessagesView'
import { ReportsView } from '@/components/dashboard/ReportsView'
import { SettingsView } from '@/components/dashboard/SettingsView'
import { TasksView } from '@/components/dashboard/TasksView'
import { useSearchParams } from 'next/navigation'
import { getClientSession } from '@/lib/client-session'

function StudentContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const session = getClientSession()
  const [liveSessionMode, setLiveSessionMode] = useState<'ai' | 'teacher' | null>(null)

  useEffect(() => {
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
      case 'messages':
        return <MessagesView currentUser={{ id: session?.id || 'student', email: session?.email || '', name: session?.name || 'ياسين عمر', role: 'student' }} />
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

      {/* Top Navbar with live role switcher */}
      <RoleNavHeader 
        currentRole="student" 
        userName={session?.name || 'ياسين عمر'} 
        onStartTour={() => setShowWalkthrough(true)}
      />

      <section className="max-w-7xl mx-auto p-6 md:p-12 pb-28 md:pb-32">
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
