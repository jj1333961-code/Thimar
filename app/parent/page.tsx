'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, TrendingUp, Calendar, 
  MessageCircle, Star, ShieldCheck,
  ChevronRight, Heart, FileText, Bell,
  BookOpen, Award, CheckCircle2, Loader2
} from 'lucide-react'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { WelcomeMessage } from '@/components/ui/welcome-message'
import { PWAInstallButton } from '@/components/pwa-install-button'
import { WelcomeWalkthrough, isWalkthroughDismissedForever } from '@/components/ui/welcome-walkthrough'
import { Brain, X } from 'lucide-react'

import { Suspense } from 'react'
import { RoleNavHeader } from '@/components/dashboard/RoleNavHeader'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { ParentHome } from '@/components/dashboard/HomeView'
import { MessagesView } from '@/components/dashboard/MessagesView'
import { ReportsView } from '@/components/dashboard/ReportsView'
import { SettingsView } from '@/components/dashboard/SettingsView'
import { TasksView } from '@/components/dashboard/TasksView'
import { useSearchParams } from 'next/navigation'
import { getClientSession } from '@/lib/client-session'

function ParentContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [selectedChild, setSelectedChild] = useState(0)
  const session = getClientSession()
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const childrenList = [
    { name: 'ياسين عمر', level: 'الجزء ٢٤', progress: 82, teacher: 'أ. أحمد علي' },
    { name: 'لينا عمر', level: 'الجزء ٥', progress: 45, teacher: 'أ. سارة خالد' },
  ]

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
        return <ParentHome childrenList={childrenList} selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
      case 'messages':
        return <MessagesView currentUser={{ id: session?.id || 'parent', email: session?.email || '', name: session?.name || 'أبو ياسين (ولي الأمر)', role: 'parent' }} />
      case 'tasks':
        return <TasksView role="parent" currentUserId={session?.id || ''} />
      case 'reports':
        return <ReportsView role="parent" currentUserId={session?.id || ''} />
      case 'settings':
        return <SettingsView />
      default:
        return <ParentHome childrenList={childrenList} selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
    }
  }

  return (
    <>
      <AnimatePresence>
        {showWalkthrough && <WelcomeWalkthrough onClose={closeWalkthrough} userRole="parent" />}
      </AnimatePresence>

      {/* Top Navbar with live role switcher */}
      <RoleNavHeader 
        currentRole="parent" 
        userName={session?.name || 'أبو ياسين'} 
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

      <BottomNav role="parent" />
      <AIChatBubble initialRole="parent" />
    </>
  )
}

export default function ParentDashboard() {
  return (
    <main className="min-h-screen bg-[#FDFBF7]" dir="rtl">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>}>
        <ParentContent />
      </Suspense>
    </main>
  )
}
