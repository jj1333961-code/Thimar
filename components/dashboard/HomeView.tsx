'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Brain, 
  X, 
  UserCheck, 
  Bell, 
  MessageSquare, 
  Video, 
  Play, 
  Clock, 
  CheckCircle2, 
  Headphones, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react'
import { WelcomeMessage } from '@/components/ui/welcome-message'
import { t } from '@/lib/i18n'

// Admin Home View
export function AdminHome({ requests, notifications, loading, handleAction, setLiveSessionMode }: any) {
  return (
    <div className="space-y-8 pb-24">
      <WelcomeMessage role="admin" userName="المسؤول العام" />

      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900 italic">{t('لوحة التحكم')}</h2>
          <p className="text-gray-500 mt-2">{t('مرحباً بك مجدداً في الإشراف العام لمنصة ثمار')}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> {t('طلبات الانضمام المعلقة')}
            </h3>
            {requests.length > 0 && <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full">{requests.length}</span>}
          </div>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-gray-400 italic text-center py-10">{t('لا توجد طلبات حالياً')}</p>
            ) : (
              requests.slice(0, 3).map((req: any) => (
                <div key={req.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3 text-right">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">{req.name[0]}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{req.name}</div>
                      <div className="text-[10px] text-gray-400">{req.role === 'student' ? t('طالب') : t('معلم')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleAction(req.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                    <button onClick={() => handleAction(req.id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><UserCheck className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" /> {t('جلسات مباشرة')}
            </h3>
          </div>
          <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center space-y-4">
            <Video className="w-12 h-12 text-gray-200 mx-auto" />
            <p className="text-sm text-gray-500 italic">{t('ابدأ جلسة تسميع مباشرة مع أحد الطلاب الآن')}</p>
            <button 
              onClick={() => setLiveSessionMode('teacher')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-100"
            >
              {t('فتح غرفة اتصال')}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

// Student Home View
export function StudentHome() {
  return (
    <div className="space-y-8 pb-24 text-right">
      <WelcomeMessage role="student" userName="ياسين عمر" />
      
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-4 order-2 md:order-1">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('التقدم')}</div>
              <div className="text-lg font-black text-gray-900">٨٢٪</div>
            </div>
          </div>
          <div className="space-y-3 text-center md:text-right order-1 md:order-2">
            <h2 className="text-3xl font-black text-gray-900 italic bg-gray-900 text-white px-4 py-1 rounded-xl inline-block">{t('مهمة اليوم')}</h2>
            <p className="text-lg text-gray-500 font-medium italic">{t('سورة')} <span className="text-emerald-600">{t('النور')}</span> • {t('من الآية')} ١ {t('إلى الآية')} ٢٠</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3 text-gray-800 italic justify-end">
             {t('استمع للمقرئين')} <Headphones className="text-emerald-500" />
          </h3>
          <div className="space-y-3">
            {['الحصري', 'المنشاوي', 'عبدالباسط'].map((qari) => (
              <div key={qari} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 transition-colors group cursor-pointer">
                <Play className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                <span className="font-bold text-gray-700 group-hover:text-emerald-700 italic">{t('الشيخ')} {t(qari)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-3 text-gray-800 italic justify-end">
            {t('آخر الإنجازات')} <Award className="text-amber-500" />
          </h3>
          <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 justify-end">
            <div className="text-right">
              <div className="font-bold text-amber-900 text-sm">{t('وسام الحافظ النشط')}</div>
              <div className="text-[10px] text-amber-600">{t('منذ يومين')}</div>
            </div>
            <Award className="w-10 h-10 text-amber-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Parent Home View
export function ParentHome({ childrenList, selectedChild, setSelectedChild }: any) {
  return (
    <div className="space-y-12 pb-24 text-right">
      <WelcomeMessage role="parent" userName="أبا عمر" />
      
      <section>
        <div className="flex items-center justify-between mb-8">
          <button className="text-emerald-600 font-bold hover:underline">{t('إضافة ابن جديد +')}</button>
          <h2 className="text-3xl font-black text-gray-900 italic">{t('أبنائي')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {childrenList.map((child: any, i: number) => (
            <button
              key={i}
              onClick={() => setSelectedChild(i)}
              className={`p-8 rounded-[3rem] text-right transition-all group relative overflow-hidden ${
                selectedChild === i 
                ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-105' 
                : 'bg-white border border-gray-100 text-gray-500 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4 mb-4 justify-end">
                <div className="text-right">
                  <h4 className="text-xl font-black italic">{child.name}</h4>
                  <p className={`text-sm ${selectedChild === i ? 'text-white/70' : 'text-gray-400'}`}>{t(child.level)}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${selectedChild === i ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                  {child.name[0]}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                  <span>{child.progress}٪</span>
                  <span>{t('التقدم')}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${selectedChild === i ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <div className={`h-full rounded-full ${selectedChild === i ? 'bg-white' : 'bg-emerald-500'}`} style={{ width: `${child.progress}%` }} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-gray-900 italic flex items-center gap-3 justify-end">
              {t('آخر نشاطات')} {childrenList[selectedChild].name} <TrendingUp className="text-emerald-500" />
            </h3>
            <div className="space-y-4">
              {[
                { action: 'تم تسميع سورة النور (١-٢٠)', date: 'اليوم، ١٠:٣٠ ص', status: 'مقبول' },
                { action: 'حصل على وسام "الحافظ النشط"', date: 'أمس، ٤:٠٠ م', status: 'إنجاز' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-gray-100">
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">{t(log.status)}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-800 italic">{t(log.action)}</p>
                      <p className="text-xs text-gray-400">{t(log.date)}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-amber-500 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <Heart className="absolute -bottom-4 -left-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-bold mb-2 italic text-right">{t('نصيحة اليوم')}</h4>
            <p className="text-xs opacity-80 leading-relaxed italic mb-6 text-right">{t('"أفضل هدية تقدمها لطفلك هي تشجيعه على ملازمة القرآن."')}</p>
            <div className="flex justify-end">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:underline">
                <ChevronRight className="w-4 h-4" /> {t('اقرأ المزيد')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
