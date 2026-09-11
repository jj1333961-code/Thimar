import { SignupForm } from '@/components/auth/signup-form'
import Image from 'next/image'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Decorative Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <Image 
          src="https://picsum.photos/seed/islamic-pattern/1920/1080" 
          alt="pattern" 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Floating Ornaments */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="hidden lg:block space-y-8 text-right">
          <div className="inline-block p-4 bg-emerald-50 rounded-2xl mb-4">
            <h2 className="text-emerald-700 text-4xl font-black">ثمار</h2>
          </div>
          <h3 className="text-5xl font-bold text-gray-900 leading-tight">
            رحلتك في <span className="text-emerald-600">حفظ كتاب الله</span> تبدأ من هنا
          </h3>
          <p className="text-xl text-gray-600 leading-relaxed">
            انضم إلى أكثر من ٥٠٠٠ طالب ومعلم في بيئة تعليمية متكاملة مدعومة بالذكاء الاصطناعي لضبط التلاوة ومتابعة التقدم.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
              <div className="text-3xl font-bold text-emerald-600 mb-1">١٠٠٪</div>
              <div className="text-gray-500 font-medium">متابعة دقيقة</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-50">
              <div className="text-3xl font-bold text-emerald-600 mb-1">AI</div>
              <div className="text-gray-500 font-medium">تصحيح ذكي</div>
            </div>
          </div>
        </div>

        <SignupForm />
      </div>
    </main>
  )
}
