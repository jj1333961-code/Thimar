'use client';

import React, { useState, useEffect } from 'react';
import { ISLAMIC_CITIES, CityLocation, getPrayerTimesForLocation, calculateQiblaDirection, PrayerTimeItem } from '@/lib/prayer-times';
import { Compass, MapPin, Clock, Volume2, Bell, Check, Navigation } from 'lucide-react';

export function PrayerQiblaView() {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(ISLAMIC_CITIES[0]);
  const [qiblaAngle, setQiblaAngle] = useState<number>(calculateQiblaDirection(ISLAMIC_CITIES[0].lat, ISLAMIC_CITIES[0].lng));
  const [prayerData, setPrayerData] = useState(() =>
    getPrayerTimesForLocation(ISLAMIC_CITIES[0].lat, ISLAMIC_CITIES[0].lng)
  );
  const [selectedAdhan, setSelectedAdhan] = useState('makkah');
  const [adhanEnabled, setAdhanEnabled] = useState(true);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const angle = calculateQiblaDirection(selectedCity.lat, selectedCity.lng);
    setQiblaAngle(angle);
    setPrayerData(getPrayerTimesForLocation(selectedCity.lat, selectedCity.lng));
  }, [selectedCity]);

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('خدمة تحديد الموقع غير مدعومة في هذا المتصفح.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocating(false);
        const userLoc: CityLocation = {
          name: 'موقعي الحالي',
          country: 'إحداثياتك المباشرة',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setSelectedCity(userLoc);
      },
      err => {
        setLocating(false);
        // Fallback gracefully
        alert('تعذر الوصول إلى الموقع الجغرافي. يمكنك اختيار المدينة من القائمة.');
      }
    );
  };

  const formatCountdown = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h} ساعة و ${m} دقيقة`;
    return `${m} دقيقة`;
  };

  return (
    <div id="prayer-qibla-section" className="space-y-6">
      {/* City & Location selector */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-stone-900">
              {selectedCity.name}
            </h3>
            <p className="text-xs text-stone-500">{selectedCity.country}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={selectedCity.name}
            onChange={e => {
              const found = ISLAMIC_CITIES.find(c => c.name === e.target.value);
              if (found) setSelectedCity(found);
            }}
            className="px-3.5 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 font-cairo"
          >
            {ISLAMIC_CITIES.map(c => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.country})
              </option>
            ))}
          </select>

          <button
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'جاري التحديد...' : 'موقعي الحالي'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Prayer & Times grid */}
        <div className="lg:col-span-8 space-y-4">
          {/* Highlight Next Prayer Banner */}
          <div className="rounded-3xl bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-300 bg-emerald-700/60 px-3 py-1 rounded-full border border-emerald-500/30">
                الصلاة القادمة
              </span>
              <h2 className="text-3xl font-bold font-cairo pt-1">
                صلاة {prayerData.nextPrayer.name}
              </h2>
              <p className="text-xs text-emerald-200">
                متبقٍ عليها: <span className="font-bold text-amber-300 text-sm">{formatCountdown(prayerData.countdownMinutes)}</span>
              </p>
            </div>

            <div className="text-left font-mono">
              <div className="text-3xl sm:text-4xl font-black text-white">
                {prayerData.nextPrayer.time}
              </div>
              <span className="text-xs text-emerald-300">بتوقيت {selectedCity.name}</span>
            </div>
          </div>

          {/* 5 Daily Prayers Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {prayerData.prayers.map(prayer => (
              <div
                key={prayer.id}
                className={`p-4 rounded-2xl border transition text-center ${
                  prayer.isNext
                    ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <span className="text-xs font-bold text-stone-500 block mb-1">
                  {prayer.name}
                </span>
                <span className="font-mono text-xl sm:text-2xl font-bold text-stone-900">
                  {prayer.time}
                </span>
                {prayer.isNext && (
                  <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    الصلاة القادمة
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Adhan Audio Settings Card */}
          <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">صوت الأذان والتنبيه</h4>
                <p className="text-xs text-stone-500">تشغيل الأذان الصوتي تلقائياً عند حلول وقت الصلاة</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedAdhan}
                onChange={e => setSelectedAdhan(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-300 font-cairo"
              >
                <option value="makkah">أذان الحرم المكي الشريف</option>
                <option value="madinah">أذان المسجد النبوي الشريف</option>
                <option value="aqsa">أذان المسجد الأقصى المبارك</option>
              </select>

              <button
                onClick={() => setAdhanEnabled(!adhanEnabled)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  adhanEnabled ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {adhanEnabled ? 'مفعّل' : 'معطّل'}
              </button>
            </div>
          </div>
        </div>

        {/* Qibla Compass Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>بوصلة اتجاه القِبلة الشريفة</span>
          </div>

          <p className="text-xs text-stone-500">
            الاتجاه الدقيق نحو الكعبة المشرفة بمكة المكرمة
          </p>

          {/* Compass Graphic Dial */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-full border-4 border-emerald-900/20 bg-emerald-50/40 shadow-inner flex items-center justify-center p-4">
            {/* North, East, South, West labels */}
            <span className="absolute top-2 text-[11px] font-bold text-rose-600">شمال (N)</span>
            <span className="absolute bottom-2 text-[11px] font-bold text-stone-500">جنوب (S)</span>
            <span className="absolute right-2 text-[11px] font-bold text-stone-500">شرق (E)</span>
            <span className="absolute left-2 text-[11px] font-bold text-stone-500">غرب (W)</span>

            {/* Inner Ring */}
            <div className="w-36 h-36 rounded-full border border-stone-300 flex items-center justify-center">
              {/* Needle rotating towards Qibla */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              >
                {/* Arrow pointing to Mecca */}
                <div className="relative flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[36px] border-b-emerald-700" />
                  <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-emerald-900" />
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[30px] border-t-stone-400" />
                </div>
              </div>
            </div>

            {/* Center Pin */}
            <div className="absolute w-4 h-4 rounded-full bg-emerald-900 border-2 border-white shadow" />
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 w-full space-y-1">
            <span className="text-xs text-stone-500">زاوية القبلة من الشمال:</span>
            <div className="text-2xl font-black text-emerald-950 font-mono">
              {qiblaAngle}°
            </div>
            <span className="text-[11px] text-emerald-800 font-bold block">
              نحو المسجد الحرام (مكة المكرمة)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
