import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-2xl mb-4">
        ٤٠٤
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h1>
      <p className="text-gray-500 mb-6">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
      <Link
        href="/login"
        className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
      >
        العودة للرئيسية
      </Link>
    </main>
  )
}
