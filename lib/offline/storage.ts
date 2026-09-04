const DB_NAME = 'thimar-offline'
const DB_VERSION = 1
const STORE_NAME = 'kv'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getOfflineValue<T>(key: string): Promise<T | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function setOfflineValue<T>(key: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}
