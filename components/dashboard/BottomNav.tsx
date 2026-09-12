'use client'

import React from 'react'
import { motion } from 'motion/react'
import { 
  Home, 
  MessageSquare, 
  Bell, 
  BarChart2, 
  Settings, 
  ClipboardList 
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export type UserRole = 'admin' | 'student' | 'parent'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: Home, roles: ['admin', 'student', 'parent'] },
  { id: 'messages', label: 'الرسائل', icon: MessageSquare, roles: ['admin', 'student', 'parent'] },
  { id: 'notifications', label: 'التنبيهات', icon: Bell, roles: ['admin'] },
  { id: 'tasks', label: 'المهمات', icon: ClipboardList, roles: ['student', 'parent'] },
  { id: 'reports', label: 'التقارير', icon: BarChart2, roles: ['admin', 'student', 'parent'] },
  { id: 'settings', label: 'الإعدادات', icon: Settings, roles: ['admin', 'student', 'parent'] },
]

interface BottomNavProps {
  role: UserRole
}

export function BottomNav({ role }: BottomNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'

  const filteredItems = navItems.filter(item => item.roles.includes(role))

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabId)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200 px-2 pb-safe-area-inset-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {filteredItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors"
            >
              <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-emerald-50/50' : ''}`} />
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-1 bg-emerald-50 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
