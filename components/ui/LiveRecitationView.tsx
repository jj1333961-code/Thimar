'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Send, CheckCircle2, RotateCcw, Sparkles, Volume2, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export function LiveRecitationView() {
  const [recording, setRecording] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState('سورة الفاتحة (١-٧)');
  const [selectedTopic, setSelectedTopic] = useState('حفظ جديد - إتقان التجويد');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDurationSec(0);
      setSubmitted(false);

      timerRef.current = setInterval(() => {
        setDurationSec(prev => prev + 1);
      }, 1000);
    } catch (err) {
      // Simulate recording fallback if user denies mic permission
      setRecording(true);
      setDurationSec(0);
      setSubmitted(false);
      timerRef.current = setInterval(() => {
        setDurationSec(prev => prev + 1);
      }, 1000);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback simulated audio URL
      setAudioBlobUrl('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3');
    }
  };

  const handleTogglePlayback = () => {
    if (!audioBlobUrl) return;

    if (isPlayingAudio) {
      audioPlaybackRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(audioBlobUrl);
      audioPlaybackRef.current = audio;
      setIsPlayingAudio(true);
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  const handleSubmitRecitation = () => {
    setSubmitted(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // ignore
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="live-recitation-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>التسميع الصوتي المباشر للحلقة</span>
        </div>
        <h3 className="text-2xl font-bold font-cairo text-stone-900">
          تسجيل تلاوتك وإرسالها للشيخ المجاز
        </h3>
        <p className="text-xs sm:text-sm text-stone-500">
          سجل تلاوتك القرآنية بوضوح ليتم تقييم تطبيق أحكام التجويد وإعطاؤك الملاحظات المعتمدة.
        </p>
      </div>

      {/* Select Surah and Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1">المقطع المراد تسميعه:</label>
          <select
            value={selectedSurah}
            onChange={e => setSelectedSurah(e.target.value)}
            className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-300 font-cairo"
          >
            <option value="سورة الفاتحة (١-٧)">سورة الفاتحة (١-٧)</option>
            <option value="سورة الملك (١-١٠)">سورة الملك (١-١٠)</option>
            <option value="سورة الكهف (١-١٠)">سورة الكهف (١-١٠)</option>
            <option value="متن تحفة الأطفال (المقدمة والنون الساكنة)">متن تحفة الأطفال (المقدمة والنون الساكنة)</option>
            <option value="سورة النبأ (كاملة)">سورة النبأ (كاملة)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-stone-600 block mb-1">نوع جلسة التسميع:</label>
          <select
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
            className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-300 font-cairo"
          >
            <option value="حفظ جديد - إتقان التجويد">حفظ جديد - إتقان التجويد</option>
            <option value="مراجعة وتثبيت الورد">مراجعة وتثبيت الورد</option>
            <option value="اختبار إجازة بالسند">اختبار إجازة بالسند</option>
          </select>
        </div>
      </div>

      {/* Recording Stage Box */}
      <div className="p-8 rounded-3xl bg-gradient-to-b from-stone-50 to-emerald-50/40 border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center space-y-4 text-center">
        {/* Visual Pulse Circle */}
        <div className="relative">
          {recording && (
            <span className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping" />
          )}
          <button
            onClick={recording ? handleStopRecording : handleStartRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 ${
              recording
                ? 'bg-rose-600 hover:bg-rose-700 text-white scale-105'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white hover:scale-105'
            }`}
          >
            {recording ? <Square className="w-7 h-7" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        {/* Timer */}
        <div className="space-y-1">
          <span className="font-mono text-2xl font-black text-stone-800">
            {formatTimer(durationSec)}
          </span>
          <p className="text-xs text-stone-500">
            {recording ? 'جاري التسجيل الصوتي... اضغط للإيقاف' : audioBlobUrl ? 'تم الانتهاء من التسجيل' : 'اضغط على الميكروفون للبدء'}
          </p>
        </div>

        {/* Wave Animation during recording */}
        {recording && (
          <div className="flex items-center gap-1 h-8">
            {[40, 75, 90, 50, 80, 100, 60, 45, 90, 70, 55, 85, 60, 40].map((val, i) => (
              <span
                key={i}
                style={{ height: `${val}%` }}
                className="w-1 bg-emerald-600 rounded-full animate-pulse"
              />
            ))}
          </div>
        )}
      </div>

      {/* Playback & Submit Actions */}
      {audioBlobUrl && !recording && (
        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlayback}
              className="p-2.5 bg-emerald-800 text-white rounded-xl shadow-xs hover:bg-emerald-900 transition flex items-center gap-1.5 text-xs font-bold"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'إيقاف الاستماع' : 'استمع لتسجيلك'}</span>
            </button>
            <button
              onClick={() => {
                setAudioBlobUrl(null);
                setDurationSec(0);
                setSubmitted(false);
              }}
              className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold transition flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة التسجيل</span>
            </button>
          </div>

          <button
            onClick={handleSubmitRecitation}
            disabled={submitted}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 ${
              submitted
                ? 'bg-emerald-200 text-emerald-800 cursor-default'
                : 'bg-emerald-800 hover:bg-emerald-900 text-white'
            }`}
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>تم إرسال التسجيل للشيخ بنجاح!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 transform rotate-180" />
                <span>إرسال التلاوة للمراجعة والتقييم</span>
              </>
            )}
          </button>
        </div>
      )}

      {submitted && (
        <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-xs sm:text-sm text-emerald-900 font-cairo space-y-1">
          <div className="font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>ملاحظة أولية للنظام الذكي:</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            تم استلام تلاوتك لـ {selectedSurah}. مخارج الحروف ممتازة والتطبيق مبدئياً متوافق مع أحكام التجويد في متن تحفة الأطفال. سيصلك تقييم الشيخ المجاز خلال ساعات.
          </p>
        </div>
      )}
    </div>
  );
}
