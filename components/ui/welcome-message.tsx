'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, Brain, Calendar, Bell, RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { generateWelcomeSummary, WelcomeBriefingData } from '@/lib/ai-service'

interface WelcomeMessageProps {
  role: 'admin' | 'teacher' | 'student' | 'parent'
  userName: string
  onActionClick?: () => void
}

export function WelcomeMessage({ role, userName, onActionClick }: WelcomeMessageProps) {
  const [data, setData] = useState<WelcomeBriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [visible, setVisible] = useState(true)
  const [minimized, setMinimized] = useState(false)

  const fetchSummary = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const result = await generateWelcomeSummary(role, userName)
      setData(result)
    } catch (error) {
      console.error('Failed to generate welcome summary:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [role, userName])

  const roleTitle = 
    role === 'admin' ? 'لوحة القيادة والإشراف العام' :
    role === 'teacher' ? 'متابعة الحلقات والطلاب' :
    role === 'parent' ? 'لوحة متابعة الأبناء' : 'رحلتك القرآنية اليومية';

  if (!visible) {
    return (
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => { setVisible(true); setMinimized(false); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold hover:bg-emerald-100 transition-all shadow-sm"
        >
          <Brain className="w-4 h-4 text-emerald-600" />
          <span>إظهار موجز ثمار الذكي لما حدث في غيابك</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        </button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-950/10 mb-8 overflow-hidden border border-emerald-500/20"
      >
        {/* Subtle Islamic Geometry Watermark */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-semibold text-emerald-100 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>موجز الذكاء الاصطناعي</span>
            </span>
            <span className="text-xs text-emerald-200/80 hidden sm:inline">• {roleTitle}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchSummary(true)}
              disabled={refreshing || loading}
              title="تحديث الموجز بالذكاء الاصطناعي"
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setMinimized(!minimized)}
              title={minimized ? 'توسيع' : 'طي'}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setVisible(false)}
              className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="إغلاق الموجز"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Briefing Content */}
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              {loading || refreshing ? (
                <Brain className="w-7 h-7 md:w-8 md:h-8 animate-pulse text-emerald-200" />
              ) : (
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-amber-300" />
              )}
            </div>

            <div className="flex-1 space-y-2 text-right">
              {loading ? (
                <div className="space-y-2.5">
                  <div className="h-5 w-48 bg-white/20 rounded-md animate-pulse" />
                  <div className="h-4 w-full max-w-xl bg-white/10 rounded-md animate-pulse" />
                  <div className="h-4 w-3/4 max-w-md bg-white/10 rounded-md animate-pulse" />
                </div>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    {data?.greeting}
                  </h3>
                  
                  {!minimized && (
                    <div className="mt-2 bg-black/15 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                      <div className="flex items-start gap-2.5">
                        <Brain className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-emerald-200 mb-1">
                            ما حدث في غيابك على المنصة:
                          </p>
                          <p className="text-sm md:text-base text-emerald-50 leading-relaxed font-normal">
                            {data?.summary}
                          </p>
                        </div>
                      </div>

                      {/* Key Indicators */}
                      {data?.keyPoints && data.keyPoints.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10">
                          {data.keyPoints.map((point, idx) => (
                            <div 
                              key={idx}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm ${
                                point.type === 'success' ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' :
                                point.type === 'warning' ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' :
                                'bg-teal-400/20 text-teal-200 border border-teal-400/30'
                              }`}
                            >
                              <span className="opacity-80">{point.label}:</span>
                              <span>{point.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {!loading && !minimized && data?.actionRequired && (
            <div className="mt-4 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-white/10">
              <div className="flex items-center gap-2 text-emerald-100">
                <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="font-semibold">الإجراء المقترح:</span>
                <span className="opacity-90">{data.actionRequired}</span>
              </div>

              {onActionClick && (
                <button
                  onClick={onActionClick}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl font-bold text-white transition-colors"
                >
                  <span>متابعة الآن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
