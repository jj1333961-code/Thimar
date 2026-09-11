import { NextResponse } from 'next/server'

export function rejectCrossOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')

  if (origin) {
    try {
      const originUrl = new URL(origin)
      const requestUrl = new URL(request.url)

      // Always allow if origins match directly
      if (originUrl.origin === requestUrl.origin) {
        return null
      }

      // Allow matching host or forwarded host behind reverse proxies
      if (host && (originUrl.host === host || originUrl.hostname === host.split(':')[0])) {
        return null
      }

      // Allow trusted preview and development environments
      const h = originUrl.hostname.toLowerCase()
      if (
        h === 'localhost' ||
        h === '127.0.0.1' ||
        h.endsWith('.run.app') ||
        h.endsWith('.vercel.app') ||
        h.endsWith('.google.com') ||
        h.endsWith('.googleusercontent.com') ||
        h.includes('ai.studio') ||
        originUrl.protocol === 'capacitor:' ||
        originUrl.protocol === 'ionic:' ||
        originUrl.protocol === 'file:'
      ) {
        return null
      }

      return NextResponse.json({ error: 'مصدر الطلب غير مسموح' }, { status: 403 })
    } catch {
      return NextResponse.json({ error: 'مصدر الطلب غير صالح' }, { status: 403 })
    }
  }

  return null
}

