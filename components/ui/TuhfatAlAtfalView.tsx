'use client';

import React, { useState } from 'react';
import { TUHFA_CHAPTERS, TAJWEED_QUIZ, TuhfaChapter } from '@/lib/tuhfat-al-atfal-data';
import { BookOpen, Volume2, Award, CheckCircle2, XCircle, Search, HelpCircle, ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function TuhfatAlAtfalView() {
  const [activeChapterId, setActiveChapterId] = useState<string>(TUHFA_CHAPTERS[0].id);
  const [activeTab, setActiveTab] = useState<'text' | 'quiz'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVerse, setPlayingVerse] = useState<number | null>(null);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const currentChapter = TUHFA_CHAPTERS.find(c => c.id === activeChapterId) || TUHFA_CHAPTERS[0];

  const handlePlayVerse = (verseNum: number, text: string) => {
    if ('speechSynthesis' in window) {
      if (playingVerse === verseNum) {
        window.speechSynthesis.cancel();
        setPlayingVerse(null);
        return;
      }
      window.speechSynthesis.cancel();
      setPlayingVerse(verseNum);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.85; // poetic recitation rhythm
      utterance.onend = () => setPlayingVerse(null);
      utterance.onerror = () => setPlayingVerse(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    TAJWEED_QUIZ.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const score = calculateScore();
    if (score >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
  };

  // Filter verses
  const filteredChapters = TUHFA_CHAPTERS.map(ch => ({
    ...ch,
    verses: ch.verses.filter(
      v =>
        v.shatrA.includes(searchQuery) ||
        v.shatrB.includes(searchQuery) ||
        (v.explanation && v.explanation.includes(searchQuery))
    )
  })).filter(ch => ch.verses.length > 0);

  return (
    <div id="tuhfat-al-atfal-section" className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-xs font-semibold text-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>متن علم التجويد المعتمد للمبتدئين والحفاظ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-cairo text-white tracking-tight">
            مَتْنُ تُحْفَةِ الأَطْفَالِ وَالغِلْمَانِ
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 mt-2 font-cairo leading-relaxed">
            للإمام سليمان الجمزوري رحمه الله. استمع للأبيات، تعرّف على الشرح التجويدي الميسر، واختبر معلوماتك في أحكام النون والميم والمدود.
          </p>

          {/* Sub-nav tabs */}
          <div className="flex items-center gap-3 mt-5">
            <button
              id="tuhfa-tab-text"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'text'
                  ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                  : 'bg-emerald-800/80 hover:bg-emerald-700 text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>قراءة وشرح المنظومة</span>
            </button>

            <button
              id="tuhfa-tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'quiz'
                  ? 'bg-amber-400 text-emerald-950 shadow-md font-bold'
                  : 'bg-emerald-800/80 hover:bg-emerald-700 text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>اختبار التجويد التفاعلي</span>
            </button>
          </div>
        </div>

        {/* Decorative Arabesque Pattern Graphic */}
        <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-600/20 blur-2xl pointer-events-none" />
      </div>

      {activeTab === 'text' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chapters Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث في أبيات التحفة أو القواعد..."
                className="w-full px-4 py-2.5 pr-10 text-sm bg-white rounded-2xl border border-stone-200 focus:outline-none focus:border-emerald-600 shadow-sm"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
            </div>

            <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-sm space-y-1">
              <h4 className="text-xs font-bold text-stone-400 px-3 py-2 uppercase tracking-wider">
                أبواب المنظومة
              </h4>
              {(searchQuery ? filteredChapters : TUHFA_CHAPTERS).map(ch => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapterId(ch.id)}
                  className={`w-full text-right px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition flex items-center justify-between ${
                    activeChapterId === ch.id
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="truncate">{ch.title}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-normal">
                    {ch.verses.length} أبيات
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Verses Reading Display */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm">
              <div className="border-b border-stone-100 pb-4 mb-4">
                <h3 className="text-xl font-bold text-emerald-950 font-cairo">
                  {currentChapter.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  {currentChapter.description}
                </p>
              </div>

              {/* Verses Cards */}
              <div className="space-y-4">
                {currentChapter.verses.map(verse => {
                  const fullVerseText = `${verse.shatrA} ... ${verse.shatrB}`;
                  const isPlaying = playingVerse === verse.number;

                  return (
                    <div
                      key={verse.number}
                      className="group rounded-2xl p-4 sm:p-5 bg-stone-50/80 hover:bg-emerald-50/50 border border-stone-200/80 hover:border-emerald-200 transition"
                    >
                      {/* Verse Header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center">
                          {verse.number}
                        </span>

                        <button
                          onClick={() => handlePlayVerse(verse.number, fullVerseText)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                            isPlaying
                              ? 'bg-emerald-700 text-white'
                              : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>إيقاف</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>استماع</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Verse Poetic Hemistichs (شطرا البيت) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center my-3 py-2 border-y border-stone-200/50">
                        <p className="font-quran text-base sm:text-lg font-bold text-stone-800 leading-loose">
                          {verse.shatrA}
                        </p>
                        <p className="font-quran text-base sm:text-lg font-bold text-emerald-950 leading-loose">
                          {verse.shatrB}
                        </p>
                      </div>

                      {/* Verse Explanation */}
                      {verse.explanation && (
                        <div className="mt-3 p-3 rounded-xl bg-white border border-stone-200 text-xs text-stone-600 leading-relaxed">
                          <span className="font-bold text-emerald-800 ml-1">الشرح التجويدي:</span>
                          {verse.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tajweed Interactive Quiz */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h3 className="text-xl font-bold text-stone-900">اختبار تجويد تحفة الأطفال التفاعلي</h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              أجب عن الأسئلة الخمسة التالية لقياس فهمك لأحكام التجويد والمنظومة.
            </p>
          </div>

          <div className="space-y-6">
            {TAJWEED_QUIZ.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isCorrect = selected === q.correctIndex;

              return (
                <div key={q.id} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                      سؤال {idx + 1} • {q.ruleCategory}
                    </span>
                    {quizSubmitted && (
                      isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" /> إجابة صحيحة
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                          <XCircle className="w-4 h-4" /> إجابة خاطئة
                        </span>
                      )
                    )}
                  </div>

                  <p className="font-bold text-sm sm:text-base text-stone-900">{q.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      let btnStyle = 'bg-white border-stone-200 text-stone-700 hover:border-emerald-300';
                      if (selected === optIdx) {
                        btnStyle = 'bg-emerald-100/80 border-emerald-600 text-emerald-950 font-bold';
                      }
                      if (quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'bg-emerald-600 border-emerald-700 text-white font-bold';
                        } else if (selected === optIdx && !isCorrect) {
                          btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 line-through';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`p-3 rounded-xl text-right text-xs sm:text-sm border transition ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                      <span className="font-bold">التوضيح: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {quizSubmitted ? (
              <div className="flex items-center gap-3 w-full justify-between">
                <div className="text-base font-bold text-stone-800">
                  النتيجة النهائية: <span className="text-emerald-700 text-xl font-black">{calculateScore()} / {TAJWEED_QUIZ.length}</span>
                </div>
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-2xl transition"
                >
                  إعادة الاختبار
                </button>
              </div>
            ) : (
              <button
                onClick={handleQuizSubmit}
                disabled={Object.keys(userAnswers).length < TAJWEED_QUIZ.length}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-sm rounded-2xl shadow transition"
              >
                تصحيح الإجابات وعرض النتيجة
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
