import { NextRequest, NextResponse } from 'next/server'
import { session } from '@/app/api/auth/google/route'

export async function requireUser(request: Request) {
  const nextRequest = request instanceof NextRequest ? request : new NextRequest(request.url, { headers: request.headers })
  const user = await session(nextRequest)
  if (!user) return { response: NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 }), user: null }
  return { response: null, user }
}

export async function requireAdmin(request: Request) {
  const result = await requireUser(request)
  if (result.response) return result
  const configured = (process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean)
  if (!configured.includes(String(result.user?.email || '').toLowerCase())) {
    return { response: NextResponse.json({ error: 'لا تملك صلاحية المسؤول' }, { status: 403 }), user: null }
  }
  return result
}
