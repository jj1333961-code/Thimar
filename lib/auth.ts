/**
 * Server-side authentication & authorization helpers
 *
 * HMAC-signed session tokens — no JWT library needed.
 * Tokens are stored in httpOnly cookies.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

const SECRET = process.env.AUTH_SECRET || process.env.SESSION_SECRET || 'thimar-fallback-secret-change-me'
const COOKIE_NAME = 'thimar_session'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionUser {
  userId: string
  username: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  displayName: string
}

export interface SessionPayload {
  userId: string
  username: string
  role: string
  displayName: string
  iat: number
  exp: number
}

// ===== Token helpers =====

function sign(payload: string): string {
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

function unsign(token: string): string | null {
  const idx = token.lastIndexOf('.')
  if (idx === -1) return null
  const payload = token.slice(0, idx)
  const sig = token.slice(idx + 1)
  const expected = createHmac('sha256', SECRET).update(payload).digest('hex')
  try {
    const sigBuf = Buffer.from(sig, 'hex')
    const expBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expBuf.length) return null
    if (!timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }
  return Buffer.from(payload, 'base64url').toString('utf8')
}

// ===== Create session cookie =====

export function createSessionCookie(user: SessionUser): string {
  const payload: SessionPayload = {
    userId: user.userId,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
  }
  const token = sign(JSON.stringify(payload))
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_MAX_AGE}`
}

// ===== Destroy session cookie =====

export function destroySessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

// ===== Parse session from cookie header =====

export function parseSession(cookieHeader: string | null): SessionUser | null {
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...rest] = c.trim().split('=')
      return [key, rest.join('=')]
    }),
  )

  const token = cookies[COOKIE_NAME]
  if (!token) return null

  const json = unsign(token)
  if (!json) return null

  try {
    const payload = JSON.parse(json) as SessionPayload
    if (!payload.userId || !payload.role) return null
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role as SessionUser['role'],
      displayName: payload.displayName,
    }
  } catch {
    return null
  }
}

// ===== API auth helpers =====

export interface AuthResult {
  authenticated: boolean
  user?: SessionUser
  error?: string
}

/**
 * Verify the request has a valid session.
 * Returns the user or an error response.
 */
export function authenticateRequest(request: Request): AuthResult {
  const cookieHeader = request.headers.get('cookie')
  const user = parseSession(cookieHeader)
  if (!user) {
    return { authenticated: false, error: 'غير مصرح — يرجى تسجيل الدخول' }
  }
  return { authenticated: true, user }
}

/**
 * Verify the request is from an admin.
 */
export function requireAdmin(request: Request): AuthResult {
  const auth = authenticateRequest(request)
  if (!auth.authenticated) return auth
  if (auth.user!.role !== 'admin') {
    return { authenticated: false, error: 'غير مصرح — الصلاحية المطلوبة: مسؤول' }
  }
  return auth
}

/**
 * Verify the request is from an admin or teacher.
 */
export function requireTeacher(request: Request): AuthResult {
  const auth = authenticateRequest(request)
  if (!auth.authenticated) return auth
  if (auth.user!.role !== 'admin' && auth.user!.role !== 'teacher') {
    return { authenticated: false, error: 'غير مصرح — الصلاحية المطلوبة: معلم أو مسؤول' }
  }
  return auth
}

/**
 * Create a JSON error response.
 */
export function authError(result: AuthResult, status = 401): Response {
  return Response.json(
    { error: result.error },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
}
