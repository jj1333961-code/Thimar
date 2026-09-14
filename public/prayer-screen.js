/* ============================================================
   شاشة الصلاة والأذان — مكوّن واحد ديناميكي (PrayerTimeScreen)
   ------------------------------------------------------------
   لا يوجد صور منفصلة لكل صلاة — واجهة واحدة تتغير بياناتها تلقائيًا
   حسب الصلاة الحالية (الفجر/الظهر/العصر/المغرب/العشاء).

   الاستخدام:
     window.THIMAR_PRAYER_SCREEN.show({
       prayerName, prayerKey, prayerTime,      // بيانات الصلاة
       gregorianDate, hijriDate,               // التاريخ (اختياري: يُحسب تلقائيًا)
       prayerMessage, ayahText, ayahRef,       // النصوص (اختياري: من الخريطة الافتراضية)
       adhanAudio                              // مسار صوت الأذان (اختياري)
     });

   العمل في الخلفية / Android Native:
     - إذا كان WebView يوفّر جسرًا باسم window.AndroidPrayerBridge
       فسيتم استدعاؤه لجدولة المنبهات وعرض الشاشة الكاملة وتشغيل الأذان
       من الطبقة الأصلية (Native) لضمان العمل والموقع في الخلفية.
     - على المتصفح العادي نستخدم Notification + Audio + واجهة ملء الشاشة.
   ============================================================ */
(function () {
  "use strict";

  var LS_ADHAN = "thimar_prayer_adhan_enabled"; // "1" مفعّل / "0" معطّل
  var LS_SHOWN = "thimar_prayer_shown";          // منع التكرار: "YYYY-MM-DD:Key"
  var DEFAULT_ADHAN = "/audio/adhan.mp3";
  var FALLBACK_ADHAN = "/audio/notification-chime.mp3";

  /* ---------- المحتوى الديني لكل صلاة (يتغيّر تلقائيًا) ---------- */
  var PRAYER_CONTENT = {
    Fajr: {
      message: "استقبل يومك بركعتين خير من الدنيا وما فيها",
      ayah: "﴿وَقُرْآنَ الْفَجْرِ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا﴾",
      ref: "(الإسراء: 78)",
    },
    Dhuhr: {
      message: "خذ من وسط نهارك سكينةً بين يدي الله",
      ayah: "﴿حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ﴾",
      ref: "(البقرة: 238)",
    },
    Asr: {
      message: "لا تُفرِّط في صلاة العصر فإنها الصلاة الوسطى",
      ayah: "﴿وَأَقِيمُوا الصَّلَاةَ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾",
      ref: "(النساء: 103)",
    },
    Maghrib: {
      message: "اختم نهارك بشكرٍ وصلاةٍ عند غروب الشمس",
      ayah: "﴿فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ﴾",
      ref: "(الروم: 17)",
    },
    Isha: {
      message: "أنهِ يومك بالصلاة ونَمْ على طهارةٍ وذِكر",
      ayah: "﴿وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَكَ﴾",
      ref: "(الإسراء: 79)",
    },
  };
  var GENERIC_CONTENT = {
    message: "حافظ على صلاتك في وقتها",
    ayah: "﴿وَأَقِيمُوا الصَّلَاةَ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا﴾",
    ref: "(النساء: 103)",
  };

  /* ---------- أدوات ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function fmt12(hhmm) {
    if (!hhmm) return { t: "--:--", mer: "" };
    var p = String(hhmm).trim().split(":");
    var h = parseInt(p[0], 10), m = parseInt(p[1], 10) || 0;
    var mer = h >= 12 ? "م" : "ص";
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return { t: pad(h12) + ":" + pad(m), mer: mer };
  }

  function gregToday(date) {
    try {
      return new Intl.DateTimeFormat("ar-EG", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }).format(date || new Date());
    } catch (e) { return ""; }
  }
  function hijriToday(date) {
    try {
      return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        day: "numeric", month: "long", year: "numeric",
      }).format(date || new Date()) + " هـ";
    } catch (e) { return ""; }
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  /* ---------- إعداد تفعيل/تعطيل الأذان ---------- */
  function isAdhanEnabled() {
    try {
      var v = localStorage.getItem(LS_ADHAN);
      return v === null ? true : v === "1"; // مفعّل افتراضيًا
    } catch (e) { return true; }
  }
  function setAdhanEnabled(on) {
    try { localStorage.setItem(LS_ADHAN, on ? "1" : "0"); } catch (e) {}
    if (!on) stopAdhan();
    updateAdhanButton();
  }

  /* ---------- الأيقونات ---------- */
  var ICONS = {
    crescent:
      '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><path d="M40 8a24 24 0 1 0 16 42A20 20 0 1 1 40 8Z"/><path d="m52 10 2.2 4.6L59 16.8l-4.6 2.2L52 24l-2.2-4.6L45 16.8l4.6-2.2L52 10Z"/></svg>',
    mosque:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 56V30c0-11 9-18 20-18s20 7 20 18v26Z"/><path d="M32 6v6"/><circle cx="32" cy="30" r="9"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="M7.5 14h.01M12 14h.01M16.5 14h.01M7.5 18h.01M12 18h.01"/></svg>',
    kneel:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="20" cy="14" r="5"/><path d="M12 52c0-8 4-16 12-18l14-4"/><path d="M8 52h48"/><path d="M38 30c6 2 10 8 10 22"/></svg>',
    soundOn:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    soundOff:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>',
  };

  /* ---------- بناء الشاشة (مرة واحدة) ---------- */
  var root = null, els = {};
  var adhanAudio = null, hideTimer = null;

  function build() {
    if (root) return;
    root = document.createElement("div");
    root.className = "ps-screen";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "شاشة الصلاة");
    root.innerHTML =
      '<div class="ps-bg" aria-hidden="true"></div>' +
      '<button type="button" class="ps-close" aria-label="إغلاق">&times;</button>' +
      '<div class="ps-scroll">' +
        '<div class="ps-crescent" aria-hidden="true">' + ICONS.crescent + "</div>" +
        '<p class="ps-kicker">حان الآن وقت</p>' +
        '<h1 class="ps-title" data-ps-title>الصلاة</h1>' +
        '<p class="ps-sub" data-ps-message>حافظ على صلاتك في وقتها<small>فإن الصلاة تنهى عن الفحشاء والمنكر</small></p>' +
        '<div class="ps-divider" aria-hidden="true"><span>&#10086;</span></div>' +
        '<div class="ps-prayer-card">' +
          '<div class="ps-prayer-name" data-ps-name>صلاة</div>' +
          '<div class="ps-sep" aria-hidden="true"></div>' +
          '<div class="ps-prayer-time" data-ps-time><span>--:--</span><small></small></div>' +
          '<span class="ps-prayer-icon" aria-hidden="true">' + ICONS.mosque + "</span>" +
        "</div>" +
        '<div class="ps-date-card">' +
          '<div class="ps-date-lines">' +
            '<div class="ps-greg" data-ps-greg></div>' +
            '<div class="ps-hijri" data-ps-hijri></div>' +
          "</div>" +
          '<span class="ps-cal" aria-hidden="true">' + ICONS.calendar + "</span>" +
        "</div>" +
        '<div class="ps-ayah-card">' +
          '<p class="ps-ayah-head">قال تعالى:</p>' +
          '<p class="ps-ayah-text" data-ps-ayah></p>' +
          '<p class="ps-ayah-ref" data-ps-ayahref></p>' +
        "</div>" +
        '<div class="ps-cta">' +
          '<span class="ps-cta-icon" aria-hidden="true">' + ICONS.kneel + "</span>" +
          '<div class="ps-cta-text">' +
            '<div class="ps-cta-title">قم إلى الصلاة الآن</div>' +
            '<div class="ps-cta-sub">استعن بالله، وتوكل عليه، وابدأ يومك بذكره</div>' +
          "</div>" +
        "</div>" +
        '<div class="ps-controls">' +
          '<button type="button" class="ps-btn" data-ps-adhan-toggle></button>' +
        "</div>" +
      "</div>";

    document.body.appendChild(root);

    els.title = root.querySelector("[data-ps-title]");
    els.message = root.querySelector("[data-ps-message]");
    els.name = root.querySelector("[data-ps-name]");
    els.time = root.querySelector("[data-ps-time]");
    els.greg = root.querySelector("[data-ps-greg]");
    els.hijri = root.querySelector("[data-ps-hijri]");
    els.ayah = root.querySelector("[data-ps-ayah]");
    els.ayahRef = root.querySelector("[data-ps-ayahref]");
    els.adhanBtn = root.querySelector("[data-ps-adhan-toggle]");

    root.querySelector(".ps-close").addEventListener("click", hide);
    els.adhanBtn.addEventListener("click", function () { setAdhanEnabled(!isAdhanEnabled()); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.getAttribute("data-open") === "1") hide();
    });

    updateAdhanButton();
  }

  function updateAdhanButton() {
    if (!els.adhanBtn) return;
    var on = isAdhanEnabled();
    els.adhanBtn.classList.toggle("is-muted", !on);
    els.adhanBtn.innerHTML = (on ? ICONS.soundOn : ICONS.soundOff) +
      "<span>" + (on ? "الأذان مُفعَّل" : "الأذان مُعطَّل") + "</span>";
    els.adhanBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  /* ---------- تشغيل/إيقاف الأذان (محليًا بلا إنترنت) ---------- */
  function playAdhan(src) {
    if (!isAdhanEnabled()) return;
    try {
      if (!adhanAudio) {
        adhanAudio = new Audio();
        adhanAudio.preload = "auto";
        adhanAudio.addEventListener("error", function () {
          // في حال غياب ملف الأذان، نرجع إلى نغمة التنبيه المدمجة
          if (adhanAudio.src.indexOf(FALLBACK_ADHAN) === -1) {
            adhanAudio.src = FALLBACK_ADHAN;
            adhanAudio.play().catch(function () {});
          }
        });
      }
      adhanAudio.src = src || DEFAULT_ADHAN;
      adhanAudio.currentTime = 0;
      var p = adhanAudio.play();
      if (p && p.catch) p.catch(function () {
        // تشغيل تلقائي محظور قبل تفاعل المستخدم — نتجاهل بهدوء
        console.log("[v0] adhan autoplay blocked");
      });
    } catch (e) { console.log("[v0] adhan play failed", e); }
  }
  function stopAdhan() {
    try { if (adhanAudio) { adhanAudio.pause(); adhanAudio.currentTime = 0; } } catch (e) {}
  }

  /* ---------- الجسر مع Android Native (للعمل في الخلفية) ---------- */
  function nativeBridge() {
    return (typeof window !== "undefined" && window.AndroidPrayerBridge) || null;
  }

  // إشعار نظام (متصفح) — يعمل حتى لو كان التبويب في الخلفية
  function systemNotify(prayerName, timeStr) {
    try {
      if (window.Notification && Notification.permission === "granted") {
        var n = new Notification("حان الآن وقت " + prayerName, {
          body: prayerName + " — " + timeStr,
          icon: "/apple-icon.png",
          tag: "thimar-prayer",           // منع تكرار الإشعار لنفس الصلاة
          renotify: false,
          silent: !isAdhanEnabled(),
        });
        n.onclick = function () { try { window.focus(); } catch (e) {} n.close(); };
      }
    } catch (e) {}
  }

  /* ---------- منع التكرار ---------- */
  function alreadyShown(key) {
    if (!key) return false;
    try { return localStorage.getItem(LS_SHOWN) === todayKey() + ":" + key; } catch (e) { return false; }
  }
  function markShown(key) {
    if (!key) return;
    try { localStorage.setItem(LS_SHOWN, todayKey() + ":" + key); } catch (e) {}
  }

  /* ============================================================
     الواجهة العامة: عرض الشاشة بالبيانات الديناميكية
     ============================================================ */
  function show(data) {
    data = data || {};
    var key = data.prayerKey || data.prayerName || "";

    // منع إظهار الشاشة/الأذان مرتين لنفس الصلاة في نفس اليوم
    if (data.dedupe !== false && alreadyShown(key)) return;
    markShown(key);

    var content = PRAYER_CONTENT[data.prayerKey] || GENERIC_CONTENT;
    var name = data.prayerName || "الصلاة";
    var f = fmt12(data.prayerTime);
    var timeStr = f.t + (f.mer ? " " + f.mer : "");

    // 1) إبلاغ الطبقة الأصلية (Native) إن وُجدت — تعرض شاشة كاملة وتشغّل الأذان في الخلفية
    var bridge = nativeBridge();
    if (bridge && typeof bridge.onPrayerEnter === "function") {
      try {
        bridge.onPrayerEnter(JSON.stringify({
          prayerName: name,
          prayerKey: data.prayerKey || "",
          prayerTime: data.prayerTime || "",
          timeDisplay: timeStr,
          gregorianDate: data.gregorianDate || gregToday(),
          hijriDate: data.hijriDate || hijriToday(),
          prayerMessage: data.prayerMessage || content.message,
          ayahText: data.ayahText || content.ayah,
          ayahRef: data.ayahRef || content.ref,
          adhanEnabled: isAdhanEnabled(),
          adhanAudio: data.adhanAudio || DEFAULT_ADHAN,
        }));
      } catch (e) {}
      // الطبقة الأصلية تتكفّل بالعرض والصوت — لا نكرّر على الويب
      systemNotifyMaybe(bridge, name, timeStr);
      return;
    }

    // 2) مسار الويب: بناء وإظهار الواجهة الديناميكية
    build();

    // العنوان الرئيسي يتغير ديناميكيًا لكل صلاة: الفجر، الظهر، العصر، المغرب، العشاء
    els.title.textContent = name;
    els.name.textContent = name;
    els.time.innerHTML = "<span>" + esc(f.t) + "</span>" + (f.mer ? "<small>" + esc(f.mer) + "</small>" : "");
    els.message.innerHTML = esc(data.prayerMessage || content.message) +
      "<small>فإن الصلاة تنهى عن الفحشاء والمنكر</small>";
    els.greg.textContent = data.gregorianDate || gregToday();
    els.hijri.textContent = data.hijriDate || hijriToday();
    els.ayah.textContent = data.ayahText || content.ayah;
    els.ayahRef.textContent = data.ayahRef || content.ref;
    updateAdhanButton();

    root.setAttribute("data-open", "1");
    document.body.style.overflow = "hidden";

    // 3) تشغيل الأذان محليًا + إشعار النظام + اهتزاز
    playAdhan(data.adhanAudio);
    systemNotify(name, timeStr);
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) {}

    // إغلاق تلقائي بعد فترة (يمكن للمستخدم الإغلاق يدويًا)
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 90000);
  }

  function systemNotifyMaybe(bridge, name, timeStr) {
    // إن كان الجسر لا يعرض إشعارًا بنفسه اترك المتصفح يعرضه
    if (!bridge || typeof bridge.showsNotification !== "function" || !bridge.showsNotification()) {
      systemNotify(name, timeStr);
    }
  }

  function hide() {
    stopAdhan();
    clearTimeout(hideTimer);
    if (root) root.setAttribute("data-open", "0");
    document.body.style.overflow = "";
  }

  /* ---------- جدولة المنبهات في الطبقة الأصلية (Android) ---------- */
  // تُستدعى من islamic-hub عند تحديث المواقيت/تغيّر الموقع لإعادة الجدولة
  function scheduleNative(timings, loc) {
    var bridge = nativeBridge();
    if (!bridge || typeof bridge.scheduleAlarms !== "function") return false;
    try {
      bridge.scheduleAlarms(JSON.stringify({
        timings: timings || {},              // { Fajr:"05:12", Dhuhr:"12:10", ... }
        location: loc || null,
        adhanEnabled: isAdhanEnabled(),
        adhanAudio: DEFAULT_ADHAN,
        date: todayKey(),
      }));
      return true;
    } catch (e) { return false; }
  }

  /* ---------- التصدير ---------- */
  window.THIMAR_PRAYER_SCREEN = {
    show: show,
    hide: hide,
    isAdhanEnabled: isAdhanEnabled,
    setAdhanEnabled: setAdhanEnabled,
    scheduleNative: scheduleNative,
    hasNativeBridge: function () { return !!nativeBridge(); },
  };
})();
