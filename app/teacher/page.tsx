'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, BookOpen, Star, Calendar, 
  Search, Plus, Filter, MessageCircle,
  TrendingUp, CheckCircle2, Clock, Play,
  ChevronRight, Award, Brain, X
} from 'lucide-react'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { WelcomeMessage } from '@/components/ui/welcome-message'
import { PWAInstallButton } from '@/components/pwa-install-button'

export default function TeacherDashboard() {
  const [activeView, setActiveView] = useState<'students' | 'tasks' | 'evaluations'>('students')

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-white border-l border-gray-100 flex flex-col p-4 lg:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0">ث</div>
          <h1 className="text-2xl font-black text-gray-900 hidden lg:block">ثمار المعلم</h1>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { id: 'students', label: 'طلابي', icon: Users },
            { id: 'tasks', label: 'المهام والتكاليف', icon: BookOpen },
            { id: 'evaluations', label: 'التقييمات والنتائج', icon: Star },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeView === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-bold hidden lg:block">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="bg-emerald-50 p-6 rounded-[2rem] hidden lg:block">
          <h4 className="font-bold text-emerald-800 mb-2">تحديثات ثمار AI</h4>
          <p className="text-xs text-emerald-600 leading-relaxed">
            تم تفعيل ميزة التنبؤ بموعد الختم بناءً على معدل حفظ الطالب الحالي.
          </p>
        </div>
      </aside>

      {/* Content */}
      <section className="flex-1 p-6 lg:p-12 overflow-auto">
        <WelcomeMessage role="teacher" userName="أ. أحمد" />
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">أهلاً بك، أ. أحمد</h2>
            <p className="text-gray-500 mt-2 text-lg">لديك ١٢ طالباً اليوم بانتظار المتابعة</p>
          </div>
          
          <div className="flex items-center gap-4">
            <PWAInstallButton />
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 border-l border-gray-100 text-center">
              <div className="text-2xl font-black text-emerald-600">٢٤</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">تسميع منجز</div>
            </div>
            <div className="px-6 text-center">
              <div className="text-2xl font-black text-amber-500">٥</div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">مهام معلقة</div>
            </div>
            </div>
          </div>
        </header>

        {activeView === 'students' && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="ابحث عن طالب بالاسم أو رقم الهاتف..." 
                  className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                <Plus className="w-5 h-5" /> إضافة طالب جديد
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[
                { name: 'محمد علي البغدادي', progress: 85, lastSurah: 'البقرة: ١٤٢', level: 'متقدم', avatar: 'M' },
                { name: 'ياسين عمر الخطيب', progress: 42, lastSurah: 'النساء: ٥٠', level: 'متوسط', avatar: 'Y' },
                { name: 'عبدالرحمن يوسف', progress: 12, lastSurah: 'الكهف: ١٠', level: 'مبتدئ', avatar: 'A' },
                { name: 'عمر خالد', progress: 98, lastSurah: 'الناس', level: 'خاتم', avatar: 'O' },
              ].map((student, i) => (
                <div key={i} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-[1.8rem] flex items-center justify-center text-3xl font-black group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      {student.avatar}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-gray-900">{student.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase">{student.level}</span>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">آخر تسميع: <span className="text-gray-600">{student.lastSurah}</span></p>
                      <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${student.progress}%` }} />
                      </div>
                    </div>
                  </div>
                  <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'tasks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3"><Clock className="text-amber-500" /> مهام اليوم</h3>
              {[
                { title: 'تسميع ربع الحزب الثالث', student: 'محمد علي', surah: 'البقرة', date: 'اليوم، ٤:٠٠ م' },
                { title: 'مراجعة سورة الكهف', student: 'ياسين عمر', surah: 'الكهف', date: 'اليوم، ٦:٣٠ م' },
              ].map((task, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-900">{task.title}</h4>
                    <p className="text-gray-500 flex items-center gap-2">
                      <Users className="w-4 h-4" /> {task.student} • <BookOpen className="w-4 h-4" /> {task.surah}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all">
                    <Play className="w-4 h-4" /> بدء الجلسة
                  </button>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-3"><TrendingUp className="text-emerald-500" /> إحصائيات الأسبوع</h3>
              <div className="space-y-4">
                {[
                  { label: 'نسبة الحضور', value: '٩٤٪', icon: CheckCircle2, color: 'text-emerald-600' },
                  { label: 'الأوسمة الممنوحة', value: '١٢', icon: Award, color: 'text-amber-500' },
                  { label: 'استخدام AI', value: '٨ ساعات', icon: Brain, color: 'text-blue-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 text-gray-600 font-medium">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      {stat.label}
                    </div>
                    <span className="font-black text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <AIChatBubble />
    </main>
  )
}
