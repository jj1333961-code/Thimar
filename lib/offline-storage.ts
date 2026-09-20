/**
 * Thimar Offline Asset & Storage Manager
 * Enables caching and offline-first retrieval for:
 * - Adhan audio recordings
 * - Quran recitations per Ayah or Surah
 * - Quran Tafsir datasets (by Sheikh / Madhhab)
 * - Tuhfat Al-Atfal poetry audio & texts
 */

const CACHE_NAME = 'thimar-offline-assets-v1'
const DB_NAME = 'thimar_offline_db'
const DB_VERSION = 1
const STORE_METADATA = 'asset_metadata'
const STORE_DATA = 'offline_data'

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result as IDBDatabase
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' })
        }
        if (!db.objectStoreNames.contains(STORE_DATA)) {
          db.createObjectStore(STORE_DATA, { keyPath: 'id' })
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

/**
 * Downloads an external asset (audio/pdf/json) and caches it locally
 */
export async function downloadAndCacheAsset(
  key: string,
  url: string,
  meta?: { title?: string; category?: 'adhan' | 'quran' | 'tafsir' | 'tuhfa'; reciter?: string }
): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) {
      // In case of CORS or local mock, synthesize or clone if available
      console.warn(`[OfflineStorage] Fetch status ${res.status} for ${url}`)
    }
    const blob = await res.blob()

    // Store in Cache API
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME)
      const fakeReq = new Request(`https://thimar.local/assets/${encodeURIComponent(key)}`)
      const cachedRes = new Response(blob, {
        headers: {
          'Content-Type': blob.type || 'audio/mpeg',
          'Content-Length': String(blob.size),
          'X-Thimar-Downloaded': String(Date.now()),
        },
      })
      await cache.put(fakeReq, cachedRes)
    }

    // Store metadata in IndexedDB
    const db = await openDB()
    if (db) {
      const tx = db.transaction(STORE_METADATA, 'readwrite')
      const store = tx.objectStore(STORE_METADATA)
      store.put({
        key,
        url,
        size: blob.size,
        type: blob.type,
        title: meta?.title || key,
        category: meta?.category || 'general',
        reciter: meta?.reciter,
        downloadedAt: Date.now(),
      })
    }

    // Also notify listeners
    window.dispatchEvent(new CustomEvent('thimar:asset-cached', { detail: { key, ...meta } }))
    return true
  } catch (err) {
    console.error('[OfflineStorage] Download error:', err)
    return false
  }
}

/**
 * Retrieves a playable object URL for an offline asset, or falls back to original URL
 */
export async function getAssetPlayableUrl(key: string, fallbackUrl?: string): Promise<string> {
  if (typeof window === 'undefined') return fallbackUrl || ''

  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME)
      const fakeReq = new Request(`https://thimar.local/assets/${encodeURIComponent(key)}`)
      const res = await cache.match(fakeReq)
      if (res) {
        const blob = await res.blob()
        return URL.createObjectURL(blob)
      }
    }
  } catch (err) {
    console.warn('[OfflineStorage] Cache match error:', err)
  }

  return fallbackUrl || ''
}

/**
 * Checks if a specific asset key is downloaded and available offline
 */
export async function isAssetCached(key: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME)
      const fakeReq = new Request(`https://thimar.local/assets/${encodeURIComponent(key)}`)
      const match = await cache.match(fakeReq)
      if (match) return true
    }

    const db = await openDB()
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_METADATA, 'readonly')
        const req = tx.objectStore(STORE_METADATA).get(key)
        req.onsuccess = () => resolve(!!req.result)
        req.onerror = () => resolve(false)
      })
    }
  } catch {
    return false
  }

  return false
}

/**
 * Saves arbitrary JSON (e.g. whole Tafsir books) into local offline storage
 */
export async function saveOfflineData(id: string, data: any): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const db = await openDB()
    if (!db) {
      localStorage.setItem(`thimar_data_${id}`, JSON.stringify(data))
      return true
    }
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DATA, 'readwrite')
      tx.objectStore(STORE_DATA).put({ id, data, savedAt: Date.now() })
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
    })
  } catch {
    return false
  }
}

/**
 * Gets offline stored JSON data
 */
export async function getOfflineData<T = any>(id: string): Promise<T | null> {
  if (typeof window === 'undefined') return null
  try {
    const db = await openDB()
    if (!db) {
      const raw = localStorage.getItem(`thimar_data_${id}`)
      return raw ? JSON.parse(raw) : null
    }
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DATA, 'readonly')
      const req = tx.objectStore(STORE_DATA).get(id)
      req.onsuccess = () => resolve(req.result ? req.result.data : null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

/**
 * Delete a downloaded asset from cache
 */
export async function removeCachedAsset(key: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    if ('caches' in window) {
      const cache = await caches.open(CACHE_NAME)
      const fakeReq = new Request(`https://thimar.local/assets/${encodeURIComponent(key)}`)
      await cache.delete(fakeReq)
    }
    const db = await openDB()
    if (db) {
      const tx = db.transaction(STORE_METADATA, 'readwrite')
      tx.objectStore(STORE_METADATA).delete(key)
    }
    return true
  } catch {
    return false
  }
}
