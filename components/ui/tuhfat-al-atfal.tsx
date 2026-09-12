'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, Sparkles, BookOpen } from 'lucide-react'

const TUHFAT_DATA = [
  { id: 1, title: 'المقدمة', verses: ['يَقُولُ رَاجِي رَحْمَةِ الْغَفُورِ ** دَوْماً سُلَيْمَانُ هُوَ الْجَمْزُورِي', 'الْحَمْدُ لِلَّهِ مُصَلِّياً عَلَى ** مُحَمَّدٍ وَآلِهِ وَمَنْ تَلَا'] },
  { id: 2, title: 'أحكام النون الساكنة والتنوين', verses: ['لِلنُّونِ إِنْ تَسْكُنْ وَلِلتَّنْوِينِ ** أَرْبَعُ أَحْكَامٍ فَخُذْ تَبْيِينِي', 'فَالأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ ** لِلْحَلْقِ سِتٌّ رُتِّبَتْ فَلْتَعْرِفِ'] },
  { id: 3, title: 'أحكام النون والميم المشددتين', verses: ['وَغُنَّ مِيماً ثُمَّ نُوناً شُدِّدَا ** وَسَمِّ كُلاً حَرْفَ غُنَّةٍ بَدَا'] },
  { id: 4, title: 'أحكام الميم الساكنة', verses: ['وَالْمِيمُ إِنْ تَسْكُنْ تَجِي قَبْلَ الْهِجَا ** لاَ أَلِفٍ لَيِّنَةٍ لِذِي الْحِجَا', 'أَحْكَامُهَا ثَلاَثَةٌ لِمَنْ ضَبَطْ ** إِخْفَاءٌ ادْغَامٌ وَإِظْهَارٌ فَقَطْ'] },
]

export function TuhfatAlAtfal() {
  const [activeSection, setActiveSection] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVerse, setCurrentVerse] = useState(0)
  const [playbackMode, setPlaybackMode] = useState<'single' | 'all'>('single')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => setIsPlaying(!isPlaying)

  const playSection = (index: number) => {
    setActiveSection(index)
    setCurrentVerse(0)
    setIsPlaying(true)
  }

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="p-8 bg-emerald-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black italic">تحفة الأطفال</h3>
            <p className="text-xs opacity-70 font-bold uppercase tracking-widest">متن الجمزوري في التجويد</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPlaybackMode(playbackMode === 'all' ? 'single' : 'all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${playbackMode === 'all' ? 'bg-white text-emerald-700' : 'bg-emerald-700/50 text-white'}`}
          >
            {playbackMode === 'all' ? 'تشغيل الكل' : 'تشغيل فقرة'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Sections */}
        <div className="w-1/3 border-l border-gray-100 bg-gray-50/50 overflow-y-auto">
          {TUHFAT_DATA.map((section, idx) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(idx)}
              className={`w-full text-right p-6 transition-all border-b border-gray-100 flex items-center gap-3 ${activeSection === idx ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-white'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${activeSection === idx ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                {idx + 1}
              </div>
              <span className="font-bold text-sm">{section.title}</span>
            </button>
          ))}
        </div>

        {/* Verses Content */}
        <div className="flex-1 p-12 flex flex-col">
          <div className="flex-1 space-y-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                <div className="text-center">
                  <h4 className="text-amber-600 font-black text-xl mb-8 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {TUHFAT_DATA[activeSection].title}
                  </h4>
                  <div className="space-y-12">
                    {TUHFAT_DATA[activeSection].verses.map((verse, vIdx) => (
                      <div 
                        key={vIdx} 
                        className={`text-3xl font-black leading-relaxed transition-all duration-500 ${currentVerse === vIdx && isPlaying ? 'text-emerald-600 scale-110' : 'text-gray-800 opacity-60'}`}
                        style={{ fontFamily: 'var(--font-amiri)' }}
                      >
                        {verse}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-12 p-8 bg-gray-50 rounded-[2.5rem] flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">يقرأ الآن</p>
                  <p className="font-bold text-gray-800">بصوت الشيخ الحصري</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Volume2 className="w-5 h-5" />
                <div className="w-24 h-1 bg-gray-200 rounded-full">
                  <div className="w-2/3 h-full bg-emerald-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
              <button className="p-4 text-gray-400 hover:text-emerald-600 transition-colors">
                <SkipBack className="w-8 h-8" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current" />}
              </button>
              <button className="p-4 text-gray-400 hover:text-emerald-600 transition-colors">
                <SkipForward className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
