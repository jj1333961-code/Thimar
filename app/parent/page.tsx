'use client'

import { useState } from 'react'
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
import { Brain, X } from 'lucide-react'

import { Suspense } from 'react'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { ParentHome } from '@/components/dashboard/HomeView'
import { MessagesView } from '@/components/dashboard/MessagesView'
import { ReportsView } from '@/components/dashboard/ReportsView'
import { SettingsView } from '@/components/dashboard/SettingsView'
import { TasksView } from '@/components/dashboard/TasksView'
import { useSearchParams } from 'next/navigation'

function ParentContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  
  const [selectedChild, setSelectedChild] = useState(0)
  const childrenList = [
    { name: 'ياسين عمر', level: 'الجزء ٢٤', progress: 82, teacher: 'أ. أحمد علي' },
    { name: 'لينا عمر', level: 'الجزء ٥', progress: 45, teacher: 'أ. سارة خالد' },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <ParentHome childrenList={childrenList} selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
      case 'messages':
        return <MessagesView currentUser={{ id: 'parent@thimar.app', email: 'parent@thimar.app', name: 'أبو عمر', role: 'parent' }} />
      case 'tasks':
        return <TasksView role="parent" currentUserId="parent_id" />
      case 'reports':
        return <ReportsView role="parent" currentUserId="parent_id" />
      case 'settings':
        return <SettingsView />
      default:
        return <ParentHome childrenList={childrenList} selectedChild={selectedChild} setSelectedChild={setSelectedChild} />
    }
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">ث</div>
            <h1 className="text-xl font-black text-gray-900 italic">ثمار ولي الأمر</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">أ</div>
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
