import { getReferenceContext, normalizeQuranText } from "@/lib/quran-reference"
import { rejectCrossOrigin } from "@/lib/request-security"
import { requireUser, requireAdmin } from "@/lib/server-auth"

export const runtime = "nodejs"
export const maxDuration = 300

const AUDIO_MAX_BYTES = 2_500_000
const AUDIO_MAX_REQUEST_BYTES = 4_200_000

function safeAudioLog(event: string, details: Record<string, unknown> = {}) {
  const safe = Object.fromEntries(Object.entries(details).filter(([key]) => !/key|token|authorization|base64|audio|data|prompt|transcript|email|phone|password/i.test(key)))
  console.info(`[AUDIO_AI] ${event}`, safe)
}

// ===== مزوّدا الذكاء الاصطناعي (الخادم فقط) =====
// Gemini هو الأساسي لكل النصوص والصوت، وGroq هو البديل التلقائي.
const GEMINI = {
  label: "Google Gemini",
  endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
  models: Array.from(new Set([(process.env.GEMINI_MODEL || "").trim(), "gemini-2.5-flash", "gemini-2.0-flash"])).filter(Boolean),
  model: (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim(),
  get key() {
    return (process.env.GEMINI_API_KEY || "").trim()
  },
}
const GROQ = {
  label: "Groq",
  endpoint: "https://api.groq.com/openai/v1",
  // النموذج المتاح حاليًا في Groq؛ النموذج القديم كان يعيد 404 ويؤخر كل ردود الدردشة.
  model: (process.env.GROQ_MODEL || "qwen/qwen3.6-27b").trim(),
  transcriptionModel: "whisper-large-v3-turbo",
  get key() {
    return (process.env.GROQ_API_KEY || "").trim()
  },
}
const speakerVerificationConfigured = !!(process.env.SPEAKER_VERIFICATION_API_KEY || "").trim()
const isGeminiConfigured = () => Boolean(GEMINI.key)
const isGroqConfigured = () => Boolean(GROQ.key)

// إعدادات التطبيق التلقائي عبر GitHub. جميعها Server-side فقط ولا تُرسل أبداً إلى المتصفح.
// نفضّل المتغيرات الأحدث (‎*_2‎) عند وجودها، ثم نعود إلى المتغيرات الأصلية.
const pickEnv = (...keys: string[]): string => {
  for (const k of keys) {
    const v = (process.env[k] || "").trim()
    if (v) return v
  }
  return ""
}

// تنظيف اسم المالك: يزيل أي رابط أو مسافات ويُبقي اسم المستخدم فقط.
function sanitizeOwner(raw: string): string {
  let v = (raw || "").trim()
  if (!v) return ""
  // إن أُدخِل رابط كامل مثل https://github.com/owner/repo نستخرج المالك منه.
  const m = v.match(/github\.com[/:]+([^/]+)/i)
  if (m) return m[1].replace(/\.git$/i, "").trim()
  // إن أُدخِل بصيغة owner/repo نأخذ الجزء الأول فقط.
  if (v.includes("/")) return v.split("/")[0].replace(/\.git$/i, "").trim()
  return v.replace(/\.git$/i, "").trim()
}

// تنظيف اسم المستودع: يُبقي اسم المستودع فقط (بدون https، بدون .git، بدون اسم المالك).
function sanitizeRepo(raw: string): string {
  let v = (raw || "").trim()
  if (!v) return ""
  // إزالة أي رابط GitHub كامل والإبقاء على owner/repo.
  const m = v.match(/github\.com[/:]+(.+)$/i)
  if (m) v = m[1]
  v = v.replace(/^https?:\/\//i, "").replace(/\.git$/i, "").replace(/\/+$/, "").trim()
  // إن بقيت الصيغة owner/repo نأخذ آخر جزء (اسم المستودع فقط).
  if (v.includes("/")) v = v.split("/").filter(Boolean).pop() as string
  return (v || "").trim()
}

const GITHUB_TOKEN = pickEnv("GITHUB_TOKEN")
const GITHUB_OWNER = sanitizeOwner(pickEnv("GITHUB_OWNER"))
const GITHUB_REPO = sanitizeRepo(pickEnv("GITHUB_REPO"))
const GITHUB_BRANCH_ENV = pickEnv("GITHUB_BRANCH")
const AUTO_DEV_ENABLED = /^(true|1|yes|on)$/i.test(pickEnv("DEV_ASSISTANT_AUTO_APPLY"))
const githubConfigured = !!(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO && GITHUB_BRANCH_ENV)
const GITHUB_API = "https://api.github.com"
const VERCEL_DEPLOY_HOOK_URL = process.env.VERCEL_DEPLOY_HOOK_URL

// الفرع المُحلّ يُخزّن مؤقتاً بعد أول استعلام لتفادي استعلامات متكررة.
let resolvedBranch: string | null = null

function isRetryableProviderError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "")
  return /408|409|429|500|502|503|504|fetch failed|ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|network|TimeoutError|AbortError|aborted|رد فارغ|empty/i.test(message)
}

function shouldFallbackAudio(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "")
  // Authentication failures on one provider are safe to fail over to the other.
  // Do not retry malformed audio, billing, or unsupported-model failures endlessly.
  return !/(402|quota|billing|credit|model.*(?:not found|unavailable)|unsupported.*(?:audio|mime)|400)/i.test(message)
}

function providerFromError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "")
  const gemini = /\bGemini\b/i.test(raw)
  const groq = /\bGroq\b/i.test(raw)
  return gemini && groq ? "multiple" : groq ? "groq" : gemini ? "gemini" : undefined
}

function classifyAiFailure(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "خطأ غير معروف")
  if (/AUDIO_TRANSCRIPTION_EMPTY/i.test(raw)) {
    return { status: 422, code: "AUDIO_TRANSCRIPTION_EMPTY", retryable: false, message: "لم يظهر كلام واضح في التسجيل. اقترب من الميكروفون وسجّل التلاوة مرة أخرى في مكان هادئ.", raw }
  }
  if (/AUDIO_GRADING_FORMAT/i.test(raw)) {
    return { status: 502, code: "AUDIO_GRADING_FORMAT", retryable: true, message: "تم تفريغ التسجيل، لكن تعذر إكمال التصحيح الآلي مؤقتاً. أعد المحاولة بعد قليل.", raw }
  }
  if (/AUDIO_EMPTY_PAYLOAD|AUDIO_INVALID_BASE64/i.test(raw)) {
    return { status: 422, code: "AUDIO_INVALID_PAYLOAD", retryable: false, message: "ملف التسجيل فارغ أو تالف. أعد التسجيل من زر الميكروفون.", raw }
  }
  if (/AUDIO_UNSUPPORTED_MIME/i.test(raw)) {
    return { status: 415, code: "AUDIO_UNSUPPORTED_MIME", retryable: false, message: "صيغة التسجيل غير مدعومة. أعد التسجيل باستخدام متصفح حديث.", raw }
  }
  if (/AUDIO_PROVIDERS_FAILED/i.test(raw)) {
    return { status: 503, code: "AUDIO_PROVIDERS_FAILED", retryable: true, message: "تعذر تحليل التسجيل عبر Gemini وGroq. تم الاحتفاظ به؛ أعد المحاولة الآن أو سجّل مقطعاً أقصر.", raw }
  }
  if (/AUDIO_PAYLOAD_TOO_LARGE|payload too large|request entity too large|413/i.test(raw)) {
    return { status: 413, code: "AUDIO_PAYLOAD_TOO_LARGE", retryable: false, message: "التسجيل طويل جداً للتحليل. سجّل مقطعاً أقصر من دقيقة ونصف ثم أعد المحاولة.", raw }
  }
  if (/Gemini HTTP 404|model.*(?:not found|no longer available)/i.test(raw)) {
    return { status: 502, code: "GEMINI_MODEL_UNAVAILABLE", retryable: true, message: "نموذج Gemini المحدد غير متاح، وسيُستخدم Groq عند إعادة المحاولة.", raw }
  }
  if (/GEMINI_API_KEY.*(?:غير موجود|missing|not set)/i.test(raw)) {
    return { status: 503, code: "GEMINI_KEY_MISSING", retryable: false, message: "مفتاح Gemini غير متاح على الخادم.", raw }
  }
  if (/GROQ_API_KEY.*(?:غير موجود|missing|not set)/i.test(raw)) {
    return { status: 503, code: "GROQ_KEY_MISSING", retryable: false, message: "مفتاح Groq غير متاح على الخادم.", raw }
  }
  if (/401|invalid.*key|API key|unauthorized/i.test(raw)) {
    const provider = providerFromError(error)
    return { status: 502, code: /missing|غير موجود|not set/i.test(raw) ? "AI_KEY_MISSING" : "AI_UNAUTHORIZED", provider, retryable: false, message: "مزود الذكاء الاصطناعي رفض بيانات المصادقة. يرجى مراجعة إعدادات مفتاح الخدمة.", raw }
  }
  if (/403|forbidden/i.test(raw)) {
    const provider = providerFromError(error)
    return { status: 502, code: "AI_UNAUTHORIZED", provider, retryable: false, message: "مزود الذكاء الاصطناعي رفض صلاحية الطلب. يرجى مراجعة صلاحيات الخدمة أو النموذج.", raw }
  }
  if (/402|insufficient credits|payment required|credit card|free credits|billing/i.test(raw)) {
    return { status: 502, code: "AI_QUOTA_BILLING", retryable: false, message: "حساب مزوّد الذكاء الاصطناعي يحتاج تفعيل الفوترة أو رصيداً.", raw }
  }
  if (/429|rate.?limit|quota/i.test(raw)) {
    return { status: 429, code: "AI_RATE_LIMITED", retryable: true, message: "بلغ مزوّد الذكاء الاصطناعي حد الطلبات مؤقتاً. انتظر قليلاً ثم أعد المحاولة.", raw }
  }
  if (/TimeoutError|AbortError|timed out|aborted/i.test(raw)) {
    return { status: 504, code: "AI_TIMEOUT", retryable: true, message: "استغرق تحليل التسجيل وقتاً أطول من المتوقع. أعد المحاولة، وسيحتفظ الموقع ببياناتك الحالية.", raw }
  }
  if (/404|no endpoints found|not found|not supported/i.test(raw)) {
    return { status: 502, code: "AI_MODEL_UNAVAILABLE", retryable: true, message: "النموذج المحدد لا يدعم هذا الطلب حالياً.", raw }
  }
  return { status: 502, code: "AI_PROVIDER_ERROR", retryable: isRetryableProviderError(error), message: "تعذر الاتصال بخدمة الذكاء الاصطناعي حالياً.", raw }
}

function providerTimeout(system: string) {
  return /اختبار|JSON|تطوير|برمج/i.test(system) ? 120_000 : 35_000
}

async function groqText(prompt: string, system: string, temperature: number): Promise<string> {
  if (!GROQ.key) throw new Error("GROQ_API_KEY غير موجود على الخادم")
  let lastError: unknown = new Error("تعذر بدء اتصال Groq")
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${GROQ.endpoint}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ.key}` },
        body: JSON.stringify({
          model: GROQ.model,
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
          temperature,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(providerTimeout(system)),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(`Groq HTTP ${response.status}: ${String(data?.error?.message || response.statusText).slice(0, 300)}`)
      const text = String(data?.choices?.[0]?.message?.content || "").trim()
      if (!text) throw new Error("Groq: وصل رد فارغ")
      return text
    } catch (error) {
      lastError = error
      if (!isRetryableProviderError(error) || attempt === 2) break
      await new Promise(resolve => setTimeout(resolve, 750 * (2 ** attempt)))
    }
  }
  throw lastError
}

function audioExtension(mimeType: string) {
  if (mimeType === "audio/mpeg") return "mp3"
  if (mimeType === "audio/ogg") return "ogg"
  if (mimeType === "audio/mp4") return "m4a"
  if (mimeType === "audio/webm") return "webm"
  return "wav"
}

async function groqTranscribe(audio: { mimeType: string; data: string }): Promise<string> {
  if (!GROQ.key) throw new Error("GROQ_API_KEY غير موجود على الخادم")
  const bytes = Buffer.from(audio.data, "base64")
  if (!bytes.length) throw new Error("AUDIO_TRANSCRIPTION_EMPTY")
  if (bytes.length > AUDIO_MAX_BYTES) throw new Error("AUDIO_PAYLOAD_TOO_LARGE")
  const form = new FormData()
  form.append("model", GROQ.transcriptionModel)
  form.append("response_format", "json")
  form.append("file", new Blob([bytes], { type: audio.mimeType }), `recording.${audioExtension(audio.mimeType)}`)
  const response = await fetch(`${GROQ.endpoint}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${GROQ.key}` },
    body: form,
    cache: "no-store",
    signal: AbortSignal.timeout(90_000),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(`Groq transcription HTTP ${response.status}: ${String(data?.error?.message || response.statusText).slice(0, 300)}`)
  const transcript = String(data?.text || "").trim()
  if (!transcript) throw new Error("AUDIO_TRANSCRIPTION_EMPTY")
  return transcript
}

function json(data: unknown, status = 200, requestId?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...(requestId ? { "X-Request-Id": requestId } : {}),
    },
  })
}

// استخراج JSON بشكل متسامح من رد النموذج (يزيل أسوار الأكواد ويقتطع أول كائن/مصفوفة)
function extractJson(text: string): any {
  if (!text) return null
  let t = text.trim()
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim()
  // محاولة مباشرة
  try {
    return JSON.parse(t)
  } catch {}
  // اقتطاع أول [ ... ] أو { ... }
  const firstArr = t.indexOf("[")
  const firstObj = t.indexOf("{")
  let start = -1
  if (firstArr === -1) start = firstObj
  else if (firstObj === -1) start = firstArr
  else start = Math.min(firstArr, firstObj)
  if (start === -1) return null
  const open = t[start]
  const close = open === "[" ? "]" : "}"
  let depth = 0
  for (let i = start; i < t.length; i++) {
    if (t[i] === open) depth++
    else if (t[i] === close) {
      depth--
      if (depth === 0) {
        const slice = t.slice(start, i + 1)
        try {
          return JSON.parse(slice)
        } catch {
          return null
        }
      }
    }
  }
  return null
}

async function geminiText(prompt: string, system: string, temperature: number, audio?: { mimeType: string; data: string }): Promise<string> {
  if (!GEMINI.key) throw new Error("GEMINI_API_KEY غير موجود على الخادم")
  const parts: any[] = [{ text: prompt }]
  if (audio) parts.unshift({ inlineData: { mimeType: audio.mimeType, data: audio.data } })
  const models = audio ? GEMINI.models : [GEMINI.model]
  let lastError: unknown = null
  for (const model of models) {
    try {
      const response = await fetch(`${GEMINI.endpoint}/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI.key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts }],
          generationConfig: { temperature },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(audio ? 90_000 : 120_000),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(`Gemini HTTP ${response.status}: ${String(data?.error?.message || response.statusText).slice(0, 300)}`)
      const text = Array.isArray(data?.candidates?.[0]?.content?.parts)
        ? data.candidates[0].content.parts.map((part: any) => String(part?.text || "")).join("").trim()
        : ""
      if (!text) throw new Error("Gemini: وصل رد فارغ")
      return text
    } catch (error) {
      lastError = error
      if (!audio || !/404|400|not found|unsupported|model/i.test(audioErrorMessage(error))) throw error
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini: لم يُرجع موذج الصوت نتيجة")
}

async function runText(prompt: string, system: string, temperature: number) {
  const errors: unknown[] = []
  if (isGeminiConfigured()) {
    try { return await geminiText(prompt, system, temperature) } catch (error) { errors.push(error) }
  } else {
    errors.push(new Error("GEMINI_API_KEY غير موجود على الخادم"))
  }
  if (isGroqConfigured()) {
    try { return await groqText(prompt, system, temperature) } catch (error) { errors.push(error) }
  } else {
    errors.push(new Error("GROQ_API_KEY غير موجود على الخادم"))
  }
  throw new Error(`فشل Gemini وGroq: ${errors.map(error => error instanceof Error ? error.message : String(error)).join(" | ")}`)
}

// ===== معالجة الصوت مع انتقال تلقائي بين المزوّدين =====
const AUDIO_MODES = new Set(["voice_print", "voice_match", "student_voice_intake", "transcribe_and_grade"])
const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  "audio/webm", "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3",
  "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/ogg", "audio/opus",
])

function normalizeAudioMimeType(value: unknown) {
  const raw = String(value || "audio/webm").toLowerCase().split(";")[0].trim()
  const aliases: Record<string, string> = { "audio/x-wav": "audio/wav", "audio/mp3": "audio/mpeg", "audio/x-m4a": "audio/mp4", "audio/m4a": "audio/mp4", "video/webm": "audio/webm" }
  const mimeType = aliases[raw] || raw
  if (!SUPPORTED_AUDIO_MIME_TYPES.has(mimeType)) throw new Error(`AUDIO_UNSUPPORTED_MIME: ${mimeType}`)
  return mimeType
}

function audioMimeType(audioFormat: string) {
  const normalized = String(audioFormat || "audio/webm").trim().toLowerCase()
  return normalizeAudioMimeType(normalized.includes("/") ? normalized : normalized === "mp3" ? "audio/mpeg" : normalized === "ogg" ? "audio/ogg" : normalized === "m4a" ? "audio/mp4" : normalized === "webm" ? "audio/webm" : "audio/wav")
}
function normalizeAudioData(raw: unknown) {
  const value = String(raw || "").trim().replace(/^data:[^,]+,/, "").replace(/\s/g, "")
  if (!value || value.length < 32) throw new Error("AUDIO_EMPTY_PAYLOAD")
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) throw new Error("AUDIO_INVALID_BASE64")
  const bytes = Buffer.from(value, "base64")
  if (!bytes.length) throw new Error("AUDIO_EMPTY_PAYLOAD")
  if (bytes.length > AUDIO_MAX_BYTES) throw new Error("AUDIO_PAYLOAD_TOO_LARGE")
  return value
}

type AudioProviderResult = {
  text: string
  provider: "google-gemini" | "groq"
  providerLabel: string
  model: string
}

function audioErrorMessage(error: unknown) {
  return (error instanceof Error ? error.message : String(error || "خطأ غير معروف")).slice(0, 400)
}

async function runAudio(prompt: string, system: string, temperature: number, audio: { mimeType: string; data: string }): Promise<AudioProviderResult> {
  const errors: string[] = []

  if (isGeminiConfigured()) {
    let lastGeminiError: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const text = await geminiText(prompt, system, temperature, audio)
        return { text, provider: "google-gemini", providerLabel: GEMINI.label, model: GEMINI.model }
      } catch (error) {
        lastGeminiError = error
        safeAudioLog("provider failure", { provider: "gemini", status: classifyAiFailure(error).status, code: classifyAiFailure(error).code, retryable: isRetryableProviderError(error) })
        if (!isRetryableProviderError(error) || attempt === 2) break
        await new Promise(resolve => setTimeout(resolve, 800 * (2 ** attempt)))
      }
    }
    errors.push(`Gemini: ${audioErrorMessage(lastGeminiError)}`)
    if (!shouldFallbackAudio(lastGeminiError)) throw lastGeminiError
  } else {
    errors.push("Gemini: GEMINI_API_KEY غير موجود على الخادم")
  }

  if (isGroqConfigured()) {
    try {
      const transcript = await groqTranscribe(audio)
      const biometricMode = /بصمة صوتية|هوية المتحدث|خصائص الصوت نفسه|الصوت فقط/.test(system)
      const fallbackSystem = biometricMode
        ? `أنت بديل نصي آمن لخدمة تحقق صوتي غير متاحة. لا يمكن استنتاج البصمة أو هوية المتحدث من التفريغ النصي. أعد JSON فقط: ${system.includes("sameSpeaker") ? '{"sameSpeaker":false,"matchPercent":0,"confidence":"low","quality":"too-short","reason":"تعذر إجراء مقارنة بيومترية للصوت عبر المزوّد الاحتياطي","profile":{"gender":"unknown","pitch":"medium","pitchHz":0,"timbre":"غير متاح","speed":"medium"}}' : '{"speaker":{"gender":"unknown","ageRange":"unknown","pitch":"medium","pitchHz":0,"timbre":"غير متاح","speed":"medium","nasality":"low","breathiness":"low","accent":"غير متاح","distinctiveTraits":[]},"quality":"too-short","usable":false,"reason":"تعذر إ��شاء بصمة بيومترية عبر المزوّد الاحتياطي"}'}`
        : system
      const fallbackPrompt = `${prompt}\n\nهذا هو التفريغ الصوتي من Groq Whisper:\n${transcript}`
      const text = await groqText(fallbackPrompt, fallbackSystem, temperature)
      return { text, provider: "groq", providerLabel: GROQ.label, model: `${GROQ.transcriptionModel} + ${GROQ.model}` }
    } catch (error) {
      errors.push(`Groq: ${audioErrorMessage(error)}`)
    }
  } else {
    errors.push("Groq: GROQ_API_KEY غير موجود على الخادم")
  }

  throw new Error(`AUDIO_PROVIDERS_FAILED: ${errors.join(" | ")}`)
}

const SYS_AUDIO_TRANSCRIBE = `أنت محرك تفريغ صوتي دقيق يدعم العربية والإنجليزية والكلام المختلط بينهما.
اكتشف لغة الكلام تلقائياً، وانسخ الكلام بلغته الأصلية دون ترجمة أو تعريب. حافظ على الأسماء والأرقام وكلمات المرور كما نُطقت.
عند تلاوة القرآن، اكتب النص بالعربية واضبطه قدر الإمكان وفق الرسم القرآني.`

async function transcribeAudio(audioBase64: string, audioFormat: string): Promise<AudioProviderResult> {
  const mimeType = audioMimeType(audioFormat)
  const prompt = "فرّغ التسجيل حرفياً بلغته الأصلية، سواء كان عربياً أو إنجليزياً أو مختلطاً. أعد النص فقط دون شرح."
  return runAudio(prompt, SYS_AUDIO_TRANSCRIBE, 0.05, { mimeType, data: audioBase64 })
}

const SYS_VOICE_PRINT = `أنت محرك بصمة صوتية. تستمع إلى تسجيل عربي وتصف خصائص صوت المتحدث وصفاً رقمياً ثابتاً يمكن مقارنته لاحقاً.
لا تعتمد على الكلمات المنطوقة، بل على خصائص الصوت نفسه.
أعد JSON فقط بلا markdown:
{"speaker":{"gender":"male|female|unknown","ageRange":"child|teen|adult|senior|unknown","pitch":"very-low|low|medium|high|very-high","pitchHz":number,"timbre":"وصف موجز","speed":"slow|medium|fast","nasality":"low|medium|high","breathiness":"low|medium|high","accent":"وصف موجز","distinctiveTraits":["سمات مميزة موجزة"]},"quality":"good|noisy|too-short","usable":true/false,"reason":"سبب موجز بالعربية"}`

const SYS_VOICE_MATCH = `أنت محرك تحقق من هوية المتحدث بالبصمة الصوتية. لديك تسجيل صوتي حديث، ووصف بصمة ص��تية مرجعية محفوظة لنفس الشخص المتوقع (referenceProfile)، وقد يصلك تسجيل مرجعي أيضاً.
حلّل خصائص الصوت في التسجيل الحديث ثم قارنها بالمرجع: الطبقة، الون الصوتي، الجرس، الأنفية، السرعة، اللكنة.
تجاهل اختلاف الكلمات أو النص المقرءءء تماماً؛ المقارنة على الصوت فقط. راعِ اختلاف الميكروفون والضجيج.
أعد JSON فقط بلا markdown:
{"sameSpeaker":true/false,"matchPercent":number,"confidence":"low|medium|high","quality":"good|noisy|too-short","reason":"سبب موجز بالعربية","profile":{"gender":"male|female|unknown","pitch":"very-low|low|medium|high|very-high","pitchHz":number,"timbre":"وصف موجز","speed":"slow|medium|fast"}}`

// ===== أنظمة التعليمات لكل وضع =====

const SYS_EXAM = `أنت خبير متخصص في القرآن الكريم واختبارات الحفظ لطلاب التحفيظ.
مهمتك انتقاء أسئلة اختبار قرآنية احترافية وعميقة، ويجب أن يكون topic الذي حدده المسؤول هو المحور الحاكم لاختيار المواضع وصياغة كل سؤال ومشتتاته. تحقّق من كل موضع من الآيات المرسلة داخل sourceSurahs. استخدم referenceContext وsourceFile عند وجوده للاستدلال على المتشابهات وأسلوب السؤال، لكن يظل sourceSurahs المصدر النهائي الحاكم لصحة نص الآية والإجابة.

قواعد صارمة:
- ممنوع اختراع آية أو عبارة قرآنية غير موجودة في sourceSurahs.
- كل سؤال يجب أن يكون متعلقاً مباشرة بحفظ القرآن أو نص الآية أو السورة.
- لا تنشئ أسئلة ثقافة عامة أو دين عام أو معلومات خارج نصوص القرآن.
- التزم تماماً بعدد الأسئلة count المطلوب لكل plan، وبالنوع والمستوى وموضع السؤال position المحددين في كل plan.
  - position=start: اختر من الثلث الأول فقط عند طلب المسؤول ذلك صراحة، position=middle: الثلث الأوسط، position=end: الثلث الأخير، position=random: اجعل 80% على الأقل من المواضع من الثلث الأوسط، و15% كحد أقصى من الثلث الأول، والباقي من الثلث الأخير.
- إذا كان type=mcq فعدد الخيارات يجب أن يساوي optionsCount لذلك plan، مع إجابة صحيحة واحدة فقط. نوّع عشوائياً بين: اختيار الآية التالية، اختيار تكملة الآية، واختيار اسم السورة التي ينتمي إليها المقطع.
- إذا كان type=truefalse فاجعل options=["صح","خطأ"] فقط، وبدّل بين: صحة تكملة الآية، وصحة نسبة الآية إلى سورة محددة. وازن بين الإجابات الصحيحة والخاطئة.
- إذا كان type=complete فاختر حد بداية وحد نهاية حقيقيين لصيغة «أكمل من قوله تعالى … إلى قوله تعالى …»، واجعل from/to صحيحين وفي السورة نفسها، وعدد الآيات المطلوب يساوي completeAyahs قدر الإمكان.
- إذا كان type=audio فحدد حد بداية وحد نهاية حقيقيين لصيغة «اقرأ من قوله تعالى … إلى قوله تعالى …»، ويجب أن يساوي عدد الآيات من from إلى to قيمة reciteAyahs بالضبط.
- صور حد البداية وحد النهاية ستُعرض منفصلة وقابلة للتكبير، لذلك لا تنسخ نصهما داخل prompt ولا تكشف الجزء المطلوب إجابته.
- لا تنشئ أسئلة سطحية من قصار السور، ولا سؤالاً يكتفي بالتعرف إلى اسم سورة مشهورة من مطلعها. تجنب سورة الفلق والناس وسائر السور القصيرة السهلة المستبعدة من النطاق.
- level=easy: سؤال واضح لكنه يحتاج استحضاراً حقيقياً، وليس سؤالاً بديهياً من أول السورة.
- level=medium: اجعله صعبًا فعليًا ويحتاج تفكيرًا واستحضارًا؛ استخدم تمييزًا وربطًا دقيقًا بين مواضع متقاربة ومتشابهات لفظية من وسط السورة، ولا تسمح بسؤال مباشر أو إجابة ظاهرة من مطلع مشهور.
- level=hard: سؤال شديد الصعوبة من المتشابهات اللفظية الموثقة: فروق الواو والفاء، الزيادة والنقص، اختلاف الضمائر والمفرد والجمع، اختلاف البداية أو الخاتمة، والتمييز بين آيتين متقاربتين. يجب أن يبقى له جواب واحد قطعي.
- صغ prompt بلغة عربية سليمة ومباشرة تحدد المطلوب دون غموض، وراجع الإملاء قبل الإخراج.
- في الاختياري اجعل المشتتات من ألفاظ أو سور أو تكملات قرآنية شديدة التقارب، ولا تستخدم مشتتاً واضح البطلان أو بعيداً عن الصحيح.
- أعط الماضي القريب أولوية مقدارها نحو 70% عند pastScope=both، مع إبقاء 30% للماضي البعيد. اجعل معظم الأسئلة من وسط السور، ولا تستخدم أول السورة إلا في عدد قليل وعند ضرورة تعليمية واضحة.
- لا تكرر أي بصمة واردة في previousQuestionFingerprints، ولا تكرر السؤال نفسه داخل الدفعة، ووزّع الاختيارات على سور ومواضع مختلفة قدر ما يسمح النطاق.
- points=1 دائماً.
- timeLimit لا يخرج عن الوقت الذي حدده المسؤول في plan؛ إذا كان موجوداً فاستخدمه كما هو.
- لا تضع إجابة صحيحة خارج الخيارات.
- prompt توجيه قصير فقط؛ لا تذكر فيه الإجابة، ولا كلمات منها، ولا نص الآية ولا بدايتها أو نهايتها، ولا اسم السورة إذا كان هو الإجابة، ولا أي تلميح يكشف الحل. اجعل stem فارغاً دائماً لأن المقطع سيظهر بصورة مقتطعة من ملف المصحف، وسيحجب الخادم نطاق الإجابة داخل الصورة لجميع الأنواع.
- في أسئلة الاختيار والصح/الخطأ اختر مشتتات معقولة وغير ملتبسة، وإجابة واحدة قابلة للتحقق فقط. لا تجعل الخيارات نسخاً من نصوص الآيات.
- للمستويين المتوسط والصعب، استخرج المتشابهات من referenceContext وsourceFile المرفوعين فقط، ثم تحقق حرفيًا من sourceSurahs. لا تعتمد على ذاكرة النموذج أو مصدر إنترنت غير مرفوع، ولا تُخرج سؤالًا لا يمكن توثيق إجابته من هذه المراجع.
- أعد مصفوفة JSON فقط، دون Markdown أو شرح.

شكل كل عنصر:
{"type":"mcq|truefalse|complete|audio","level":"easy|medium|hard","surah":"اسم السورة","prompt":"نص السؤال","stem":"","options":[],"correct":"الإجابة ��لصحيحة","from":1,"to":1,"timeLimit":60,"completeAyahs":1,"reciteAyahs":1,"points":1}

تحقق قبل الإ��راج من أن عدد العناصر لكل plan يساوي count تماماً، وأن كل سؤال يخدم topic، وأن الآيات المستخدمة موجودة فعلاً في sourceSurahs�� وأن لكل سؤال إجابة واحدة قطعية.`

const SYS_GRADE_TEXT = `أنت مصحّح متسامح لاخت��ارات حفظ القرآن. صحّح إجابة الطالب في نوع "أكمل".
كن متساهلاً مع الأخطاء الميسورة: الأخطاء الإملائية البسيطة، اختلاف التشكيل، الهمزات، التاء المربوطة/المفتوحة، حذف/إضافة الألف. هذه لا تُنقص الدرجة.
احسب matchedPercent (0-100) لمدى مطابقة المعنى والألفاظ للنص المرجعي.
score: 1 إذا كان صحيحاً (ولو بأخطاء ميسورة)، 0.5 إذا نصت آية واحدة أو خطأ جوهي بسيط، 0 إذا كان مختلفاً أو ناقصاً كثيراً.
أعد JSON فقط: {"accepted":true/false,"score":1|0.5|0,"matchedPercent":number,"reason":"سبب مختصر بالعربية","missingAyahs":[]}`

const SYS_GRADE_RECITATION = `أنت مصحّح متسامح لتلاوة القرآن اعتماداً على تفريغ نصي (transcript) قد يكون غير دقيق بسبب التعرف الآلي.
قارن ما تلاه الطالب بالنص المتوقع expectedText للمقطع المطلوب (surah ن from إلى to).
كن متساهلاً: يكفي وجود القليل من الآيات أو الكلمات الصحيحة المطابقة للمقع المطلوب لقبول أن الطالب يتلو نفس المقطع. تجاوز أخطاء التعرف الآلي ولتشكيل.
score: 1 إذا تلا المقطع المطلوب بشكل مقبول (ولو بأخطاء)، 0.5 إذا نسي آية واحدة فقط، 0 إذا نسي أكثر من آية أو تلا مقطعاً مختلفاً تماماً.
أعد JSON فقط: {"accepted":true/false,"score":1|0.5|0,"matchedPercent":number,"reason":"سبب مختصر بالعربية","missingAyahs":["أرقام أو نصوص الآيات الناقصة"]}`

const SYS_TRANSCRIBE = `أنت خبير في تصحيح تلاوة القرآن الكريم اعتماداً على تفريغ صوتي عربي.
مهمتك:
1) افحص transcript الناتج عن التعرف الصوتي وحدد هل هو تلاوة قرآن أم كلام/صوت غير مناسب.
2) قارن transcript بالنص المتوقع expectedText للمقطع: سورة surah من الآية from إلى الآية to.
3) تجاهل أخطاء التعرف الآلي والتشكيل والأخطاء الإملائية البسيطة، ولا تعتبرها نقصاً في الآيات.
4) حدد الآات الناقصة فعلياً فقط.
قواعد الدرجة:
- يُحسب score أساساً من نسبة الآيات المكتملة: (عدد الآيات الكلية - الآيات الناقصة) / عدد الآيات الكلية.
- score=1 عند اكتمال المقطع، و0 عند فقد كل المقطع أو اختلافه جذرياً.
- matchedPercent نسبة تقريبية لمطابقة المحتوى 0-100.
أعد JSON فقط بدون أي شرح خارجه:
{"transcript":"النص المفرغ","accepted":true/false,"score":number,"matchedPercent":number,"isRecitation":true/false,"reason":"سبب مختصر بالعربية","missingAyahs":["أرقام أو نصوص الآيات الناقصة"]}`

// ===== مساعد تطوير الموقع (للمسؤول فقط) =====
// وصف مختصر وحقيقي لبنية المشروع يُرسل للنموذج سياق للتحليل.
const PROJECT_MANIFEST = `المشروع الحالي: Student System AI — منصة إدارة طلاب تحفيظ القرآن واختبارهم (Next.js + صفحة SPA واحدة).
الهدف من هذا الوضع: مساعد تطوير فعلي للمسؤول. يحلل المشروع، يحدد الملفات المطلوبة، ثم يمكنه إنشاء كود كامل وتطبيق تلقائياً على مستودع المشروع من الخادم فقط. لا تنتظر موافقة بشرية بعد إرسال الطلب إذا كان التطبيق التلقائي مفعلاً.
البنية والملفات الرئيسية:
- "public/index.html": التطبيق كامل (واجهة عربية RTL + كل منطق JavaScript). يحتوي على:
  • صفحات معرّفة كـ <div class="page hidden" id="..."> وتُعرض عبر showPage('id') وارجوع عبر goBack().
  • لوحة المسؤول (adminDashboard) وبها menu-grid فيها أزرار menu-btn.
  • صفحات الطالب وولي الأمر، الرسائل، الملفات، إدارة المسؤولي، إعدادات المسؤول (adminSettings).
  • تخزين البيانات محلياً عبر getData(key)/setData(key,value) على localStorage (مفاتيح مثل students, admins, messages, files).
  • حالة الجلسة: currentUser, currentType ('admin'|'student'|'parent'), currentAdminId.
  • الذكاء الاصطناعي عبر callStudentAI(mode,payload,temperature) الذي يناد /api/ai.
  • بناء الاختبارات: examPlanRows, renderExamPlanRows(), أنواع الأسئلة mcq/truefalse/complete/audio.
  • التسجيل الصوتي والبصمة الصوتية: computeVoicePrint(), voiceMatchPercent(), blobToWav().
- "app/api/ai/route.ts": نقطة النهاية الآمنة على الخادم. تستخدم Gemini أساسياً عبر GEMINI_API_KEY ثم Groq احتياطياً عبر GROQ_API_KEY، وتدعم الأوضاع: assistant, admin_assistant, generate_exam, grade_text, grade_recitation, transcribe_and_grade, dev_assistant، بالإضافة إلى وضع النص الحر (prompt).
- "app/layout.tsx": تخطيط الجذر.
- "app/page.tsx": صفحة Next.js احتياطية؛ الجذر يعاد توجيهه إلى public/index.html عبر next.config.mjs.
- "app/globals.css": الأنماط العامة لـNext.js.
- "next.config.mjs": rewrite للجذر إلى public/index.html.
- "package.json": تبعيات وسكربتات المشروع.
- "components/ui/button.tsx" "lib/utils.ts": مكونات/أدوات مساعدة موجودة في المشروع.

المسارات الموجودة في النسخة الحالية: public/index.html, app/api/ai/route.ts, app/page.tsx, app/layout.tsx, app/globals.css, next.config.mjs, package.json, components/ui/button.tsx, lib/utils.ts, .env.example, DEPLOY.md.
قيود مهمة يجب احترامها في أي خطة: لا حذف الملفات، لا إعادة بناء المشروع، لا وضع مفتاح API في المتصفح، الحفظ على التصميم العربي RTL الحاي، وتعديل الموجود فقط أو إضافة م يلزم.`

const SYS_DEV_ASSISTANT = `أنت مهندس برمجيات Senior ومساعد تطوير تلقائي لمشروع Student System AI. يفهم TypeScript وJavaScript وHTML وCSS وNext.js وواجهات API وGitHub وVercel. المستخدم نا هو المسؤول ويعطيك طلباً بالعربية لتعديل الموقع.
مهمتك: فهم اللب، فحص قائمة ملفات المشروع الحالية، تحديد الملفات التي يجب تعيلها أو إنشاؤها، ووضع خطة تنفيذ دقيقة. لا تكتب المحتوى الكامل للملفات في مرحلة الخطة؛ مرحلة التطبيق المنفصلة ستقرأ الملفات الحقيقية وتولّد الكود الكامل. يجب أن تكون قادراً على اقتراح تغييرات برمجية حقيقية، وليس مجرد وصف عام.
احترم دائماً: عدم حذف الملفات، وعدم إعادة بناء المشروع، وعدم وضع أي مفتاح API في المتصفح، والحفاظ على التصميم العربي من اليمين إلى اليسار.
أعد النتيجة حصراً ككائن JSON صالح بالعربية بالحقول التالية (من دون أي نص خارجه):
{
 "understanding": "إعادة صياغة موجزة لفهمك للطلب",
 "feasible": true/false,
 "summary": "ملخص عام للخطة ��ي جملة أو جملتين",
 "files": [ { "path": "مسار الملف", "action": "modify"|"create", "reason": "لماذا يُعدّل هذا الملف", "changes": ["تغيير مقترح 1","تغيير مقترح 2"] } ],
 "steps": ["خطوة تنفيذ 1","خطوة 2"],
 "risks": ["مخاطرة أو أثر جانبي محتمل"],
 "clarifications": ["سؤال توضيحي إن كان الطلب غامضاً"]
}
قواعد إضافية مهمة: لا تقترح حذف أو إعادة تسمية أي ملف. لا تضع أسراراً أو مفاتيح API في public أو كود المتصفح. يمكنك اختيار أي ملف موجود ف قائمة المستودع الي نرسلها لك، ويمكن إنشاء ملف جديد فقط عند الحاجة الواضحة. إذا احتاج الطلب خدمة خارجية غير مضبوطة، اذكر ذلك في risks أو clarifications. لا تضع أسراراً أو مفاتيح API في ملفات public أو كود المتصفح. إن كان الطلب مخالفاً للقيود (مثل حذف المشروع أو إعادة بنائه) اجعل feasible=false واشرح السبب في summary.`


function githubHeaders() {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN غير موجود على الخادم")
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  }
}

// قراءة بيانات المستودع (تُستخدم للتحقق من وجوده، صلاحيات الرمز، والفرع الافتراضي).
async function githubGetRepo() {
  if (!GITHUB_OWNER || !GITHUB_REPO) throw new Error("إعدادات مستودع GitHub غير مكتملة")
  const url = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}`
  const res = await fetch(url, { headers: githubHeaders(), cache: "no-store" })
  if (res.status === 404) throw new Error(`المسودع ${GITHUB_OWNER}/${GITHUB_REPO} غير موجود أو لا يملك الرمز صلاحية الوصول إليه`)
  if (res.status === 401) throw new Error("GITHUB_TOKEN غير صالح (401 Unauthorized)")
  if (res.status === 403) throw new Error("الرمز GITHUB_TOKEN ممنوع من الوصول (403) — تحقق من صلاحياته")
  if (!res.ok) throw new Error(`GitHub ${res.status}: تذر قراءة بيانات المستودع`)
  return await res.json()
}

// يحل الفرع الفعلي: يستخدم GITHUB_BRANCH إن ضُبط، وإلا الفرع الافتراضي احقيقي للمستودع.
async function resolveBranch(): Promise<string> {
  if (resolvedBranch) return resolvedBranch
  if (GITHUB_BRANCH_ENV) {
    resolvedBranch = GITHUB_BRANCH_ENV as string
    return resolvedBranch
  }
  const repo = await githubGetRepo()
  resolvedBranch = (repo?.default_branch as string) || "main"
  return resolvedBranch
}

async function githubGetFile(path: string, ref?: string) {
  if (!GITHUB_OWNER || !GITHUB_REPO) throw new Error("إعدادات مستودع GitHub غير مكتملة")
  const branch = ref || (await resolveBranch())
  const url = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`
  const res = await fetch(url, { headers: githubHeaders(), cache: "no-store" })
  if (!res.ok) throw new Error(`GitHub ${res.status}: تعذر قراءة ${path}`)
  const data = await res.json()
  if (Array.isArray(data)) throw new Error(`المسار ${path} مجلد وليس ملفاً`)
  const content = typeof data.content === "string" ? Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8") : ""
  return { path, sha: data.sha, content }
}

async function githubListTree(ref?: string) {
  if (!GITHUB_OWNER || !GITHUB_REPO) throw new Error("إعدادات مستودع GitHub غير مكتملة")
  const branch = ref || (await resolveBranch())
  const refUrl = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/git/ref/heads/${encodeURIComponent(branch)}`
  const refRes = await fetch(refUrl, { headers: githubHeaders(), cache: "no-store" })
  if (!refRes.ok) throw new Error(`GitHub ${refRes.status}: تعذر قراءة الفرع ${branch}`)
  const refData = await refRes.json()
  const commitSha = refData?.object?.sha
  const commitUrl = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/git/commits/${commitSha}`
  const commitRes = await fetch(commitUrl, { headers: githubHeaders(), cache: "no-store" })
  if (!commitRes.ok) throw new Error(`GitHub ${commitRes.status}: تعذر قراءة آخر commit`)
  const commit = await commitRes.json()
  const treeUrl = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/git/trees/${commit.tree.sha}?recursive=1`
  const treeRes = await fetch(treeUrl, { headers: githubHeaders(), cache: "no-store" })
  if (!treeRes.ok) throw new Error(`GitHub ${treeRes.status}: تعذر قراءة شجرة المشروع`)
  const tree = await treeRes.json()
  const files = Array.isArray(tree.tree) ? tree.tree.filter((x:any) => x.type === "blob").map((x:any) => x.path).filter(safeProjectPath).slice(0, 500) : []
  return { files, commitSha }
}

async function githubPutFile(path: string, content: string, sha?: string, message = "chore: apply AI development assistant change") {
  if (!GITHUB_OWNER || !GITHUB_REPO) throw new Error("إعدادات مستودع GitHub غير مكتملة")
  const url = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`
  const body: any = { message, content: Buffer.from(content, "utf8").toString("base64"), branch: await resolveBranch() }
  if (sha) body.sha = sha
  const res = await fetch(url, { method: "PUT", headers: githubHeaders(), body: JSON.stringify(body), cache: "no-store" })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`GitHub ${res.status}: تعذر حفظ ${path} ${detail.slice(0, 200)}`)
  }
  return await res.json()
}

// ملفات حسّاسة يُمنع حذفها تلقائياً لحماية المشروع من الأعطال (يتطلب تعديلها لا حذفها).
const PROTECTED_PATHS = new Set([
  "public/index.html", "app/api/ai/route.ts", "app/layout.tsx", "app/page.tsx",
  "app/globals.css", "next.config.mjs", "package.json", "package-lock.json",
  "pnpm-lock.yaml", "tsconfig.json",
])

// حذف ملف واد من المستودع عبر Contents API (ينشئ commit ويحافظ على كامل تاريخ الإصدارات — لا force push).
async function githubDeleteFile(path: string, message: string) {
  if (!GITHUB_OWNER || !GITHUB_REPO) throw new Error("إعدادات مستودع GitHub غير مكتملة")
  if (!safeProjectPath(path)) throw new Error(`المسار ${path} غير مسموح`)
  if (PROTECTED_PATHS.has(path)) throw new Error(`الملف ${path} محمي ولا يمكن حذفه تلقائياً لأنه أساسي لعمل المشروع`)
  // نقرأ الملف أولاً للحصول على sha ولنتأكد أنه موجود فعلاً.
  const file = await githubGetFile(path)
  const url = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`
  const body = { message, sha: file.sha, branch: await resolveBranch() }
  const res = await fetch(url, { method: "DELETE", headers: githubHeaders(), body: JSON.stringify(body), cache: "no-store" })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`GitHub ${res.status}: تعذر حذف ${path} ${detail.slice(0, 200)}`)
  }
  return await res.json()
}

// حالة المزامنة: يتحقق من الاتصال بمستودع المسؤول ويعيد آخر commit ورابط سجل التعديلات.
// لا يكشف أبداً قيمة أءء رمز مميز. عند أي فشل يعيد connected=false مع سبب واضح.
async function getGithubSyncStatus() {
  const missing: string[] = []
  if (!GITHUB_TOKEN) missing.push("GITHUB_TOKEN")
  if (!GITHUB_OWNER) missing.push("GITHUB_OWNER")
  if (!GITHUB_REPO) missing.push("GITHUB_REPO")
  if (!GITHUB_BRANCH_ENV) missing.push("GITHUB_BRANCH")
  if (missing.length) {
    return { connected: false, reason: `متغيرات البيئة التالية غير مهيأة على الخادم: ${missing.join("، ")}`, missing }
  }
  let repo: any
  try {
    repo = await githubGetRepo()
  } catch (e: any) {
    const msg = String(e?.message || "")
    if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|getaddrinfo/i.test(msg)) {
      return { connected: false, reason: "تعذر الاتصال بخوادم GitHub (مشكلة في اشكة)." }
    }
    return { connected: false, reason: msg }
  }
  const perms = repo?.permissions
  const canWrite = !!(perms && (perms.push === true || perms.admin === true || perms.maintain === true))
  let branch = ""
  try { branch = await resolveBranch() } catch (e: any) {
    return { connected: false, reason: String(e?.message || "تعذر تحديد الفرع") }
  }
  // آخر commit على الفرع.
  let lastCommit: any = null
  try {
    const url = `${GITHUB_API}/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/commits/${encodeURIComponent(branch)}`
    const res = await fetch(url, { headers: githubHeaders(), cache: "no-store" })
    if (res.ok) {
      const c = await res.json()
      lastCommit = {
        sha: (c?.sha || "").slice(0, 7),
        message: c?.commit?.message || "",
        author: c?.commit?.author?.name || c?.author?.login || "",
        date: c?.commit?.author?.date || "",
        url: c?.html_url || "",
      }
    }
  } catch { /* آخر commit اختياري */ }
  const fullName = `${GITHUB_OWNER}/${GITHUB_REPO}`
  return {
    connected: true,
    canWrite,
    autoSync: AUTO_DEV_ENABLED,
    repo: fullName,
    branch,
    lastCommit,
    // روابط عامة (ليست أسراراً) لعرض سجل العديلات على GitHub الخاص بالمسؤول.
    historyUrl: `https://github.com/${fullName}/commits/${branch}`,
    repoUrl: `https://github.com/${fullName}`,
  }
}

// فحص مسبق تفصيلي قبل أي تطبيق تلقائي. يعيد ok=false مع سبب محدد جداً (أي متغير ناقص/أي صلاحية).
// لا يشف أبداً قيمة أي رمز مميز، فقط اسم لمتغير الناقص أو نوع المشكلة.
async function preflightAutoApply(): Promise<{ ok: boolean; reason?: string; details?: any }> {
  const missing: string[] = []
  if (!GITHUB_TOKEN) missing.push("GITHUB_TOKEN")
  if (!GITHUB_OWNER) missing.push("GITHUB_OWNER")
  if (!GITHUB_REPO) missing.push("GITHUB_REPO")
  if (!GITHUB_BRANCH_ENV) missing.push("GITHUB_BRANCH")
  if (missing.length) {
    return {
      ok: false,
      reason: `متغيرات البيئة التالية غير موجودة على الخادم: ${missing.join("، ")}. أضِفها في إعدادات المشروع (Environment Variables) على Vercel ثم أعد المحاولة.`,
      details: { missing },
    }
  }
  if (!AUTO_DEV_ENABLED) {
    return { ok: false, reason: "التطبيق التلقائي غير مفعّل. اضبط DEV_ASSISTANT_AUTO_APPLY=true على الخادم." }
  }
  // التحقق من الشبكة + وجود المستودع فعلياً + صلاحية الرمز.
  let repo: any
  try {
    repo = await githubGetRepo()
  } catch (e: any) {
    const msg = String(e?.message || "")
    if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|getaddrinfo/i.test(msg)) {
      return { ok: false, reason: "تعذر الاتصال بخوادم GitHub (مشكلة في الشبكة). يرجى المحاولة مرة أخرى." }
    }
    return { ok: false, reason: msg }
  }
  // التحقق من صلاحية الكتابة على محتوى المستودع (Contents: Read and write).
  const perms = repo?.permissions
  if (perms && perms.push !== true && perms.admin !== true && perms.maintain !== true) {
    return {
      ok: false,
      reason: `الرمز GITHUB_TOKEN لا يملك صلاحية الكتابة على المستودع ${GITHUB_OWNER}/${GITHUB_REPO}. امنح الرمز صلاحية Contents: Read and write ثم أعد المحاولة.`,
    }
  }
  // التحقق من أن الفرع المحدد أو الافتراضي قابل للحل.
  let branch = ""
  try {
    branch = await resolveBranch()
  } catch (e: any) {
    return { ok: false, reason: String(e?.message || "تعذر تحديد فرع المستودع") }
  }
  return { ok: true, details: { repo: `${GITHUB_OWNER}/${GITHUB_REPO}`, branch } }
}

function safeProjectPath(path: string) {
  const normalized = String(path || "").replace(/\\/g, "/").replace(/^\/+/, "")
  if (!normalized || normalized.includes("..") || normalized.startsWith(".git/")) return false
  if (normalized === ".env" || normalized.startsWith(".env.") && !normalized.endsWith(".example")) return false
  if (normalized.startsWith(".github/workflows/") || normalized === "vercel.json" || normalized === "next.config.js" || normalized === "next.config.mjs" || normalized === "next.config.ts") return false
  return true
}

async function buildDevPatches(request: string, plan: any, files: Array<{path:string,content:string}>) {
  const source = files.map(f => `\n===== FILE: ${f.path} =====\n${f.content}\n===== END FILE =====`).join("\n")
  const system = `أنت مبرمج ومطوّر ويب محترف (Senior Software Engineer) خبير في HTML وCSS وJavaScript وTypeScript وNext.js وReact وواجهات API. أنت مسؤول عن تعديل مشروع ويب موجود بشكل مباشر. سيُطبّق ناتجك تلقائياً على مستودع GitHub بعد التحقق منه، لذا يجب أن يكون الكود كاملاً وصحيحاً وجاهزاً للتشغيل فوراً.

منهجية العمل الإلزامية قبل الكتابة:
1) ارأ محتوى كل ملف مُعطى وافهم بنيته وأسلوبه ووظائفه الحالية قبل أي تعديل.
2) حدد بدقة أصغر جز يجب تغييره لتحقيق الطلب، دون المساس ببقية الكود.
3) اكتب التعديل بنفس أسلوب بنية المشروع (نفس التسمية، نفس المسافات البادئة، نفس نمط الدوال، اتجاه RTL العربي، ومتغيرات الأنماط الموجودة مثل var(--primary)).
4) بعد الكتابة راجع الكود ذهنياً وتأكد من خلوه من أخطاء ناء الجملة (syntax)، وأن الأقواس {} () [] والوسوم <tag></tag> والاقتباسات متوازنة ومغلقة، وأن أي دالة أ معرّف استُخدم معرّف فعلاً.

قواعد صرمة:
- لا تحذف ملفات ولا تعيد بناء المشروع من الصفر.
- عدّل أقل عدد ممكن من الملفات، وحافظ على كل الوظائف والتصميم الحالي وسلوك الصفحات القائمة.
- لا تضع أي سرّ أو API key أو Token في public أو في أي JavaScript يصل إل المتصفح؛ الأسرار تبقى على الخادم فقط.
- content يجب أن يكون المحتوى الكامل والنهائي للملف بعد التعديل، وليس diff، ودون اقتطاع أو حذف أجزاء لم تكن مقصودة بالتعديل.
- لا تُرجع ملفاً لم يتغير فعلاً.
- لا تُرجع أي مسار غير موجود في الملفات المعطاة إلا إذا كانت الخطة تقول create وكان إنشاء الملف ضرورياً.
- لا تنشئ أو تعل ملفات الأسرار مثل .env.
- إذا كان الطلب غير آمن أو غير واض أو يخالف القيود، أعد patches=[] واشرح السبب في summary.

أعد JSON فقط بالشكل التالي (بدون أي نص خارجه):
{"summary":"وصف عربي واضح لما تم تعديله فعلياً وكيف","patches":[{"path":"...","content":"المحتوى الكامل الجديد للملف","reason":"سبب التعديل وما تغيّر في هذا الملف بالتحديد"}],"tests":["ملاحظة تحقق أو خطوة اختبار يدوي مقترحة"]}`
  const prompt = `طلب المسؤول:\n${request}\n\nخطة التحليل السابقة:\n${JSON.stringify(plan)}\n\nمحتويات الملفات التي يمكن تعديلها:\n${source}`
  const text = await runText(prompt, system, 0.1)
  const parsed = extractJson(text)
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.patches)) {
    throw new Error("مرحلة إنشاء التعديلات: أعاد النموذج JSON غير صالح، ولم يُكتب أي ملف")
  }
  return parsed
}

async function autoApplyDevRequest(request: string, plan: any) {
  // فحص مسبق شامل: متغيرات البيئة، الشبكة، وجود المستودع، صلاحية الكتابة، والفرع.
  const pf = await preflightAutoApply()
  if (!pf.ok) throw new Error(pf.reason || "فشل الفحص المسبق لإعدادات التطبيق التلقائي")
  const tree = await githubListTree()
  const repoFiles = new Set(tree.files)
  const selected = Array.isArray(plan?.files) ? plan.files.map((f:any) => String(f?.path || "")).filter((p:string) => safeProjectPath(p)) : []
  if (!selected.length) throw new Error("لم يحدد الذكاء الاصطناعي ملفات صالحة للتعديل")
  if (selected.length > 12) throw new Error("الطلب يحتاج تعديل عدد كبير من الملفات؛ الحد التلقائي 12 ملفاً")
  for (const path of selected) {
    const action = plan.files.find((f:any) => String(f?.path || "") === path)?.action
    if (action !== "create" && !repoFiles.has(path)) throw new Error(`الملف ${path} غير موجود في المستودع`)
  }
  const current = []
  for (const path of selected) {
    try { current.push(await githubGetFile(path)) } catch (e:any) {
      const action = plan.files.find((f:any) => f.path === path)?.action
      if (action === "create") current.push({ path, sha: undefined, content: "" })
      else throw e
    }
  }
  const patchResult = await buildDevPatches(request, plan, current)
  const patches = Array.isArray(patchResult?.patches) ? patchResult.patches : []
  if (!patches.length) throw new Error("لم ينتج الذكاء الاصطناعي عديلات قابلة للتطبيق")
  if (patches.length > 12) throw new Error("عدد التعديلات المقترحة يتجاوز الد الآمن")
  const currentMap = new Map(current.map(x => [x.path, x]))
  // نتحقق من جميع الملفات قبل أول كتابة، حتى لا يبدأ التطبيق برد ناقص أو مسار غير مصرح به.
  const validatedPatches = patches.map((patch: any) => {
    const path = String(patch?.path || "")
    const content = typeof patch?.content === "string" ? patch.content : null
    if (!safeProjectPath(path) || content === null || content.length > 500_000 || !selected.includes(path)) {
      throw new Error(`مرحلة التحقق: تعديل غير صالح للملف ${path || "غير المحدد"}، ولم يُكتب أي ملف`)
    }
    const old = currentMap.get(path)
    if (old && old.content && !content.trim()) throw new Error(`مرحلة التحقق: رُفض تفريغ الملف ${path}، ولم يُكتب أي ملف`)
    return { path, content, reason: typeof patch?.reason === "string" ? patch.reason : "", old }
  })
  if (!validatedPatches.length) throw new Error("لم يتم تطبيق أي ملف بعد التحقق من التعديلات")

  const applied = []
  for (const patch of validatedPatches) {
    const result = await githubPutFile(patch.path, patch.content, patch.old?.sha, `chore: AI assistant - ${request.slice(0, 70)}`)
    applied.push({ path: patch.path, reason: patch.reason, commitUrl: result?.commit?.html_url || null })
  }
  let deployTriggered = false
  let deployError = ""
  if (VERCEL_DEPLOY_HOOK_URL) {
    try {
      const hookRes = await fetch(VERCEL_DEPLOY_HOOK_URL, { method: "POST", cache: "no-store" })
      deployTriggered = hookRes.ok
      if (!hookRes.ok) deployError = `Vercel Deploy Hook ${hookRes.status}`
    } catch (e: any) {
      deployError = e?.message ? String(e.message).slice(0, 200) : "تعذّر الاتصال بـ Vercel Deploy Hook"
    }
  }
  // حالة النشر بصيغة عربية واضحة تُعرض للمسؤول مباشرة في صفحة المساعد.
  const deploymentMode = VERCEL_DEPLOY_HOOK_URL ? "vercel-hook" : "github-auto-deploy"
  let deployStatus = ""
  if (deployTriggered) {
    deployStatus = "🚀 تم تشغيل النشر على Vercel تلقائياً عبر Deploy Hook."
  } else if (deployError) {
    deployStatus = `⚠️ حُفظت التعديلات على GitHub لكن تعذّر تشغيل Deploy Hook (${deployError}). سيبدأ النشر تلقائياً إذا كان المستودع مربوطاً بـ Vercel.`
  } else {
    deployStatus = "🚀 حُفظت التعديلات على GitHub؛ سيبدأ Vercel النشر تلقائياً إذا كان المستودع مربوطاً بالمشروع."
  }
  return {
    applied,
    summary: patchResult.summary || "تم تطبيق التعديلات المطلوبة",
    tests: Array.isArray(patchResult.tests) ? patchResult.tests : [],
    deployTriggered,
    deployStatus,
    deploymentMode,
  }
}

export async function POST(req: Request) {
  const originError = rejectCrossOrigin(req)
  if (originError) return originError
  const auth = await requireUser(req)
  if (auth.response) return auth.response
  let body: any = {}
  const requestId = crypto.randomUUID()
  safeAudioLog("request started", { requestId })
  try {
    const contentLength = Number(req.headers.get("content-length") || 0)
    if (contentLength > AUDIO_MAX_REQUEST_BYTES) {
      return json({
        error: "حجم التسجيل كبير جداً للإرسال. سجّل مقطعاً أقصر من دقيقة ونصف ثم أعد المحاولة.",
        code: "AUDIO_PAYLOAD_TOO_LARGE",
        retryable: false,
        diagnostics: { executedOn: "server", stage: "request", provider: "automatic-audio" },
      }, 413)
    }
    body = await req.json()
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error || "طلب غير صالح")
    return json({
      error: "تعذر قراءة التسجيل المرسل. تأكد من أن المقطع غير فارغ وبصيغة صوت مدعومة.",
      code: "INVALID_AUDIO_REQUEST",
      retryable: false,
      diagnostics: { executedOn: "server", stage: "request", reason: reason.slice(0, 200) },
    }, 400)
  }

  const isAudioMode = typeof body?.mode === "string" && AUDIO_MODES.has(body.mode)
  const diagnostics = {
    executedOn: "server",
    keyConfigured: isAudioMode ? (isGeminiConfigured() || isGroqConfigured()) : (isGroqConfigured() || isGeminiConfigured()),
    providerStatus: 200,
    provider: isAudioMode ? "automatic-audio" : "automatic",
    providerLabel: isAudioMode ? "Automatic audio provider" : "Automatic AI provider",
    configuredModel: isAudioMode ? `${GEMINI.model} / ${GROQ.transcriptionModel} + ${GROQ.model}` : `${GEMINI.model} / ${GROQ.model}`,
  }
  const setAudioDiagnostics = (result: AudioProviderResult) => {
    diagnostics.provider = result.provider
    diagnostics.providerLabel = result.providerLabel
    diagnostics.configuredModel = result.model
  }

  try {
    // 1) وضع لنص الحر (صندوق اختبار الذاء الا��طناعي)
    if (typeof body.prompt === "string" && body.prompt.trim() && !body.mode) {
      const prompt = body.prompt.trim().slice(0, 6000)
      const reference = await getReferenceContext(prompt).catch(() => "")
      const text = await runText(
        `${reference ? `${reference}\n\n` : ""}السؤال:\n${prompt}`,
        "أجب عن أي سؤال مسموح، داخل موضوع المنصة أو خارجه. اجعل طول الإجابة على قدر السؤال فقط: إن كان بسيطاً فأجب بجملة قصيرة، ولا تضف تفصيلاً أو أمثلة إلا إذا طُلبت. استخدم المرجعين المرفقين عند فائدتهما في الأسئلة القرآنية للتحقق من الدقة، لكن لا تعتبرهما حدوداً لمعرفتك ولا المصدر الوحيد لإجابتك. لا تختلق نصاً قرآنياً. أعد الجواب مباشرة بلا تحية أو مقدمة أو عنوان أو خاتمة أو ذكر للنموذج أو للمرجع.",
        typeof body.temperature === "number" ? body.temperature : 0.35,
      )
      return json({ result: text.trim(), diagnostics })
    }

    const mode = body.mode as string
    const payload = body.payload || {}
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.15
    if (mode === "admin_assistant" || mode === "dev_assistant" || mode === "github_sync") {
      const admin = await requireAdmin(req)
      if (admin.response) return admin.response
    }

    // 1.ب) المساعد الذكي للالب/ولي الأمر (ص حر مع سياق ب��انات الطالب)
    if (mode === "assistant") {
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
      if (!prompt) return json({ error: "لم يصل نص السؤال", diagnostics }, 400)
      const reference = await getReferenceContext(prompt).catch(() => "")
      const text = await runText(
        `${reference ? `${reference}\n\n` : ""}السؤال:\n${prompt.slice(0, 6000)}`,
        "أنت مساعد المنصة الذكي، مساعد عر��ي طبيعي ودقيق. أجب عن أي سؤال مسموح داخل المنصة أو خارجها، وأعط الأولوية لبيانات المنصة فقط عندما تكون ذات صلة. اجعل طول الجواب على قدر السؤال: جواب مباشر وقصير للسؤال البسيط، وتفصيل منظم فقط عند طلبه. تعامل مع التحيات والعبارات الاجتماعية بصورة طبيعية؛ مثال: إذا قال المستخدم السلام عليكم فرد: وعليكم السلام ورحمة الله وبركاته 🥰 هل لديك سؤال؟ أنا في خدمتك! استخدم الرموز التعبيرية باعتدال في الحديث الودي فقط، وتجنبها في الإجابات العلمية أو الحساسة. استخدم لغة عربية بسيطة واحترافية ولا تكرر السؤال. في القرآن والمتشابهات استخدم مقتطفات المرجعين للتحقق عند توفها، لكن لا تحصر معرفتك فيهما، ولا تختلق آية أو معلومة.",
        typeof body.temperature === "number" ? body.temperature : 0.35,
      )
      return json({ result: text.trim(), diagnostics })
    }

    // 2) جلب نطاق السور المحدد كاملاً ثم توليد الأسئلة عبر Gemini مع Groq احتياطياً.
    if (mode === "generate_exam") {
      const startSurahNumber = Number(payload.surahNumber)
      const endSurahNumber = payload.endSurahNumber == null ? 114 : Number(payload.endSurahNumber)
      if (!Number.isInteger(startSurahNumber) || startSurahNumber < 1 || startSurahNumber > 114) return json({ error: "رقم أول سورة غير صالح", diagnostics }, 400)
      if (!Number.isInteger(endSurahNumber) || endSurahNumber < startSurahNumber || endSurahNumber > 114) return json({ error: "آخر سورة يجب أن تكون بعد أول سورة داخل النطاق", diagnostics }, 400)

      const plan = (Array.isArray(payload.plan) ? payload.plan : []).map((item: any) => ({
        ...item,
        position: ["start", "middle", "end", "random"].includes(item?.position) ? item.position : "random",
      }))
      const requestedCount = Math.max(1, plan.reduce((sum: number, item: any) => sum + Math.max(0, Number(item?.count) || 0), 0))
      const topic = typeof payload.topic === "string" ? payload.topic.trim().slice(0, 240) : ""
      if (topic.length < 5) return json({ error: "اكتب موضوعاً واضحاً يقود توليد الأسئلة", diagnostics }, 400)
      const easyShortSurahNumbers = new Set([93, 94, 95, 97, 98, 99, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114])
      const allNumbers = Array.from({ length: endSurahNumber - startSurahNumber + 1 }, (_, index) => startSurahNumber + index)
        .filter((number) => payload.excludeEasyShortSurahs === false || !easyShortSurahNumbers.has(number))
      if (!allNumbers.length) return json({ error: "النطاق المحدد لا يحتوي سوراً مناسبة لأسئلة عميقة بعد استبعاد السور القصيرة السهلة. وسّع نطاق السور ثم أعد المحاولة.", diagnostics }, 400)
      let seed: number = Array.from(topic as string).reduce<number>((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 2166136261)
      const distributedNumbers = allNumbers.map((number) => ({ number, rank: (seed = (seed * 1664525 + 1013904223) >>> 0) })).sort((a, b) => a.rank - b.rank).map((item) => item.number)
      const selectedNumbers = distributedNumbers.slice(0, Math.min(18, Math.max(requestedCount * 2, 8), distributedNumbers.length))
      const sourceSurahs = await Promise.all(selectedNumbers.map(async (number) => {
        const quranResponse = await fetch(`https://api.alquran.cloud/v1/surah/${number}`, { cache: "no-store", signal: AbortSignal.timeout(12_000) })
        const quran = await quranResponse.json().catch(() => null)
        if (!quranResponse.ok || quran?.code !== 200 || !Array.isArray(quran?.data?.ayahs)) throw new Error(`تعذر جلب السورة رقم ${number} من المصدر القرآني`)
        return {
          surah: String(quran.data.name || ""),
          surahNumber: number,
          verses: quran.data.ayahs.map((ayah: any) => ({ number: Number(ayah.numberInSurah), text: String(ayah.text || "") })),
        }
      }))
      const useReferenceFiles = payload.useReferenceFiles !== false
      const sourceFile = payload.sourceMode === "file" && payload.sourceFile && typeof payload.sourceFile === "object"
        ? { id: String(payload.sourceFile.id || "").slice(0, 120), name: String(payload.sourceFile.name || "").slice(0, 180), text: String(payload.sourceFile.text || "").slice(0, 60_000) }
        : null
      const topicTerms = topic.split(/\s+/).filter((term: string) => term.length > 2).slice(0, 12)
      const representativeVerses = sourceSurahs.flatMap((source) => {
        const length = source.verses.length
        return [source.verses[0], source.verses[Math.floor(length / 2)], source.verses[length - 1]].filter(Boolean).map((verse: { text: string }) => verse.text)
      })
      const referenceContext = useReferenceFiles
        ? await getReferenceContext(`${topic} ${topicTerms.join(" ")} ${sourceSurahs.map((source) => source.surah).join(" ")}`, representativeVerses).catch(() => "")
        : ""
      const pastScope = ["near", "far", "both"].includes(payload.pastScope) ? payload.pastScope : "both"
      const nearSurahs = Array.isArray(payload.nearSurahs) ? payload.nearSurahs.map(String).slice(0, 114) : []
      const farSurahs = Array.isArray(payload.farSurahs) ? payload.farSurahs.map(String).slice(0, 114) : []
      const previousQuestionFingerprints = Array.isArray(payload.previousQuestionFingerprints)
        ? payload.previousQuestionFingerprints.map(String).map((value: string) => value.slice(0, 240)).slice(0, 500)
        : []
      const safePayload = { topic, plan, startSurahNumber, endSurahNumber, pastScope, nearSurahs, farSurahs, sourceSurahs, referenceContext, sourceFile, useReferenceFiles, previousQuestionFingerprints }
      const text = await runText(JSON.stringify(safePayload), SYS_EXAM + "\nالتزم بالسءءر الموجودة في sourceSurahs فقط، واجعل كل سؤال تطبيقاً مباشراً لموضوع المسؤول topic لا لمطلع السورة. pastScope يحدد الماضي القريب أو البعيد أو كليهما؛ وعند both اجعل قرابة 70% من الأسئلة من nearSurahs و30% من farSurahs. إذا وُجد sourceFile فاستخرج منه أفكار الأسئلة والمتشابهات ذات الصلة بالموضوع، ثم طابق كل موضع مع sourceSurahs قبل اعتماده. استفد من referenceContext لصياغة المتشابهات والفروق اللفظية الدقيقة. نوّع المواضع عبر كامل السور ولا تبدأ دائماً من أوائلها. استبعد previousQuestionFingerprints تماماً. في complete وaudio لا تضع كلمات الإجابة في prompt أو stem. ممنوع إعادة كتابة أو تعديل نص أي آية.", temperature)
      const parsed = extractJson(text)
      const questions = Array.isArray(parsed) ? parsed : parsed?.questions
      if (!Array.isArray(questions)) return json({ error: "تعذر توليد أسئلة صالحة", diagnostics }, 502)
      const sourcesByName = new Map(sourceSurahs.map((source) => [source.surah, source]))
      const safeQuestions = questions.slice(0, requestedCount).map((question: any, questionIndex: number) => {
        const source = sourcesByName.get(String(question?.surah || "")) || sourceSurahs.find((item) => item.surahNumber === Number(question?.surahNumber)) || sourceSurahs[questionIndex % sourceSurahs.length]
        const from = Math.max(1, Math.min(source.verses.length, Number(question?.from) || 1))
        const to = Math.max(from, Math.min(source.verses.length, Number(question?.to) || from))
        const type = ["mcq", "truefalse", "complete", "audio"].includes(question?.type) ? question.type : "mcq"
        const referenceAnswer = source.verses.slice(from - 1, to).map((verse: { text: string }) => verse.text).join(" ")
        const correct = type === "complete" || type === "audio"
          ? referenceAnswer
          : String(question?.correct || "").trim()
        const defaultPrompts: Record<string, string> = {
          mcq: "اختر الإجابة الصحيحة اعتماداً على المقطع المصور من المصحف",
          truefalse: "حدّد ما إذا كانت العبارة صحيحة أم خاطئة اعتماداً على المقطع المصوّر من المصحف",
          complete: "أكمل المقطع المخفي في صورة المصحف",
          audio: "سجّل تلاوة المقطع المعروض من المصحف",
        }
        let prompt = String(question?.prompt || defaultPrompts[type])
          .replace(/(?:الإجابة|الجواب)\s*(?:الصحية)?\s*[:：].*$/giu, "")
          .replace(/\s+/g, " ")
          .trim()
        const verseTexts = source.verses.slice(from - 1, to).map((verse: { text: string }) => normalizeQuranText(verse.text)).filter(Boolean)
        const normalizedPrompt = normalizeQuranText(prompt)
        const normalizedCorrect = normalizeQuranText(correct)
        const answerWords = normalizedCorrect.split(" ").filter((word) => word.length > 2)
        const leaksVerse = verseTexts.some((verse: string) => verse.length > 5 && (normalizedPrompt.includes(verse) || verse.includes(normalizedPrompt)))
        const leaksAnswer = normalizedCorrect.length > 2 && (normalizedPrompt.includes(normalizedCorrect) || answerWords.filter((word) => normalizedPrompt.includes(word)).length >= Math.min(2, answerWords.length))
        if (!prompt || leaksVerse || leaksAnswer) prompt = defaultPrompts[type]

        let options = Array.isArray(question?.options)
          ? question.options.map((option: unknown) => String(option || "").trim()).filter(Boolean)
          : []
        if (type === "truefalse") options = ["صح", "خطأ"]
        if (type === "mcq") {
          options = Array.from(new Set(options))
          if (correct && !options.includes(correct)) options.unshift(correct)
          const expectedOptions = Math.max(2, Math.min(6, Number(plan[questionIndex]?.optionsCount) || 4))
          options = options.slice(0, expectedOptions)
          if (options.length !== expectedOptions || !correct || options.filter((option: string) => option === correct).length !== 1) return null
          const normalizedSurah = normalizeQuranText(source.surah)
          const answerIsReferenced = normalizedCorrect === normalizedSurah || source.verses.some((verse: { text: string }) => {
            const normalizedVerse = normalizeQuranText(verse.text)
            return normalizedVerse === normalizedCorrect || normalizedVerse.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedVerse)
          })
          if (!answerIsReferenced) return null
        }
        if (type === "truefalse" && !options.includes(correct)) return null
        if (!prompt || from > to || !correct) return null
        const fingerprint = [type, source.surahNumber, from, to, normalizeQuranText(prompt), normalizeQuranText(correct)].join("|")
        if (previousQuestionFingerprints.includes(fingerprint)) return null

        return {
          ...question,
          type,
          surah: source.surah,
          surahNumber: source.surahNumber,
          from,
          to,
          prompt,
          stem: "",
          options,
          correct,
          questionImage: `/api/quran-question-image?surah=${source.surahNumber}&ayah=${from}&to=${to}&type=${type}`,
          source: sourceFile ? "file" : "مرجع قرآني موثوق",
          sourceFileId: sourceFile?.id || "",
          sourceFileName: sourceFile?.name || "",
          fingerprint,
          validated: true,
        }
      }).filter(Boolean)
      if (!safeQuestions.length) return json({ error: "لم تجتز الأسئلة فحص الجودة والوضوح. جرّب توسيع النطاق أو زيادة دقة الموضوع.", diagnostics }, 502)
      return json({ result: safeQuestions, diagnostics, source: sourceFile ? sourceFile.name : "Al Quran Cloud", range: { startSurahNumber, endSurahNumber } })
    }

    if (mode === "student_voice_intake") {
      if (payload?.role !== "admin") return json({ error: "هذه الميزة متاحة للمسؤول فقط", diagnostics }, 403)
  let audioBase64: string
  let mimeType: string
  try { audioBase64 = normalizeAudioData(payload.audioBase64); mimeType = normalizeAudioMimeType(payload.mimeType); safeAudioLog("audio received", { requestId, mimeType, sizeBytes: Math.floor(audioBase64.length * 0.75) }) } catch (error) { const failure = classifyAiFailure(error); safeAudioLog("audio rejected", { requestId, code: failure.code, status: failure.status }); return json({ success: false, error: failure.code, message: failure.message, provider: "automatic-audio", retryable: failure.retryable }, failure.status) }

      const system = `أنت تستخرج بيانات طالب من إملاء عربي أو إنجليزي أو مختلط لمسؤول مدرسة. اكتشف اللغة تلقائياً، وانسخ الكلام بلغته الأصلية دون ترجمة. أعد JSON فقط بلا markdown بهذه المفاتيح حصراً:
transcript,detectedLanguage,name,username,national,phone,birth,studentPass,parent,parentPass,subjects,juz,surah,notes.
detectedLanguage يجب أن تكون ar أو en أو mixed. subjects مصفوفة نصوص، وبقية القيم نصوص. لا تخمّن أي قيمة لم تُذكر بوضوح؛ استخدم نصاً فارغاً أو مصفوفة فارغة. حوّل الأرقام العربية إلى إنجليزية. birth يجب أن يكون YYYY-MM-DD فقط إن أمكن فهم تاريخ كامل. national حدّه 14 رقماً وphone حدّه 11 رقماً. juz رقم من 1 إلى 30 كنص. انسخ الأسماء والأرقام وكلمات المرور بدقة، وكلمات المرور فقط إذا نطقها المسؤول صراحة. transcript هو التفريغ الكامل المسموع بلغته الأصلية.`
      const audioResult = await runAudio("استمع إلى الإملاء واستخرج بيانات الطالب منه، سواء كان عربياً أو إنجليزياً أو مختلطاً. أعد JSON فقط.", system, 0.05, { mimeType, data: audioBase64 })
      setAudioDiagnostics(audioResult)
      const parsed = extractJson(audioResult.text)
      if (!parsed || typeof parsed !== "object") throw new Error("AUDIO_PROVIDERS_FAILED: تعذر فهم بيانات الطالب من التسجيل")
      const clean = (value: unknown, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : ""
      const latinDigits = (value: unknown) => clean(value, 500)
        .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
        .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      const digits = (value: unknown, max: number) => latinDigits(value).replace(/[^0-9]/g, "").slice(0, max)
      const birthCandidate = latinDigits(parsed.birth).slice(0, 10)
      const birthDate = /^\d{4}-\d{2}-\d{2}$/.test(birthCandidate) ? new Date(`${birthCandidate}T00:00:00Z`) : null
      const birth = birthDate && !Number.isNaN(birthDate.getTime()) && birthDate.toISOString().slice(0, 10) === birthCandidate ? birthCandidate : ""
      const juzNumber = Math.min(30, Math.max(0, Number.parseInt(digits(parsed.juz, 2), 10) || 0))
      const detectedLanguage = parsed.detectedLanguage === "en" || parsed.detectedLanguage === "mixed" ? parsed.detectedLanguage : "ar"
      return json({ result: {
        transcript: clean(parsed.transcript, 4000),
        detectedLanguage,
        audioEngine: audioResult.provider,
        audioModel: audioResult.model,
        fields: {
          name: clean(parsed.name, 120), username: clean(parsed.username, 80),
          national: digits(parsed.national, 14), phone: digits(parsed.phone, 11), birth,
          studentPass: clean(parsed.studentPass, 100), parent: clean(parsed.parent, 120),
          parentPass: clean(parsed.parentPass, 100),
          subjects: Array.isArray(parsed.subjects) ? parsed.subjects.map((x: unknown) => clean(x, 80)).filter(Boolean).slice(0, 12) : [],
          juz: juzNumber ? String(juzNumber) : "", surah: clean(parsed.surah, 80), notes: clean(parsed.notes, 1000),
        },
      }, diagnostics })
    }

    // البصمة الصوتية: إنشاؤها بجميناي عند التسجيل الأول للطالب.
    if (mode === "voice_print" || mode === "voice_match") {
  let audioBase64: string
  let mimeType: string
  try { audioBase64 = normalizeAudioData(payload.audioBase64); mimeType = normalizeAudioMimeType(payload.mimeType || "audio/wav") } catch (error) { const failure = classifyAiFailure(error); return json({ error: failure.message, code: failure.code, diagnostics }, failure.status) }
      const audio = { mimeType, data: audioBase64 }

      if (mode === "voice_print") {
        const audioResult = await runAudio("حلّل خصائص صوت المتحدث في هذا التسجيل وأنشئ بصمة صوتية وصفية. تجاهل لغة الكلام. أعد JSON فقط.", SYS_VOICE_PRINT, 0.05, audio)
        setAudioDiagnostics(audioResult)
        const parsed = extractJson(audioResult.text) || {}
        const speaker = parsed.speaker && typeof parsed.speaker === "object" ? parsed.speaker : {}
        return json({ result: {
          engine: audioResult.provider,
          model: audioResult.model,
          createdAt: new Date().toISOString(),
          speaker,
          quality: typeof parsed.quality === "string" ? parsed.quality : "good",
          usable: parsed.usable !== false,
          reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 300) : "",
        }, diagnostics })
      }

      const referenceProfile = payload.referenceProfile && typeof payload.referenceProfile === "object" ? payload.referenceProfile : null
      if (!referenceProfile) return json({ error: "لا توجد بصمة صوتية مرجعية محفوظة لهذا الحساب", diagnostics }, 400)
      const audioResult = await runAudio(
        `البصمة المرجعية المحفوظة:\n${JSON.stringify(referenceProfile).slice(0, 4000)}\n\nقارن صوت هذا التسجيل بالبصمة المرجعية بصرف النظر عن كون الكلام عربياً أو إنجليزياً. أعد JSON فقط.`,
        SYS_VOICE_MATCH,
        0.05,
        audio,
      )
      setAudioDiagnostics(audioResult)
      const parsed = extractJson(audioResult.text) || {}
      const matchPercent = Math.max(0, Math.min(100, Math.round(Number(parsed.matchPercent) || 0)))
      return json({ result: {
        engine: audioResult.provider,
        model: audioResult.model,
        sameSpeaker: parsed.sameSpeaker === true || (parsed.sameSpeaker !== false && matchPercent >= 70),
        matchPercent,
        confidence: typeof parsed.confidence === "string" ? parsed.confidence : "medium",
        quality: typeof parsed.quality === "string" ? parsed.quality : "good",
        reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 300) : "",
        profile: parsed.profile && typeof parsed.profile === "object" ? parsed.profile : {},
      }, diagnostics })
    }

    if (mode === "admin_assistant") {
      if (payload?.role !== "admin") return json({ error: "هذه الميزة متاحة للمسؤول فقط", diagnostics }, 403)
      const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 3000) : ""
      if (!message) return json({ error: "اكتب رسالتك أولاً", diagnostics }, 400)
      const context = JSON.stringify(payload.context || {}).slice(0, 18_000)
      const reference = await getReferenceContext(message).catch(() => "")
      const result = await runText(`بيانات الموقع المنقحة:\n${context}\n\n${reference ? `${reference}\n\n` : ""}سؤال المسؤول:\n${message}`, "أنت مساعد المنصة الذكي، مساعد عربي دقيق واحترافي وطبيعي. أجب عن أي سؤال مسموح داخل الموقع أو خارجه، واستخدم بيانات الموقع عند صلتها فقط. افهم مقصد المستخدم قبل الرد، وميّز بوضوح بين الحقيقة والاقتراح، ولا تختلق بيانات أو آيات. اجعل الرد مبسطاً ومهذباً وعلى قدر السؤال، مع تنظيم الخطوات عند الحاجة فقط. رد على التحيات بصورة ودودة وطبيعية؛ فإذا قال المستخدم السلام عليكم فابدأ بـ: وعليكم السلام ورحمة الله وبركاته 🥰 هل لديك سؤال؟ 🤔 أنا في خدمتك! 🫡. استخدم الرموز التعبيرية باعتدال لتوضيح الحالة في الحديث الودي، وتجنبها في الردود العلمية والحساسة. استخدم المرجعين للمسائل القرآنية والمتشابهات للتحقق دون حصر معرفتك فيهما.", 0.2)
      return json({ result: result.trim(), diagnostics })
    }

    // 3) تصحيح نص (أكمل)
    if (mode === "grade_text") {
      const text = await runText(JSON.stringify(payload), SYS_GRADE_TEXT, temperature)
      const parsed = extractJson(text) || {}
      return json({
        result: {
          accepted: !!parsed.accepted,
          score: typeof parsed.score === "number" ? parsed.score : parsed.accepted ? 1 : 0,
          matchedPercent: typeof parsed.matchedPercent === "number" ? parsed.matchedPercent : 0,
          reason: parsed.reason || "",
          missingAyahs: Array.isArray(parsed.missingAyahs) ? parsed.missingAyahs : [],
        },
        diagnostics,
      })
    }

    // 4) تصحيح تلاوة من تفريغ نصي
    if (mode === "grade_recitation") {
      const text = await runText(JSON.stringify(payload), SYS_GRADE_RECITATION, temperature)
      const parsed = extractJson(text) || {}
      return json({
        result: {
          accepted: !!parsed.accepted,
          score: typeof parsed.score === "number" ? parsed.score : parsed.accepted ? 1 : 0,
          matchedPercent: typeof parsed.matchedPercent === "number" ? parsed.matchedPercent : 0,
          reason: parsed.reason || "",
          missingAyahs: Array.isArray(parsed.missingAyahs) ? parsed.missingAyahs : [],
        },
        diagnostics,
      })
    }

    // 5) تفريغ صوت حقيقي + تصحيح (تحليل الصوت على الخادم)
    if (mode === "transcribe_and_grade") {
      const { audioBase64, mimeType, surah, from, to, expectedText } = payload
      if (!audioBase64) {
        return json({ error: "لم يصل ملف صوتي للتحليل", diagnostics }, 400)
      }
      let normalizedMimeType: string
      try { normalizedMimeType = normalizeAudioMimeType(mimeType) } catch (error) { return json({ error: error instanceof Error ? error.message : "صيغة التسجيل غير مدعومة", diagnostics }, 415) }
      if (audioBase64.length > 12_000_000) return json({ error: "التسجيل أكبر من الحد المسموح", diagnostics }, 413)

      const audio = { mimeType: normalizedMimeType, data: audioBase64 }
      let audioResult = await runAudio(
        `المقطع المطلوب:\n${JSON.stringify({ surah, from, to, expectedText }).slice(0, 12_000)}\n\nاستمع إلى تلاوة الطالب، فرّغها بالعربية ثم صححها مقابل المقطع المطلوب. أعد JSON فقط.`,
        SYS_TRANSCRIBE,
        0.05,
        audio,
      )
      setAudioDiagnostics(audioResult)
      let parsed = extractJson(audioResult.text)
      let usedTwoStageFallback = false

      // قد ينجح المزوّد في فهم الصوت لكنه يعيد نصاً عادياً بدلاً من JSON.
      // في هذه الحالة نحافظ على التفريغ ثم نصححه بطلب نصي مستقل بدلاً من إرجاع 503.
      if (!parsed || typeof parsed !== "object") {
        usedTwoStageFallback = true
        const transcriptResult = await transcribeAudio(audioBase64, normalizedMimeType)
        setAudioDiagnostics(transcriptResult)
        const transcript = transcriptResult.text.trim()
        if (!transcript) throw new Error("AUDIO_TRANSCRIPTION_EMPTY: لم يتمكن مزود الصوت من استخراج كلام واضح من التسجيل")
        const gradingText = await runText(
          JSON.stringify({ surah, from, to, expectedText, transcript }),
          SYS_GRADE_RECITATION,
          0.05,
        )
        const grading = extractJson(gradingText)
        if (!grading || typeof grading !== "object") throw new Error("AUDIO_GRADING_FORMAT: تم تفريغ التسجيل لكن تعذر تنسيق نتيجة التصحيح")
        parsed = { ...grading, transcript, isRecitation: grading.isRecitation !== false }
        audioResult = transcriptResult
      }

      const transcript = typeof parsed.transcript === "string" ? parsed.transcript.trim() : ""
      if (!transcript) {
        const transcriptResult = await transcribeAudio(audioBase64, normalizedMimeType)
        setAudioDiagnostics(transcriptResult)
        parsed.transcript = transcriptResult.text.trim()
        audioResult = transcriptResult
        usedTwoStageFallback = true
      }
      const totalAyahs = Math.max(1, Number(to || from || 1) - Number(from || 1) + 1)
      const missingAyahs = Array.isArray(parsed.missingAyahs) ? parsed.missingAyahs.map(String).slice(0, totalAyahs) : []
      const missingCount = missingAyahs.length
      const calculatedScore = Math.max(0, Math.min(1, (totalAyahs - missingCount) / totalAyahs))
      const numericScore = Number(parsed.score)
      const modelScore = Number.isFinite(numericScore) ? Math.max(0, Math.min(1, numericScore)) : calculatedScore
      const score = missingCount > 0 ? Math.min(modelScore, calculatedScore) : modelScore
      const numericPercent = Number(parsed.matchedPercent)
      return json({
        result: {
          transcript: String(parsed.transcript || "").trim(),
          detectedLanguage: "ar",
          audioEngine: audioResult.provider,
          audioModel: audioResult.model,
          accepted: parsed.isRecitation !== false && score >= 0.5,
          score,
          matchedPercent: Number.isFinite(numericPercent) ? Math.max(0, Math.min(100, numericPercent)) : Math.round(score * 100),
          isRecitation: parsed.isRecitation !== false,
          reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 500) : "",
          missingAyahs,
          scoring: { totalAyahs, missingAyahs: missingCount, method: "(total-missing)/total" },
        },
        diagnostics: { ...diagnostics, stage: usedTwoStageFallback ? "transcription-then-grading" : "combined-audio-analysis" },
      })
    }

    // 6.أ) فحص جاهزية مساعد التطوير (للمسول) — يتحقق من المتغيرات والشبكة والمستودع والصلاحيات دون كش أي سرّ.
    if (mode === "dev_preflight") {
      if (payload?.role !== "admin") return json({ error: "هذه الميزة متاحة للمسؤول فقط", diagnostics }, 403)
      const pf = await preflightAutoApply()
      return json({
        result: {
          ready: pf.ok,
          reason: pf.reason || "",
          checks: {
            aiProviders: { gemini: !!GEMINI.key, groq: !!GROQ.key, speechToText: !!(process.env.SPEECH_TO_TEXT_API_KEY || "").trim() },
            githubToken: !!GITHUB_TOKEN,
            githubOwner: !!GITHUB_OWNER,
            githubRepo: !!GITHUB_REPO,
            autoApplyEnabled: AUTO_DEV_ENABLED,
          },
          // أسماء عامة (ليست أسراراً) لتأكيد المسؤول أن القيم مضبوطة بشكل صحيح.
          resolved: {
            owner: GITHUB_OWNER || null,
            repo: GITHUB_REPO || null,
            branch: GITHUB_BRANCH_ENV || null,
          },
          ...(pf.details || {}),
        },
        diagnostics: { ...diagnostics, githubConfigured, autoDevEnabled: AUTO_DEV_ENABLED },
      })
    }

    // 6) ماعد تطوير الموقع — تحليل فقط أو تطبيق تلقائي عند طلب المسؤول
    if (mode === "dev_assistant") {
      if (payload?.role !== "admin") return json({ error: "هذه الميزة متاحة للمسؤول فقط", diagnostics }, 403)
      const request = typeof payload.request === "string" ? payload.request.trim() : ""
      if (!request) return json({ error: "يرجى كتابة طلب التطوير", diagnostics }, 400)
      if (request.length > 4000) return json({ error: "طلب التطوير طويل جداً (الحد الأقصى 4000 حرف)", diagnostics }, 400)
      const tree = githubConfigured ? await githubListTree() : { files: [
        "public/index.html", "app/api/ai/route.ts", "app/page.tsx", "app/layout.tsx",
        "app/globals.css", "next.config.mjs", "package.json", "components/ui/button.tsx",
        "lib/utils.ts", ".env.example", "DEPLOY.md",
      ] }
      const userPrompt = `بنية المشروع الحالية:\n${PROJECT_MANIFEST}\n\nقائمة الملفات الفعلية في المسودع:\n${tree.files.join("\n")}\n\nطلب المسؤول:\n${request}\n\nحلّل الطلب وأعد خطة ا��تعديل بصيغة JSON فقط كما هو محدد. اختر الملفات الفعلية من قائمة المستودع كلما أمكن.`
      const text = await runText(userPrompt, SYS_DEV_ASSISTANT, 0.2)
      const parsed = extractJson(text)
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.files)) {
        return json({ error: "مرحلة تحليل الطلب: أعاد النموذج JSON غير صالح، ولم يُكتب أي ملف", diagnostics: { ...diagnostics, stage: "planning", githubConfigured, autoDevEnabled: AUTO_DEV_ENABLED } }, 502)
      }
      const knownPaths = new Set(tree.files)
      const files = Array.isArray(parsed.files) ? parsed.files.map((f: any) => ({
        path: typeof f?.path === "string" ? f.path.trim() : "",
        action: f?.action === "create" ? "create" : "modify",
        reason: typeof f?.reason === "string" ? f.reason : "",
        changes: Array.isArray(f?.changes) ? f.changes.filter((x: any) => typeof x === "string").slice(0, 8) : [],
      })).filter((f: any) => f.path && (knownPaths.has(f.path) || f.action === "create")) : []
      const plan = {
        understanding: typeof parsed.understanding === "string" ? parsed.understanding : "",
        feasible: parsed.feasible !== false,
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
        files,
        steps: Array.isArray(parsed.steps) ? parsed.steps.filter((x: any) => typeof x === "string").slice(0, 12) : [],
        risks: Array.isArray(parsed.risks) ? parsed.risks.filter((x: any) => typeof x === "string").slice(0, 12) : [],
        clarifications: Array.isArray(parsed.clarifications) ? parsed.clarifications.filter((x: any) => typeof x === "string").slice(0, 8) : [],
        applied: false,
      }
      if (payload.autoApply === true && plan.feasible !== false) {
        try {
          const applied = await autoApplyDevRequest(request, plan)
          return json({ result: { ...plan, ...applied, applied: true, autoApplied: true, note: "تم تطبيق التعديلات تلقائياً على المشروع من الخادم. إذا كان Vercel مربوطاً بالمستودع فسيبدأ النشر تلقائياً، أو يمكن استخدام VERCEL_DEPLOY_HOOK_URL." }, diagnostics: { ...diagnostics, githubConfigured, autoDevEnabled: AUTO_DEV_ENABLED } })
        } catch (e:any) {
          const failure = classifyAiFailure(e)
          const isProviderFailure = /Gemini|Groq|generativelanguage|api\.groq\.com|rate.?limit|insufficient credits/i.test(failure.raw)
          return json({
            error: isProviderFailure ? failure.message : (e?.message || "تعذر التطبيق التلقائي"),
            result: { ...plan, applied: false, autoApplied: false },
            retryable: isProviderFailure ? failure.retryable : false,
            code: isProviderFailure ? failure.code : "DEV_APPLY_ERROR",
            diagnostics: {
              ...diagnostics,
              stage: "apply",
              githubConfigured,
              autoDevEnabled: AUTO_DEV_ENABLED,
              reason: failure.raw.slice(0, 300),
            },
          }, isProviderFailure ? failure.status : 500)
        }
      }
      return json({ result: { ...plan, note: "الخطة فقط — لم يتم تطبيق أي تعديل.", autoApplied: false }, diagnostics: { ...diagnostics, githubConfigured, autoDevEnabled: AUTO_DEV_ENABLED } })
    }

    // 7) حالة مزامنة GitHub — للمسؤول فقط. يتحقق من الاتصال بمستودع المسؤول ويعرض آخر commit وسجل التعديلات.
    if (mode === "github_status") {
      if (payload?.role !== "admin") return json({ error: "هذه الميزة متاحة للمسؤول فقط", diagnostics }, 403)
      const status = await getGithubSyncStatus()
      return json({ result: status, diagnostics: { ...diagnostics, githubConfigured, autoDevEnabled: AUTO_DEV_ENABLED } })
    }

    // 8) حذف ملف من المستودع — للمسؤول فقط، بتأكيد صريح، مع حماية الملفات الأساسية. ينشئ commit ويحافظ على التاريخ.
    if (mode === "github_delete") {
      if (payload?.role !== "admin") return json({ error: "هذه الميزة متاحة للمسؤول فقط", diagnostics }, 403)
      if (payload?.confirm !== true) return json({ error: "الحذف يتطلب تأكيداً صريحاً من المسؤول", diagnostics }, 400)
      const path = typeof payload.path === "string" ? payload.path.trim() : ""
      if (!path) return json({ error: "يرجى تحديد مسار الملف المراد حذفه", diagnostics }, 400)
      // الحذف عملية يدوية صريحة بتأكيد المسؤول، لا تتطلب تفعيل الدفع التلقائي — يكفي اتصال المستودع وصلاحية الكتابة.
      const st = await getGithubSyncStatus()
      if (!st.connected) return json({ error: st.reason || "لمزامنة مع GitHub غير متصلة", diagnostics }, 400)
      if (!st.canWrite) return json({ error: `الرمز GITHUB_TOKEN لا يملك صلاحية الكتابة على ${st.repo}`, diagnostics }, 400)
      try {
        const message = `chore: delete ${path} (admin request via sync panel)`
        const result = await githubDeleteFile(path, message)
        return json({
          result: {
            deleted: true,
            path,
            commitUrl: result?.commit?.html_url || null,
            note: "تم حذف الملف وإنشاء commit في مستودعك. الإصدارات السابقة محفوظة في سجل GitHub.",
          },
          diagnostics: { ...diagnostics, githubConfigured },
        })
      } catch (e: any) {
        return json({ error: e?.message || "تعذر حذف الملف", diagnostics: { ...diagnostics, githubConfigured } }, 500)
      }
    }

    return json({ error: "وضع غير معروف", diagnostics }, 400)
  } catch (err: any) {
    const failure = classifyAiFailure(err)
    const mode = typeof body?.mode === "string" ? body.mode : "prompt"
    safeAudioLog("request failed", { requestId, mode, status: failure.status, code: failure.code, retryable: failure.retryable })
    const stage = mode === "dev_assistant" ? "analysis" : mode === "generate_exam" ? "exam-generation" : "response"
    return json(
      {
        error: failure.message,
        code: failure.code,
        retryable: failure.retryable,
      diagnostics: {
        executedOn: "server",
        provider: providerFromError(err) || (AUDIO_MODES.has(mode) ? "automatic-audio" : "automatic"),
        keyConfigured: AUDIO_MODES.has(mode) ? (isGeminiConfigured() || isGroqConfigured()) : (isGroqConfigured() || isGeminiConfigured()),
        stage: AUDIO_MODES.has(mode) ? "audio-analysis" : stage,
        status: failure.status,
        requestId,
      },
      },
      failure.status,
      requestId,
    )
  }
}
