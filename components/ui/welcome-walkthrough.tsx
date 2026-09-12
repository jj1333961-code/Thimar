'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, ChevronRight, ChevronLeft, BookOpen, Brain, Trophy, Calendar, MessageCircle, ShieldCheck, CheckSquare, EyeOff } from 'lucide-react'

export const WALKTHROUGH_STORAGE_KEY = 'thimar_walkthrough_dismissed_forever'

export function isWalkthroughDismissedForever(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(WALKTHROUGH_STORAGE_KEY) === 'true'
}

export function resetWalkthroughPreference(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WALKTHROUGH_STORAGE_KEY)
  }
}

interface WelcomeWalkthroughProps {
  onClose: () => void
  userRole?: 'student' | 'teacher' | 'parent' | 'admin'
}

export function WelcomeWalkthrough({ onClose, userRole = 'student' }: WelcomeWalkthroughProps) {
  const [step, setStep] = useState(0)
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  const steps = [
    {
      title: 'مرحباً بك في ثمار',
      subtitle: 'المنصة القرآنية الذكية الرائدة',
      description: 'ثمار هي بيئتك القرآنية المتكاملة لحفظ كتاب الله، وإتقان أحكام التجويد، والتواصل الحي والمباشر بين الطالب والمعلم وولي الأمر والإدارة.',
      icon: Sparkles,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      badge: 'البداية المباركة'
    },
    {
      title: 'الورد اليومي والمصحف الشريف',
      subtitle: 'حفظ منظم ومصحف رقمي تفاعلي',
      description: 'تصفح صفحات القرآن الكريم برسم عثماني أصيل، واستمع لتلاوات أئمة الحرم وقراء العالم الإسلامي، وتابع وردك اليومي المكلف به من معلمك أولاً بأول.',
      icon: BookOpen,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      badge: 'القرآن الكريم'
    },
    {
      title: 'المصحح الذكي وجلسات التسميع',
      subtitle: 'ذكاء اصطناعي متخصص في التجويد',
      description: 'سجّل تلاوتك ليقوم الذكاء الاصطناعي بتحليل مخارج الحروف وأحكام النون والتنوين والمدود مع تنبيهات فورية، قبل اعتماد التقييم النهائي من شيخك.',
      icon: Brain,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      badge: 'الذكاء الاصطناعي'
    },
    {
      title: 'الاختبارات ونظام الأمان والنزاهة',
      subtitle: 'مراقبة تقنية ذكية وحماية النزاهة',
      description: 'نظام متقدم لمكافحة الغش والتحقق الصوتي أثناء التسميع والاختبارات التحريرية، لضمان أعلى معايير الجودة والإتقان في إجازة الحفاظ.',
      icon: ShieldCheck,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      badge: 'النزاهة والإتقان'
    },
    {
      title: 'التواصل المباشر والمساعد الفوري',
      subtitle: 'دائماً معك خطوة بخطوة',
      description: 'يمكنك في أي وقت استخدام الزر الدائري في أسفل الشاشة للتحدث مع مساعد ثمار الذكي، أو التواصل الفوري مع الإدارة والمعلمين عبر واتساب وجوجل.',
      icon: MessageCircle,
      color: 'text-emerald-800',
      bg: 'bg-emerald-100/60',
      badge: 'الدعم والمراسلة'
    }
  ]

  const handleFinish = (forever = false) => {
    if (forever || neverShowAgain) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true')
      }
    }
    onClose()
  }

  const currentStep = steps[step]
  const Icon = currentStep.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden relative border border-emerald-100 flex flex-col"
      >
        {/* Ornate Header */}
        <div className="bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center font-black text-amber-300">
                ث
              </span>
              <span className="font-bold text-sm tracking-wide text-emerald-100">
                دليل منصة ثِمار للمستخدم الجديد
              </span>
            </div>
            <button 
              onClick={() => handleFinish(false)}
              className="p-1.5 hover:bg-white/10 rounded-xl text-emerald-200 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 text-center space-y-6 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4"
            >
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {currentStep.badge}
              </span>

              <div className={`p-5 rounded-3xl ${currentStep.bg} ${currentStep.color} shadow-inner`}>
                <Icon className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-gray-900">
                  {currentStep.title}
                </h3>
                <p className="text-xs font-bold text-emerald-600">
                  {currentStep.subtitle}
                </p>
              </div>

              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-md mx-auto font-normal">
                {currentStep.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-8 bg-emerald-600' : 'w-2 bg-gray-200 hover:bg-gray-300'
                }`}
                aria-label={`الانتقال للخطوة ${i + 1}`}
              />
            ))}
          </div>

          {/* Persistent "Never Show Again" Option */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800 transition-colors select-none">
              <input 
                type="checkbox"
                checked={neverShowAgain}
                onChange={(e) => setNeverShowAgain(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <span>عدم إظهار هذه الجولة التعريفية مرة أخرى نهائياً (إلى الأبد)</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-3 border border-gray-200 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-1.5"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(step + 1)
                } else {
                  handleFinish(neverShowAgain)
                }
              }}
              className="flex-1 max-w-[200px] py-3 px-6 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mr-auto"
            >
              <span>{step === steps.length - 1 ? 'ابدأ الاستخدام الآن' : 'التالي'}</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Skip Forever Link */}
          <div className="pt-1 flex items-center justify-center gap-4 text-xs font-bold text-gray-400">
            <button 
              onClick={() => handleFinish(false)}
              className="hover:text-emerald-700 transition-colors"
            >
              تخطي هذه المرة
            </button>
            <span>•</span>
            <button 
              onClick={() => handleFinish(true)}
              className="hover:text-red-600 transition-colors text-[11px]"
            >
              تخطي وعدم الإظهار نهائياً
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
