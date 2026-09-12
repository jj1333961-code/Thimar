'use client'

import React, { useState, useEffect } from 'react'
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
  Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Task {
  id: number
  type: 'exam' | 'recitation' | 'homework' | 'ai-task'
  title: string
  description?: string
  status: 'new' | 'in-progress' | 'completed' | 'graded'
  deadline?: string
  score?: string
  studentName?: string // For parent view
}

import { t } from '@/lib/i18n'

export function TasksView({ role, currentUserId }: { role: 'student' | 'parent', currentUserId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'completed'>('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      // Fetching tasks would normally be from /api/tasks
      const mockTasks: Task[] = [
        { id: 1, type: 'recitation', title: 'تسميع سورة النور (١-٢٠)', status: 'new', deadline: t('اليوم، ٨:٠٠ م'), studentName: 'ياسين عمر' },
        { id: 2, type: 'exam', title: 'اختبار الجزء ٢٤', status: 'completed', score: '٩٥٪', studentName: 'ياسين عمر' },
        { id: 3, type: 'homework', title: 'حفظ تحفة الأطفال (١-٥)', status: 'in-progress', deadline: t('غداً'), studentName: 'لينا عمر' },
      ]
      setTasks(mockTasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'new') return t.status === 'new' || t.status === 'in-progress'
    if (filter === 'completed') return t.status === 'completed' || t.status === 'graded'
    return true
  })

  return (
    <div className="space-y-6 pb-24 text-right">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start order-2 md:order-1">
          {[
            { id: 'all', label: t('الكل') },
            { id: 'new', label: t('القائمة') },
            { id: 'completed', label: t('المكتملة') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-black text-gray-900 italic">{t('المهمات')}</h2>
          <p className="text-gray-500 mt-2">
            {role === 'student' ? t('كل ما هو مطلوب منك إنجازه اليوم') : t('متابعة مهام الأبناء القادمة والمكتملة')}
          </p>
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p>{t('جاري جلب المهمات...')}</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">{t('لا توجد مهمات حالياً')}</h3>
            <p className="text-gray-500 mt-2">{t('لقد أنجزت كل المطلوب، أحسنت!')}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
              <button className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 order-2 md:order-1 justify-center ${
                task.status === 'completed' || task.status === 'graded'
                ? 'bg-gray-50 text-gray-400 cursor-default'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-100'
              }`}>
                {task.status === 'completed' || task.status === 'graded' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current rotate-180" />
                    {role === 'student' ? t('بدء المهمة') : t('عرض التفاصيل')}
                  </>
                )}
              </button>

              <div className="flex items-center gap-6 order-1 md:order-2 justify-end flex-1">
                <div className="space-y-1 text-right flex-1">
                  {role === 'parent' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase mb-1 inline-block">
                      {task.studentName}
                    </span>
                  )}
                  <h4 className="text-xl font-bold text-gray-900 italic">{t(task.title)}</h4>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400 justify-end">
                    <span className="flex items-center gap-1 capitalize">
                      {task.type === 'exam' ? t('اختبار') : task.type === 'recitation' ? t('تسميع') : t('مهمة')}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-bold text-2xl ${
                  task.type === 'exam' ? 'bg-amber-100 text-amber-600' : 
                  task.type === 'recitation' ? 'bg-emerald-100 text-emerald-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {task.type === 'exam' ? <FileText /> : task.type === 'recitation' ? <Mic /> : <Book />}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
