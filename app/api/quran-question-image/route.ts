import { requireUser } from "@/lib/server-auth"

export const runtime = "nodejs"
export const maxDuration = 30

const QUESTION_TYPES = new Set(["mcq", "truefalse", "complete", "audio"])

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const url = new URL(request.url)
    const surah = Number(url.searchParams.get("surah"))
    const ayah = Number(url.searchParams.get("ayah"))
    const requestedType = url.searchParams.get("type") || "complete"
    const _type = QUESTION_TYPES.has(requestedType) ? requestedType : "complete"

    if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) {
      return Response.json({ error: "مرجع الآية غير صالح" }, { status: 400 })
    }

    const response = await fetch(`https://cdn.islamic.network/quran/images/${surah}_${ayah}.png`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      throw new Error("تعذر تحميل صورة الآية المطلوبة")
    }

    const bytes = await response.arrayBuffer()
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر تجهيز صورة السؤال"
    return Response.json({ error: message.slice(0, 240) }, { status: 422 })
  }
}

