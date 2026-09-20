'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Brain, 
  Trophy, 
  MessageCircle, 
  ShieldCheck, 
  CheckSquare, 
  Home, 
  Bell, 
  BarChart2, 
  Settings, 
  ClipboardList, 
  CheckCircle2, 
  ArrowDown, 
  ArrowUp, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react'

export const WALKTHROUGH_STORAGE_KEY = 'thimar_walkthrough_dismissed_forever'
export const WALKTHROUGH_SEEN_KEY = 'thimar_new_user_welcomed'

export function isWalkthroughDismissedForever(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(WALKTHROUGH_STORAGE_KEY) === 'true'
}

export function resetWalkthroughPreference(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(WALKTHROUGH_STORAGE_KEY)
    localStorage.removeItem(WALKTHROUGH_SEEN_KEY)
  }
}

export interface WelcomeWalkthroughProps {
  onClose: () => void
  userRole?: 'student' | 'teacher' | 'parent' | 'admin'
  forceStartAtStep?: number
}

interface TourStep {
  targetId?: string // HTML ID of element to highlight
  title: string
  subtitle: string
  badge: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
  position?: string
}

export function WelcomeWalkthrough({ onClose, userRole = 'student', forceStartAtStep = 0 }: WelcomeWalkthroughProps) {
  // Step 0: Welcome and What is Thimar / How it works overview modal
  // Steps 1..N: Guided spotlight tour pointing to specific buttons and tabs
  const [currentStepIndex, setCurrentStepIndex] = useState(forceStartAtStep)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [neverShowAgain, setNeverShowAgain] = useState(false)
  const [mode, setMode] = useState<'welcome' | 'spotlight'>(forceStartAtStep === 0 ? 'welcome' : 'spotlight')

  // Define steps according to user role
  const isStudent = userRole === 'student'
  const isAdmin = userRole === 'admin'
  const isParent = userRole === 'parent'

  const spotlightSteps: TourStep[] = [
    {
      targetId: 'navTab-home',
      title: 'الصفحة الرئيسية 🏠',
      subtitle: 'مركز المتابعة اليومية وإنجازك السريع',
      badge: 'الرئيسية',
      description: isAdmin 
        ? 'صفحة القيادة والإشراف العام للمسؤول؛ تمنحك نظرة فورية على طلبات الانضمام المعلقة، الإحصائيات الحية، وأحدث الأحداث الإدارية دون تكرار وظائف الصفحات الأخرى.'
        : isParent
        ? 'واجهة ولي الأمر المركزية؛ تعرض ملخص تقدم الأبناء، الحلقات النشطة، والأنشطة القادمة بوضوح وسلاسة.'
        : 'واجهتك القرآنية اليومية؛ تعرض وردك المقرر، بطاقات الحلقات الحية، وتتبع إنجازك اليومي والرسالة الترحيبية الذكية.',
      icon: Home,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      position: 'top'
    },
    {
      targetId: 'navTab-messages',
      title: 'مركز الرسائل والمحادثات 💬',
      subtitle: 'قناة تواصل فورية وآمنة',
      badge: 'الرسائل',
      description: 'قسم مخصص للتراسل المباشر؛ يمكنك استقبال الرسائل، فتح المحادثات، التحدث مع المعلمين والإدارة، والرد السريع مع مؤشر للرسائل الجديدة وسجل كامل للمحادثات.',
      icon: MessageCircle,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      position: 'top'
    },
    ...(isAdmin ? [
      {
        targetId: 'navTab-notifications',
        title: 'التنبيهات الإدارية 🔔',
        subtitle: 'متابعة شاملة لجميع أحداث النظام (للمسؤول فقط)',
        badge: 'التنبيهات',
        description: 'خانة حصرية للمسؤول؛ يتم فيها تصنيف تنبيهات التسميع، نتائج الاختبارات، تسليم المهام، وطلبات الطلاب الجدد مع شارات العداد الحية وإمكانية تمييز المقروء فردياً أو كلياً.',
        icon: Bell,
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        position: 'top'
      }
    ] : [
      {
        targetId: 'navTab-tasks',
        title: 'مركز المهمات والتكليفات 📝',
        subtitle: 'كل ما هو مطلوب تنفيذه في مكان واحد',
        badge: 'المهمات',
        description: isParent
          ? 'تتيح لك متابعة مهام وتكليفات جميع أبنائك في شاشة موحدة، مع تمييز اسم كل ابن، وتصنيف المهام (تسميع، اختبارات، واجبات) وحالات تسليمها.'
          : 'مكانك الموحد لإنجاز التسميع، الاختبارات، والواجبات؛ مع معرفة المهام الجديدة وقيد التنفيذ والمكتملة، وتسجيل تلاوتك مباشرة دون الحاجة للتنقل بين شاشات متعددة.',
        icon: ClipboardList,
        color: 'text-indigo-700',
        bg: 'bg-indigo-50',
        position: 'top'
      }
    ]),
    {
      targetId: 'navTab-reports',
      title: 'منظومة التقارير والتقييم الشامل 📊',
      subtitle: 'تقييم حقيقي ومفصل للأداء والإتقان',
      badge: 'التقارير',
      description: isAdmin
        ? 'تتيح لك تصفح قائمة جميع الطلاب، واختيار أي طالب لاستعراض سجله الكامل ودرجاته، مع التقييم الفصلي الخماسي (النشاط، الاجتهاد، المذاكرة، الانتظام، والتقدم).'
        : isParent
        ? 'تعرض التقارير الشاملة لأبنائك المرتبطين بحسابك فقط، مع نتائج التسميع، درجات الاختبارات، وتفاصيل التقييم التربوي المعتمد.'
        : 'تقريرك الذاتي المحمي؛ يعرض درجات تسميعك، تسجيلاتك الصوتية، نتائج الاختبارات، ونسب إنجازك دون إمكانية اطلاع أي طالب آخر عليها.',
      icon: BarChart2,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      position: 'top'
    },
    {
      targetId: 'navTab-settings',
      title: 'إعدادات الحساب والتطبيق ⚙️',
      subtitle: 'تخصيص كامل للمظهر والخصوصية',
      badge: 'الإعدادات',
      description: 'تحكم في المظهر (الوضع الفاتح / الداكن / التلقائي)، لغة التطبيق (عربي / English)، أصوات التنبيهات، خيارات الخصوصية واستقبال الرسائل، وإعادة تشغيل هذه الجولة التعريفية.',
      icon: Settings,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      position: 'top'
    },
    {
      targetId: 'floatingChatButton',
      title: 'المساعد الذكي ومراسلة الإدارة 💬',
      subtitle: 'الزر الدائري العائم - رفيقك الدائم',
      badge: 'المساعد الفوري',
      description: 'هذا الزر الدائري في أسفل الشاشة يرافقك دائماً؛ اضغط عليه في أي وقت لسؤال مساعد ثمار الذكي، أو التبديل لتبويب "المسؤولين" لإرسال رسالة مباشرة لإدارة المنصة عبر واتساب والبريد.',
      icon: Sparkles,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      position: 'top'
    }
  ]

  // Update rect when target changes
  const updateTargetRect = useCallback(() => {
    if (mode !== 'spotlight') return
    const stepData = spotlightSteps[currentStepIndex]
    if (!stepData?.targetId) {
      setTargetRect(null)
      return
    }

    const el = document.getElementById(stepData.targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
    } else {
      setTargetRect(null)
    }
  }, [mode, currentStepIndex, spotlightSteps])

  useEffect(() => {
    updateTargetRect()
    window.addEventListener('resize', updateTargetRect)
    window.addEventListener('scroll', updateTargetRect)
    return () => {
      window.removeEventListener('resize', updateTargetRect)
      window.removeEventListener('scroll', updateTargetRect)
    }
  }, [updateTargetRect])

  const handleFinish = (forever = false) => {
    if (forever || neverShowAgain) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true')
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(WALKTHROUGH_SEEN_KEY, 'true')
    }
    onClose()
  }

  const startSpotlightTour = () => {
    setMode('spotlight')
    setCurrentStepIndex(0)
  }

  // --- RENDERING STEP 0: WELCOME & HOW IT WORKS MODAL ---
  if (mode === 'welcome') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.93, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-xl w-full overflow-hidden relative border border-emerald-100 dark:border-emerald-950 flex flex-col my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-800 p-6 md:p-8 text-white relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center font-black text-amber-300 text-xl border border-white/20 shadow-inner">
                  ث
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> مرحباً بك كعضو جديد
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    أهلاً بك في منصة ثِمار القرآنية
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => handleFinish(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-emerald-200 hover:text-white transition-colors shrink-0"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-emerald-100/90 text-xs md:text-sm mt-3 leading-relaxed font-normal">
              البيئة القرآنية الرقمية المتكاملة لتعليم كتاب الله وتجويده، ومتابعة الحلقات بأعلى معايير الإتقان والتفاعل الذكي.
            </p>
          </div>

          {/* Body: What is Thimar and How it Works */}
          <div className="p-6 md:p-8 space-y-6 max-h-[68vh] overflow-y-auto">
            {/* Section 1: What is Thimar */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 text-right">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm md:text-base flex items-center gap-2 mb-1.5">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>ما هو تطبيق ثمار؟</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                منصة ثمار هي نظام تعليمي قرآني متطور يربط بين الطالب، ولي الأمر، المعلم، والإدارة في بيئة واحدة متزامنة، مع دعم التحفيظ المنتظم والتقييم الصوتي والتقارير المعتمدة.
              </p>
            </div>

            {/* Section 2: How it Works (4 Pillars) */}
            <div className="space-y-3 text-right">
              <h3 className="font-black text-gray-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600" />
                <span>كيف يعمل التطبيق وماذا يقدم لك؟</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Pillar 1 */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-right space-y-1">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <Brain className="w-4 h-4" />
                    <span>المصحح الذكي والتسميع</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    تسجيل التلاوات بصوتك مع تحليل فوري لأحكام التجويد ومخارج الحروف بالذكاء الاصطناعي ومراجعة المشايخ.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-right space-y-1">
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                    <ClipboardList className="w-4 h-4" />
                    <span>المهام والاختبارات الدورية</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    تكليفات محددة للمراجعة والحفظ مع متابعة مواعيد التسليم ونظام دقيق لضمان النزاهة والإتقان.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-right space-y-1">
                  <div className="flex items-center gap-2 text-teal-600 font-bold text-xs">
                    <BarChart2 className="w-4 h-4" />
                    <span>التقارير والتقييم الشامل</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    سجل درجات حقيقي وتقييم فصلي لمعايير النشاط والاجتهاد والانتظام لمتابعة مستوى التقدم أولاً بأول.
                  </p>
                </div>

                {/* Pillar 4 */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-right space-y-1">
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                    <MessageCircle className="w-4 h-4" />
                    <span>التواصل المباشر والمساعد</span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    محادثات خاصة مع الإدارة والمعلمين، مع زر عائم للدردشة التفاعلية مع المساعد الذكي في أي وقت.
                  </p>
                </div>
              </div>
            </div>

            {/* Step Checkbox */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-500">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors select-none">
                <input 
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-700"
                />
                <span>عدم إظهار هذه الرسالة التعريفية مرة أخرى نهائياً</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleFinish(neverShowAgain)}
                className="w-full sm:w-auto px-5 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center"
              >
                تخطي والبدء مباشرة
              </button>

              <button
                onClick={startSpotlightTour}
                className="w-full sm:w-auto px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>بدء الجولة الإرشادية للصفحات والأزرار</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // --- RENDERING STEP 1..N: GUIDED SPOTLIGHT TOUR POINTING DIRECTLY TO UI ELEMENTS ---
  const currentStep = spotlightSteps[currentStepIndex]
  const IconComponent = currentStep.icon
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === spotlightSteps.length - 1

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none" dir="rtl">
      {/* Darkened backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={() => handleFinish(false)}
      />

      {/* Spotlight cutout / halo over the targeted button */}
      {targetRect && (
        <div
          className="absolute z-[151] rounded-2xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65), 0 0 25px rgba(16, 185, 129, 0.8)',
            border: '2px solid #10b981',
          }}
        >
          {/* Animated Pulsing Ring */}
          <div className="absolute -inset-1.5 rounded-2xl border-2 border-emerald-400 animate-ping opacity-75" />
          
          {/* Visual pointer / arrow pointing directly to the button */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-600 text-white p-1 rounded-full shadow-lg animate-bounce">
            <ArrowDown className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Floating Guided Card with arrow and detailed explanation */}
      <div className="absolute inset-x-4 bottom-24 md:bottom-28 z-[152] flex justify-center pointer-events-auto">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-5 md:p-6 shadow-2xl max-w-lg w-full text-right space-y-4 relative"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900">
                {currentStep.badge} • خطوة {currentStepIndex + 1} من {spotlightSteps.length}
              </span>
            </div>

            <button
              onClick={() => handleFinish(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="إغلاق الجولة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${currentStep.bg} ${currentStep.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 flex-1">
              <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">
                {currentStep.title}
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {currentStep.subtitle}
              </p>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {spotlightSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStepIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-6 bg-emerald-600' : 'w-2 bg-gray-200 dark:bg-gray-700'
                }`}
                aria-label={`الخطوة ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            {isFirstStep ? (
              <button
                onClick={() => setMode('welcome')}
                className="px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>المقدمة</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFinish(neverShowAgain)}
                className="px-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                تخطي
              </button>

              <button
                onClick={() => {
                  if (isLastStep) {
                    handleFinish(neverShowAgain)
                  } else {
                    setCurrentStepIndex(prev => Math.min(spotlightSteps.length - 1, prev + 1))
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs md:text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <span>{isLastStep ? 'إنهاء وبدء الاستخدام' : 'التالي'}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
