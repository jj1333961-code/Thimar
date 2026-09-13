'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  UserPlus, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Loader2,
  Trash2,
  Clock,
  ChevronRight,
  Filter,
  CheckCheck,
  Mic,
  Award,
  ClipboardList,
  ShieldAlert,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { requestJson } from '@/lib/api-client'

export interface AppNotification {
  id: string | number
  type: string
  category?: string
  title: string
  message: string
  read?: boolean
  isRead?: boolean
  created_at?: string
  createdAt?: string
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const data = await requestJson<any>('/api/supabase/notifications')
      const notifs: AppNotification[] = (data?.notifications || []).map((n: any) => ({
        ...n,
        read: n.read ?? n.isRead ?? false,
        created_at: n.created_at || n.createdAt || new Date().toISOString()
      }))
      setNotifications(notifs)
    } catch (err) {
      console.error('Fetch notifications error:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })))
    try {
      await requestJson('/api/supabase/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ markAllRead: true, userId: 'admin' })
      })
    } catch (e) {
      console.error(e)
    }
  }

  const markSingleAsRead = async (id: string | number) => {
    setActionLoadingId(id)
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, isRead: true } : n))
      await requestJson('/api/supabase/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ id: String(id) })
      })
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoadingId(null)
    }
  }

  const deleteNotification = (id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length

  const categories = [
    { id: 'all', label: 'جميع التنبيهات' },
    { id: 'recitation', label: 'تنبيهات التسميع' },
    { id: 'exam', label: 'تنبيهات الاختبارات' },
    { id: 'task', label: 'تنبيهات المهام' },
    { id: 'students', label: 'تنبيهات الطلاب' },
    { id: 'admin', label: 'تنبيهات إدارية' },
  ]

  const filteredNotifications = notifications.filter(n => {
    if (selectedCategory === 'all') return true
    if (selectedCategory === 'recitation') return n.type === 'recitation' || n.category === 'recitations'
    if (selectedCategory === 'exam') return n.type === 'exam' || n.category === 'exams'
    if (selectedCategory === 'task') return n.type === 'task' || n.category === 'tasks'
    if (selectedCategory === 'students') return n.type === 'signup' || n.category === 'students' || n.type === 'student'
    if (selectedCategory === 'admin') return n.type === 'admin' || n.category === 'administrative' || n.type === 'alert' || n.type === 'info'
    return true
  })

  const getNotificationBadge = (n: AppNotification) => {
    if (n.type === 'recitation' || n.category === 'recitations') {
      return {
        label: 'تسميع قرآني',
        icon: Mic,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-100'
      }
    }
    if (n.type === 'exam' || n.category === 'exams') {
      return {
        label: 'اختبار تجريبي',
        icon: Award,
        bg: 'bg-amber-50 text-amber-700 border-amber-100',
        iconColor: 'text-amber-600',
        iconBg: 'bg-amber-100'
      }
    }
    if (n.type === 'task' || n.category === 'tasks') {
      return {
        label: 'مهمة وتكليف',
        icon: ClipboardList,
        bg: 'bg-blue-50 text-blue-700 border-blue-100',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100'
      }
    }
    if (n.type === 'signup' || n.category === 'students') {
      return {
        label: 'طالب جديد',
        icon: UserPlus,
        bg: 'bg-purple-50 text-purple-700 border-purple-100',
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-100'
      }
    }
    return {
      label: 'تنبيه إداري',
      icon: Info,
      bg: 'bg-teal-50 text-teal-700 border-teal-100',
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-100'
    }
  }

  const formatNotificationTime = (dateStr?: string) => {
    if (!dateStr) return 'منذ قليل'
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'منذ قليل'
    }
  }

  return (
    <div className="space-y-6 pb-24" dir="rtl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-right">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 italic">التنبيهات الإدارية</h2>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                {unreadCount} جديد
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">متابعة شاملة لجميع أحداث وتنبيهات الطلاب، التسميع، الاختبارات والمهام</p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-emerald-700 hover:bg-emerald-50 rounded-2xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تحديد الكل كمقروء</span>
          </button>
        )}
      </header>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-emerald-600" />
            <p className="text-xs font-bold">جاري تحديث التنبيهات...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center text-gray-400 space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <Bell className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-gray-700 text-base">لا توجد تنبيهات في هذا القسم</h4>
            <p className="text-xs text-gray-400">سيتم إشعارك فور وصول أي أنشطة أو أحداث جديدة</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getNotificationBadge(notif)
            const isUnread = !notif.read && !notif.isRead
            const IconComponent = badge.icon

            return (
              <div 
                key={notif.id} 
                className={`p-5 sm:p-6 flex items-start gap-4 sm:gap-6 hover:bg-gray-50/80 transition-colors relative ${
                  isUnread ? 'bg-emerald-50/25' : ''
                }`}
              >
                {/* Visual indicator bar on the right */}
                {isUnread && (
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l" />
                )}
                
                {/* Icon box */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${badge.iconBg} ${badge.iconColor}`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 text-right space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                        {notif.title}
                      </h4>
                    </div>

                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatNotificationTime(notif.created_at || notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
                    {notif.message}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs">
                    {isUnread && (
                      <button 
                        onClick={() => markSingleAsRead(notif.id)}
                        disabled={actionLoadingId === notif.id}
                        className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        {actionLoadingId === notif.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5" />
                        )}
                        <span>تحديد كمقروء</span>
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
