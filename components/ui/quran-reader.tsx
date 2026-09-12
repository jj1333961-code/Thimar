'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Play, Pause, ChevronLeft, ChevronRight, 
  Settings, Search, Headphones, BookOpen,
  Volume2, Download, Share2, Sparkles
} from 'lucide-react'

const SHEIKHS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.abdulbasit', name: 'عبدالباسط عبدالصمد' }
]

const SURAHS = [
  { id: 1, name: 'الفاتحة', pages: '1-1' },
  { id: 2, name: 'البقرة', pages: '2-49' },
  { id: 24, name: 'النور', pages: '350-359' },
  { id: 36, name: 'يس', pages: '440-445' }
]

export function QuranReader() {
  const [selectedSurah, setSelectedSurah] = useState(24)
  const [selectedSheikh, setSelectedSheikh] = useState(SHEIKHS[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState<'text' | 'image'>('text')
  const [fontSize, setFontSize] = useState(40)

  return (
    <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full" dir="rtl">
      {/* Reader Header */}
      <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between bg-emerald-50/30 gap-4">
        <div className="flex items-center gap-4">
          <select 
            value={selectedSurah}
            onChange={(e) => setSelectedSurah(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SURAHS.map(s => <option key={s.id} value={s.id}>سورة {s.name}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-100"><ChevronLeft className="w-5 h-5 text-emerald-600 rotate-180" /></button>
            <span className="font-bold text-emerald-800">صفحة ٣٥٠</span>
            <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-100"><ChevronLeft className="w-5 h-5 text-emerald-600" /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
             <Headphones className="w-4 h-4 text-gray-400" />
             <select 
               value={selectedSheikh}
               onChange={(e) => setSelectedSheikh(e.target.value)}
               className="bg-transparent font-bold text-sm text-gray-600 outline-none"
             >
               {SHEIKHS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-3 rounded-xl shadow-lg transition-all ${isPlaying ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          </button>
          <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400"><Settings className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-12 overflow-y-auto bg-[#FDFBF7] relative">
        <div className="max-w-3xl mx-auto space-y-16">
          {/* Bismillah */}
          <div className="text-center">
            <div className="inline-block p-4 bg-emerald-50 rounded-2xl mb-8 border border-emerald-100">
               <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-5xl font-black text-gray-800" style={{ fontFamily: 'var(--font-amiri)', fontSize: `${fontSize}px` }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
          </div>

          {/* Ayahs */}
          <div className="text-center space-y-12">
            <div 
              className="text-gray-800 leading-[5rem] transition-all duration-500"
              style={{ fontFamily: 'var(--font-amiri)', fontSize: `${fontSize}px` }}
            >
              سُورَةٌ أَنزَلْنَاهَا وَفَرَضْنَاهَا وَأَنزَلْنَا فِيهَا آيَاتٍ بَيِّنَاتٍ لَّعَلَّكُمْ تَذَكَّرُونَ <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-emerald-200 text-xl font-bold text-emerald-600 mx-2">١</span>
              الزَّانِيَةُ وَالزَّانِي فَاجْلِدُوا كُلَّ وَاحِدٍ مِّنْهُمَا مِائَةَ جَلْدَةٍ ۖ وَلَا تَأْخُذْكُم بِهِمَا رَأْفَةٌ فِي دِينِ اللَّهِ إِن كُنتُمْ تُؤْمِنُونَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ ۖ وَلْيَشْهَدْ عَذَابَهُمَا طَائِفَةٌ مِّنَ الْمُؤْمِنِينَ <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-emerald-200 text-xl font-bold text-emerald-600 mx-2">٢</span>
            </div>
          </div>
        </div>

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-4">
           <button 
             onClick={() => setFontSize(prev => Math.min(60, prev + 4))}
             className="w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-600 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-all"
           >
             +A
           </button>
           <button 
             onClick={() => setFontSize(prev => Math.max(20, prev - 4))}
             className="w-12 h-12 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-600 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-all"
           >
             -A
           </button>
        </div>
      </div>

      {/* Reader Footer Info */}
      <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between px-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
         <div className="flex items-center gap-6">
           <span>الحزب: ٤٨</span>
           <span>الجزء: ٢٤</span>
           <span className="text-emerald-600 flex items-center gap-1">
             <Sparkles className="w-3 h-3" />
             تفسير الآية متاح
           </span>
         </div>
         <div className="flex items-center gap-4">
           <button className="hover:text-emerald-600 transition-colors"><Share2 className="w-4 h-4" /></button>
           <button className="hover:text-emerald-600 transition-colors"><Download className="w-4 h-4" /></button>
         </div>
      </div>
    </div>
  )
}
