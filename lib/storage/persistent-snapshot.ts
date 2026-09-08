import { promises as fs } from 'node:fs'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { appSnapshots } from '@/lib/db/schema'

export type PersistentSnapshot = {
  id: string
  data: Record<string, unknown>
  updated_at: string
}

type LocalStore = Record<string, PersistentSnapshot>

const localFile = process.env.THIMAR_LOCAL_DATA_FILE?.trim() || path.join(process.cwd(), '.data', 'teacher-platform.json')
const hasNeon = Boolean(process.env.DATABASE_URL?.trim())
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
    const parsed: unknown = JSON.parse(contents)
    return isRecord(parsed) ? parsed as LocalStore : {}
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
      console.warn('[v0] Local snapshot read failed', error)
    }
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

export function getStorageMode(): 'neon' | 'local' {
  return hasNeon ? 'neon' : 'local'
}

export async function getPersistentSnapshot(id: string): Promise<PersistentSnapshot | null> {
  if (hasNeon) {
    try {
      return await getNeonSnapshot(id)
    } catch (error) {
      console.warn('[v0] Neon snapshot read failed; using local Dyad storage', error)
    }
  }
  return getLocalSnapshot(id)
}

export async function upsertPersistentSnapshot(id: string, data: Record<string, unknown>): Promise<PersistentSnapshot> {
  if (hasNeon) {
    try {
      return await upsertNeonSnapshot(id, data)
    } catch (error) {
      console.warn('[v0] Neon snapshot write failed; using local Dyad storage', error)
    }
  }
  return upsertLocalSnapshot(id, data)
}
