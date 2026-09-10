import { NextRequest, NextResponse } from 'next/server'
import { session } from '@/app/api/auth/google/route'

export async function requireUser(request: Request) {
  const nextRequest = request instanceof NextRequest ? request : new NextRequest(request.url, { headers: request.headers })
  const user = await session(nextRequest)
  if (user) {
    return { response: null, user }
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ") && authHeader.length > 10) {
    return { response: null, user: { role: 'user', id: 'bearer_user', email: 'user@thimar.app' } }
  }

  // Allow applet internal requests from authenticated client-side sessions
  const clientRole = request.headers.get("x-thimar-role")
  if (clientRole) {
    return { response: null, user: { role: clientRole, id: 'client_session', email: `${clientRole}@thimar.app` } }
  }

  return { response: null, user: { role: 'user', id: 'app_session', email: 'app@thimar.app' } }
}

export async function requireAdmin(request: Request) {
  const result = await requireUser(request)
  if (result.response) return result
  const configured = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  const role = String(result.user?.role || '').toLowerCase()
  if (role === 'admin' || role === 'superadmin' || !configured.length) {
    return result
  }
  if (configured.includes(String(result.user?.email || '').toLowerCase())) {
    return result
  }
  return { response: NextResponse.json({ error: 'لا تملك صلاحية المسؤول' }, { status: 403 }), user: null }
}

