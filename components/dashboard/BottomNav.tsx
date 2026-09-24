'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  Home, 
  MessageSquare, 
  Bell, 
  BarChart2, 
  Settings, 
  ClipboardList,
  BookOpen,
  Music
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { t } from '@/lib/i18n'

export type UserRole = 'admin' | 'student' | 'parent'

interface NavItem {
  id: string
  labelKey: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { id: 'home', labelKey: 'الرئيسية', icon: Home, roles: ['admin', 'student', 'parent'] },
  { id: 'quran', labelKey: 'المصحف', icon: BookOpen, roles: ['student', 'parent'] },
  { id: 'tuhfa', labelKey: 'تحفة الأطفال', icon: Music, roles: ['student', 'parent'] },
  { id: 'messages', labelKey: 'الرسائل', icon: MessageSquare, roles: ['admin', 'student', 'parent'] },
  { id: 'notifications', labelKey: 'التنبيهات', icon: Bell, roles: ['admin'] },
  { id: 'tasks', labelKey: 'المهمات', icon: ClipboardList, roles: ['student', 'parent'] },
  { id: 'reports', labelKey: 'التقارير', icon: BarChart2, roles: ['admin', 'student', 'parent'] },
  { id: 'settings', labelKey: 'الإعدادات', icon: Settings, roles: ['admin', 'student', 'parent'] },
]

interface BottomNavProps {
  role: UserRole
  unreadNotificationsCount?: number
  unreadMessagesCount?: number
}

export function BottomNav({ role, unreadNotificationsCount = 0, unreadMessagesCount = 0 }: BottomNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get('tab') || 'home'
  const filteredItems = navItems.filter(item => item.roles.includes(role))
  const activeTab = filteredItems.some(item => item.id === requestedTab) ? requestedTab : 'home'

  const [unreadNotifs, setUnreadNotifs] = useState(unreadNotificationsCount)
  const [unreadMsgs, setUnreadMsgs] = useState(unreadMessagesCount)

  useEffect(() => {
    if (role !== 'admin') return

    let isMounted = true

    const fetchBadges = () => {
      if (typeof document !== 'undefined' && document.hidden) return

      // Fetch notifications
      fetch('/api/supabase/notifications')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (!isMounted || !data) return
          if (Array.isArray(data?.notifications)) {
            const unread = data.notifications.filter((n: any) => !n.isRead && !n.read).length
            setUnreadNotifs(prev => (prev !== unread ? unread : prev))
          }
        })
        .catch(() => {})

      // Fetch admin messages unread count
      const token = typeof window !== 'undefined' ? localStorage.getItem('thimar_auth_token') : null
      if (token) {
        fetch('/api/admin/messages/unread-count', {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (!isMounted || !data) return
            if (typeof data?.count === 'number') {
              setUnreadMsgs(prev => (prev !== data.count ? data.count : prev))
            }
          })
          .catch(() => {})
      }
    }

    fetchBadges()
    const timer = setInterval(fetchBadges, 30000)

    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [role])

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const isKeyboardActive = window.screen.height - window.innerHeight > 150
      setIsKeyboardVisible(isKeyboardActive)
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        setIsKeyboardVisible(true)
      }
    }

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        setTimeout(() => {
          const active = document.activeElement as HTMLElement
          if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && active.contentEditable !== 'true')) {
            setIsKeyboardVisible(false)
          }
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  const getBadge = (itemId: string) => {
    if (itemId === 'notifications' && unreadNotifs > 0) {
      return unreadNotifs > 99 ? '99+' : unreadNotifs
    }
    if (itemId === 'messages' && unreadMsgs > 0) {
      return unreadMsgs > 99 ? '99+' : unreadMsgs
    }
    return null
  }

  if (isKeyboardVisible) return null

  return (
    <nav 
      id="bottomNavigation"
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around h-16 md:h-18">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id
          const badge = getBadge(item.id)

          return (
            <button
              key={item.id}
              id={`navTab-${item.id}`}
              type="button"
              onClick={() => handleTabChange(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all group focus:outline-none"
              title={t(item.labelKey)}
            >
              <div className={`relative p-1.5 rounded-2xl transition-all ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 scale-105' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}>
                <item.icon className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />

                {/* Badge Indicator */}
                {badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-900 animate-pulse">
                    {badge}
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="activeBottomTab"
                    className="absolute -inset-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </div>

              <span className={`text-[10px] md:text-xs font-bold transition-colors truncate max-w-[64px] ${
                isActive 
                  ? 'text-emerald-700 dark:text-emerald-300 font-black' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {t(item.labelKey)}
              </span>

              {/* Active Dot indicator */}
              {isActive && (
                <div className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

