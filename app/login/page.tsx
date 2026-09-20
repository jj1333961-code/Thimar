import { LoginForm } from '@/components/auth/login-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Decorative Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <Image 
          src="https://picsum.photos/seed/quran-pattern/1920/1080" 
          alt="pattern" 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Floating Ornaments */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200 rotate-12">
            <h2 className="text-white text-4xl font-black -rotate-12">ثمار</h2>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">أهلاً بك في ثمار</h2>
          <p className="text-gray-500 mt-2 font-medium">سجل دخولك لمتابعة وردك اليومي</p>
        </div>

        <LoginForm />
        
        <footer className="mt-12 text-sm text-gray-400 font-medium">
          &copy; ٢٠٢٦ منصة ثمار التعليمية. جميع الحقوق محفوظة.
        </footer>
      </div>
    </main>
  )
}
