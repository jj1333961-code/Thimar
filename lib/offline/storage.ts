const DB_NAME = 'thimar-offline'
const DB_VERSION = 2
const KV_STORE = 'kv'
const CACHE_STORE = 'cache'
const QUEUE_STORE = 'sync_queue'

export type SyncOperation = {
  id: string
  resource: string
  action: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  createdAt: number
  attempts: number
  nextAttemptAt: number
  idempotencyKey: string
  lastError?: string
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('indexeddb-unavailable'))
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE)
      if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE)
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' })
        store.createIndex('nextAttemptAt', 'nextAttemptAt')
        store.createIndex('createdAt', 'createdAt')
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function storeValue<T>(storeName: string, key: IDBValidKey, value: T): Promise<void> {
  const db = await openDatabase()
  await requestResult(db.transaction(storeName, 'readwrite').objectStore(storeName).put(value, key))
  db.close()
}

async function readValue<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDatabase()
  const result = await requestResult(db.transaction(storeName, 'readonly').objectStore(storeName).get(key))
  db.close()
  return result as T | undefined
}

export async function getOfflineValue<T>(key: string): Promise<T | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  return readValue<T>(KV_STORE, key)
}

export async function setOfflineValue<T>(key: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  return storeValue(KV_STORE, key, value)
}

export async function cacheOfflineData<T>(key: string, value: T): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  return storeValue(CACHE_STORE, key, { value, cachedAt: Date.now() })
}

export async function getCachedOfflineData<T>(key: string): Promise<T | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  const record = await readValue<{ value: T }>(CACHE_STORE, key)
  return record?.value
}

export async function enqueueSyncOperation(input: Omit<SyncOperation, 'id' | 'createdAt' | 'attempts' | 'nextAttemptAt' | 'idempotencyKey'>): Promise<SyncOperation> {
  const now = Date.now()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${now}-${Math.random().toString(36).slice(2)}`
  const operation: SyncOperation = { ...input, id, createdAt: now, attempts: 0, nextAttemptAt: now, idempotencyKey: id }
  if (typeof indexedDB !== 'undefined') await storeValue(QUEUE_STORE, id, operation)
  return operation
}

export async function listSyncQueue(): Promise<SyncOperation[]> {
  if (typeof indexedDB === 'undefined') return []
  const db = await openDatabase()
  const rows = await requestResult<SyncOperation[]>(db.transaction(QUEUE_STORE, 'readonly').objectStore(QUEUE_STORE).getAll())
  db.close()
  return rows.sort((a, b) => a.createdAt - b.createdAt)
}

export async function removeSyncOperation(id: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  await requestResult(db.transaction(QUEUE_STORE, 'readwrite').objectStore(QUEUE_STORE).delete(id))
  db.close()
}

export async function updateSyncOperation(operation: SyncOperation): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  await storeValue(QUEUE_STORE, operation.id, operation)
}

export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine
}

export function supportsOfflineStorage(): boolean {
  return typeof indexedDB !== 'undefined'
}

export async function clearOfflineData(): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  const tx = db.transaction([CACHE_STORE, QUEUE_STORE], 'readwrite')
  tx.objectStore(CACHE_STORE).clear()
  tx.objectStore(QUEUE_STORE).clear()
  await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error) })
  db.close()
}
