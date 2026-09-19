'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  Shield, 
  UserCheck, 
  LogOut, 
  RefreshCw,
  HelpCircle,
  Check
} from 'lucide-react'

interface RoleNavHeaderProps {
  currentRole: 'admin' | 'student' | 'parent'
  userName?: string
  onRefresh?: () => void
  onStartTour?: () => void
  loading?: boolean
}

export function RoleNavHeader({
  currentRole,
  userName,
  onRefresh,
  onStartTour,
  loading = false,
}: RoleNavHeaderProps) {
  const router = useRouter()

  const roles = [
    {
      id: 'student',
      label: 'الطالب',
      icon: Sparkles,
      path: '/student',
      color: 'emerald',
      activeClass: 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20',
      inactiveClass: 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
    },
    {
      id: 'parent',
      label: 'ولي الأمر',
      icon: UserCheck,
      path: '/parent',
      color: 'amber',
      activeClass: 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/20',
      inactiveClass: 'text-gray-600 hover:text-amber-700 hover:bg-amber-50'
    },
    {
      id: 'admin',
      label: 'المسؤول',
      icon: Shield,
      path: '/admin',
      color: 'gray',
      activeClass: 'bg-gray-900 text-white shadow-sm ring-2 ring-gray-900/20',
      inactiveClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    },
  ]

  const handleRoleSwitch = (path: string, roleId: string) => {
    if (roleId === 'admin') {
      localStorage.setItem('thimar_auth_token', 'admin_local_bypass_token')
      localStorage.setItem('thimar_role', 'admin')
    } else if (roleId === 'parent') {
      localStorage.setItem('thimar_auth_token', 'demo_parent_token')
      localStorage.setItem('thimar_role', 'parent')
    } else {
      localStorage.setItem('thimar_auth_token', 'demo_student_token')
      localStorage.setItem('thimar_role', 'student')
    }
    router.push(path)
  }

  const handleLogout = () => {
    localStorage.removeItem('thimar_auth_token')
    localStorage.removeItem('thimar_role')
    router.push('/login')
  }

  const roleTitle = 
    currentRole === 'admin' ? 'ثمار المسؤول' :
    currentRole === 'parent' ? 'ثمار ولي الأمر' : 'ثمار الطالب'

  const userInitial = 
    currentRole === 'admin' ? 'م' :
    currentRole === 'parent' ? 'و' : 'ي'

  const defaultDisplayName =
    userName || (
      currentRole === 'admin' ? 'المسؤول العام' :
      currentRole === 'parent' ? 'أبو ياسين' : 'ياسين عمر'
    )

  return (
    <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 px-3 md:px-6 py-3 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4">
        
        {/* Brand & Active Role Title */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xs">
              ث
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                {roleTitle}
              </h1>
              <p className="text-[10px] text-gray-400 font-medium">منصة القرآن والتعليم</p>
            </div>
          </div>

          {/* Quick Tour & Refresh on Mobile */}
          <div className="flex items-center gap-1.5 sm:hidden">
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-50"
                title="تحديث البيانات"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {onStartTour && (
              <button
                onClick={onStartTour}
                className="p-2 text-amber-500 hover:text-amber-600 rounded-lg hover:bg-amber-50"
                title="دليل الواجهة"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Live Role Switcher (التبديل بين الأدوار للمعاينة الفورية) */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-inner max-w-full overflow-x-auto">
          <span className="hidden lg:inline-block text-[11px] font-bold text-gray-400 px-2 select-none">
            معاينة الدور:
          </span>
          {roles.map((r) => {
            const isActive = currentRole === r.id
            const Icon = r.icon
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleSwitch(r.path, r.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  isActive ? r.activeClass : r.inactiveClass
                }`}
                title={`التبديل إلى واجهة ${r.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
                {isActive && <Check className="w-3 h-3 opacity-90 mr-0.5" />}
              </button>
            )
          })}
        </div>

        {/* Left (RTL): User profile, Refresh, Tour & Logout */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3">
          {onStartTour && (
            <button
              type="button"
              onClick={onStartTour}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl text-xs font-bold border border-amber-200/70 transition-colors"
              title="عرض جولة إرشادية في عناصر الشاشة"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>دليل المنصة</span>
            </button>
          )}

          {onRefresh && (
            <button 
              type="button"
              onClick={onRefresh}
              className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all border border-gray-100 dark:border-gray-700"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* User badge */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 py-1 px-2.5 rounded-full border border-gray-100 dark:border-gray-700">
            <div className="w-7 h-7 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 rounded-full flex items-center justify-center font-black text-xs">
              {userInitial}
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
              {defaultDisplayName}
            </span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
            title="تسجيل الخروج والعودة لشاشة الدخول"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </nav>
  )
}
