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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center font-bold text-2xl mb-4 border border-red-500/20">
        !
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">حدث خطأ غير متوقع</h1>
      <p className="text-muted-foreground mb-6">نعتذر عن هذا الخطأ، يمكنك محاولة إعادة التحميل.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
        >
          إعادة المحاولة
        </button>
        <Link
          href="/login"
          className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors"
        >
          صفحة الدخول
        </Link>
      </div>
    </main>
  )
}
