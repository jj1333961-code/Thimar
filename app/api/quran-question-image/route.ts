import { readFile } from "node:fs/promises"
import path from "node:path"
import { createCanvas, loadImage, type Image } from "@napi-rs/canvas"
import { requireUser } from "@/lib/server-auth"

export const runtime = "nodejs"
export const maxDuration = 30

const QUESTION_TYPES = new Set(["mcq", "truefalse", "complete", "audio"])
const FRAME_PATH = path.join(process.cwd(), "public", "images", "ayah-frame.png")
const FRAME_AREA = { left: 0.115, top: 0.245, right: 0.885, bottom: 0.855 }
let framePromise: Promise<Image> | null = null

function loadFrame() {
  if (!framePromise) {
    framePromise = readFile(FRAME_PATH).then((bytes) => loadImage(bytes))
    framePromise.catch(() => { framePromise = null })
  }
  return framePromise
}

async function loadExactAyah(surah: number, ayah: number) {
  const response = await fetch(`https://cdn.islamic.network/quran/images/${surah}_${ayah}.png`, {
    cache: "force-cache",
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error("تعذر تحميل صورة الآية المطلوبة")
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length < 200) throw new Error("وصلت صورة آية فارغة")
  return loadImage(bytes)
}

function renderAyahSnippet(image: Image, masked: boolean) {
  const paddingX = 48
  const paddingY = 38
  const width = Math.max(720, image.width + paddingX * 2)
  const height = Math.max(180, image.height + paddingY * 2)
  const canvas = createCanvas(width, height)
  const context = canvas.getContext("2d")
  context.fillStyle = "#ffffff"
  context.fillRect(0, 0, width, height)
  const scale = Math.min((width - paddingX * 2) / image.width, (height - paddingY * 2) / image.height, 3)
  const drawWidth = Math.max(1, Math.round(image.width * scale))
  const drawHeight = Math.max(1, Math.round(image.height * scale))
  const drawX = width - paddingX - drawWidth
  const drawY = Math.round((height - drawHeight) / 2)
  context.drawImage(image as any, drawX, drawY, drawWidth, drawHeight)

  if (masked) {
    // الآية العربية تبدأ من اليمين؛ نُبقي بدايتها ونخفي جزء الإجابة في اليسار فقط.
    const maskWidth = Math.round(drawWidth * 0.46)
    context.fillStyle = "#ffffff"
    context.fillRect(drawX, drawY - 8, maskWidth, drawHeight + 16)
    context.strokeStyle = "#204f45"
    context.lineWidth = 3
    context.strokeRect(drawX, drawY - 8, maskWidth, drawHeight + 16)
  }

  const pixels = context.getImageData(0, 0, width, height).data
  let ink = 0
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] > 20 && pixels[index] < 190 && pixels[index + 1] < 190 && pixels[index + 2] < 190) ink++
  }
  if (ink < 80) throw new Error("تعذر استخراج جزء واضح من الآية؛ أعد المحاولة")
  return canvas
}

async function printOnFrame(ayah: ReturnType<typeof createCanvas>) {
  const frame = await loadFrame()
  const canvas = createCanvas(frame.width, frame.height)
  const context = canvas.getContext("2d")
  context.fillStyle = "#faf6ec"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(frame as any, 0, 0, canvas.width, canvas.height)
  const areaX = Math.round(canvas.width * FRAME_AREA.left)
  const areaY = Math.round(canvas.height * FRAME_AREA.top)
  const areaWidth = Math.round(canvas.width * (FRAME_AREA.right - FRAME_AREA.left))
  const areaHeight = Math.round(canvas.height * (FRAME_AREA.bottom - FRAME_AREA.top))
  const scale = Math.min(areaWidth / ayah.width, areaHeight / ayah.height)
  const drawWidth = Math.round(ayah.width * scale)
  const drawHeight = Math.round(ayah.height * scale)
  context.save()
  context.globalCompositeOperation = "multiply"
  context.drawImage(ayah as any, areaX + Math.round((areaWidth - drawWidth) / 2), areaY + Math.round((areaHeight - drawHeight) / 2), drawWidth, drawHeight)
  context.restore()
  return canvas
}

export async function GET(request: Request) {
  const auth = await requireUser(request)
  if (auth.response) return auth.response
  try {
    const url = new URL(request.url)
    const surah = Number(url.searchParams.get("surah"))
    const ayah = Number(url.searchParams.get("ayah"))
    const requestedType = url.searchParams.get("type") || "complete"
    const type = QUESTION_TYPES.has(requestedType) ? requestedType : "complete"
    const masked = url.searchParams.get("display") !== "anchor" && type === "complete"
    if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(ayah) || ayah < 1) {
      return Response.json({ error: "مرجع الآية غير صالح" }, { status: 400 })
    }

    const exactAyah = await loadExactAyah(surah, ayah)
    const snippet = renderAyahSnippet(exactAyah, masked)
    const output = await printOnFrame(snippet as any).catch(() => snippet)
    return new Response(new Uint8Array(output.toBuffer("image/png")), {
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
