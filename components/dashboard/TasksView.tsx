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
      // In a real app, fetch from /api/assignments, /api/quizzes, etc.
      // Mock data for demonstration, but based on DB schema
      const mockTasks: Task[] = [
        { id: 1, type: 'recitation', title: 'تسميع سورة النور (١-٢٠)', status: 'new', deadline: 'اليوم، ٨:٠٠ م', studentName: 'ياسين عمر' },
        { id: 2, type: 'exam', title: 'اختبار الجزء ٢٤', status: 'completed', score: '٩٥٪', studentName: 'ياسين عمر' },
        { id: 3, type: 'homework', title: 'حفظ تحفة الأطفال (١-٥)', status: 'in-progress', deadline: 'غداً', studentName: 'لينا عمر' },
        { id: 4, type: 'ai-task', title: 'تحليل تلاوة سورة الحج', status: 'graded', score: 'ممتاز', studentName: 'ياسين عمر' },
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
    <div className="space-y-6 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 italic">المهمات</h2>
          <p className="text-gray-500 mt-2">
            {role === 'student' ? 'كل ما هو مطلوب منك إنجازه اليوم' : 'متابعة مهام الأبناء القادمة والمكتملة'}
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'new', label: 'القائمة' },
            { id: 'completed', label: 'المكتملة' },
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
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p>جاري جلب المهمات...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">لا توجد مهمات حالياً</h3>
            <p className="text-gray-500 mt-2">لقد أنجزت كل المطلوب، أحسنت!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all group">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-bold text-2xl ${
                  task.type === 'exam' ? 'bg-amber-100 text-amber-600' : 
                  task.type === 'recitation' ? 'bg-emerald-100 text-emerald-600' : 
                  task.type === 'ai-task' ? 'bg-purple-100 text-purple-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {task.type === 'exam' ? <FileText /> : task.type === 'recitation' ? <Mic /> : task.type === 'ai-task' ? <Brain /> : <Book />}
                </div>
                
                <div className="space-y-1 text-right">
                  {role === 'parent' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase mb-1 inline-block">
                      {task.studentName}
                    </span>
                  )}
                  <h4 className="text-xl font-bold text-gray-900 italic">{task.title}</h4>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {task.deadline}
                      </span>
                    )}
                    <span className="flex items-center gap-1 capitalize">
                      {task.type === 'exam' ? 'اختبار' : task.type === 'recitation' ? 'تسميع' : 'مهمة'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                <div className="text-right">
                  {task.status === 'completed' || task.status === 'graded' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">مكتمل</span>
                      {task.score && <span className="text-lg font-black text-gray-900">{task.score}</span>}
                    </div>
                  ) : task.status === 'in-progress' ? (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">جاري التنفيذ</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase">جديد</span>
                  )}
                </div>

                <button className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                  task.status === 'completed' || task.status === 'graded'
                  ? 'bg-gray-50 text-gray-400 cursor-default'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-100'
                }`}>
                  {task.status === 'completed' || task.status === 'graded' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      {role === 'student' ? 'بدء المهمة' : 'عرض التفاصيل'}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
