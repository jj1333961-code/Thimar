'use client'

import React, { useState } from 'react'
import { 
  ClipboardList, 
  Book, 
  Mic, 
  Brain, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Play,
  FileText,
  Loader2,
  Calendar,
  X,
  Send,
  Sparkles,
  Users,
  Check,
  Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { t } from '@/lib/i18n'

interface Task {
  id: number
  type: 'recitation' | 'exam' | 'homework' | 'activity'
  title: string
  description?: string
  status: 'new' | 'in-progress' | 'completed' | 'graded'
  deadline?: string
  score?: string
  studentName?: string // For parent view
  surahOrSubject?: string
}

const INITIAL_TASKS: Task[] = [
  { 
    id: 1, 
    type: 'recitation', 
    title: 'تسميع سورة النور (الآيات ١ - ٢٠)', 
    description: 'تسميع غيباً مع مراعاة أحكام المدود ومخارج الحروف وترقيق الراء.',
    status: 'new', 
    deadline: 'اليوم، ٨:٠٠ م', 
    studentName: 'ياسين عمر',
    surahOrSubject: 'سورة النور'
  },
  { 
    id: 2, 
    type: 'exam', 
    title: 'اختبار الجزء الرابع والعشرين (الحفظ المتقن)', 
    description: 'اختبار تجريبي للتأكد من ربط الآيات والمتشابهات اللفظية.',
    status: 'completed', 
    score: '٩٥٪', 
    deadline: 'أمس، ٥:٠٠ م',
    studentName: 'ياسين عمر',
    surahOrSubject: 'الجزء ٢٤'
  },
  { 
    id: 3, 
    type: 'homework', 
    title: 'حفظ أبيات تحفة الأطفال من ١ إلى ١٠', 
    description: 'تدوين معاني الكلمات وحفظ الأبيات مع الاستماع للتسجيل النموذجي.',
    status: 'in-progress', 
    deadline: 'غداً، ٤:٠٠ م', 
    studentName: 'لينا عمر',
    surahOrSubject: 'تجويد - تحفة الأطفال'
  },
  { 
    id: 4, 
    type: 'recitation', 
    title: 'تسميع سورة المؤمنون (الآيات ٨٠ - ١١٨)', 
    description: 'تسجيل الورد اليومي مع الشيخ المشرف.',
    status: 'graded', 
    score: '٩٨٪', 
    deadline: 'منذ يومين', 
    studentName: 'ياسين عمر',
    surahOrSubject: 'سورة المؤمنون'
  },
  { 
    id: 5, 
    type: 'activity', 
    title: 'نشاط استخراج أحكام النون الساكنة من سورة يس', 
    description: 'استخراج ٥ أمثلة لكل حكم من أحكام النون الساكنة والتنوين.',
    status: 'new', 
    deadline: 'الخميس، ٦:٠٠ م', 
    studentName: 'لينا عمر',
    surahOrSubject: 'تطبيق عملي تجويد'
  },
]

export function TasksView({ role, currentUserId }: { role: 'student' | 'parent', currentUserId: string }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [filterType, setFilterType] = useState<'all' | 'recitation' | 'exam' | 'homework'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedChild, setSelectedChild] = useState<string>('all')
  
  // Active task execution modal
  const [activeTaskModal, setActiveTaskModal] = useState<Task | null>(null)
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Recording timer
  React.useEffect(() => {
    let interval: any
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1)
      }, 1000)
    } else {
      setRecordingSeconds(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const filteredTasks = tasks.filter(t => {
    // Role filter
    if (role === 'student' && t.studentName !== 'ياسين عمر') {
      return false
    }
    if (role === 'parent' && selectedChild !== 'all' && t.studentName !== selectedChild) {
      return false
    }

    // Type filter
    if (filterType !== 'all' && t.type !== filterType) return false

    // Status filter
    if (filterStatus === 'active') {
      return t.status === 'new' || t.status === 'in-progress'
    }
    if (filterStatus === 'completed') {
      return t.status === 'completed' || t.status === 'graded'
    }

    return true
  })

  const handleStartTask = (task: Task) => {
    setActiveTaskModal(task)
    setSubmittedSuccess(false)
    setSubmissionNotes('')
    setIsRecording(false)
  }

  const handleSubmitTask = () => {
    if (!activeTaskModal) return

    setTasks(prev => prev.map(t => {
      if (t.id === activeTaskModal.id) {
        return {
          ...t,
          status: 'completed',
          score: t.type === 'recitation' ? 'قيد التصحيح' : '١٠٠٪'
        }
      }
      return t
    }))

    setSubmittedSuccess(true)
    setTimeout(() => {
      setActiveTaskModal(null)
      setSubmittedSuccess(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 pb-24 text-right" dir="rtl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 italic flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-emerald-600" />
            {t('المهمات والتكليفات')}
          </h2>
          <p className="text-gray-500 mt-1">
            {role === 'student' 
              ? t('قائمة التسميع والاختبارات والواجبات المطلوبة منك') 
              : t('متابعة المهام المسندة للأبناء ونسب إنجازها')}
          </p>
        </div>

        {/* Parent child filter */}
        {role === 'parent' && (
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start">
            {[
              { id: 'all', label: 'جميع الأبناء' },
              { id: 'ياسين عمر', label: 'ياسين' },
              { id: 'لينا عمر', label: 'لينا' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  selectedChild === c.id 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Filter Tabs & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          {[
            { id: 'all', label: t('الكل') },
            { id: 'recitation', label: t('التسميع') },
            { id: 'exam', label: t('الاختبارات') },
            { id: 'homework', label: t('الواجبات والأنشطة') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                filterType === item.id 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${filterStatus === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 shadow-sm' : 'text-gray-500'}`}
          >
            الكل ({filteredTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl transition-all ${filterStatus === 'active' ? 'bg-white dark:bg-gray-700 text-emerald-700 shadow-sm' : 'text-gray-500'}`}
          >
            النشطة
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${filterStatus === 'completed' ? 'bg-white dark:bg-gray-700 text-blue-700 shadow-sm' : 'text-gray-500'}`}
          >
            المكتملة
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-dashed border-gray-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">{t('لا توجد مهمات في هذا القسم')}</h3>
            <p className="text-gray-400 text-xs mt-1.5">{t('لقد تم إنجاز جميع التكليفات المسندة، جزاكم الله خيراً')}</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed' || task.status === 'graded'

            return (
              <div 
                key={task.id} 
                className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group"
              >
                {/* Action button */}
                <div className="order-2 md:order-1 flex items-center gap-3">
                  {task.score && (
                    <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 text-xs font-black rounded-2xl border border-emerald-100">
                      النتيجة: {task.score}
                    </span>
                  )}

                  <button 
                    onClick={() => handleStartTask(task)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 justify-center ${
                      isCompleted
                        ? 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-600/20'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>عرض التفاصيل</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current rotate-180" />
                        <span>{role === 'student' ? t('بدء المهمة الآن') : t('تفاصيل التكليف')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Task Details */}
                <div className="flex items-center gap-5 order-1 md:order-2 flex-1 justify-end">
                  <div className="space-y-1 text-right flex-1">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      {role === 'parent' && (
                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                          {task.studentName}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        task.status === 'new' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        task.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {task.status === 'new' ? 'مهمة جديدة' :
                         task.status === 'in-progress' ? 'قيد التنفيذ' : 'مكتملة ومصححة'}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 justify-end pt-1">
                      <span className="capitalize">
                        {task.type === 'exam' ? 'اختبار حفظ' : 
                         task.type === 'recitation' ? 'تسميع شفهي' : 
                         task.type === 'homework' ? 'واجب منزلي' : 'نشاط تفاعلي'}
                      </span>
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <Calendar className="w-3.5 h-3.5" /> موعد التسليم: {task.deadline}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Icon Avatar */}
                  <div className={`w-15 h-15 rounded-[1.8rem] flex items-center justify-center font-bold text-2xl shadow-sm ${
                    task.type === 'exam' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                    task.type === 'recitation' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {task.type === 'exam' ? <FileText className="w-7 h-7" /> : 
                     task.type === 'recitation' ? <Mic className="w-7 h-7" /> : 
                     <Book className="w-7 h-7" />}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Task Interaction Modal */}
      <AnimatePresence>
        {activeTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-xl p-6 md:p-8 shadow-2xl border border-gray-100 relative text-right"
              dir="rtl"
            >
              <button 
                onClick={() => setActiveTaskModal(null)}
                className="absolute left-6 top-6 p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    {activeTaskModal.type === 'recitation' ? <Mic className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {activeTaskModal.surahOrSubject}
                    </span>
                    <h3 className="text-xl font-black text-gray-900 mt-1">{activeTaskModal.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl">
                  {activeTaskModal.description}
                </p>

                {submittedSuccess ? (
                  <div className="p-8 bg-emerald-50 text-emerald-800 rounded-3xl text-center space-y-2 border border-emerald-100">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-black">تم تسليم المهمة بنجاح!</h4>
                    <p className="text-xs text-emerald-700">تم إرسال إشعار لمعلم الحلقة للمراجعة والتقييم.</p>
                  </div>
                ) : (
                  <>
                    {/* If Recitation */}
                    {activeTaskModal.type === 'recitation' && (
                      <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 text-center space-y-4">
                        <div className="text-xs font-bold text-gray-700">التسجيل الصوتي المباشر للتسميع</div>
                        <div className="text-3xl font-black text-emerald-700 font-mono">
                          00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                        </div>
                        
                        <button
                          onClick={() => setIsRecording(!isRecording)}
                          className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center gap-3 mx-auto ${
                            isRecording 
                              ? 'bg-red-500 text-white animate-pulse shadow-red-500/20' 
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                          }`}
                        >
                          <Mic className="w-5 h-5" />
                          <span>{isRecording ? 'إيقاف التسجيل وإنهاء التلاوة' : 'بدء تسجيل التلاوة الآن'}</span>
                        </button>
                      </div>
                    )}

                    {/* Submission text notes */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">ملاحظات الطالب أو الإجابة المكتوبة:</label>
                      <textarea
                        value={submissionNotes}
                        onChange={e => setSubmissionNotes(e.target.value)}
                        placeholder="أدخل أي ملاحظات أو أسئلة للمعلم هنا..."
                        rows={3}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => setActiveTaskModal(null)}
                        className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-400 hover:text-gray-600"
                      >
                        إلغاء
                      </button>
                      
                      <button
                        onClick={handleSubmitTask}
                        className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Send className="w-4 h-4 rotate-180" />
                        <span>تسليم المهمة للمعلم</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
