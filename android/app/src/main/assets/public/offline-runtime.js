(function () {
  'use strict';
  var DB = 'thimar-offline', VERSION = 2, CACHE = 'cache', QUEUE = 'sync_queue';
  var state = { syncing: false, pending: 0 };

  function openDb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) return reject(new Error('indexeddb-unavailable'));
      var r = indexedDB.open(DB, VERSION);
      r.onupgradeneeded = function () {
        var db = r.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains(CACHE)) db.createObjectStore(CACHE);
        if (!db.objectStoreNames.contains(QUEUE)) {
          var s = db.createObjectStore(QUEUE, { keyPath: 'id' });
          s.createIndex('createdAt', 'createdAt');
        }
      };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
  }

  function req(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error); };
    });
  }

  function readCache(key) {
    return openDb().then(function (db) {
      return req(db.transaction(CACHE, 'readonly').objectStore(CACHE).get(key)).then(function (record) {
        db.close();
        return record && record.value;
      });
    }).catch(function () { return null; });
  }

  function writeCache(key, value) {
    return openDb().then(function (db) {
      return req(db.transaction(CACHE, 'readwrite').objectStore(CACHE).put({ value: value, cachedAt: Date.now() }, key)).then(function () {
        db.close();
      });
    }).catch(function () {});
  }

  function readQueue() {
    return openDb().then(function (db) {
      return req(db.transaction(QUEUE, 'readonly').objectStore(QUEUE).getAll()).then(function (items) {
        db.close();
        return (items || []).sort(function (a, b) { return a.createdAt - b.createdAt; });
      });
    }).catch(function () { return []; });
  }

  function putQueue(item) {
    return openDb().then(function (db) {
      return req(db.transaction(QUEUE, 'readwrite').objectStore(QUEUE).put(item)).then(function () {
        db.close();
      });
    }).catch(function () {});
  }

  function deleteQueue(id) {
    return openDb().then(function (db) {
      return req(db.transaction(QUEUE, 'readwrite').objectStore(QUEUE).delete(id)).then(function () {
        db.close();
      });
    }).catch(function () {});
  }

  var statusHideTimer = null;
  function updateIndicator(messageAr, messageEn, tone) {
    var isEn = (localStorage.getItem('lang') === 'en');
    var text = isEn ? (messageEn || messageAr) : (messageAr || messageEn);

    var el = document.getElementById('thimar-offline-status');
    if (!el) {
      el = document.createElement('div');
      el.id = 'thimar-offline-status';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }

    var isOnline = (tone === 'online');
    var bgColor = isOnline ? '#15803d' : '#b45309';
    var iconSvg = isOnline
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>';

    el.innerHTML = '<span style="display:inline-flex;align-items:center;justify-content:center;">' + iconSvg + '</span>' +
                   '<span style="font-weight:600;letter-spacing:-0.01em;">' + text + '</span>';

    el.style.cssText = 'position:fixed;z-index:999999;top:16px;left:50%;transform:translateX(-50%) translateY(0);' +
      'display:inline-flex;align-items:center;gap:10px;padding:10px 20px;border-radius:9999px;' +
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Cairo",sans-serif;' +
      'font-size:14px;color:#ffffff;background:' + bgColor + ';' +
      'box-shadow:0 10px 25px -5px rgba(0,0,0,0.25),0 8px 10px -6px rgba(0,0,0,0.2);' +
      'border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(6px);' +
      'transition:opacity .35s cubic-bezier(0.16,1,0.3,1),transform .35s cubic-bezier(0.16,1,0.3,1);' +
      'pointer-events:none;max-width:92vw;direction:' + (isEn ? 'ltr' : 'rtl') + ';';

    if (statusHideTimer) clearTimeout(statusHideTimer);
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';

    statusHideTimer = setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(-14px)';
      statusHideTimer = null;
    }, 4500);
  }

  function refreshStatus() {
    return readQueue().then(function (items) {
      state.pending = items.length;
      var queueBadge = document.getElementById('thimar-sync-badge');
      if (queueBadge) {
        queueBadge.textContent = state.pending > 0 ? String(state.pending) : '';
        queueBadge.style.display = state.pending > 0 ? 'inline-flex' : 'none';
      }
    });
  }

  function endpointFor(url) {
    return /^\//.test(url) ? (window.__THIMAR_API_ORIGIN || '') + url : url;
  }

  function queueWrite(input) {
    return readQueue().then(function (items) {
      var previous = items.filter(function (item) {
        return item.resource === input.resource;
      }).sort(function (a, b) { return b.createdAt - a.createdAt; })[0];

      var item = {
        id: (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
        resource: input.resource,
        action: input.action,
        payload: input.payload,
        audit: input.audit || null,
        createdAt: Date.now(),
        attempts: 0,
        nextAttemptAt: Date.now(),
        idempotencyKey: (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
      };

      return (previous ? deleteQueue(previous.id) : Promise.resolve())
        .then(function () { return putQueue(item); })
        .then(refreshStatus);
    });
  }

  function flush() {
    if (!navigator.onLine || state.syncing) return Promise.resolve();
    state.syncing = true;
    return refreshStatus().then(readQueue).then(function (items) {
      return items.reduce(function (chain, item) {
        return chain.then(function () {
          if (item.nextAttemptAt > Date.now()) return;
          var fetcher = window.__thimarOriginalFetch || window.fetch;
          return fetcher(endpointFor('/api/data'), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Thimar-Idempotency-Key': item.idempotencyKey
            },
            body: JSON.stringify({ data: item.payload, audit: item.audit || null })
          }).then(function (response) {
            if (!response.ok) throw new Error('sync-' + response.status);
            return deleteQueue(item.id);
          }).catch(function (error) {
            item.attempts += 1;
            item.lastError = String(error.message || error);
            item.nextAttemptAt = Date.now() + Math.min(300000, Math.pow(2, item.attempts) * 2000);
            return putQueue(item);
          });
        });
      }, Promise.resolve());
    }).finally(function () {
      state.syncing = false;
      return refreshStatus();
    });
  }

  var originalFetch = (typeof window.fetch === 'function') ? window.fetch.bind(window) : null;
  window.__thimarOriginalFetch = originalFetch;

  function start() {
    // Register Service Worker for offline PWA functionality across all browsers
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
    }

    window.addEventListener('online', function () {
      updateIndicator('تم الاتصال بالإنترنت — المتصفح متصل الآن', 'Connected to the Internet — Online mode', 'online');
      flush();
    });

    window.addEventListener('offline', function () {
      updateIndicator('انقطع الاتصال بالإنترنت — تعمل المنصة بالوضع غير المتصل (أوفلاين)', 'Internet disconnected — Working in offline mode', 'offline');
    });

    refreshStatus();
    if (!navigator.onLine) {
      // Show initial offline badge if page is opened while disconnected
      setTimeout(function () {
        updateIndicator('المنصة تعمل بالوضع غير المتصل (بدون إنترنت)', 'Platform is working in offline mode', 'offline');
      }, 800);
    } else {
      flush();
    }
  }

  window.ThimarOfflineSession = {
    save: function (session) { return writeCache('auth:session', { session: session, savedAt: Date.now() }); },
    read: function () { return readCache('auth:session'); },
    clear: function () { return writeCache('auth:session', null); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.ThimarOffline = {
    flush: flush,
    refreshStatus: refreshStatus,
    readQueue: readQueue,
    enqueue: queueWrite,
    showIndicator: updateIndicator,
    isOffline: function () { return !navigator.onLine; }
  };
}());
