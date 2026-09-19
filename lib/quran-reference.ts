import { readFile } from "node:fs/promises"
import path from "node:path"
import { get } from "@vercel/blob"
import { PDFParse } from "pdf-parse"

const QURAN_PATH = "references/quran.pdf"
const MUTASHABIHAT_PATH = "references/mutashabihat.pdf"
const EXAM_GUIDE_PATH = "references/exam-question-guide.pdf"
const MAX_REFERENCE_CHARS = 240_000

type ReferenceCache = { mutashabihat: string; examGuide: string; loadedAt: number }
let cache: ReferenceCache | null = null
let pending: Promise<ReferenceCache> | null = null

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function readReference(pathname: string) {
  try {
    const localFile = await readFile(path.join(process.cwd(), "references", path.basename(pathname)))
    return new Uint8Array(localFile)
  } catch (localError) {
    if (!(process.env.BLOB_READ_WRITE_TOKEN || "").trim()) {
      throw new Error(`تعذر قراءة المرجع المحلي: ${pathname}`, { cause: localError })
    }
    const result = await get(pathname, { access: "private" })
    if (!result || result.statusCode !== 200) throw new Error(`تعذر قراءة المرجع الخاص: ${pathname}`)
    return new Uint8Array(await new Response(result.stream).arrayBuffer())
  }
}

async function extractPdf(data: Uint8Array) {
  const parser = new PDFParse({ data })
  try {
    const result = await parser.getText()
    return result.text.replace(/\u0000/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_REFERENCE_CHARS)
  } finally {
    await parser.destroy().catch(() => undefined)
  }
}

export async function loadQuranReferences() {
  if (cache && Date.now() - cache.loadedAt < 6 * 60 * 60 * 1000) return cache
  if (!pending) {
    pending = Promise.all([
      readReference(MUTASHABIHAT_PATH),
      readReference(EXAM_GUIDE_PATH),
    ])
      .then(async ([mutashabihatData, examGuideData]) => {
        const [mutashabihat, examGuide] = await Promise.all([
          extractPdf(mutashabihatData),
          extractPdf(examGuideData),
        ])
        cache = { mutashabihat, examGuide, loadedAt: Date.now() }
        return cache
      })
      .finally(() => { pending = null })
  }
  return pending
}

function relevantWindows(source: string, terms: string[], windowSize = 900, limit = 5) {
  const normalizedSource = normalize(source)
  const windows: string[] = []
  for (const term of terms.map(normalize).filter((term) => term.length > 2)) {
    let index = normalizedSource.indexOf(term)
    if (index < 0) continue
    const ratio = index / Math.max(1, normalizedSource.length)
    const sourceIndex = Math.floor(ratio * source.length)
    windows.push(source.slice(Math.max(0, sourceIndex - windowSize), sourceIndex + windowSize))
    if (windows.length >= limit) break
  }
  return windows
}

export async function getReferenceContext(query: string, extraTerms: string[] = []) {
  const references = await loadQuranReferences()
  const terms = [query, ...extraTerms]
  const randomWindow = (source: string, size: number) => {
    if (!source) return ""
    const start = Math.floor(Math.random() * Math.max(1, source.length - size))
    return source.slice(start, start + size)
  }
  const mutashabihatMatches = relevantWindows(references.mutashabihat, terms, 1100, 4)
  const guideMatches = relevantWindows(references.examGuide, terms, 1200, 5)
  const mutashabihatContext = [...mutashabihatMatches, randomWindow(references.mutashabihat, 1800)].filter(Boolean)
  const guideContext = [...guideMatches, randomWindow(references.examGuide, 2200)].filter(Boolean)
  return [
    mutashabihatContext.length ? `مقتطفات عشوائية ذات صلة من ملف المتشابهات المرفق:\n${mutashabihatContext.join("\n---\n")}` : "",
    guideContext.length ? `مقتطفات عشوائية ذات صلة من دليل إعداد أسئلة الاختبارات المرفق:\n${guideContext.join("\n---\n")}` : "",
  ].filter(Boolean).join("\n\n").slice(0, 18_000)
}

export async function getQuranPdfBytes() {
  return readReference(QURAN_PATH)
}

export function normalizeQuranText(value: string) {
  return normalize(value)
}
