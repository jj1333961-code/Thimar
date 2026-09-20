'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SURAHS_LIST, SAMPLE_AYAHS, Surah, Ayah } from '@/lib/quran-data';
import { Play, Pause, Volume2, Bookmark, Copy, Check, BookOpen, Search, ArrowRight, Type, Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface QuranReaderViewProps {
  onPlayAyahGlobal?: (ayah: Ayah, surahName: string) => void;
}

export function QuranReaderView({ onPlayAyahGlobal }: QuranReaderViewProps) {
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(SURAHS_LIST[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'مكية' | 'مدنية'>('all');
  const [fontSize, setFontSize] = useState<number>(24);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Ayah | null>(null);

  // Audio playing state
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [fetchedAyahs, setFetchedAyahs] = useState<Record<number, Ayah[]>>({});
  const [loadingSurah, setLoadingSurah] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!selectedSurah) return;
    const surahNum = selectedSurah.number;

    if (SAMPLE_AYAHS[surahNum] || fetchedAyahs[surahNum]) return;

    setLoadingSurah(true);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.alafasy`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'OK' && data.data && data.data.ayahs) {
          const list: Ayah[] = data.data.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            audio: a.audio || `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${a.number}.mp3`,
            tafsir: `تفسير الآية الكريمة رقم ${a.numberInSurah} من سورة ${selectedSurah.name}.`
          }));
          setFetchedAyahs(prev => ({ ...prev, [surahNum]: list }));
        }
      })
      .catch(err => {
        console.warn('Could not fetch surah ayahs:', err);
      })
      .finally(() => {
        setLoadingSurah(false);
      });
  }, [selectedSurah, fetchedAyahs]);

  const currentAyahs: Ayah[] = selectedSurah
    ? (SAMPLE_AYAHS[selectedSurah.number] || fetchedAyahs[selectedSurah.number] || [
        {
          number: 1,
          numberInSurah: 1,
          text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
          audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
          tafsir: 'أبدأ قراءتي مستعينا باسم الله تعالى.'
        }
      ])
    : [];

  const handleTogglePlay = (ayah: Ayah) => {
    if (playingAyahNumber === ayah.number) {
      audioRef.current?.pause();
      setPlayingAyahNumber(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(ayah.audio);
    audioRef.current = audio;
    setPlayingAyahNumber(ayah.number);

    if (onPlayAyahGlobal && selectedSurah) {
      onPlayAyahGlobal(ayah, selectedSurah.name);
    }

    audio.play().catch(() => {
      // Audio playback interrupted
      setPlayingAyahNumber(null);
    });

    audio.onended = () => {
      setPlayingAyahNumber(null);
    };
  };

  const handleCopyAyah = (text: string, ayahNum: number) => {
    navigator.clipboard.writeText(`${text} ﴿${ayahNum}﴾`);
    setCopiedAyah(ayahNum);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const toggleBookmark = (ayahNum: number) => {
    setBookmarks(prev =>
      prev.includes(ayahNum) ? prev.filter(b => b !== ayahNum) : [...prev, ayahNum]
    );
  };

  const filteredSurahs = SURAHS_LIST.filter(s => {
    const matchesSearch = s.name.includes(searchQuery) || s.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || s.revelationType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div id="quran-reader-section" className="space-y-6">
      {/* View Switch: Surahs list vs Reader */}
      {selectedSurah ? (
        /* Reading Mode */
        <div className="space-y-4">
          {/* Reader Top Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>فهرس السور</span>
            </button>

            <div className="flex items-center gap-2 text-center">
              <span className="font-bold text-base sm:text-lg text-emerald-950 font-cairo">
                سُورَةُ {selectedSurah.name}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                {selectedSurah.revelationType} • {selectedSurah.numberOfAyahs} آيات • الجزء {selectedSurah.juz}
              </span>
            </div>

            {/* Font size adjuster */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setFontSize(prev => Math.max(18, prev - 2))}
                className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shadow-xs"
                title="تصغير الخط"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(prev => Math.min(38, prev + 2))}
                className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shadow-xs"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>
          </div>

          {/* Quran Text Card */}
          <div className="bg-[#fcfaf4] rounded-3xl p-6 sm:p-10 border-2 border-[#e6decb] shadow-sm relative">
            {/* Basmalah */}
            {selectedSurah.number !== 9 && (
              <div className="text-center py-6 border-b border-[#e6decb]/80 mb-8">
                <p className="font-quran text-2xl sm:text-3xl text-emerald-950 font-bold tracking-wide">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
              </div>
            )}

            {loadingSurah && (
              <div className="p-8 text-center text-stone-500 font-cairo space-y-2">
                <Sparkles className="w-6 h-6 animate-spin mx-auto text-emerald-700" />
                <p className="text-sm font-bold">جاري تحميل آيات سورة {selectedSurah.name} وتلاواتها بصوت العفاسي...</p>
              </div>
            )}

            {/* Ayahs Stream */}
            <div className="space-y-6">
              {currentAyahs.map(ayah => {
                const isPlaying = playingAyahNumber === ayah.number;
                const isBookmarked = bookmarks.includes(ayah.number);

                return (
                  <div
                    key={ayah.number}
                    className={`p-4 sm:p-6 rounded-2xl transition border ${
                      isPlaying
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-sm ring-1 ring-emerald-400'
                        : 'bg-white/60 hover:bg-white border-[#eee6d3]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Quran Arabic Text */}
                      <p
                        className="font-quran font-bold text-stone-900 flex-1 leading-loose"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}{' '}
                        <span className="inline-flex items-center justify-center text-emerald-800 font-cairo font-bold text-sm mx-1 px-2 py-0.5 rounded-full border border-emerald-300 bg-emerald-50/70 select-none">
                          ﴿{ayah.numberInSurah}﴾
                        </span>
                      </p>

                      {/* Ayah Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button
                          onClick={() => handleTogglePlay(ayah)}
                          className={`p-2 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                            isPlaying
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-100 hover:bg-emerald-100 text-emerald-900'
                          }`}
                          title="استماع لتلاوة الآية"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span className="hidden sm:inline">تلاوة</span>
                        </button>

                        <button
                          onClick={() => setActiveTafsirAyah(ayah)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition flex items-center gap-1"
                          title="تفسير الآية"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span className="hidden sm:inline">تفسير</span>
                        </button>

                        <button
                          onClick={() => handleCopyAyah(ayah.text, ayah.numberInSurah)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
                          title="نسخ الآية"
                        >
                          {copiedAyah === ayah.numberInSurah ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => toggleBookmark(ayah.number)}
                          className={`p-2 rounded-xl transition ${
                            isBookmarked
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                          }`}
                          title="حفظ موضع الآية"
                        >
                          <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Surahs Index Directory */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سورة (مثال: الكهف، البقرة)..."
                className="w-full px-4 py-2.5 pr-10 text-sm bg-white rounded-2xl border border-stone-200 focus:outline-none focus:border-emerald-600 shadow-sm"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
            </div>

            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  filterType === 'all' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                جميع السور
              </button>
              <button
                onClick={() => setFilterType('مكية')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  filterType === 'مكية' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                مكية
              </button>
              <button
                onClick={() => setFilterType('مدنية')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded-xl transition ${
                  filterType === 'مدنية' ? 'bg-white text-emerald-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                مدنية
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredSurahs.map(surah => (
              <button
                key={surah.number}
                onClick={() => setSelectedSurah(surah)}
                className="group p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-stone-200 hover:border-emerald-300 transition text-right flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-stone-100 group-hover:bg-emerald-700 group-hover:text-white text-stone-700 text-xs font-bold flex items-center justify-center transition">
                    {surah.number}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-emerald-900">
                      سورة {surah.name}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {surah.englishName} • {surah.numberOfAyahs} آيات
                    </span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                  {surah.revelationType}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tafsir Modal */}
      {activeTafsirAyah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setActiveTafsirAyah(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-stone-900">
                  التفسير الميسر • الآية ﴿{activeTafsirAyah.numberInSurah}﴾
                </h3>
              </div>
              <button
                onClick={() => setActiveTafsirAyah(null)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="font-quran text-lg font-bold text-emerald-950 text-center leading-loose">
                  {activeTafsirAyah.text}
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-stone-800 leading-relaxed font-cairo">
                <span className="font-bold text-emerald-900 block mb-1">بيان المعنى والتفسير:</span>
                {activeTafsirAyah.tafsir}
              </div>
            </div>

            <button
              onClick={() => setActiveTafsirAyah(null)}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
