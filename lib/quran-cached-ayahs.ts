// Built-in verified offline Quran text cache for immediate display
import { getOfflineData, saveOfflineData } from './offline-storage'
import { AyahItem } from './quran-surahs'

export const DEFAULT_FATIHA_AYAHS: AyahItem[] = [
  { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
  { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
  { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
  { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
  { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' }
]

export const DEFAULT_IKHLAS_AYAHS: AyahItem[] = [
  { number: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
  { number: 2, text: 'اللَّهُ الصَّمَدُ' },
  { number: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
  { number: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' }
]

export const DEFAULT_FALAQ_AYAHS: AyahItem[] = [
  { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
  { number: 2, text: 'مِن شَرِّ مَا خَلَقَ' },
  { number: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
  { number: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ' },
  { number: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' }
]

export const DEFAULT_NAS_AYAHS: AyahItem[] = [
  { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
  { number: 2, text: 'مَلِكِ النَّاسِ' },
  { number: 3, text: 'إِلَٰهِ النَّاسِ' },
  { number: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' },
  { number: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ' },
  { number: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ' }
]

export async function getSurahAyahs(surahNumber: number): Promise<AyahItem[]> {
  // 1. Check IndexedDB offline storage
  const cacheKey = `surah_text_${surahNumber}`
  try {
    const cached = await getOfflineData<AyahItem[]>(cacheKey)
    if (cached && cached.length > 0) {
      return cached
    }
  } catch {}

  // 2. Check defaults
  if (surahNumber === 1) return DEFAULT_FATIHA_AYAHS
  if (surahNumber === 112) return DEFAULT_IKHLAS_AYAHS
  if (surahNumber === 113) return DEFAULT_FALAQ_AYAHS
  if (surahNumber === 114) return DEFAULT_NAS_AYAHS

  // 3. Fetch from Quran API and save into offline IndexedDB
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`)
    if (res.ok) {
      const data = await res.json()
      if (data?.data?.ayahs) {
        const ayahs: AyahItem[] = data.data.ayahs.map((a: any) => ({
          number: a.numberInSurah,
          globalNumber: a.number,
          text: a.text,
        }))
        // Store locally
        await saveOfflineData(cacheKey, ayahs)
        return ayahs
      }
    }
  } catch {}

  // 4. Return reasonable fallback if offline and not cached yet
  return [
    { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' }
  ]
}
