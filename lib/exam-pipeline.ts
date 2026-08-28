/**
 * Enhanced exam generation pipeline
 * Wraps the AI-generated questions through validation, deduplication, and persistence.
 */

import { checkQuestionSimilarity, saveQuestion, getRecentFingerprints } from './question-similarity'
import { validateQuranQuestion } from './quran-validator'

export interface EnhancedQuestionResult {
  questions: any[]
  stats: {
    totalGenerated: number
    accepted: number
    rejectedByValidation: number
    rejectedBySimilarity: number
  }
}

/**
 * Process AI-generated questions through the full pipeline:
 * 1. Validate Quran text
 * 2. Check similarity against DB
 * 3. Save to DB
 * 4. Return only valid, non-duplicate questions
 */
export async function processGeneratedQuestions(
  questions: any[],
  topic: string,
): Promise<EnhancedQuestionResult> {
  const validated: any[] = []
  let rejectedByValidation = 0
  let rejectedBySimilarity = 0

  for (const question of questions) {
    // 1. Validate Quran text
    const validation = validateQuranQuestion({
      surah: question.surah,
      surahNumber: question.surahNumber,
      from: question.from,
      to: question.to,
      type: question.type,
      correct: question.correct,
      options: question.options,
      prompt: question.prompt,
    })

    if (!validation.valid) {
      rejectedByValidation++
      continue
    }

    // 2. Check similarity
    const similarity = await checkQuestionSimilarity(
      question.prompt,
      question.type,
      question.surah,
      question.from,
      question.to,
      0.75,
    ).catch(() => ({ isDuplicate: false, similarityScore: 0 }))

    if (similarity.isDuplicate) {
      rejectedBySimilarity++
      continue
    }

    // 3. Save to DB
    const questionId = crypto.randomUUID()
    await saveQuestion(
      questionId,
      question.prompt,
      question.type,
      question.level || 'medium',
      question.surah,
      question.surahNumber,
      question.from,
      question.to,
      topic,
      { correct: question.correct, options: question.options },
    ).catch(() => { /* save is optional */ })

    validated.push(question)
  }

  return {
    questions: validated,
    stats: {
      totalGenerated: questions.length,
      accepted: validated.length,
      rejectedByValidation,
      rejectedBySimilarity,
    },
  }
}

/**
 * Get fingerprints to pass to the AI prompt for deduplication
 */
export async function getDeduplicationFingerprints(
  topic: string,
  surahNumbers: number[],
): Promise<string[]> {
  return getRecentFingerprints(topic, surahNumbers, 300).catch(() => [])
}
