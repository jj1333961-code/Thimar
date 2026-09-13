'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Headphones, 
  Award, 
  UserCheck, 
  Video, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Compass, 
  CheckCircle2, 
  ArrowDown, 
  ArrowUp,
  RotateCcw
} from 'lucide-react'

export const HOME_TOUR_STORAGE_KEY = 'thimar_home_tour_dismissed'

export function isHomeTourDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(HOME_TOUR_STORAGE_KEY) === 'true'
}

export function resetHomeTourPreference(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(HOME_TOUR_STORAGE_KEY)
  }
}

export interface HomeTourProps {
  isOpen: boolean
  onClose: () => void
  userRole?: 'student' | 'teacher' | 'parent' | 'admin'
}

interface TourStep {
  targetId: string
  title: string
  subtitle: string
  badge: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
}

export function HomeTour({ isOpen, onClose, userRole = 'student' }: HomeTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [neverShowAgain, setNeverShowAgain] = useState(false)

  const isStudent = userRole === 'student'
  const isAdmin = userRole === 'admin'
  const isParent = userRole === 'parent'

  // Define steps according to user role
  const steps: TourStep[] = [
    {
      targetId: 'home-welcome-card',
      title: 'الموجز الترحيبي والورد اليومي 🌿',
      subtitle: 'بطاقة الذكاء الاصطناعي الذكية',
      badge: 'الترحيب والموجز',
      description: isAdmin
        ? 'بطاقة مخصصة للإدارة تعرض ملخصاً سريعاً لأهم التنبيهات والأحداث النشطة اليوم، مع إمكانية تحديث الموجز الذكي فورياً.'
        : isParent
        ? 'تعرض لك كولي أمر ملخصاً يومياً عن حفظ ومتابعة أبنائك، مع نصائح تربوية وتحديث مباشر للأخبار.'
        : 'ترحب بك باسمك وتعرض وردك القرآني المقرر اليوم، مع إمكانية تحديث التحفيز اليومي بالذكاء الاصطناعي والاستماع للتوجيهات.',
      icon: Sparkles,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-950/40'
    },
    ...(isAdmin ? [
      {
        targetId: 'home-admin-header',
        title: 'رأسية لوحة التحكم والإشراف 👑',
        subtitle: 'بيانات المركز القيادي للمنصة',
        badge: 'لوحة التحكم',
        description: 'عنوان لوحة التحكم الإدارية، يتيح لك التأكد من صلاحياتك ومتابعة مركز إدارة منصة ثمار القرآنية.',
        icon: Compass,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40'
      },
      {
        targetId: 'home-pending-requests',
        title: 'طلبات الانضمام المعلقة 👥',
        subtitle: 'الموافقة على الطلاب والمعلمين الجدد',
        badge: 'طلبات الانضمام',
        description: 'تعرض جميع الراغبين في الانضمام للمنصة؛ يمكنك مراجعة الاسم والدور والموافقة بنقرة على زر الاعتماد الأخضر أو الرفض بنقرة على الزر الأحمر.',
        icon: UserCheck,
        color: 'text-teal-600',
        bg: 'bg-teal-50 dark:bg-teal-950/40'
      },
      {
        targetId: 'home-live-sessions',
        title: 'جلسات التسميع المباشرة 🎥',
        subtitle: 'غرف التسميع والاتصال الصوتي والمرئي',
        badge: 'جلسات مباشرة',
        description: 'تسمح لك بفتح غرفة اتصال حي وفوري مع أي طالب للتسميع الشفوي المباشر وتصحيح التلاوة وأحكام التجويد في الوقت الفعلي.',
        icon: Video,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950/40'
      }
    ] : isParent ? [
      {
        targetId: 'home-children-section',
        title: 'قائمة الأبناء وبطاقات الإنجاز 👨‍👩‍👧‍👦',
        subtitle: 'اختيار ومتابعة كل ابن على حدة',
        badge: 'الأبناء',
        description: 'تعرض جميع أبنائك المسجلين مع الجزء القرآني الحالي ومؤشر نسبة التقدم؛ اضغط على بطاقة أي ابن لتحديده واستعراض تفاصيل ورده ونشاطاته.',
        icon: BookOpen,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40'
      },
      {
        targetId: 'home-child-activities',
        title: 'سجل آخر النشاطات والتسميع 📈',
        subtitle: 'التحديثات الفورية لجلسات التسميع',
        badge: 'النشاطات',
        description: 'يعرض آخر جلسات التسميع التي أنجزها الابن المختار مع التاريخ والوقت والحالة المعتمدة من المعلم (مقبول / ممتاز / إنجاز جديد).',
        icon: TrendingUp,
        color: 'text-teal-600',
        bg: 'bg-teal-50 dark:bg-teal-950/40'
      },
      {
        targetId: 'home-parent-tip',
        title: 'نصيحة اليوم التربوية 💛',
        subtitle: 'إضاءات قرآنية وتربوية لدعم الأبناء',
        badge: 'نصيحة اليوم',
        description: 'توجيهات نفسية وتربوية قيّمة متجددة لمساعدتك في تشجيع أبنائك على مداومة الحفظ وترغيبهم في تلاوة كتاب الله.',
        icon: Heart,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/40'
      }
    ] : [
      {
        targetId: 'home-daily-task',
        title: 'مهمة اليوم ونسبة التقدم 📖',
        subtitle: 'السورة المقررة ومعدل إنجازك العام',
        badge: 'مهمة اليوم',
        description: 'تحدد لك بدقة السورة والآيات المطلوب حفظها أو مراجعتها اليوم، مع بطاقة تعرض نسبة تقدمك الإجمالية في الحفظ (مثلاً ٨٢٪).',
        icon: BookOpen,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40'
      },
      {
        targetId: 'home-reciters',
        title: 'الاستماع لكبار المقرئين 🎧',
        subtitle: 'مشايخ التلاوة المتقنون للاستماع والترديد',
        badge: 'المقرئون',
        description: 'استمع للتلاوة بصوت كبار القراء كالحصري، المنشاوي، وعبدالباسط لضبط التجويد ومخارج الحروف الصحيحة قبل بدء التسميع.',
        icon: Headphones,
        color: 'text-teal-600',
        bg: 'bg-teal-50 dark:bg-teal-950/40'
      },
      {
        targetId: 'home-achievements',
        title: 'لوحة الأوسمة وآخر الإنجازات 🏆',
        subtitle: 'مكافآت التميز ونقاط الاجتهاد',
        badge: 'الإنجازات',
        description: 'تُبرز أحدث الأوسمة القرآنية التي حققتها مثل "وسام الحافظ النشط" لتشجيعك الدائم على إكمال الختمة والتميز.',
        icon: Award,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/40'
      }
    ]),
    {
      targetId: 'floatingChatButton',
      title: 'المساعد الفوري ومراسلة الإدارة 💬',
      subtitle: 'الزر الدائري العائم - متاح في كل وقت',
      badge: 'المساعد الذكي',
      description: 'زر عائم يرافقك أينما كنت في التطبيق؛ اضغط عليه لسؤال المساعد الذكي عن أي حكم تجويدي أو سورة، أو إرسال استفسار مباشر لإدارة المنصة.',
      icon: MessageCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40'
    }
  ]

  // Update target rect on step change, resize or scroll
  const updateTargetRect = useCallback(() => {
    if (!isOpen) return
    const stepData = steps[currentStepIndex]
    if (!stepData?.targetId) {
      setTargetRect(null)
      return
    }

    const el = document.getElementById(stepData.targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
    } else {
      setTargetRect(null)
    }
  }, [isOpen, currentStepIndex, steps])

  useEffect(() => {
    if (isOpen) {
      updateTargetRect()
      const timer = setTimeout(updateTargetRect, 200)
      window.addEventListener('resize', updateTargetRect)
      window.addEventListener('scroll', updateTargetRect)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', updateTargetRect)
        window.removeEventListener('scroll', updateTargetRect)
      }
    }
  }, [isOpen, updateTargetRect])

  const handleFinish = (forever = false) => {
    if (forever || neverShowAgain) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(HOME_TOUR_STORAGE_KEY, 'true')
      }
    }
    onClose()
  }

  if (!isOpen) return null

  const currentStep = steps[currentStepIndex]
  const IconComponent = currentStep.icon
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  return (
    <div className="fixed inset-0 z-[160] pointer-events-none" dir="rtl">
      {/* Darkened backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={() => handleFinish(false)}
      />

      {/* Spotlight cutout / animated halo directly over the targeted element */}
      {targetRect && (
        <div
          className="absolute z-[161] rounded-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: `${Math.max(10, targetRect.top - 8)}px`,
            left: `${Math.max(10, targetRect.left - 8)}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 25px rgba(16, 185, 129, 0.85)',
            border: '2.5px solid #10b981',
          }}
        >
          {/* Animated ping border */}
          <div className="absolute -inset-2 rounded-3xl border-2 border-emerald-400 animate-ping opacity-60 pointer-events-none" />
          
          {/* Animated arrow pointing down or up */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white p-1.5 rounded-full shadow-lg animate-bounce pointer-events-none">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Floating Guided Card with Simplified Explanations */}
      <div className="absolute inset-x-4 bottom-24 md:bottom-28 z-[162] flex justify-center pointer-events-auto">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800/80 rounded-[2rem] p-5 md:p-6 shadow-2xl max-w-lg w-full text-right space-y-4 relative"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900">
                🧭 جولة الصفحة الرئيسية • {currentStepIndex + 1} من {steps.length}
              </span>
              <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
                {currentStep.badge}
              </span>
            </div>

            <button
              onClick={() => handleFinish(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="إغلاق وتخطي الجولة"
              aria-label="إغلاق وتخطي الجولة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${currentStep.bg} ${currentStep.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>

            <div className="space-y-1 flex-1">
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {currentStep.subtitle}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal pt-1">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-6 bg-emerald-600' : 'w-2 bg-gray-200 dark:bg-gray-700'
                }`}
                aria-label={`الانتقال إلى الخطوة ${i + 1}`}
              />
            ))}
          </div>

          {/* Checkbox for never show again */}
          <div className="flex items-center justify-center pt-1 text-[11px] text-gray-500">
            <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 select-none">
              <input 
                type="checkbox"
                checked={neverShowAgain}
                onChange={(e) => setNeverShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700"
              />
              <span>عدم إظهار جولة الصفحة الرئيسية تلقائياً مرة أخرى</span>
            </label>
          </div>

          {/* Footer Controls: Skip, Back, Next */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handleFinish(neverShowAgain)}
              className="px-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              تخطي الجولة
            </button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>السابق</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (isLastStep) {
                    handleFinish(neverShowAgain)
                  } else {
                    setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
              >
                <span>{isLastStep ? 'فهمت ذلك وإنهاء' : 'التالي'}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
