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
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface Notification {
  id: number
  type: 'signup' | 'alert' | 'info' | 'success'
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/supabase/notifications')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 italic">التنبيهات</h2>
          <p className="text-gray-500 mt-2">إدارة التنبيهات الإدارية والنشاطات</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-emerald-600 font-bold text-sm hover:underline"
        >
          تحديد الكل كمقروء
        </button>
      </header>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p>جاري جلب التنبيهات...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center text-gray-400 italic">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
            لا توجد تنبيهات جديدة
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-6 flex items-start gap-6 hover:bg-gray-50 transition-colors relative ${!notif.isRead ? 'bg-emerald-50/20' : ''}`}
            >
              {!notif.isRead && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500" />
              )}
              
              <div className={`mt-1 p-3 rounded-2xl ${
                notif.type === 'signup' ? 'bg-blue-50 text-blue-600' :
                notif.type === 'alert' ? 'bg-red-50 text-red-600' :
                notif.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {notif.type === 'signup' ? <UserPlus className="w-6 h-6" /> :
                 notif.type === 'alert' ? <AlertTriangle className="w-6 h-6" /> :
                 notif.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                 <Info className="w-6 h-6" />}
              </div>

              <div className="flex-1 text-right">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-gray-900">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(notif.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
                <div className="mt-4 flex items-center gap-4">
                  <button className="text-xs font-bold text-emerald-600 hover:underline">عرض التفاصيل</button>
                  <button className="text-xs font-bold text-gray-400 hover:text-red-500">حذف</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
