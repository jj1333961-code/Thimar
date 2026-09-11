import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { getSessionSecret } from "@/lib/auth/session-secret"

export const dynamic = "force-dynamic"
const COOKIE = "teacher_google_state"
const SESSION = "teacher_google_session"

function getOrigin(request?: NextRequest): string {
  if (process.env.APP_URL?.trim()) {
    return process.env.APP_URL.trim().replace(/\/$/, "")
  }
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host")
    const host = forwardedHost || request.headers.get("host") || request.nextUrl.host
    const proto = request.headers.get("x-forwarded-proto") || (request.nextUrl.protocol.replace(":", "") || "https")
    if (host) return `${proto}://${host}`
    return request.nextUrl.origin
  }
  return "https://teacher-three-ashen.vercel.app"
}

function getAppPage(request?: NextRequest): string {
  return `${getOrigin(request)}/app.html`
}

function redirectUri(request?: NextRequest): string {
  return `${getOrigin(request)}/api/auth/google`
}

function isValidGoogleClientId(id?: string): boolean {
  if (!id) return false
  const trimmed = id.trim()
  if (
    trimmed.startsWith("your-") ||
    trimmed.includes("placeholder") ||
    trimmed.includes("example") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    !trimmed.endsWith(".apps.googleusercontent.com")
  ) {
    return false
  }
  return /^[0-9]+-[a-zA-Z0-9_\-]+\.apps\.googleusercontent\.com$/.test(trimmed)
}

function config() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret || !isValidGoogleClientId(clientId)) {
    throw new Error("Google OAuth غير مهيأ على الخادم بمعرف عميل صالح")
  }
  return { clientId, clientSecret }
}
function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url")
}
function sessionValue(email: string, name: string, secret: string) {
  const payload = Buffer.from(JSON.stringify({ email, name, issuedAt: Date.now() })).toString("base64url")
  return `${payload}.${sign(payload, secret)}`
}
function verify(value: string, secret: string) {
  const [payload, signature] = value.split(".")
  if (!payload || !signature) return null
  const expected = sign(payload, secret)
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    const issuedAt = Number(parsed.issuedAt)
    const maxAge = 60 * 60 * 24 * 7 * 1000
    if (typeof parsed.email !== "string" || !Number.isFinite(issuedAt) || Date.now() - issuedAt < 0 || Date.now() - issuedAt > maxAge) return null
    return parsed
  } catch { return null }
}

export async function GET(request: NextRequest) {
  const appPage = getAppPage(request)
  const cb = redirectUri(request)
  try {
    const { clientId, clientSecret } = config()
    const url = new URL(request.url)
    // Older bookmarks may still start OAuth on teacher.vercel.app. Move the
    // browser to the canonical production origin before creating state/cookies.
    if (url.hostname === "teacher.vercel.app") {
      const canonical = new URL(`${cb}${url.search}`)
      return NextResponse.redirect(canonical)
    }
    const code = url.searchParams.get("code")
    const error = url.searchParams.get("error")
    if (!code) {
      const state = randomBytes(24).toString("base64url")
      const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth")
      auth.searchParams.set("client_id", clientId)
      auth.searchParams.set("redirect_uri", cb)
      auth.searchParams.set("response_type", "code")
      auth.searchParams.set("scope", "openid email profile")
      auth.searchParams.set("state", state)
      auth.searchParams.set('prompt', url.searchParams.get('prompt') || 'select_account')
      if (error) { const response = NextResponse.redirect(`${appPage}?google_error=cancelled`); response.cookies.delete(COOKIE); return response }
      const response = NextResponse.redirect(auth)
      response.cookies.set(COOKIE, state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 })
      return response
    }
    const state = request.cookies.get(COOKIE)?.value
    const returnedState = url.searchParams.get("state")
    if (!state || !returnedState || state !== returnedState) return NextResponse.redirect(`${appPage}?google_error=invalid_state`)
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: cb, grant_type: "authorization_code" }), cache: "no-store" })
    if (!tokenResponse.ok) return NextResponse.redirect(`${appPage}?google_error=token_exchange`)
    const tokens = await tokenResponse.json()
    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` }, cache: "no-store" })
    if (!userResponse.ok) return NextResponse.redirect(`${appPage}?google_error=userinfo`)
    const user = await userResponse.json()
    if (typeof user.email !== "string" || user.email_verified !== true) return NextResponse.redirect(`${appPage}?google_error=email_not_verified`)
    const response = NextResponse.redirect(`${appPage}?google=success`)
    response.cookies.set(SESSION, sessionValue(user.email, typeof user.name === "string" ? user.name : "", getSessionSecret()), { httpOnly: true, secure: request.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 })
    response.cookies.delete(COOKIE)
    return response
  } catch { return NextResponse.redirect(`${appPage}?google_error=not_configured`) }
}

export async function POST(request: NextRequest) {
  try {
    const { clientId } = config()
    return NextResponse.json({ configured: Boolean(clientId), redirectUri: redirectUri(request) }, { headers: { "cache-control": "no-store" } })
  } catch { return NextResponse.json({ configured: false }, { status: 503 }) }
}

export async function session(request: NextRequest) {
  const secret = getSessionSecret()
  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null
  const value = bearerToken || request.cookies.get(SESSION)?.value
  return secret && value ? verify(value, secret) : null
}
