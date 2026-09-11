'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Book, Mic, Trophy, Calendar, 
  Play, CheckCircle2, Star, Brain,
  ChevronLeft, MessageSquare, Headphones,
  Search, Award, Sparkles, Clock, Users, X
} from 'lucide-react'

import { WelcomeWalkthrough } from '@/components/ui/welcome-walkthrough'
import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { WelcomeMessage } from '@/components/ui/welcome-message'

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'daily' | 'reader' | 'ai' | 'badges'>('daily')
  const [showWalkthrough, setShowWalkthrough] = useState(false)

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('thimar_walkthrough_seen')
    if (!hasSeenWalkthrough) {
      setShowWalkthrough(true)
    }
  }, [])

  const closeWalkthrough = () => {
    localStorage.setItem('thimar_walkthrough_seen', 'true')
    setShowWalkthrough(false)
  }

  return (
    <main id="studentDashboard" className="min-h-screen bg-[#FDFBF7]" dir="rtl">
      <AnimatePresence>
        {showWalkthrough && <WelcomeWalkthrough onClose={closeWalkthrough} />}
      </AnimatePresence>

      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">ث</div>
            <h1 className="text-xl font-black text-gray-900">ثمار الطالب</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-gray-50 p-1 pr-4 rounded-full border border-gray-100">
              <span className="text-sm font-bold text-gray-700">ياسين عمر</span>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">ي</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Navigation */}
        <aside className="lg:col-span-3 space-y-4">
          {[
            { id: 'daily', label: 'الورد اليومي', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'reader', label: 'المصحف الشريف', icon: Book, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: 'ai', label: 'المصحح الذكي', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
            { id: 'badges', label: 'إنجازاتي', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-bold transition-all ${
                activeTab === item.id 
                ? 'bg-white shadow-xl shadow-gray-200/50 scale-105 border-2 border-emerald-500 text-emerald-700' 
                : 'text-gray-400 hover:bg-white hover:text-gray-600'
              }`}
            >
              <div className={`p-2 rounded-xl ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              {item.label}
              {activeTab === item.id && <Sparkles className="mr-auto w-4 h-4 text-emerald-400" />}
            </button>
          ))}
          
          <div className="mt-12 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-24 h-24" />
            </div>
            <h4 className="text-xl font-bold mb-2">تحدي الختمة</h4>
            <p className="text-sm opacity-80 mb-6 leading-relaxed">أنت الآن في الجزء ٢٤، أكمل سورة فصلت لتحصل على وسام جديد!</p>
            <button className="w-full py-3 bg-white text-emerald-700 rounded-xl font-bold text-sm shadow-lg">استمر الآن</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <WelcomeMessage role="student" userName="ياسين عمر" />
          <AnimatePresence mode="wait">
            {activeTab === 'daily' && (
              <motion.div 
                key="daily"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 text-center md:text-right">
                      <h2 className="text-3xl font-black text-gray-900 italic" style={{ backgroundColor: '#000000', color: '#ffffff', padding: '4px 12px', borderRadius: '8px', display: 'inline-block' }}>مهمة اليوم</h2>
                      <p className="text-lg text-gray-500 font-medium italic">سورة <span className="text-emerald-600">النور</span> • من الآية ١ إلى الآية ٢٠</p>
                      <div className="flex items-center gap-4 pt-2">
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> متبقي ٤ ساعات
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> مراجعة
                        </span>
                      </div>
                    </div>
                    <button className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-emerald-200 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                      <Play className="w-6 h-6 fill-current" /> ابدأ التسميع
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-gray-800 italic">
                      <Headphones className="text-emerald-500" /> استمع للمقرئين
                    </h3>
                    <div className="space-y-3">
                      {['الحصري', 'المنشاوي', 'عبدالباسط'].map((qari) => (
                        <div key={qari} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors group cursor-pointer">
                          <span className="font-bold text-gray-700 group-hover:text-emerald-700">الشيخ {qari}</span>
                          <Play className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-gray-800 italic">
                      <MessageSquare className="text-blue-500" /> رسائل المعلم
                    </h3>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 italic text-blue-800 text-sm leading-relaxed">
                      "أحسنت في تسميع الأمس يا ياسين، ركز اليوم على مخارج حرف الضاد في سورة النور."
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reader' && (
              <motion.div 
                key="reader"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col"
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
                  <div className="flex items-center gap-4">
                    <button className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft className="w-5 h-5 text-emerald-600 rotate-180" /></button>
                    <h3 className="text-2xl font-black text-emerald-800 italic leading-none">سورة النور</h3>
                    <button className="p-2 bg-white rounded-xl shadow-sm"><ChevronLeft className="w-5 h-5 text-emerald-600" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"><Mic className="w-5 h-5 text-gray-400" /></button>
                    <button className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg"><Sparkles className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="flex-1 p-12 text-center space-y-12">
                  <div className="text-5xl font-black text-gray-800 leading-[4.5rem] max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-amiri)' }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ <br/>
                    سُورَةٌ أَنزَلْنَاهَا وَفَرَضْنَاهَا وَأَنزَلْنَا فِيهَا آيَاتٍ بَيِّنَاتٍ لَّعَلَّكُمْ تَذَكَّرُونَ
                  </div>
                  <div className="pt-20 text-gray-300 italic">... باقي الآيات تظهر هنا ...</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                  <div className="relative z-10 space-y-6 text-center max-w-xl mx-auto">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-black">المصحح الذكي (ثمار AI)</h2>
                    <p className="text-lg opacity-80 leading-relaxed font-medium">سجل تلاوتك وسيقوم الذكاء الاصطناعي بتحليلها وتحديد الأخطاء في التجويد والمخارج فوراً.</p>
                    <button className="mt-8 px-12 py-5 bg-white text-purple-700 rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-3 mx-auto transition-transform hover:scale-105 active:scale-95">
                      <Mic className="w-6 h-6" /> ابدأ التسجيل الآن
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-gray-800 italic">آخر تحليلات AI</h3>
                  <div className="space-y-4">
                    {[
                      { surah: 'المؤمنون', score: '٩٢٪', date: 'منذ يومين', status: 'ممتاز' },
                      { surah: 'الحج', score: '٧٨٪', date: 'منذ أسبوع', status: 'جيد' },
                    ].map((analysis, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-purple-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-600 font-bold">{analysis.score}</div>
                          <div className="text-right">
                            <h4 className="font-bold text-gray-900 italic">سورة {analysis.surah}</h4>
                            <p className="text-xs text-gray-400">{analysis.date}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-4 py-1.5 rounded-full uppercase tracking-widest">{analysis.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'badges' && (
              <motion.div 
                key="badges"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
              >
                {[
                  { label: 'حافظ نشط', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', level: 5 },
                  { label: 'متقن التجويد', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50', level: 3 },
                  { label: 'صديق AI', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50', level: 7 },
                  { label: 'الأوائل', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50', level: 1 },
                  { label: 'صوت ذهبي', icon: Headphones, color: 'text-amber-600', bg: 'bg-amber-100/50', level: 2 },
                  { label: 'سفير ثمار', icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-100/50', level: 4 },
                ].map((badge, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all group">
                    <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center ${badge.bg} ${badge.color} group-hover:scale-110 transition-transform shadow-sm`}>
                      <badge.icon className="w-10 h-10" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 italic">{badge.label}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">مستوى {badge.level}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AIChatBubble />
    </main>
  )
}
