import { readFile } from "node:fs/promises"
import path from "node:path"
import { del, get, list, put } from "@vercel/blob"
import mammoth from "mammoth"
import { rejectCrossOrigin } from "@/lib/request-security"
import { requireAdmin } from "@/lib/server-auth"

export const runtime = "nodejs"
export const maxDuration = 60

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_TEXT_LENGTH = 200_000
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt"])

type ExamFileMeta = {
  id: string
  name: string
  pathname: string
  metadataPathname: string
  type: string
  size: number
  uploadedAt: string
  text: string
  pinned?: boolean
}

const PINNED_FILES = [
  { id: "pinned-exam-guide", name: "دليل إعداد أسئلة الاختبارات", filename: "exam-question-guide.pdf" },
  { id: "pinned-mutashabihat", name: "متشابهات القرآن الكريم", filename: "mutashabihat.pdf" },
] as const

let pinnedFilesCache: Promise<ExamFileMeta[]> | null = null

function getPinnedFiles() {
  if (!pinnedFilesCache) {
    pinnedFilesCache = Promise.all(PINNED_FILES.map(async (definition) => {
      const buffer = await readFile(path.join(process.cwd(), "references", definition.filename))
      const text = await extractText(buffer, "pdf")
      return {
        id: definition.id,
        name: definition.name,
        pathname: `references/${definition.filename}`,
        metadataPathname: "",
        type: "pdf",
        size: buffer.byteLength,
        uploadedAt: "2026-08-15T00:00:00.000Z",
        text,
        pinned: true,
      }
    })).catch((error) => {
      pinnedFilesCache = null
      throw error
    })
  }
  return pinnedFilesCache
}

function response(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } })
}

function normalizeText(value: string) {
  return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_TEXT_LENGTH)
}

async function extractText(buffer: Buffer, extension: string) {
  if (extension === "txt") return normalizeText(buffer.toString("utf8"))
  if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer })
    return normalizeText(result.value)
  }

  // الاستيراد الكسول يمنع قارئ PDF وعامله من إسقاط GET أو رفع TXT/DOCX أثناء تهيئة المسار.
  const { PDFParse } = await import("pdf-parse")
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    return normalizeText(result.text)
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (/worker|pdf\.worker|fake worker/i.test(message)) {
      throw new Error("تعذر تشغيل قارئ PDF على الخادم. أعد المحاولة بعد تحديث الصفحة.")
    }
    throw error
  } finally {
    await parser.destroy().catch(() => undefined)
  }
}

async function readMetadata(pathname: string): Promise<ExamFileMeta | null> {
  try {
    const result = await get(pathname, { access: "private" })
    if (!result || result.statusCode !== 200) return null
    const text = await new Response(result.stream).text()
    if (!text.trim()) return null
    const parsed = JSON.parse(text) as Partial<ExamFileMeta>
    if (!parsed.id || !parsed.pathname || !parsed.metadataPathname) return null
    return parsed as ExamFileMeta
  } catch {
    // لا يجب أن يمنع ملف وصف تالف عرض بقية الملفات السليمة.
    return null
  }
}

function safeError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback
  if (/token|secret|credential|api[_ -]?key/i.test(message)) return fallback
  if (/store.*public|access.*public|private.*store/i.test(message)) return "إعداد مخزن الملفات لا يطابق التخزين الخاص المطلوب"
  return message.slice(0, 300) || fallback
}

function ensureBlobConfigured() {
  if (!(process.env.BLOB_READ_WRITE_TOKEN || "").trim()) {
    throw new Error("خدمة حفظ ملفات الاختبارات غير مهيأة على الخادم")
  }
}

async function listAllMetadataPathnames() {
  const pathnames: string[] = []
  let cursor: string | undefined
  do {
    const page = await list({ prefix: "exam-files/meta/", cursor, limit: 1000 })
    pathnames.push(...page.blobs.map((blob) => blob.pathname))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  return pathnames
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response
  try {
    const pinnedFiles = await getPinnedFiles()
    if (!(process.env.BLOB_READ_WRITE_TOKEN || "").trim()) {
      return response({ files: pinnedFiles, storageAvailable: false, warning: "ملفات المرجع المثبتة متاحة، لكن رفع ملفات إضافية غير متاح مؤقتاً" })
    }

    try {
      const pathnames = await listAllMetadataPathnames()
      const uploadedFiles = (await Promise.all(pathnames.map(readMetadata)))
        .filter((file): file is ExamFileMeta => Boolean(file))
        .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
      return response({ files: [...pinnedFiles, ...uploadedFiles], storageAvailable: true })
    } catch (blobError) {
      return response({ files: pinnedFiles, storageAvailable: false, warning: safeError(blobError, "تعذر تحميل الملفات المرفوعة مؤقتاً؛ المراجع المثبتة ما زالت متاحة") })
    }
  } catch (error) {
    return response({ error: safeError(error, "تعذر تحميل المراجع المثبتة") }, 500)
  }
}

export async function POST(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response
  let uploadedPathname = ""
  try {
    ensureBlobConfigured()
    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return response({ error: "اختر ملفاً صالحاً" }, 400)
    if (!file.size || file.size > MAX_FILE_SIZE) return response({ error: "حجم الملف يجب ألا يتجاوز 10 ميجابايت" }, 400)
    const extension = file.name.split(".").pop()?.toLowerCase() || ""
    if (!ALLOWED_EXTENSIONS.has(extension)) return response({ error: "الأنواع المدعومة: PDF وDOCX وTXT" }, 415)

    const id = crypto.randomUUID()
    const safeName = file.name.replace(/[^\p{L}\p{N}._-]+/gu, "-").slice(-120)
    const pathname = `exam-files/content/${id}-${safeName}`
    const metadataPathname = `exam-files/meta/${id}.json`
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractText(buffer, extension)
    if (text.length < 80) return response({ error: "لم نستطع استخراج نص كافٍ من الملف" }, 422)

    const uploaded = await put(pathname, buffer, { access: "private", contentType: file.type || "application/octet-stream", addRandomSuffix: false })
    uploadedPathname = uploaded.pathname
    const metadata: ExamFileMeta = { id, name: file.name.slice(0, 180), pathname: uploaded.pathname, metadataPathname, type: extension, size: file.size, uploadedAt: new Date().toISOString(), text }
    await put(metadataPathname, JSON.stringify(metadata), { access: "private", contentType: "application/json", addRandomSuffix: false })
    uploadedPathname = ""
    return response({ file: metadata }, 201)
  } catch (error) {
    if (uploadedPathname) await del(uploadedPathname).catch(() => undefined)
    return response({ error: safeError(error, "تعذر رفع الملف") }, 500)
  }
}

export async function DELETE(request: Request) {
  const originError = rejectCrossOrigin(request)
  if (originError) return originError
  const auth = await requireAdmin(request)
  if (auth.response) return auth.response
  try {
    ensureBlobConfigured()
    const { pathname, metadataPathname } = await request.json()
    if (typeof pathname === "string" && pathname.startsWith("references/")) return response({ error: "المرجع المثبت للقراءة فقط ولا يمكن حذفه" }, 403)
    if (typeof pathname !== "string" || typeof metadataPathname !== "string" || !pathname.startsWith("exam-files/content/") || !metadataPathname.startsWith("exam-files/meta/")) return response({ error: "بيانات الحذف غير صالحة" }, 400)
    await del([pathname, metadataPathname])
    return response({ success: true })
  } catch (error) {
    return response({ error: safeError(error, "تعذر حذف الملف") }, 500)
  }
}
