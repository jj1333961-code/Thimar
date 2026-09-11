'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, TrendingUp, Calendar, 
  MessageCircle, Star, ShieldCheck,
  ChevronRight, Heart, FileText, Bell,
  BookOpen, Award, CheckCircle2
} from 'lucide-react'

import { AIChatBubble } from '@/components/ui/ai-chat-bubble'
import { WelcomeMessage } from '@/components/ui/welcome-message'
import { Brain, X } from 'lucide-react'

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(0)

  const children = [
    { name: 'ياسين عمر', level: 'الجزء ٢٤', progress: 82, lastUpdate: 'منذ ساعتين', teacher: 'أ. أحمد' },
    { name: 'لينا عمر', level: 'الجزء ٥', progress: 45, lastUpdate: 'أمس', teacher: 'أ. سارة' },
  ]

  return (
    <main className="min-h-screen bg-[#FDFBF7]" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">ث</div>
            <h1 className="text-xl font-black text-gray-900 italic">ثمار ولي الأمر</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 bg-amber-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-amber-700 font-bold">ع</div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        <WelcomeMessage role="parent" userName="أبا عمر" />
        {/* Children Selector */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900 italic">أبنائي</h2>
            <button className="text-emerald-600 font-bold hover:underline">إضافة ابن جديد +</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, i) => (
              <button
                key={i}
                onClick={() => setSelectedChild(i)}
                className={`p-8 rounded-[3rem] text-right transition-all group relative overflow-hidden ${
                  selectedChild === i 
                  ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-105' 
                  : 'bg-white border border-gray-100 text-gray-500 hover:shadow-lg'
                }`}
              >
                {selectedChild === i && <ShieldCheck className="absolute top-6 left-6 w-8 h-8 opacity-20" />}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${selectedChild === i ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                    {child.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-black">{child.name}</h4>
                    <p className={`text-sm ${selectedChild === i ? 'text-white/70' : 'text-gray-400'}`}>{child.level}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                    <span>التقدم</span>
                    <span>{child.progress}٪</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${selectedChild === i ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <div className={`h-full rounded-full ${selectedChild === i ? 'bg-white' : 'bg-emerald-500'}`} style={{ width: `${child.progress}%` }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Selected Child Progress Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900 italic flex items-center gap-3">
                  <TrendingUp className="text-emerald-500" /> تقرير تقدم {children[selectedChild].name}
                </h3>
                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-50 transition-all"><FileText className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'جلسات مكتملة', value: '١٢', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'أوسمة جديدة', value: '٣', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'تقييم المعلم', value: 'امتياز', icon: Star, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] ${stat.bg} ${stat.color} space-y-2 text-center`}>
                    <stat.icon className="w-8 h-8 mx-auto opacity-80" />
                    <div className="text-2xl font-black">{stat.value}</div>
                    <div className="text-xs font-bold uppercase opacity-70">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-700 flex items-center gap-2 italic"><BookOpen className="w-5 h-5 text-emerald-500" /> آخر النشاطات</h4>
                {[
                  { action: 'تم تسميع سورة النور (١-٢٠)', date: 'اليوم، ١٠:٣٠ ص', status: 'مقبول' },
                  { action: 'حصل على وسام "الحافظ النشط"', date: 'أمس، ٤:٠٠ م', status: 'إنجاز' },
                  { action: 'تعديل خطة الحفظ من قبل المعلم', date: 'منذ يومين', status: 'تنبيه' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                      <div>
                        <p className="font-bold text-gray-800 italic">{log.action}</p>
                        <p className="text-xs text-gray-400">{log.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-emerald-600 transition-colors">{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-gray-900 italic flex items-center gap-3">
                <MessageCircle className="text-emerald-500" /> تواصل مع المعلم
              </h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">أ</div>
                <div>
                  <h5 className="font-bold text-gray-800">{children[selectedChild].teacher}</h5>
                  <p className="text-xs text-gray-400">معلم القرآن الكريم</p>
                </div>
                <button className="mr-auto p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 italic leading-relaxed">
                يمكنك مناقشة خطة حفظ {children[selectedChild].name} أو طرح استفساراتك مباشرة مع المعلم المختص.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <Heart className="absolute -bottom-4 -left-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
              <h4 className="text-xl font-bold mb-2">ركن النصائح</h4>
              <p className="text-sm opacity-80 leading-relaxed italic mb-6">"أفضل هدية تقدمها لطفلك هي تشجيعه على ملازمة القرآن، اجعل له وقتاً ثابتاً كل يوم."</p>
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline">
                اقرأ المزيد <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </section>
      </div>
      <AIChatBubble />
    </main>
  )
}
