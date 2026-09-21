import { promises as fs } from 'node:fs'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { db, isPostgresConfigured, isPostgresHealthy, markPostgresUnavailable } from '@/lib/db'
import { appSnapshots } from '@/lib/db/schema'
import { createSupabaseAdmin, isServerSupabaseConfigured } from '@/lib/supabase/server'
import { adminDb, isFirestoreEnabled, setFirestoreEnabled } from '@/lib/firebase-admin'

export type PersistentSnapshot = {
  id: string
  data: Record<string, unknown>
  updated_at: string
}

type LocalStore = Record<string, PersistentSnapshot>

const localFile = process.env.THIMAR_LOCAL_DATA_FILE?.trim() || path.join(process.cwd(), '.data', 'teacher-platform.json')
const hasNeon = () => isPostgresConfigured() && isPostgresHealthy()
let localQueue = Promise.resolve()

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asSnapshot(row: { id: string; data: unknown; updatedAt: Date }): PersistentSnapshot {
  return {
    id: row.id,
    data: isRecord(row.data) ? row.data : {},
    updated_at: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : new Date(row.updatedAt).toISOString(),
  }
}

async function readLocalStore(): Promise<LocalStore> {
  try {
    const contents = await fs.readFile(/* turbopackIgnore: true */ localFile, 'utf8')
    if (!contents || !contents.trim()) return {}
    const parsed: unknown = JSON.parse(contents)
    return isRecord(parsed) ? parsed as LocalStore : {}
  } catch {
    return {}
  }
}

async function writeLocalStore(store: LocalStore) {
  await fs.mkdir(path.dirname(localFile), { recursive: true })
  const temporaryFile = `${localFile}.${process.pid}.${Date.now()}.tmp`
  await fs.writeFile(/* turbopackIgnore: true */ temporaryFile, JSON.stringify(store, null, 2), 'utf8')
  await fs.rename(temporaryFile, localFile)
}

function withLocalLock<T>(task: () => Promise<T>): Promise<T> {
  const next = localQueue.then(task, task)
  localQueue = next.then(() => undefined, () => undefined)
  return next
}

async function getLocalSnapshot(id: string): Promise<PersistentSnapshot | null> {
  return withLocalLock(async () => {
    const store = await readLocalStore()
    return store[id] || null
  })
}

async function upsertLocalSnapshot(id: string, data: Record<string, unknown>): Promise<PersistentSnapshot> {
  return withLocalLock(async () => {
    const store = await readLocalStore()
    const snapshot: PersistentSnapshot = { id, data, updated_at: new Date().toISOString() }
    store[id] = snapshot
    await writeLocalStore(store)
    return snapshot
  })
}

async function getSupabaseSnapshot(id: string): Promise<PersistentSnapshot | null> {
  const supabase = createSupabaseAdmin()
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from('app_snapshots').select('id, data, updated_at').eq('id', id).maybeSingle()
    if (error || !data) return null
    return {
      id: data.id,
      data: isRecord(data.data) ? data.data : {},
      updated_at: data.updated_at || new Date().toISOString(),
    }
  } catch {
    return null
  }
}

async function upsertSupabaseSnapshot(id: string, data: Record<string, unknown>): Promise<void> {
  const supabase = createSupabaseAdmin()
  if (!supabase) return
  try {
    await supabase.from('app_snapshots').upsert({
      id,
      data,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('[v0] Supabase snapshot sync failed (continuing)', error)
  }
}

async function getFirestoreSnapshot(id: string): Promise<PersistentSnapshot | null> {
  if (!adminDb || !isFirestoreEnabled) return null
  try {
    const doc = await adminDb.collection('app_snapshots').doc(id).get()
    if (!doc.exists) return null
    const data = doc.data()
    return {
      id: doc.id,
      data: isRecord(data?.data) ? data!.data : {},
      updated_at: data?.updated_at || new Date().toISOString(),
    }
  } catch (error: any) {
    if (error.message?.includes('PERMISSION_DENIED')) {
      console.warn('[v0] Firestore API not enabled. Disabling Firestore fallback.')
      setFirestoreEnabled(false)
    } else {
      console.warn('[v0] Firestore snapshot fetch failed', error)
    }
    return null
  }
}

async function upsertFirestoreSnapshot(id: string, data: Record<string, unknown>): Promise<void> {
  if (!adminDb || !isFirestoreEnabled) return
  try {
    await adminDb.collection('app_snapshots').doc(id).set({
      data,
      updated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    if (error.message?.includes('PERMISSION_DENIED')) {
      console.warn('[v0] Firestore API not enabled. Disabling Firestore fallback.')
      setFirestoreEnabled(false)
    } else {
      console.warn('[v0] Firestore snapshot sync failed', error)
    }
  }
}

async function getNeonSnapshot(id: string): Promise<PersistentSnapshot | null> {
  const rows = await db.select().from(appSnapshots).where(eq(appSnapshots.id, id)).limit(1)
  return rows[0] ? asSnapshot(rows[0]) : null
}

async function upsertNeonSnapshot(id: string, data: Record<string, unknown>): Promise<PersistentSnapshot> {
  const [row] = await db
    .insert(appSnapshots)
    .values({ id, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSnapshots.id,
      set: { data, updatedAt: new Date() },
    })
    .returning()
  return asSnapshot(row)
}

let memoryCache: { id: string; snapshot: PersistentSnapshot; cachedAt: number } | null = null
const MEMORY_CACHE_TTL = 15000

export function getStorageMode(): 'supabase' | 'neon' | 'local' {
  if (isServerSupabaseConfigured()) return 'supabase'
  return hasNeon() ? 'neon' : 'local'
}

export async function getPersistentSnapshot(id: string): Promise<PersistentSnapshot | null> {
  // 1. Ultra-fast memory cache hit (< 0.1ms)
  if (memoryCache && memoryCache.id === id && Date.now() - memoryCache.cachedAt < MEMORY_CACHE_TTL) {
    return memoryCache.snapshot
  }

  // 2. Fast local disk snapshot (< 1ms)
  const local = await getLocalSnapshot(id)
  if (local && local.data && Object.keys(local.data).length > 0) {
    memoryCache = { id, snapshot: local, cachedAt: Date.now() }
    return local
  }

  // 3. Fallback to cloud sources only if local snapshot is empty/missing
  if (isFirestoreEnabled) {
    try {
      const snap = await Promise.race([
        getFirestoreSnapshot(id),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Firestore Timeout')), 800))
      ])
      if (snap) {
        memoryCache = { id, snapshot: snap, cachedAt: Date.now() }
        upsertLocalSnapshot(id, snap.data).catch(() => {})
        return snap
      }
    } catch {
      // Fallback
    }
  }

  if (isServerSupabaseConfigured()) {
    try {
      const snap = await Promise.race([
        getSupabaseSnapshot(id),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Supabase Timeout')), 800))
      ])
      if (snap) {
        memoryCache = { id, snapshot: snap, cachedAt: Date.now() }
        upsertLocalSnapshot(id, snap.data).catch(() => {})
        return snap
      }
    } catch {
      // Quiet fallback
    }
  }

  if (hasNeon()) {
    try {
      const snap = await Promise.race([
        getNeonSnapshot(id),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 800))
      ])
      if (snap) {
        memoryCache = { id, snapshot: snap, cachedAt: Date.now() }
        upsertLocalSnapshot(id, snap.data).catch(() => {})
        return snap
      }
    } catch {
      markPostgresUnavailable()
    }
  }

  return local
}

export async function upsertPersistentSnapshot(id: string, data: Record<string, unknown>): Promise<PersistentSnapshot> {
  // Save locally first with file lock for immediate persistence
  const localSnapshot = await upsertLocalSnapshot(id, data)
  memoryCache = { id, snapshot: localSnapshot, cachedAt: Date.now() }

  // Asynchronously sync to remote cloud databases in the background without blocking the user response
  queueMicrotask(() => {
    Promise.allSettled([
      isFirestoreEnabled ? upsertFirestoreSnapshot(id, data) : Promise.resolve(),
      isServerSupabaseConfigured() ? upsertSupabaseSnapshot(id, data) : Promise.resolve(),
      hasNeon() ? Promise.race([
        upsertNeonSnapshot(id, data),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1500))
      ]).catch(() => markPostgresUnavailable()) : Promise.resolve(),
    ]).catch(() => {})
  })

  return localSnapshot
}
