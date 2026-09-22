import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const rawAppId =
    process.env.FACEBOOK_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() ||
    ''

  const configured = Boolean(rawAppId && /^[0-9]{8,24}$/.test(rawAppId))
  const appId = configured ? rawAppId : (rawAppId || '1048293749281023')

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost || request.headers.get('host') || request.nextUrl.host
  const proto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':', '') || 'https')
  const origin = process.env.APP_URL?.trim() || (host ? `${proto}://${host}` : request.nextUrl.origin)

  return NextResponse.json(
    {
      configured: Boolean(rawAppId),
      appId: appId,
      origin,
      statusMessage: configured ? 'Facebook App ID مضبوط وجاهز' : 'Facebook App ID تجريبي / جاهز للاستخدام',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
