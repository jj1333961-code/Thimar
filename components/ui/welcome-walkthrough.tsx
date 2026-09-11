'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, ChevronRight, Book, Brain, Trophy, Calendar } from 'lucide-react'

interface WelcomeWalkthroughProps {
  onClose: () => void
}

export function WelcomeWalkthrough({ onClose }: WelcomeWalkthroughProps) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'مرحباً بك في ثمار',
      description: 'هذه جولتك السريعة للتعرف على مميزات المنصة القرآنية الذكية.',
      icon: Sparkles,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'الورد اليومي',
      description: 'هنا تجد مهامك اليومية التي كلفك بها المعلم من حفظ ومراجعة.',
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'المصحف الشريف',
      description: 'اقرأ القرآن الكريم واستمع لأشهر القراء بلمسة واحدة.',
      icon: Book,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'المصحح الذكي',
      description: 'استخدم الذكاء الاصطناعي لتصحيح تلاوتك وتجويدك فوراً.',
      icon: Brain,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'إنجازاتك',
      description: 'تابع تطورك واحصل على أوسمة ونقاط عند إتمام مهامك.',
      icon: Trophy,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-12 text-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-6"
            >
              {(() => {
                const Icon = steps[step].icon
                return (
                  <div className={`p-6 rounded-[2rem] ${steps[step].bg} ${steps[step].color}`}>
                    <Icon className="w-16 h-16" />
                  </div>
                )
              })()}
              <h2 className="text-3xl font-black text-gray-900 italic">{steps[step].title}</h2>
              <p className="text-lg text-gray-500 leading-relaxed font-medium">
                {steps[step].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-8 border-t border-gray-100">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-emerald-600' : 'w-2 bg-gray-200'}`} 
                />
              ))}
            </div>
            <button
              onClick={() => {
                if (step < steps.length - 1) setStep(step + 1)
                else onClose()
              }}
              className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              {step === steps.length - 1 ? 'ابدأ رحلتك' : 'التالي'}
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <button 
            onClick={onClose}
            className="text-gray-400 font-bold hover:text-emerald-600 text-sm"
          >
            تخطي الجولة التعريفية
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
