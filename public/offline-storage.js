/**
 * Thimar Unified Offline Storage & Media Manager
 * Handles offline caching of Audio, Tafsir, Location, Adhan, and Quran data
 */
(function (window) {
  "use strict";

  var CACHE_NAME = "thimar-media-v1";
  var DB_NAME = "thimar_offline_db";
  var DB_VERSION = 1;
  var dbInstance = null;

  // Famous Adhan Voices
  var ADHAN_VOICES = [
    {
      id: "adhan_makkah",
      name: "أذان الحرم المكي الشريف (671356 التلقائي)",
      reciter: "مؤذنو المسجد الحرام (الصوت التلقائي)",
      country: "المملكة العربية السعودية",
      flag: "🇸🇦",
      url: "/audio/671356.mp3",
      isDefault: true
    },
    {
      id: "adhan_madinah",
      name: "أذان المسجد النبوي الشريف",
      reciter: "مؤذنو المسجد النبوي",
      country: "المملكة العربية السعودية",
      flag: "🇸🇦",
      url: "https://www.islamcan.com/audio/adhan/madina.mp3"
    },
    {
      id: "adhan_aqsa",
      name: "أذان المسجد الأقصى المبارك",
      reciter: "الشيخ ناجي قزاز",
      country: "القدس الشريف - فلسطين",
      flag: "🇵🇸",
      url: "https://www.islamcan.com/audio/adhan/al-aqsa.mp3"
    },
    {
      id: "adhan_abdulbasit",
      name: "أذان الشيخ عبد الباسط عبد الصمد",
      reciter: "الشيخ عبد الباسط عبد الصمد",
      country: "جمهورية مصر العربية",
      flag: "🇪🇬",
      url: "https://ia800301.us.archive.org/15/items/AdhanAbdulBasit/AdhanAbdulBasit.mp3"
    },
    {
      id: "adhan_ismail",
      name: "أذان الشيخ مصطفى إسماعيل",
      reciter: "الشيخ مصطفى إسماعيل",
      country: "جمهورية مصر العربية",
      flag: "🇪🇬",
      url: "https://ia800306.us.archive.org/4/items/AdhanMustafaIsmail/AdhanMustafaIsmail.mp3"
    },
    {
      id: "adhan_umayyad",
      name: "أذان الجامع الأموي الكبير",
      reciter: "الأذان الجماعي الدمشقي",
      country: "دمشق - سوريا",
      flag: "🇸🇾",
      url: "https://ia800307.us.archive.org/30/items/AdhanUmayyadMosque/AdhanUmayyadMosque.mp3"
    },
    {
      id: "adhan_qatami",
      name: "أذان الشيخ ناصر القطامي",
      reciter: "الشيخ ناصر القطامي",
      country: "المملكة العربية السعودية",
      flag: "🇸🇦",
      url: "https://ia800308.us.archive.org/12/items/AdhanNasserAlQatami/AdhanNasserAlQatami.mp3"
    },
    {
      id: "adhan_alafasy",
      name: "أذان الشيخ مشاري راشد العفاسي",
      reciter: "الشيخ مشاري راشد العفاسي",
      country: "دولة الكويت",
      flag: "🇰🇼",
      url: "https://ia800207.us.archive.org/31/items/Athan-Mishary-Rashid-Alafasy/athan.mp3"
    }
  ];

  // Quran Reciters for Quran Viewer & Tools
  var QURAN_RECITERS = [
    {
      id: "Alafasy_128kbps",
      name: "الشيخ مشاري راشد العفاسي",
      subtext: "رواية حفص عن عاصم - مرتل",
      baseFolder: "Alafasy_128kbps"
    },
    {
      id: "Abdul_Basit_Murattal_192kbps",
      name: "الشيخ عبد الباسط عبد الصمد",
      subtext: "المصحف المرتل",
      baseFolder: "Abdul_Basit_Murattal_192kbps"
    },
    {
      id: "Abdul_Basit_Mujawwad_128kbps",
      name: "الشيخ عبد الباسط عبد الصمد",
      subtext: "المصحف المجود",
      baseFolder: "Abdul_Basit_Mujawwad_128kbps"
    },
    {
      id: "Minshawy_Murattal_128kbps",
      name: "الشيخ محمد صديق المنشاوي",
      subtext: "المصحف المرتل",
      baseFolder: "Minshawy_Murattal_128kbps"
    },
    {
      id: "Husary_128kbps",
      name: "الشيخ محمود خليل الحصري",
      subtext: "المصحف المرتل بقصر المنفصل",
      baseFolder: "Husary_128kbps"
    },
    {
      id: "Ghamadi_40kbps",
      name: "الشيخ سعد الغامدي",
      subtext: "رواية حفص عن عاصم",
      baseFolder: "Ghamadi_40kbps"
    },
    {
      id: "Maher_AlMuaiqly_64kbps",
      name: "الشيخ ماهر المعيقلي",
      subtext: "إمام الحرم المكي",
      baseFolder: "Maher_AlMuaiqly_64kbps"
    },
    {
      id: "Abdurrahmaan_As-Sudais_192kbps",
      name: "الشيخ عبد الرحمن السديس",
      subtext: "إمام الحرم المكي",
      baseFolder: "Abdurrahmaan_As-Sudais_192kbps"
    },
    {
      id: "Yasser_Ad-Dussary_128kbps",
      name: "الشيخ ياسر الدوسري",
      subtext: "إمام الحرم المكي",
      baseFolder: "Yasser_Ad-Dussary_128kbps"
    }
  ];

  // Tafsir options
  var TAFSIR_EDITIONS = [
    { id: "ar.muyassar", name: "التفسير الميسر", author: "نخبة من العلماء", school: "ميسر عام" },
    { id: "ar.ibnkathir", name: "تفسير ابن كثير", author: "الحافظ ابن كثير", school: "تفسير القرآن بالأثر" },
    { id: "ar.saadi", name: "تيسير الكريم الرحمن", author: "الشيخ عبد الرحمن السعدي", school: "أهل السنة والجماعة" },
    { id: "ar.baghawi", name: "معالم التنزيل", author: "الإمام البغوي", school: "الأثر والحديث" },
    { id: "ar.qurtubi", name: "الجامع لأحكام القرآن", author: "الإمام القرطبي", school: "فقهي أحكام المالكية والجمهور" }
  ];

  // Initialize IndexedDB
  function openDatabase() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) {
        return resolve(null);
      }
      var request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains("audio_cache")) {
          db.createObjectStore("audio_cache", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("tafsir_cache")) {
          db.createObjectStore("tafsir_cache", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("generic_cache")) {
          db.createObjectStore("generic_cache", { keyPath: "key" });
        }
      };
      request.onsuccess = function (e) {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      request.onerror = function (err) {
        console.warn("[ThimarOffline] IndexedDB open error", err);
        resolve(null);
      };
    });
  }

  // Caching mechanism: Try Cache API first, fallback to IndexedDB Blobs
  async function cacheAudioBlob(key, blob) {
    try {
      if ("caches" in window) {
        var cache = await window.caches.open(CACHE_NAME);
        var response = new Response(blob, {
          headers: { "Content-Type": blob.type || "audio/mpeg" }
        });
        await cache.put(key, response);
        return true;
      }
    } catch (e) {
      console.warn("[ThimarOffline] Cache API save failed, using IndexedDB", e);
    }

    // Fallback to IndexedDB
    try {
      var db = await openDatabase();
      if (!db) return false;
      return new Promise(function (resolve) {
        var tx = db.transaction("audio_cache", "readwrite");
        var store = tx.objectStore("audio_cache");
        store.put({ key: key, blob: blob, updatedAt: Date.now() });
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    } catch (e) {
      return false;
    }
  }

  async function getCachedAudioBlob(key) {
    // 1. Check Cache API
    try {
      if ("caches" in window) {
        var cache = await window.caches.open(CACHE_NAME);
        var res = await cache.match(key);
        if (res) {
          return await res.blob();
        }
      }
    } catch (e) {}

    // 2. Check IndexedDB
    try {
      var db = await openDatabase();
      if (!db) return null;
      return new Promise(function (resolve) {
        var tx = db.transaction("audio_cache", "readonly");
        var store = tx.objectStore("audio_cache");
        var req = store.get(key);
        req.onsuccess = function () {
          resolve(req.result ? req.result.blob : null);
        };
        req.onerror = function () { resolve(null); };
      });
    } catch (e) {
      return null;
    }
  }

  async function isAudioCached(key) {
    var blob = await getCachedAudioBlob(key);
    return Boolean(blob);
  }

  // Download and cache any audio file locally
  async function fetchAndCacheAudio(url, key, onProgress) {
    key = key || url;
    // Check if already cached
    var existing = await getCachedAudioBlob(key);
    if (existing) {
      return URL.createObjectURL(existing);
    }

    try {
      var response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Audio download failed: " + response.status);
      var blob = await response.blob();
      await cacheAudioBlob(key, blob);
      return URL.createObjectURL(blob);
    } catch (err) {
      console.warn("[ThimarOffline] fetch audio failed, fallback to direct url", err);
      return url; // fallback to direct URL
    }
  }

  // Tafsir Caching
  async function saveTafsirLocally(surah, ayah, edition, text) {
    var key = "tafsir_" + edition + "_" + surah + "_" + ayah;
    try {
      var db = await openDatabase();
      if (db) {
        var tx = db.transaction("tafsir_cache", "readwrite");
        tx.objectStore("tafsir_cache").put({ key: key, text: text, time: Date.now() });
      } else {
        localStorage.setItem(key, text);
      }
    } catch (e) {
      try { localStorage.setItem(key, text); } catch (err) {}
    }
  }

  async function getTafsirLocally(surah, ayah, edition) {
    var key = "tafsir_" + edition + "_" + surah + "_" + ayah;
    try {
      var db = await openDatabase();
      if (db) {
        return new Promise(function (resolve) {
          var tx = db.transaction("tafsir_cache", "readonly");
          var req = tx.objectStore("tafsir_cache").get(key);
          req.onsuccess = function () {
            resolve(req.result ? req.result.text : null);
          };
          req.onerror = function () { resolve(null); };
        });
      }
    } catch (e) {}
    return localStorage.getItem(key);
  }

  async function fetchAndCacheTafsir(surah, ayah, edition) {
    edition = edition || "ar.muyassar";
    var cached = await getTafsirLocally(surah, ayah, edition);
    if (cached) return cached;

    // Fetch from Quran.com API or AlQuran.cloud API
    var urls = [
      "https://api.alquran.cloud/v1/ayah/" + surah + ":" + ayah + "/" + edition,
      "https://api.quran.com/api/v4/tafsirs/" + edition + "/by_ayah/" + surah + ":" + ayah
    ];

    for (var i = 0; i < urls.length; i++) {
      try {
        var res = await fetch(urls[i]);
        if (res.ok) {
          var data = await res.json();
          var text = "";
          if (data && data.data && data.data.text) {
            text = data.data.text;
          } else if (data && data.tafsir && data.tafsir.text) {
            text = data.tafsir.text;
          }
          if (text) {
            await saveTafsirLocally(surah, ayah, edition, text);
            return text;
          }
        }
      } catch (err) {}
    }

    // Fallback explanation if offline and not previously cached
    return "تفسير الآية الكريمة: قوله تعالى يوضح المعنى الإيماني والأحكام الجليلة في هذه الآية المباركة. (يرجى الاتصال بالإنترنت أول مرة لتحميل نص التفسير الكامل لهذا المفسر وحفظه محليًا).";
  }

  // Location Management (Requirement 8)
  var LS_SAVED_LOC = "thimar_saved_user_location";

  function getSavedLocation() {
    try {
      var raw = localStorage.getItem(LS_SAVED_LOC);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function saveLocation(loc) {
    if (!loc) return;
    try {
      loc.savedAt = Date.now();
      localStorage.setItem(LS_SAVED_LOC, JSON.stringify(loc));
      window.dispatchEvent(new CustomEvent("thimar_location_updated", { detail: loc }));
    } catch (e) {}
  }

  function requestAndSaveLocation(onSuccess, onError) {
    if (!navigator.geolocation) {
      if (onError) onError(new Error("المتصفح لا يدعم تحديد الموقع"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        var loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "موقعي الحالي",
          accuracy: pos.coords.accuracy,
          isUserGps: true
        };
        saveLocation(loc);
        if (onSuccess) onSuccess(loc);
      },
      function (err) {
        if (onError) onError(err);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3600000 }
    );
  }

  // Adhan Selection & Persistence (Requirement 2)
  var LS_ADHAN_ID = "thimar_selected_adhan_id";

  function getSelectedAdhan() {
    var id = localStorage.getItem(LS_ADHAN_ID) || "adhan_makkah";
    var match = ADHAN_VOICES.find(function (v) { return v.id === id; });
    return match || ADHAN_VOICES[0];
  }

  async function setSelectedAdhan(adhanId) {
    var adhan = ADHAN_VOICES.find(function (v) { return v.id === adhanId; });
    if (!adhan) return null;
    localStorage.setItem(LS_ADHAN_ID, adhan.id);
    // Trigger download and local caching immediately
    await fetchAndCacheAudio(adhan.url, "adhan_" + adhan.id);
    return adhan;
  }

  // Get active Adhan audio source (returns cached local object URL or fallback)
  async function getAdhanAudioSource() {
    var selected = getSelectedAdhan();
    var key = "adhan_" + selected.id;
    var cached = await getCachedAudioBlob(key);
    if (cached) {
      return URL.createObjectURL(cached);
    }
    // Try to cache in background
    fetchAndCacheAudio(selected.url, key).catch(function () {});
    return selected.url;
  }

  // Quran Ayah Audio helper
  function getAyahAudioUrl(surah, ayah, reciterFolder) {
    reciterFolder = reciterFolder || "Alafasy_128kbps";
    var sStr = String(surah).padStart(3, "0");
    var aStr = String(ayah).padStart(3, "0");
    return "https://everyayah.com/data/" + reciterFolder + "/" + sStr + aStr + ".mp3";
  }

  // Export to window
  window.ThimarOffline = Object.assign(window.ThimarOffline || {}, {
    ADHAN_VOICES: ADHAN_VOICES,
    QURAN_RECITERS: QURAN_RECITERS,
    TAFSIR_EDITIONS: TAFSIR_EDITIONS,
    cacheAudioBlob: cacheAudioBlob,
    getCachedAudioBlob: getCachedAudioBlob,
    isAudioCached: isAudioCached,
    fetchAndCacheAudio: fetchAndCacheAudio,
    saveTafsirLocally: saveTafsirLocally,
    getTafsirLocally: getTafsirLocally,
    fetchAndCacheTafsir: fetchAndCacheTafsir,
    getSavedLocation: getSavedLocation,
    saveLocation: saveLocation,
    requestAndSaveLocation: requestAndSaveLocation,
    getSelectedAdhan: getSelectedAdhan,
    setSelectedAdhan: setSelectedAdhan,
    getAdhanAudioSource: getAdhanAudioSource,
    getAyahAudioUrl: getAyahAudioUrl
  });

})(window);
