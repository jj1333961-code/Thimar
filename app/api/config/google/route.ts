import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function isValidGoogleClientId(id?: string): boolean {
  if (!id) return false
  const trimmed = id.trim()
  if (
    trimmed.startsWith('your-') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('example') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    !trimmed.endsWith('.apps.googleusercontent.com')
  ) {
    return false
  }
  // Google Client IDs are formatted as <numeric_project_id>-<hash>.apps.googleusercontent.com
  return /^[0-9]+-[a-zA-Z0-9_\-]+\.apps\.googleusercontent\.com$/.test(trimmed)
}

export async function GET(request: NextRequest) {
  const rawId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    ''

  const configured = isValidGoogleClientId(rawId)
  const isPlaceholder = Boolean(rawId) && !configured

  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost || request.headers.get('host') || request.nextUrl.host
  const proto = request.headers.get('x-forwarded-proto') || (request.nextUrl.protocol.replace(':', '') || 'https')
  const origin = process.env.APP_URL?.trim() || (host ? `${proto}://${host}` : request.nextUrl.origin)
  const redirectUri = `${origin}/api/auth/google`

  return NextResponse.json(
    {
      configured,
      clientId: configured ? rawId : '',
      isPlaceholder,
      rawClientId: isPlaceholder ? 'your-google-client-id...' : '',
      origin,
      redirectUri,
      statusMessage: configured
        ? 'معرّف Google Client ID معتمد وجاهز'
        : isPlaceholder
          ? 'المعرّف الحالي تجريبي (your-google-client-id...). يلزم استبداله بمعرف OAuth حقيقي من Google Cloud Console'
          : 'Google Client ID غير مضبوط في متغيرات البيئة',
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  )
}
