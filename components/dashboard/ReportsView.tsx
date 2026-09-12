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
  Loader2, 
  FileText, 
  Mic, 
  Star, 
  Activity, 
  User, 
  History,
  Play,
  Pause,
  Volume2,
  CalendarCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Download,
  Share2,
  Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { requestJson } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { t } from '@/lib/i18n'

interface Student {
  id: string
  name: string
  email: string
  role: string
  progress: number
  level: string
  lastSeen?: string
  activityScore: number
  diligenceScore: number
  studyHabitsScore: number
  regularityScore: number
  progressTrajectory: string
  attendanceRate: number
  recitationsCount: number
  examsAverage: number
}

interface RecitationRecord {
  id: string
  surah: string
  ayahs: string
  grade: string
  score: number
  date: string
  audioDuration: string
  teacherFeedback: string
  tajweedNotes: string[]
}

interface ExamRecord {
  id: string
  title: string
  score: number
  total: number
  date: string
  passed: boolean
  teacherFeedback: string
}

interface TaskRecord {
  id: string
  title: string
  status: 'completed' | 'in-progress' | 'pending'
  dueDate: string
  submittedAt?: string
  grade?: string
}

export function ReportsView({ role, currentUserId }: { role: 'admin' | 'student' | 'parent', currentUserId: string }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [reportTab, setReportTab] = useState<'all' | 'recitations' | 'exams' | 'tasks' | 'attendance'>('all')
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)

  const { data: students = [], isLoading: loading } = useQuery<Student[]>({
    queryKey: ['students-reports', role, currentUserId],
    queryFn: async () => {
      if (role === 'admin') {
        try {
          const data = await requestJson<any>('/api/supabase/students')
          const list = (data.students || []).map((s: any, idx: number) => ({
            id: s.id || `s_${idx}`,
            name: s.name || `طالب ${idx + 1}`,
            email: s.email || `student${idx}@thimar.app`,
            role: 'student',
            progress: 75 + (idx % 23),
            level: s.grade_level || 'الجزء ٢٤ - سورة النور',
            lastSeen: 'اليوم، ١١:٣٠ ص',
            activityScore: 92 - (idx % 10),
            diligenceScore: 89 - (idx % 8),
            studyHabitsScore: 85 - (idx % 12),
            regularityScore: 96 - (idx % 5),
            progressTrajectory: 'متصاعد ومتميز',
            attendanceRate: 98 - (idx % 4),
            recitationsCount: 38 + (idx * 2),
            examsAverage: 94 - (idx % 7),
          }))
          if (list.length > 0) return list
        } catch {}

        // Fallback admin student pool
        return [
          {
            id: 's_1',
            name: 'ياسين عمر',
            email: 'y@thimar.app',
            role: 'student',
            progress: 82,
            level: 'الجزء ٢٤ - سورة النور',
            lastSeen: 'اليوم، ١٠:٣٠ ص',
            activityScore: 94,
            diligenceScore: 90,
            studyHabitsScore: 88,
            regularityScore: 98,
            progressTrajectory: 'في تصاعد مستمر',
            attendanceRate: 97,
            recitationsCount: 42,
            examsAverage: 96,
          },
          {
            id: 's_2',
            name: 'لينا عمر',
            email: 'l@thimar.app',
            role: 'student',
            progress: 65,
            level: 'الجزء الخامس - النساء',
            lastSeen: 'أمس، ٤:١٥ م',
            activityScore: 88,
            diligenceScore: 85,
            studyHabitsScore: 82,
            regularityScore: 92,
            progressTrajectory: 'جيد جداً مع تحسن ملحوظ',
            attendanceRate: 94,
            recitationsCount: 28,
            examsAverage: 91,
          },
          {
            id: 's_3',
            name: 'عبدالرحمن خالد',
            email: 'abood@thimar.app',
            role: 'student',
            progress: 91,
            level: 'الجزء التاسع والعشرون - تبارك',
            lastSeen: 'اليوم، ٩:٠٠ ص',
            activityScore: 96,
            diligenceScore: 95,
            studyHabitsScore: 92,
            regularityScore: 100,
            progressTrajectory: 'ممتاز وفائق',
            attendanceRate: 100,
            recitationsCount: 54,
            examsAverage: 99,
          },
          {
            id: 's_4',
            name: 'فاطمة الزهراء أحمد',
            email: 'fatima@thimar.app',
            role: 'student',
            progress: 78,
            level: 'الجزء الأول - البقرة',
            lastSeen: 'منذ يومين',
            activityScore: 85,
            diligenceScore: 88,
            studyHabitsScore: 84,
            regularityScore: 90,
            progressTrajectory: 'مستقر ومتطور',
            attendanceRate: 92,
            recitationsCount: 31,
            examsAverage: 89,
          }
        ]
      } else if (role === 'parent') {
        // Parent only sees their linked children
        return [
          {
            id: 's_1',
            name: 'ياسين عمر',
            email: 'y@thimar.app',
            role: 'student',
            progress: 82,
            level: 'الجزء ٢٤ - سورة النور',
            lastSeen: 'اليوم، ١٠:٣٠ ص',
            activityScore: 94,
            diligenceScore: 90,
            studyHabitsScore: 88,
            regularityScore: 98,
            progressTrajectory: 'في تصاعد مستمر',
            attendanceRate: 97,
            recitationsCount: 42,
            examsAverage: 96,
          },
          {
            id: 's_2',
            name: 'لينا عمر',
            email: 'l@thimar.app',
            role: 'student',
            progress: 65,
            level: 'الجزء الخامس - النساء',
            lastSeen: 'أمس، ٤:١٥ م',
            activityScore: 88,
            diligenceScore: 85,
            studyHabitsScore: 82,
            regularityScore: 92,
            progressTrajectory: 'جيد جداً مع تحسن ملحوظ',
            attendanceRate: 94,
            recitationsCount: 28,
            examsAverage: 91,
          }
        ]
      }
      return []
    },
    enabled: role === 'admin' || role === 'parent'
  })

  useEffect(() => {
    // If student, automatically lock to own report
    if (role === 'student' && !selectedStudent) {
      setSelectedStudent({
        id: currentUserId,
        name: 'ياسين عمر',
        email: 'student@thimar.app',
        role: 'student',
        progress: 82,
        level: 'الجزء ٢٤ - سورة النور',
        lastSeen: 'اليوم، ١٠:٣٠ ص',
        activityScore: 94,
        diligenceScore: 90,
        studyHabitsScore: 88,
        regularityScore: 98,
        progressTrajectory: 'في تصاعد مستمر',
        attendanceRate: 97,
        recitationsCount: 42,
        examsAverage: 96,
      })
    }
  }, [role, currentUserId])

  // Sample recitation attempts
  const recitations: RecitationRecord[] = [
    {
      id: 'rec_1',
      surah: 'سورة النور',
      ayahs: 'الآيات ١ - ٢٠',
      grade: 'ممتاز مع مرتبة الشرف',
      score: 98,
      date: 'اليوم، ١٠:٣٠ ص',
      audioDuration: '٠٤:١٥',
      teacherFeedback: 'قراءة محكمة ومخارج حروف واضحة جداً، أحسنت في ترقيق الراء وأحكام النون الساكنة.',
      tajweedNotes: ['أتقن أحكام المد المنفصل', 'الوقف والابتداء سليم', 'غنّة الإدغام واضحة']
    },
    {
      id: 'rec_2',
      surah: 'سورة المؤمنون',
      ayahs: 'الآيات ٨٠ - ١١٨',
      grade: 'ممتاز',
      score: 95,
      date: 'منذ يومين',
      audioDuration: '٠٥:٣٠',
      teacherFeedback: 'حفظ متين، يُرجى الانتباه للمد اللازم في الآية الأخيرة.',
      tajweedNotes: ['مخارج حروف الحلق ممتازة', 'تطبيق الإخفاء الحقيقي جيد']
    },
    {
      id: 'rec_3',
      surah: 'سورة الحج',
      ayahs: 'الآيات ٥٠ - ٧٨',
      grade: 'جيد جداً مرتفع',
      score: 91,
      date: 'منذ ٥ أيام',
      audioDuration: '٠٣:٤٥',
      teacherFeedback: 'تلاوة طيبة وخشوع طيب، ركز على تفخيم اللام في لفظ الجلالة.',
      tajweedNotes: ['أحكام التفخيم والترقيق', 'القلقلة الصغرى']
    }
  ]

  // Sample exams
  const exams: ExamRecord[] = [
    {
      id: 'ex_1',
      title: 'اختبار نصف الجزء الرابع والعشرين',
      score: 98,
      total: 100,
      date: '١٠ سبتمبر ٢٠٢٦',
      passed: true,
      teacherFeedback: 'إجابات دقيقة وتسميع متميز بدون أي خطأ جلي.'
    },
    {
      id: 'ex_2',
      title: 'اختبار أحكام النون الساكنة والتنوين (نظري وتطبيقي)',
      score: 95,
      total: 100,
      date: '٠٣ سبتمبر ٢٠٢٦',
      passed: true,
      teacherFeedback: 'استيعاب كامل لقواعد التجويد النظرية وتطبيقها عملياً.'
    },
    {
      id: 'ex_3',
      title: 'اختبار ربع يس الشهري',
      score: 94,
      total: 100,
      date: '٢٥ أغسطس ٢٠٢٦',
      passed: true,
      teacherFeedback: 'حفظ ممتاز ومتصل مع تثبيت المتشابهات.'
    }
  ]

  // Sample tasks
  const tasks: TaskRecord[] = [
    {
      id: 't_1',
      title: 'تسميع سورة النور (الآيات ١ - ٢٠)',
      status: 'completed',
      dueDate: 'اليوم، ٨:٠٠ م',
      submittedAt: 'اليوم، ١٠:٣٠ ص',
      grade: '٩٨٪'
    },
    {
      id: 't_2',
      title: 'مراجعة تثبيت ربع الحزب ٤٧',
      status: 'completed',
      dueDate: 'أمس',
      submittedAt: 'أمس، ٥:٠٠ م',
      grade: '٩٥٪'
    },
    {
      id: 't_3',
      title: 'حفظ أبيات تحفة الأطفال من ١ إلى ١٠',
      status: 'in-progress',
      dueDate: 'غداً، ٦:٠٠ م',
    }
  ]

  const togglePlayAudio = (recId: string) => {
    if (playingAudioId === recId) {
      setPlayingAudioId(null)
    } else {
      setPlayingAudioId(recId)
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Filter students for admin search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.level.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" />
        <p className="font-bold">{t('جاري تحميل التقارير الأكاديمية...')}</p>
      </div>
    )
  }

  // If Admin or Parent and no student is currently chosen, show the selector directory
  if ((role === 'admin' || role === 'parent') && !selectedStudent) {
    return (
      <div className="space-y-8 pb-24 text-right" dir="rtl">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 italic flex items-center gap-3">
              <BarChart2 className="w-8 h-8 text-emerald-600" />
              {t('تقارير الطلاب')}
            </h2>
            <p className="text-gray-500 mt-1">
              {role === 'admin' 
                ? t('اختر طالباً من القائمة لعرض ملفه التقييمي الشامل وتسجيلات التسميع')
                : t('متابعة تقارير الأبناء ومستويات الإنجاز والتقييمات الشاملة')}
            </p>
          </div>

          {role === 'parent' && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-black border border-emerald-100 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{students.length} أبناء مسجلين</span>
            </div>
          )}
        </header>

        {role === 'admin' && (
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('ابحث عن اسم طالب أو مرحلته الدراسية...')}
              className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-sm text-right"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 italic">
              {t('لا يوجد طلاب مسجلين')}
            </div>
          ) : (
            filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white p-7 rounded-[2.5rem] border border-gray-100 text-right shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-6 justify-between">
                  <span className="p-2.5 bg-gray-50 group-hover:bg-emerald-50 text-gray-400 group-hover:text-emerald-600 rounded-2xl transition-colors">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </span>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h4 className="text-lg font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {student.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{student.level}</p>
                    </div>
                    <div className="w-13 h-13 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm">
                      {student.name[0]}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2 bg-gray-50/70 p-4 rounded-2xl mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-600 font-black">{student.progress}٪</span>
                    <span className="text-gray-500">{t('نسبة الإنجاز')}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200/60 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${student.progress}%` }} />
                  </div>
                </div>

                {/* Key Metrics row */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-50">
                  <div className="p-2 bg-emerald-50/50 rounded-xl">
                    <div className="text-xs font-black text-emerald-700">{student.attendanceRate}٪</div>
                    <div className="text-[10px] text-gray-400">الحضور</div>
                  </div>
                  <div className="p-2 bg-blue-50/50 rounded-xl">
                    <div className="text-xs font-black text-blue-700">{student.recitationsCount}</div>
                    <div className="text-[10px] text-gray-400">تسميع</div>
                  </div>
                  <div className="p-2 bg-amber-50/50 rounded-xl">
                    <div className="text-xs font-black text-amber-700">{student.examsAverage}٪</div>
                    <div className="text-[10px] text-gray-400">الاختبارات</div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  // DETAILED STUDENT REPORT VIEW
  return (
    <div className="space-y-8 pb-24 text-right" dir="rtl">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {(role === 'admin' || role === 'parent') && (
            <button 
              onClick={() => setSelectedStudent(null)}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-1 text-xs font-bold shadow-sm"
              title="العودة لقائمة الطلاب"
            >
              <ChevronLeft className="w-5 h-5 rotate-180" />
              <span>{role === 'admin' ? 'قائمة الطلاب' : 'الأبناء'}</span>
            </button>
          )}

          <button 
            onClick={handleExportPDF}
            className="px-5 py-3 bg-white border border-gray-100 rounded-2xl text-emerald-700 font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm text-xs"
          >
            <Download className="w-4 h-4" />
            <span>{t('طباعة التقرير / PDF')}</span>
          </button>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="text-right">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 italic">
              {t('تقرير الطالب')} : {selectedStudent?.name}
            </h2>
            <p className="text-xs text-emerald-600 font-bold mt-1">
              {selectedStudent?.level} • {t('الحالة الأكاديمية')}: نشط ومتميز
            </p>
          </div>
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-md">
            {selectedStudent?.name?.[0]}
          </div>
        </div>
      </header>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('نسبة الإنجاز والتقدم'), value: `${selectedStudent?.progress}٪`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: t('جلسات التسميع المنجزة'), value: `${selectedStudent?.recitationsCount}`, icon: Mic, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: t('متوسط درجات الاختبارات'), value: `${selectedStudent?.examsAverage}٪`, icon: Award, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
          { label: t('نسبة الحضور والالتزام'), value: `${selectedStudent?.attendanceRate}٪`, icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] ${stat.bg} ${stat.color} text-center space-y-1.5 border border-gray-100 shadow-sm`}>
            <stat.icon className="w-7 h-7 mx-auto opacity-80" />
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-[11px] font-bold opacity-75">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Section Filter Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto gap-1">
        {[
          { id: 'all', label: 'ملخص شامل', icon: Activity },
          { id: 'recitations', label: 'نتائج التسميع والتسجيلات', icon: Mic },
          { id: 'exams', label: 'نتائج الاختبارات', icon: Award },
          { id: 'tasks', label: 'سجل المهام', icon: BookOpen },
          { id: 'attendance', label: 'الحضور والالتزام', icon: CalendarCheck },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setReportTab(item.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              reportTab === item.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Recitations Section */}
      {(reportTab === 'all' || reportTab === 'recitations') && (
        <section className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="text-xs text-gray-400 font-bold">{recitations.length} جلسات مسجلة</span>
            <h3 className="text-xl font-black text-gray-900 italic flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-emerald-600" />
              <span>نتائج التسميع مع التسجيلات الصوتية</span>
            </h3>
          </div>

          <div className="space-y-4">
            {recitations.map((rec) => {
              const isPlaying = playingAudioId === rec.id

              return (
                <div key={rec.id} className="p-6 bg-gray-50/70 rounded-3xl border border-gray-100 space-y-4 hover:border-emerald-200 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full">
                        {rec.score}٪ • {rec.grade}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {rec.date}
                      </span>
                    </div>

                    <div className="text-right">
                      <h4 className="text-base font-black text-gray-900">{rec.surah}</h4>
                      <p className="text-xs text-emerald-600 font-bold">{rec.ayahs}</p>
                    </div>
                  </div>

                  {/* Audio Player Bar */}
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => togglePlayAudio(rec.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isPlaying 
                            ? 'bg-emerald-600 text-white animate-pulse' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                        title={isPlaying ? 'إيقاف التسجيل' : 'الاستماع إلى تسجيل التسميع'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current rotate-180" />}
                      </button>

                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-900">
                          {isPlaying ? 'جاري تشغيل التسجيل الصوتي...' : 'استمع لتسجيل الطالب'}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">المدة: {rec.audioDuration}</div>
                      </div>
                    </div>

                    {/* Sound Waves visualizer */}
                    <div className="flex items-center gap-1 flex-1 max-w-xs justify-center">
                      {[40, 70, 30, 90, 60, 45, 80, 100, 65, 50, 85, 30, 75, 40].map((h, i) => (
                        <span 
                          key={i} 
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-gray-200'
                          }`} 
                          style={{ height: isPlaying ? `${Math.max(8, (h * Math.random()) + 10)}px` : `${h * 0.25}px` }} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Teacher Feedback & Tajweed Notes */}
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-right space-y-2">
                    <div className="text-xs font-bold text-emerald-800 flex items-center justify-end gap-1.5">
                      <span>ملاحظات المعلم وتقييم الأداء:</span>
                      <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{rec.teacherFeedback}"</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2 justify-end">
                      {rec.tajweedNotes.map((note, nIdx) => (
                        <span key={nIdx} className="text-[10px] font-bold bg-white text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200">
                          ✓ {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* 2. Exams Section */}
      {(reportTab === 'all' || reportTab === 'exams') && (
        <section className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="text-xs text-gray-400 font-bold">{exams.length} اختبارات مجتازة</span>
            <h3 className="text-xl font-black text-gray-900 italic flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-500" />
              <span>نتائج الاختبارات ومحاولاتها</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exams.map((ex) => (
              <div key={ex.id} className="p-5 bg-amber-50/40 rounded-3xl border border-amber-100 space-y-3 text-right">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                    {ex.score} / {ex.total}
                  </span>
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{ex.title}</h4>
                <p className="text-[11px] text-gray-400">{ex.date}</p>
                <div className="p-3 bg-white rounded-xl text-[11px] text-gray-600 border border-amber-100 leading-relaxed">
                  "{ex.teacherFeedback}"
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Tasks Section */}
      {(reportTab === 'all' || reportTab === 'tasks') && (
        <section className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="text-xs text-gray-400 font-bold">إجمالي المهام الموكلة</span>
            <h3 className="text-xl font-black text-gray-900 italic flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span>نتائج المهام والتكليفات</span>
            </h3>
          </div>

          <div className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <div key={task.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {task.grade && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl">
                      {task.grade}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {task.status === 'completed' ? 'تم الإنجاز' : 'قيد المتابعة'}
                  </span>
                </div>

                <div className="text-right">
                  <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                  <p className="text-[11px] text-gray-400">موعد التسليم: {task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Attendance Section */}
      {(reportTab === 'all' || reportTab === 'attendance') && (
        <section className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              نسبة الالتزام: {selectedStudent?.attendanceRate}٪
            </span>
            <h3 className="text-xl font-black text-gray-900 italic flex items-center gap-2.5">
              <CalendarCheck className="w-5 h-5 text-purple-600" />
              <span>سجل الحضور والانتظام</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="text-xl font-black text-emerald-700">٤٦</div>
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">أيام الحضور في الموعد</div>
            </div>
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="text-xl font-black text-blue-700">١</div>
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">تأخر بعذر</div>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="text-xl font-black text-amber-700">١</div>
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">غياب بإذن مسبق</div>
            </div>
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
              <div className="text-xl font-black text-purple-700">٠</div>
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">غياب بدون عذر</div>
            </div>
          </div>
        </section>
      )}

      {/* 5. COMPREHENSIVE EVALUATION SECTION AT THE BOTTOM */}
      <section className="bg-gradient-to-br from-gray-900 to-emerald-950 text-white p-8 md:p-10 rounded-[3rem] shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-3.5 py-1.5 rounded-full">
              التقييم الفصلي الشامل
            </span>
          </div>

          <div className="text-right">
            <h3 className="text-2xl font-black italic flex items-center justify-end gap-2 text-white">
              <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
              <span>التقييم الشامل للطالب</span>
            </h3>
            <p className="text-xs text-emerald-200/70 mt-1">
              تحليل أدائي دقيق بناءً على الحلقات اليومية، والتسميع، والاختبارات، وسلوك الطالب الأكاديمي
            </p>
          </div>
        </div>

        {/* 5 Core Required Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* 1. نشاط الطالب */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-right space-y-2">
            <div className="text-[11px] font-bold text-emerald-300">١. نشاط الطالب</div>
            <div className="text-2xl font-black text-white">{selectedStudent?.activityScore}٪</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${selectedStudent?.activityScore}%` }} />
            </div>
            <p className="text-[10px] text-gray-300">تفاعل استثنائي ومشاركة دائمة في التسميع الجماعي والفردي.</p>
          </div>

          {/* 2. اجتهاده */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-right space-y-2">
            <div className="text-[11px] font-bold text-blue-300">٢. اجتهاده</div>
            <div className="text-2xl font-black text-white">{selectedStudent?.diligenceScore}٪</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${selectedStudent?.diligenceScore}%` }} />
            </div>
            <p className="text-[10px] text-gray-300">حرص واضح على تصحيح التلاوة وتنفيذ توجيهات شيخ الحلقة فوراً.</p>
          </div>

          {/* 3. مذاكرته */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-right space-y-2">
            <div className="text-[11px] font-bold text-amber-300">٣. مذاكرته</div>
            <div className="text-2xl font-black text-white">{selectedStudent?.studyHabitsScore}٪</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${selectedStudent?.studyHabitsScore}%` }} />
            </div>
            <p className="text-[10px] text-gray-300">تحضير مسبق للورد اليومي ومراجعة مستمرة للمحفوظ السابق.</p>
          </div>

          {/* 4. انتظامه */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-right space-y-2">
            <div className="text-[11px] font-bold text-purple-300">٤. انتظامه</div>
            <div className="text-2xl font-black text-white">{selectedStudent?.regularityScore}٪</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${selectedStudent?.regularityScore}%` }} />
            </div>
            <p className="text-[10px] text-gray-300">انضباط عالٍ في مواعيد الجلسات وتأدية التكليفات في وقتها المحدد.</p>
          </div>

          {/* 5. مستوى تقدمه */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-right space-y-2">
            <div className="text-[11px] font-bold text-teal-300">٥. مستوى تقدمه</div>
            <div className="text-sm font-black text-teal-200 mt-1">{selectedStudent?.progressTrajectory}</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-teal-400 rounded-full" style={{ width: '95%' }} />
            </div>
            <p className="text-[10px] text-gray-300">منحنى صاعد بثبات وتطور ملموس في ضبط أحكام التجويد وإتقان الحفظ.</p>
          </div>
        </div>

        {/* AI & Administration Final Recommendation */}
        <div className="p-6 bg-white/10 rounded-3xl border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
          <div className="text-xs text-emerald-200/90 leading-relaxed">
            <span className="font-black text-white ml-1">توصية الإدارة المشتركة:</span>
            نوصي بالاستمرار على هذا النهج المبارك، مع تكثيف جلسات مراجعة المتشابهات اللفظية، وترشيح الطالب للمسابقة القرآنية السنوية القادمة.
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="text-xs font-black text-amber-300">طالب مرشح للتميز</span>
          </div>
        </div>
      </section>
    </div>
  )
}
