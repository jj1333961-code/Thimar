import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center font-black text-3xl mb-4 border border-emerald-500/20">
        ٤٠٤
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">الصفحة غير موجودة</h1>
      <p className="text-muted-foreground mb-6 max-w-md">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
      <Link
        href="/login"
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
      >
        العودة لتسجيل الدخول
      </Link>
    </main>
  )
}
