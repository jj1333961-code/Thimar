'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('thimar_role')
      const token = localStorage.getItem('thimar_auth_token')

      if (savedRole === 'admin' || token === 'admin_local_bypass_token') {
        router.replace('/admin')
      } else if (savedRole === 'parent' || token === 'demo_parent_token') {
        router.replace('/parent')
      } else {
        // Default to student preview directly so user sees the application instantly
        if (!token) {
          localStorage.setItem('thimar_auth_token', 'demo_student_token')
          localStorage.setItem('thimar_role', 'student')
        }
        router.replace('/student')
      }
    } catch {
      router.replace('/student')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-emerald-200/50">
        ث
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">منصة ثمار التعليمية</h2>
      <p className="text-sm text-gray-500 mb-4">جاري فتح الواجهة...</p>
      <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
    </div>
  )
}
