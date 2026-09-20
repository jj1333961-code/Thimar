export interface CityLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export const ISLAMIC_CITIES: CityLocation[] = [
  { name: 'مكة المكرمة', country: 'المملكة العربية السعودية', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة المنورة', country: 'المملكة العربية السعودية', lat: 24.5247, lng: 39.5692 },
  { name: 'الرياض', country: 'المملكة العربية السعودية', lat: 24.7136, lng: 46.6753 },
  { name: 'القاهرة', country: 'مصر', lat: 30.0444, lng: 31.2357 },
  { name: 'القدس الشريف', country: 'فلسطين', lat: 31.7683, lng: 35.2137 },
  { name: 'عَمّان', country: 'الأردن', lat: 31.9454, lng: 35.9284 },
  { name: 'أبو ظبي', country: 'الإمارات العربية المتحدة', lat: 24.4539, lng: 54.3773 },
  { name: 'إسطنبول', country: 'تركيا', lat: 41.0082, lng: 28.9784 }
];

export interface PrayerTimeItem {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  name: string;
  time: string; // "HH:MM"
  isNext?: boolean;
}

// Computes Qibla direction in degrees from North
export function calculateQiblaDirection(lat: number, lng: number): number {
  const meccaLat = 21.4225 * (Math.PI / 180);
  const meccaLng = 39.8262 * (Math.PI / 180);
  const userLat = lat * (Math.PI / 180);
  const userLng = lng * (Math.PI / 180);

  const deltaLng = meccaLng - userLng;
  const y = Math.sin(deltaLng);
  const x = Math.cos(userLat) * Math.tan(meccaLat) - Math.sin(userLat) * Math.cos(deltaLng);

  let qiblaDeg = Math.atan2(y, x) * (180 / Math.PI);
  return Math.round((qiblaDeg + 360) % 360);
}

// Approximate calculation of prayer times based on city latitude/longitude
export function getPrayerTimesForLocation(lat: number, lng: number, date = new Date()): {
  prayers: PrayerTimeItem[];
  nextPrayer: PrayerTimeItem;
  countdownMinutes: number;
} {
  // Approximate standard calculation based on solar position and timezone offset
  const timeOffset = lng / 15; // rough solar time offset in hours from UTC
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Reference times adjusted slightly by latitude
  const latFactor = (lat - 21.4) * 0.4;
  
  // Format into HH:MM
  const formatTime = (totalMinutes: number) => {
    let m = Math.round(totalMinutes) % (24 * 60);
    if (m < 0) m += 24 * 60;
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  };

  const fajrMin = 4 * 60 + 35 - latFactor;
  const sunriseMin = 5 * 60 + 55 - latFactor;
  const dhuhrMin = 12 * 60 + 15;
  const asrMin = 15 * 60 + 35 + latFactor * 0.5;
  const maghribMin = 18 * 60 + 10 + latFactor;
  const ishaMin = 19 * 60 + 40 + latFactor;

  const rawList: { id: PrayerTimeItem['id']; name: string; mins: number }[] = [
    { id: 'fajr', name: 'الفجر', mins: fajrMin },
    { id: 'sunrise', name: 'الشروق', mins: sunriseMin },
    { id: 'dhuhr', name: 'الظهر', mins: dhuhrMin },
    { id: 'asr', name: 'العصر', mins: asrMin },
    { id: 'maghrib', name: 'المغرب', mins: maghribMin },
    { id: 'isha', name: 'العشاء', mins: ishaMin },
  ];

  // Find next prayer
  let nextIdx = rawList.findIndex(p => p.mins > currentMinutes);
  if (nextIdx === -1) nextIdx = 0; // next day Fajr

  const nextPrayerItem = rawList[nextIdx];
  let diff = nextPrayerItem.mins - currentMinutes;
  if (diff < 0) diff += 24 * 60;

  const prayers: PrayerTimeItem[] = rawList.map((item, idx) => ({
    id: item.id,
    name: item.name,
    time: formatTime(item.mins),
    isNext: idx === nextIdx
  }));

  return {
    prayers,
    nextPrayer: prayers[nextIdx],
    countdownMinutes: diff
  };
}
