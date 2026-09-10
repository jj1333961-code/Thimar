import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let pool: Pool | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | any = null
let postgresHealthy = false

export function isPostgresConfigured(): boolean {
  const url = process.env.DATABASE_URL?.trim() || ''
  if (!url) return false
  // Avoid attempting connections to localhost/loopback placeholders in containers without a local Postgres service
  if (/@(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\//i.test(url)) {
    return false
  }
  return true
}

export function isPostgresHealthy(): boolean {
  return postgresHealthy
}

export function markPostgresUnavailable() {
  postgresHealthy = false
}

export function markPostgresAvailable() {
  postgresHealthy = true
}

function createChainableProxy(): any {
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      if (prop === 'then') {
        return (resolve: (val: any) => void) => resolve([])
      }
      if (prop === 'catch') {
        return () => Promise.resolve([])
      }
      return createChainableProxy()
    },
    apply: () => createChainableProxy(),
  }
  return new Proxy(() => {}, handler)
}

if (isPostgresConfigured()) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 1000,
      idleTimeoutMillis: 10_000,
      max: 5,
    })
    pool.on('error', () => {
      postgresHealthy = false
    })
    db = drizzle(pool, { schema })
    postgresHealthy = true
  } catch {
    pool = null
    postgresHealthy = false
  }
}

if (!db) {
  db = createChainableProxy()
}

export { pool, db }
