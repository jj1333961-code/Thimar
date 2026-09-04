import { NextResponse } from 'next/server'

export function rejectCrossOrigin(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      if (new URL(origin).origin !== requestUrl.origin) {
        return NextResponse.json({ error: 'مصدر الطلب غير مسموح' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'مصدر الطلب غير صالح' }, { status: 403 })
    }
  }

  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    return NextResponse.json({ error: 'مصدر الطلب غير مسموح' }, { status: 403 })
  }

  return null
}
