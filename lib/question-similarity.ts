/**
 * محرك كشف تشابه الأسئلة — يمنع تكرار الأسئلة المتشابهة في المعنى أو الصياغة
 *
 * يستخدم 3 طبقات مقارنة:
 * 1. مطابقة حرفيّة (exact match)
 * 2. مطابقة نصية مُوحَّدة (normalized match)
 * 3. مطابقة هيكليّة / قوالب لغوية (template match)
 */

import { db } from './db'
import { generatedQuestions, questionFingerprints } from './db/schema'
import { eq, or, like, sql } from 'drizzle-orm'

// ===== تنظيف النص للمقارنة =====

/**
 * إزالة التشكيل والקריאה وأحرف Unicode الزائدة
 */
function stripDiacritics(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // تشكيل
    .replace(/[\u0610-\u061A]/g, '') // تنقيط
    .replace(/[\u0640]/g, '') // كشيدة
    .replace(/[\u0671]/g, '') // ألف وصل
    .trim()
}

/**
 * توحيد الأحرف العربية المتشابهة
 */
function unifyArabicChars(text: string): string {
  return text
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim()
}

/**
 * إزالة علامات الترقيم والمسافات الزائدة
 */
function removePunctuation(text: string): string {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * توليد بصمة نصية مُوحَّدة ل السؤال
 */
export function normalizeQuestionText(text: string): string {
  let normalized = text
  normalized = stripDiacritics(normalized)
  normalized = unifyArabicChars(normalized)
  normalized = removePunctuation(normalized)
  normalized = normalized.toLowerCase()
  return normalized.trim()
}

/**
 * استخراج keywords من السؤال (إزالة كلمات الإيقاف)
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'في', 'من', 'على', 'إلى', 'عن', 'مع', 'بين', 'قبل', 'بعد',
    'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'اللذين', 'اللتين',
    'ما', 'كيف', 'أين', 'متى', 'لماذا', 'هل', 'أي', 'كم',
    'السؤال', 'الإجابة', 'الصحيحة', 'الخاطئة', 'أكمل', 'حدد',
    'اختر', 'صح', 'خطأ', 'صحيح', 'خاطئ',
    'الآية', 'آية', 'السورة', 'سورة', 'قوله تعالى',
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'which',
    'where', 'when', 'how', 'who', 'does', 'do', 'did',
  ])
  return text.split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word))
}

// ===== مقارنة البصمات =====

/**
 * حساب مسافة Levenshtein بين نصّين
 */
function levenshteinDistance(a: string, b: string): number {
  const lenA = a.length
  const lenB = b.length
  if (lenA === 0) return lenB
  if (lenB === 0) return lenA

  const matrix: number[][] = Array.from({ length: lenA + 1 }, () => Array(lenB + 1).fill(0))
  for (let i = 0; i <= lenA; i++) matrix[i][0] = i
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }
  return matrix[lenA][lenB]
}

/**
 * نسبة التشابه بين نصّين (0-1)
 */
function similarityRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(a, b)
  return 1 - distance / maxLen
}

/**
 * نسبة تطابق الكلمات المفتاحية
 */
function keywordOverlap(a: string, b: string): number {
  const keywordsA = new Set(extractKeywords(a))
  const keywordsB = new Set(extractKeywords(b))
  if (keywordsA.size === 0 || keywordsB.size === 0) return 0
  let intersection = 0
  for (const word of keywordsA) {
    if (keywordsB.has(word)) intersection++
  }
  return intersection / Math.max(keywordsA.size, keywordsB.size)
}

/**
 * كشف القوالب اللغوية المتشابهة
 *
 * مثال:
 * - "ما الآية التي تبدأ بـ..." و "بأي آية تبدأ سورة..." ← متشابهان
 * - "أكمل الآية..." و "أكمل الآية..." ← متطابقان
 */
function extractTemplate(text: string): string {
  const normalized = normalizeQuestionText(text)

  // استبدال المحتوى المتغير بن placeholders
  let template = normalized
    // أسماء السور → [SURAH]
    .replace(/سورة\s+\S+/g, 'سورة [SURA]')
    .replace(/ف\S{2,8}\s+ت\S{1,6}/g, '[VERB]') // أفعال
    // أرقام الآيات
    .replace(/الآية\s+\S+/g, 'الآية [N]')
    .replace(/من\s+الآية\s+\S+/g, 'من الآية [N]')
    // إشارات ثابتة
    .replace(/قوله\s+تعالى/g, '[Q]')
    .replace(/من\s+قوله\s+تعالى/g, 'من [Q]')

  return template
}

/**
 * كشف التشابه الهيكلي (نفس النوع + نفس القالب + كلمات مفتاحية مشتركة)
 */
function structuralSimilarity(a: string, b: string): number {
  const templateA = extractTemplate(a)
  const templateB = extractTemplate(b)

  // إذا كان القالب متطابقاً
  if (templateA === templateB) return 0.9

  // نسبة تشابه القالب
  const templateSim = similarityRatio(templateA, templateB)

  // نسبة تطابق الكلمات المفتاحية
  const keywordSim = keywordOverlap(a, b)

  // متوسط موزون
  return templateSim * 0.6 + keywordSim * 0.4
}

// ===== واجهة الكشف العامة =====

export interface SimilarityCheckResult {
  isDuplicate: boolean
  similarityScore: number
  reason: string
  matchType: 'exact' | 'normalized' | 'template' | 'semantic' | 'none'
  matchedQuestionId?: string
}

/**
 * فحص تشابه سؤال مع أسئلة سابقة
 *
 * @param questionText - نص السؤال الجديد
 * @param questionType - نوع السؤال
 * @param surahName - اسم السورة
 * @param fromAyah - من آية
 * @param toAyah - إلى آية
 * @param threshold - عتبة القبول (0-1، افتراضي 0.75)
 */
export async function checkQuestionSimilarity(
  questionText: string,
  questionType: string,
  surahName: string,
  fromAyah: number,
  toAyah: number,
  threshold = 0.75,
): Promise<SimilarityCheckResult> {
  const normalized = normalizeQuestionText(questionText)

  // 1. فحص التطابق الحرفي الدقيق
  const exactMatch = await db
    .select({ id: generatedQuestions.id })
    .from(generatedQuestions)
    .where(eq(generatedQuestions.normalizedFingerprint, normalized))
    .limit(1)

  if (exactMatch.length > 0) {
    return {
      isDuplicate: true,
      similarityScore: 1.0,
      reason: 'تطابق حرفي مع سؤال سابق',
      matchType: 'exact',
      matchedQuestionId: exactMatch[0].id,
    }
  }

  // 2. فحص البصمات المحفوظة
  const fingerprints = await db
    .select({ fingerprint: questionFingerprints.fingerprint, questionId: questionFingerprints.questionId })
    .from(questionFingerprints)
    .where(eq(questionFingerprints.fingerprintType, 'normalized'))
    .limit(500)

  let bestMatch: { score: number; type: SimilarityCheckResult['matchType']; questionId: string } = { score: 0, type: 'none', questionId: '' }
  for (const fp of fingerprints) {
    const sim = similarityRatio(normalized, fp.fingerprint)
    if (sim > bestMatch.score) {
      bestMatch = { score: sim, type: 'normalized', questionId: fp.questionId }
    }
  }

  if (bestMatch.score >= threshold) {
    return {
      isDuplicate: true,
      similarityScore: bestMatch.score,
      reason: `تشابه نصي ${Math.round(bestMatch.score * 100)}% مع سؤال سابق`,
      matchType: bestMatch.type,
      matchedQuestionId: bestMatch.questionId,
    }
  }

  // 3. فحص القوالب اللغوية — نفس السورة + نفس النطاق + نفس النوع
  const similarByContext = await db
    .select({ id: generatedQuestions.id, questionText: generatedQuestions.questionText })
    .from(generatedQuestions)
    .where(
      or(
        eq(generatedQuestions.surah, surahName),
        like(generatedQuestions.questionText, `%${surahName}%`),
      ),
    )
    .limit(100)

  for (const q of similarByContext) {
    const templateSim = structuralSimilarity(questionText, q.questionText)
    if (templateSim > bestMatch.score) {
      bestMatch = { score: templateSim, type: 'template', questionId: q.id }
    }
  }

  if (bestMatch.score >= threshold) {
    return {
      isDuplicate: true,
      similarityScore: bestMatch.score,
      reason: `تشابه هيكلي ${Math.round(bestMatch.score * 100)}% (نفس القالب وال_areaية)`,
      matchType: bestMatch.type,
      matchedQuestionId: bestMatch.questionId,
    }
  }

  return {
    isDuplicate: false,
    similarityScore: bestMatch.score,
    reason: bestMatch.score > 0.5 ? `تشابه جزئي ${Math.round(bestMatch.score * 100)}% — مقبول` : 'لا يوجد تشابه',
    matchType: bestMatch.score > 0.5 ? bestMatch.type : 'none',
  }
}

/**
 * حفظ سؤال جديد مع بصمته
 */
export async function saveQuestion(
  id: string,
  questionText: string,
  type: string,
  level: string,
  surah: string,
  surahNumber: number,
  fromAyah: number,
  toAyah: number,
  topic: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const normalized = normalizeQuestionText(questionText)

  // حفظ السؤال
  await db.insert(generatedQuestions).values({
    id,
    questionText,
    type,
    level,
    surah,
    surahNumber,
    fromAyah,
    toAyah,
    topic,
    normalizedFingerprint: normalized,
    metadata,
  })

  // حفظ البصمة
  await db.insert(questionFingerprints).values({
    questionId: id,
    fingerprint: normalized,
    fingerprintType: 'normalized',
  })
}

/**
 * جلب بصمات أسئلة سابقة لنطاق محدد (تُستخدم في الـ prompt)
 */
export async function getRecentFingerprints(
  topic: string,
  surahNumbers: number[],
  limit = 200,
): Promise<string[]> {
  const results = await db
    .select({ fingerprint: questionFingerprints.fingerprint })
    .from(questionFingerprints)
    .innerJoin(generatedQuestions, eq(questionFingerprints.questionId, generatedQuestions.id))
    .where(
      or(
        eq(generatedQuestions.topic, topic),
        sql`${generatedQuestions.surahNumber} = ANY(${surahNumbers})`,
      ),
    )
    .limit(limit)

  return results.map(r => r.fingerprint)
}
