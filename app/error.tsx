'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-bold text-2xl mb-4">
        !
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ غير متوقع</h1>
      <p className="text-gray-500 mb-6">نعتذر عن هذا الخطأ، يمكنك محاولة إعادة التحميل.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/login"
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          صفحة الدخول
        </Link>
      </div>
    </main>
  )
}
