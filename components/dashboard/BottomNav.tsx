'use client';

import React from 'react';
import { Home, BookOpen, Scroll, Mic, MessageSquare, ShieldCheck, Play, Pause, X } from 'lucide-react';
import { Ayah } from '@/lib/quran-data';

export type MainTabType = 'home' | 'quran' | 'tuhfa' | 'recitation' | 'messages' | 'admin' | 'prayer';

interface BottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  activePlayingAyah?: { ayah: Ayah; surahName: string } | null;
  onStopAudio?: () => void;
  unreadMessagesCount?: number;
}

export function BottomNav({
  activeTab,
  onChangeTab,
  activePlayingAyah,
  onStopAudio,
  unreadMessagesCount = 2
}: BottomNavProps) {
  const tabs: { id: MainTabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'quran', label: 'المصحف', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'tuhfa', label: 'تحفة الأطفال', icon: <Scroll className="w-5 h-5" /> },
    { id: 'recitation', label: 'التسميع', icon: <Mic className="w-5 h-5" /> },
    { id: 'messages', label: 'الرسائل', icon: <MessageSquare className="w-5 h-5" />, badge: unreadMessagesCount },
    { id: 'admin', label: 'لوحة الإدارة', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div id="persistent-bottom-nav-card" className="fixed bottom-0 inset-x-0 z-40 p-3 pointer-events-none">
      <div className="max-w-xl mx-auto space-y-2 pointer-events-auto">
        {/* Active Quran Recitation Bottom Mini-Card */}
        {activePlayingAyah && (
          <div className="bg-emerald-950 text-white rounded-2xl p-3 shadow-2xl border border-emerald-700/60 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate text-white">
                  جارٍ الاستماع: {activePlayingAyah.surahName} • الآية ﴿{activePlayingAyah.ayah.numberInSurah}﴾
                </p>
                <p className="text-[11px] text-emerald-300 font-quran truncate">
                  {activePlayingAyah.ayah.text}
                </p>
              </div>
            </div>

            {onStopAudio && (
              <button
                onClick={onStopAudio}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Primary Bottom Card Bar */}
        <nav className="bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200/90 shadow-xl p-2 flex items-center justify-around">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onChangeTab(t.id)}
                className={`relative flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition ${
                  isActive
                    ? 'text-emerald-900 font-bold bg-emerald-50'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
                }`}
              >
                <div className="relative">
                  {t.icon}
                  {t.badge && t.badge > 0 && !isActive && (
                    <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {t.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight font-cairo whitespace-nowrap">
                  {t.label}
                </span>

                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-emerald-700 mt-0.5" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
