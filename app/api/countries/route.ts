import { COUNTRY_RULES } from '@/lib/country-rules'

export const dynamic = 'force-static'

export function GET() {
  return Response.json({ countries: COUNTRY_RULES }, {
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', 'X-Content-Type-Options': 'nosniff' },
  })
}
