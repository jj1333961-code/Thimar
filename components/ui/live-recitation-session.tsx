'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  Sparkles, Brain, MessageSquare, AlertCircle,
  Volume2, Settings, Maximize2, User, UserPlus
} from 'lucide-react'

interface LiveRecitationSessionProps {
  mode: 'ai' | 'teacher'
  onClose: () => void
}

export function LiveRecitationSession({ mode, onClose }: LiveRecitationSessionProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [status, setStatus] = useState<'connecting' | 'active' | 'analyzing'>('connecting')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string>('')
  
  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => setStatus('active'), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Simulate AI Analysis
  useEffect(() => {
    if (status === 'active' && mode === 'ai') {
      const interval = setInterval(() => {
        const phrases = ['بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'الرَّحْمَٰنِ الرَّحِيمِ']
        setTranscription(prev => phrases[Math.floor(Math.random() * phrases.length)])
        
        if (Math.random() > 0.7) {
          setFeedback('تنبيه: انتبه لمد الياء في "الرَّحِيمِ"')
          setTimeout(() => setFeedback(null), 3000)
        }
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [status, mode])

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0A0A] flex flex-col items-center justify-center p-4 md:p-8" dir="rtl">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Main Viewport */}
      <div className="relative w-full max-w-6xl aspect-video bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col">
        
        {/* Remote View (AI or Teacher) */}
        <div className="flex-1 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            {status === 'connecting' ? (
              <motion.div 
                key="connecting"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center animate-bounce">
                  <Brain className="w-12 h-12 text-emerald-500" />
                </div>
                <p className="text-white font-bold text-xl animate-pulse">جاري الاتصال بـ {mode === 'ai' ? 'ثمار AI' : 'المعلم'}...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col items-center justify-center relative"
              >
                {/* AI Visualizer or Avatar */}
                {mode === 'ai' ? (
                  <div className="flex flex-col items-center gap-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                      <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/20 relative z-10 overflow-hidden">
                        <Brain className="w-24 h-24 text-white" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="absolute inset-0 border border-white/20 rounded-[3rem] animate-ping" style={{ animationDelay: `${i * 1}s` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-center space-y-4">
                      <h3 className="text-3xl font-black text-white italic">تحدث الآن، أنا أستمع...</h3>
                      <div className="flex items-center justify-center gap-1 h-8">
                        {[...Array(12)].map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ height: isMuted ? 4 : [8, 24, 12, 32, 8] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                            className="w-1.5 bg-emerald-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#222] to-[#111] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <User className="w-16 h-16 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">الشيخ أحمد محمود</h4>
                      <p className="text-emerald-500 font-bold mt-2 flex items-center gap-2 justify-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        بث مباشر
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback Overlay */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-amber-400 z-50"
                    >
                      <AlertCircle className="w-6 h-6" />
                      <p className="text-lg font-black">{feedback}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transcription */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
                   <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl text-center border border-white/5">
                      <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">التعرف التلقائي</p>
                      <p className="text-2xl font-bold text-emerald-400 italic" style={{ fontFamily: 'var(--font-amiri)' }}>{transcription || 'بانتظار التلاوة...'}</p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Local Preview (Self) */}
        <div className="absolute top-6 right-6 w-48 h-32 bg-[#2A2A2A] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-20">
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
             {isVideoOff ? <VideoOff className="w-8 h-8 text-white/20" /> : <User className="w-12 h-12 text-white/40" />}
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg">
             <div className="w-2 h-2 bg-emerald-500 rounded-full" />
             <span className="text-[10px] text-white font-bold uppercase">أنت</span>
          </div>
        </div>

        {/* Floating Side Tools */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 space-y-4 z-20">
           <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl">
             <MessageSquare className="w-6 h-6" />
           </button>
           <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl">
             <UserPlus className="w-6 h-6" />
           </button>
           <button className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-md transition-all shadow-xl">
             <Settings className="w-6 h-6" />
           </button>
        </div>

        {/* Footer Controls */}
        <div className="bg-[#111] p-8 flex items-center justify-center gap-8 border-t border-white/5">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-[#2A2A2A] text-white hover:bg-[#333]'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-[#2A2A2A] text-white hover:bg-[#333]'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button 
            onClick={onClose}
            className="w-24 h-16 bg-red-600 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
          >
            <PhoneOff className="w-8 h-8" />
          </button>

          <button className="w-16 h-16 bg-[#2A2A2A] text-white rounded-2xl flex items-center justify-center hover:bg-[#333] transition-all">
            <Volume2 className="w-6 h-6" />
          </button>
          
          <button className="w-16 h-16 bg-[#2A2A2A] text-white rounded-2xl flex items-center justify-center hover:bg-[#333] transition-all">
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>

      </div>

      {/* Mode Indicator Overlay */}
      <div className="mt-8 flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full backdrop-blur-md border border-white/10">
        <Sparkles className="w-4 h-4 text-emerald-400" />
        <span className="text-white/60 text-sm font-bold">نمط الجلسة:</span>
        <span className="text-emerald-400 font-black italic">{mode === 'ai' ? 'تصحيح تلاوة ذكي' : 'تسميع مباشر مع المعلم'}</span>
      </div>
    </div>
  )
}
