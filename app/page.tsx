'use client';

import React, { useState } from 'react';
import { DraggableAIChatBubble } from '@/components/ui/DraggableAIChatBubble';
import { TuhfatAlAtfalView } from '@/components/ui/TuhfatAlAtfalView';
import { QuranReaderView } from '@/components/ui/QuranReaderView';
import { MessagesView } from '@/components/dashboard/MessagesView';
import { AdminDashboardView } from '@/components/dashboard/AdminDashboardView';
import { PrayerQiblaView } from '@/components/ui/PrayerQiblaView';
import { LiveRecitationView } from '@/components/ui/LiveRecitationView';
import { BottomNav, MainTabType } from '@/components/dashboard/BottomNav';
import { SocialAuthModal, UserRole } from '@/components/auth/SocialAuthModal';
import { Ayah } from '@/lib/quran-data';
import { Sparkles, BookOpen, Scroll, Mic, Shield, Bell, User, Clock, Compass, ChevronLeft, CheckCircle2, Flame, Award } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activePlayingAyah, setActivePlayingAyah] = useState<{ ayah: Ayah; surahName: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleLabelMap: Record<UserRole, { title: string; badge: string; color: string }> = {
    student: { title: 'طالب قرآن', badge: 'حلقة الإتقان', color: 'bg-emerald-100 text-emerald-800' },
    teacher: { title: 'معلم مجاز', badge: 'إشراف وتسميع', color: 'bg-blue-100 text-blue-800' },
    parent: { title: 'ولي أمر', badge: 'متابعة الأبناء', color: 'bg-teal-100 text-teal-800' },
    admin: { title: 'مسؤول النظام', badge: 'تحكم ورقابة', color: 'bg-amber-100 text-amber-900' }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 pb-28">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-900 to-emerald-700 text-amber-300 flex items-center justify-center shadow-md border border-emerald-600/40">
              <span className="font-amiri text-2xl font-bold">ث</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg font-cairo text-stone-900 tracking-tight">
                  ثِمَار
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  منصة القرآن والتعليم
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden md:block">
                مساحة هادئة للحفظ والتسميع والتجويد
              </p>
            </div>
          </div>

          {/* Quick Header Links on desktop */}
          <div className="hidden lg:flex items-center gap-1 bg-stone-100/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'home' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => setActiveTab('quran')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'quran' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              المصحف الشريف
            </button>
            <button
              onClick={() => setActiveTab('tuhfa')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'tuhfa' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              تحفة الأطفال
            </button>
            <button
              onClick={() => setActiveTab('prayer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'prayer' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              المواقيت والقبلة
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'admin' ? 'bg-white text-emerald-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              لوحة الإدارة
            </button>
          </div>

          {/* Right Action buttons: Role Badge + Social Login & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Badge button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-white transition shadow-xs"
              title="تغيير الدور أو تسجيل الدخول"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-stone-900">{roleLabelMap[userRole].title}</div>
                <div className="text-[10px] text-stone-500">{roleLabelMap[userRole].badge}</div>
              </div>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition relative"
                title="التنبيهات والإعلانات"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-3xl p-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="font-bold text-xs text-stone-900">التنبيهات والإشعارات</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">2 جديدة</span>
                  </div>
                  <div className="space-y-2 mt-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
                      <p className="font-bold text-emerald-950">حلقة التسميع القادمة</p>
                      <p className="text-emerald-800 text-[11px] mt-0.5">تبدأ حلقة إتقان سورة الملك اليوم الساعة 04:30 مساءً.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                      <p className="font-bold text-stone-900">تحديث منظومة تحفة الأطفال</p>
                      <p className="text-stone-600 text-[11px] mt-0.5">تم تفعيل اختبار التجويد التفاعلي مع ميزة التدقيق الآلي.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-800/60">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-600/40 text-xs font-semibold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>منصة ثمار • حلقة القرآن والتعليم</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black font-cairo text-white tracking-tight leading-snug">
                  مرحباً بك في رحاب القرآن الكريم
                </h2>

                <p className="text-sm sm:text-base text-emerald-100/90 font-cairo leading-relaxed">
                  استمع للمصحف المرتل، أتقن أبيات متن تحفة الأطفال مع شروح التجويد، وسجل تلاوتك لمعلم الحلقة بإتقان وثبات.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <button
                    onClick={() => setActiveTab('quran')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>فتح المصحف الشريف</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tuhfa')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-600/50 transition"
                  >
                    <Scroll className="w-4 h-4 text-amber-300" />
                    <span>متن تحفة الأطفال</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('recitation')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition"
                  >
                    <Mic className="w-4 h-4 text-emerald-300" />
                    <span>التسميع الصوتي المباشر</span>
                  </button>
                </div>
              </div>

              {/* Islamic Pattern Accent Graphic */}
              <div className="absolute -left-16 -top-16 w-80 h-80 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />
            </div>

            {/* Quick Stats & Daily Ayah Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Daily Ayah & Contemplation */}
              <div className="md:col-span-7 bg-[#fcfaf5] rounded-3xl p-6 border-2 border-[#e8dfcf] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 bg-emerald-100/70 px-3 py-1 rounded-full">
                    آية وتدبر اليوم
                  </span>
                  <span className="text-xs text-stone-500 font-medium">سورة الملك • الآية 1</span>
                </div>

                <p className="font-quran text-xl sm:text-2xl font-bold text-stone-900 text-center leading-loose py-2">
                  ﴿ تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ﴾
                </p>

                <div className="p-3.5 bg-white rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-600 leading-relaxed">
                  <span className="font-bold text-emerald-900 block mb-1">فائدة وتدبر:</span>
                  افتتاح السورة بالبركة الشاملة لبيان عظمة ملك الله وقدرته المطلقة على الإحياء والإماتة، مما يملأ قلب المؤمن طمأنينة ويقيناً.
                </div>
              </div>

              {/* Progress & Quick Links Cards */}
              <div className="md:col-span-5 space-y-4">
                {/* Streak card */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Flame className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-stone-400 uppercase">المواظبة على الورد</span>
                      <h4 className="text-xl font-bold text-stone-900 font-mono">14 يوماً متواصلاً</h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    ممتاز 🌟
                  </span>
                </div>

                {/* Quick Halaqa Card */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500">الحلقة القرآنية الحالية</span>
                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">نشطة الآن</span>
                  </div>
                  <h4 className="font-bold text-base text-stone-900">حلقة الإتقان وتحفة الأطفال</h4>
                  <p className="text-xs text-stone-500">بإشراف الشيخ أحمد الحافظ • موعد التسميع: 04:30 م</p>
                  
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="w-full mt-2 py-2 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <span>فتح محادثة الحلقة مع الشيخ</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('quran')}
                className="group p-5 bg-white hover:bg-emerald-50/50 rounded-3xl border border-stone-200 hover:border-emerald-300 transition cursor-pointer shadow-xs space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-stone-900">المصحف المرتل</h4>
                <p className="text-xs text-stone-500">تلاوة آية بآية بصوت الشيخ مشاري العفاسي مع التفسير الميسر.</p>
              </div>

              <div
                onClick={() => setActiveTab('tuhfa')}
                className="group p-5 bg-white hover:bg-emerald-50/50 rounded-3xl border border-stone-200 hover:border-emerald-300 transition cursor-pointer shadow-xs space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
                  <Scroll className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-stone-900">تحفة الأطفال</h4>
                <p className="text-xs text-stone-500">الأبيات التجويدية كاملة مع الشروح واختبار التجويد التفاعلي.</p>
              </div>

              <div
                onClick={() => setActiveTab('recitation')}
                className="group p-5 bg-white hover:bg-emerald-50/50 rounded-3xl border border-stone-200 hover:border-emerald-300 transition cursor-pointer shadow-xs space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:scale-105 transition">
                  <Mic className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-stone-900">التسميع الصوتي</h4>
                <p className="text-xs text-stone-500">تسجيل التلاوة بالميكروفون وإرسالها لمعلم الحلقة لتقييم الحفظ.</p>
              </div>

              <div
                onClick={() => setActiveTab('prayer')}
                className="group p-5 bg-white hover:bg-emerald-50/50 rounded-3xl border border-stone-200 hover:border-emerald-300 transition cursor-pointer shadow-xs space-y-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center group-hover:scale-105 transition">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-stone-900">المواقيت والقبلة</h4>
                <p className="text-xs text-stone-500">مواقيت الصلوات الخمس بدقة وبوصلة اتجاه الكعبة المشرفة.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quran' && (
          <QuranReaderView
            onPlayAyahGlobal={(ayah, surahName) => {
              setActivePlayingAyah({ ayah, surahName });
            }}
          />
        )}

        {activeTab === 'tuhfa' && <TuhfatAlAtfalView />}

        {activeTab === 'recitation' && <LiveRecitationView />}

        {activeTab === 'messages' && <MessagesView />}

        {activeTab === 'admin' && <AdminDashboardView />}

        {activeTab === 'prayer' && <PrayerQiblaView />}
      </main>

      {/* Movable Floating Smart AI Chat Bubble (دائرة المحادثة الذكية القابلة للتحريك) */}
      <DraggableAIChatBubble />

      {/* Persistent Bottom Navigation Card (المصحف الشريف والبطاقة السفلية) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={tab => setActiveTab(tab)}
        activePlayingAyah={activePlayingAyah}
        onStopAudio={() => setActivePlayingAyah(null)}
      />

      {/* Social Login and Role Badges Modal (أزرار وشارات التسجيل الاجتماعي) */}
      <SocialAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={userRole}
        onSelectRole={role => {
          setUserRole(role);
          if (role === 'admin') setActiveTab('admin');
        }}
      />
    </div>
  );
}
