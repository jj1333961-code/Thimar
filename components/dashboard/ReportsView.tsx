'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  Search,
  Filter,
  Loader2,
  FileText,
  Mic,
  Star,
  Activity,
  User,
  History
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { requestJson } from '@/lib/api-client'

interface Student {
  id: string
  name: string
  email: string
  role: string
  progress: number
  level: string
  lastSeen?: string
}

export function ReportsView({ role, currentUserId }: { role: 'admin' | 'student' | 'parent', currentUserId: string }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role === 'admin' || role === 'parent') {
      fetchStudents()
    } else {
      // For student, they are the selected student
      setSelectedStudent({
        id: currentUserId,
        name: 'ياسين عمر',
        email: 'student@thimar.app',
        role: 'student',
        progress: 82,
        level: 'الجزء ٢٤'
      })
      setLoading(false)
    }
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      if (role === 'admin') {
        const data = await requestJson<any>('/api/supabase/students')
        setStudents(data.students || [])
      } else if (role === 'parent') {
        // Fetch children
        const mockChildren: Student[] = [
          { id: 's1', name: 'ياسين عمر', email: 'y@thimar.app', role: 'student', progress: 82, level: 'الجزء ٢٤' },
          { id: 's2', name: 'لينا عمر', email: 'l@thimar.app', role: 'student', progress: 45, level: 'الجزء ٥' },
        ]
        setStudents(mockChildren)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>جاري تحميل البيانات...</p>
      </div>
    )
  }

  if ((role === 'admin' || role === 'parent') && !selectedStudent) {
    return (
      <div className="space-y-8 pb-24">
        <header>
          <h2 className="text-3xl font-black text-gray-900 italic">التقارير</h2>
          <p className="text-gray-500 mt-2">
            {role === 'admin' ? 'اختر طالباً لعرض تقريره المفصل' : 'متابعة مستوى تقدم الأبناء'}
          </p>
        </header>

        {role === 'admin' && (
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ابحث عن اسم طالب..."
              className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.length === 0 ? (
            <div className="col-span-full p-20 text-center text-gray-400 italic">لا يوجد طلاب مسجلين</div>
          ) : (
            students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white p-8 rounded-[3rem] border border-gray-100 text-right shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl font-black">
                    {student.name[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 italic group-hover:text-emerald-700 transition-colors">{student.name}</h4>
                    <p className="text-sm text-gray-400">{student.level}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-400">الإنجاز الكلي</span>
                    <span className="text-emerald-600">{student.progress}٪</span>
                  </div>
                  <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${student.progress}%` }} />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><History className="w-3 h-3" /> آخر نشاط: {student.lastSeen || 'أمس'}</span>
                  <ChevronLeft className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {(role === 'admin' || role === 'parent') && (
            <button 
              onClick={() => setSelectedStudent(null)}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
            >
              <ChevronLeft className="w-6 h-6 rotate-180" />
            </button>
          )}
          <div>
            <h2 className="text-3xl font-black text-gray-900 italic">تقرير الطالب</h2>
            <p className="text-gray-500 mt-1">{selectedStudent?.name}</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-emerald-600 font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm">
          <FileText className="w-5 h-5" /> تصدير PDF
        </button>
      </header>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'نسبة الحفظ', value: `${selectedStudent?.progress}٪`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'جلسات التسميع', value: '٤٢', icon: Mic, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'الأوسمة', value: '٧', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'التقييم العام', value: 'ممتاز', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2.5rem] ${stat.bg} ${stat.color} text-center space-y-2 border border-white`}>
            <stat.icon className="w-8 h-8 mx-auto opacity-70" />
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Progress Timeline */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black text-gray-900 italic mb-8 flex items-center gap-3">
              <Activity className="text-emerald-500" /> سجل الإنجاز الأكاديمي
            </h3>
            <div className="space-y-6">
              {[
                { type: 'recitation', title: 'تسميع سورة النور (١-٢٠)', date: 'اليوم، ١٠:٣٠ ص', grade: 'ممتاز', feedback: 'مخارج الحروف جيدة جداً، ركز على المد المنفصل.' },
                { type: 'exam', title: 'اختبار ربع يس', date: 'أمس، ٤:٠٠ م', grade: '٩٨٪', feedback: 'أداء مذهل، استمر في المراجعة.' },
                { type: 'recitation', title: 'مراجعة الجزء ٢٣', date: 'منذ يومين', grade: 'جيد جداً', feedback: 'تحسن واضح في الأداء.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      item.type === 'exam' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {item.type === 'exam' ? <FileText className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </div>
                    <div className="w-0.5 flex-1 bg-gray-50 my-2" />
                  </div>
                  <div className="flex-1 bg-gray-50/50 p-6 rounded-3xl group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 italic">{item.title}</h4>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{item.grade}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{item.date}</p>
                    <div className="p-3 bg-white/50 rounded-xl text-xs text-gray-500 italic leading-relaxed border border-gray-100">
                      "{item.feedback}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Behavior & Activity */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-gray-900 italic flex items-center gap-3">
              <TrendingUp className="text-blue-500" /> تحليل المستوى
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'الانتظام', value: 95, color: 'bg-emerald-500' },
                { label: 'الاجتهاد', value: 88, color: 'bg-blue-500' },
                { label: 'المذاكرة', value: 75, color: 'bg-amber-500' },
                { label: 'التفاعل', value: 92, color: 'bg-purple-500' },
              ].map((skill, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-gray-500">{skill.label}</span>
                    <span className="text-gray-900">{skill.value}٪</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> توصية ثمار AI
              </h4>
              <p className="text-[11px] text-emerald-600 italic leading-relaxed">
                يُظهر الطالب تقدماً ممتازاً في الحفظ، ننصح بزيادة ورد المراجعة اليومي لضمان ثبات الحفظ القديم.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <Activity className="absolute -bottom-4 -left-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold mb-2 italic">الخلاصة</h4>
            <p className="text-xs opacity-70 leading-relaxed italic">
              هذا التقرير مبني على نشاط الطالب خلال الـ ٣٠ يوماً الماضية، بما في ذلك محاولات التسميع ودرجات الاختبارات الفعلية.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
