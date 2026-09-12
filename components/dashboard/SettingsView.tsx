'use client'

import React, { useState, useEffect } from 'react'
import { 
  Moon, 
  Sun, 
  Monitor, 
  Languages, 
  Volume2, 
  VolumeX, 
  Shield, 
  Lock, 
  LogOut,
  ChevronLeft,
  Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SettingsView() {
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    // Sync theme with system
    const root = window.document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const handleLogout = () => {
    localStorage.removeItem('thimar_auth_token')
    router.push('/login')
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 italic">الإعدادات</h2>
        <p className="text-gray-500 mt-2">تحكم في مظهر وتجربة التطبيق</p>
      </header>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-emerald-500" /> المظهر والوضع
          </h3>
        </div>
        <div className="p-2 grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'فاتح', icon: Sun },
            { id: 'dark', label: 'داكن', icon: Moon },
            { id: 'system', label: 'تلقائي', icon: Monitor },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                theme === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Languages className="w-5 h-5 text-blue-500" /> اللغة
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { id: 'ar', label: 'العربية', native: 'العربية' },
            { id: 'en', label: 'English', native: 'English' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setLang(item.id as any)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="text-right">
                <div className="font-bold text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-400">{item.native}</div>
              </div>
              {lang === item.id && <Check className="w-5 h-5 text-emerald-500" />}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-500" /> التنبيهات
          </h3>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-bold text-gray-900">صوت التنبيهات</div>
            <div className="text-xs text-gray-400">تشغيل المؤثرات الصوتية عند وصول تنبيه جديد</div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-14 h-8 rounded-full transition-colors relative ${soundEnabled ? 'bg-emerald-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${soundEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" /> الخصوصية والأمان
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-700">تغيير كلمة المرور</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <button className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-red-600" onClick={handleLogout}>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-bold">تسجيل الخروج</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  )
}
