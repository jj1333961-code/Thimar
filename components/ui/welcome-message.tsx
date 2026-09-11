'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, Brain, Calendar, Bell } from 'lucide-react'
import { generateWelcomeSummary } from '@/lib/ai-service'

interface WelcomeMessageProps {
  role: 'student' | 'teacher' | 'parent'
  userName: string
}

export function WelcomeMessage({ role, userName }: WelcomeMessageProps) {
  const [data, setData] = useState<{ greeting: string; summary: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const result = await generateWelcomeSummary(role, userName)
        setData(result)
      } catch (error) {
        console.error('Failed to generate welcome summary:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [role, userName])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-100 mb-8 overflow-hidden"
      >
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
            {loading ? (
              <Brain className="w-8 h-8 md:w-10 md:h-10 animate-pulse text-emerald-100" />
            ) : (
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-amber-300" />
            )}
          </div>

          <div className="flex-1 text-center md:text-right space-y-2">
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 w-48 bg-white/20 rounded-lg animate-pulse mx-auto md:mx-0" />
                <div className="h-4 w-full max-w-md bg-white/10 rounded-lg animate-pulse mx-auto md:mx-0" />
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  {data?.greeting}
                </h2>
                <div className="flex items-start md:items-center gap-2 justify-center md:justify-start">
                  <Brain className="w-4 h-4 text-emerald-200 mt-1 md:mt-0" />
                  <p className="text-emerald-50 text-sm md:text-base leading-relaxed opacity-90">
                    {data?.summary}
                  </p>
                </div>
              </>
            )}
          </div>

          {!loading && (
            <div className="flex gap-3 shrink-0">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                <Calendar className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={() => setVisible(false)}
          className="absolute top-4 left-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
