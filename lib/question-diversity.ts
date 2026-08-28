/**
 * محرك تنوع الأسئلة — يضمن تنوع الأسئلة في النوع والصياغة والصعوبة
 *
 * يمنع:
 * - تكرار نفس النوع عدة مرات متتالية
 * - تكرار نفس القالب اللغوي
 * - جميع الأسئلة بنفس مستوى الصعوبة
 */

// ===== أنواع الأسئلة =====
export type QuestionType = 'mcq' | 'truefalse' | 'complete' | 'audio'

// ===== مستويات الصعوبة =====
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'advanced'

// ===== قوالب صياغة الأسئلة =====
export const QUESTION_TEMPLATES: Record<QuestionType, string[]> = {
  mcq: [
    'اختر الإجابة الصحيحة اعتماداً على المقطع المصوّر من المصحف',
    'أيّ من الخيارات التالية تطابق المقطع المعروض',
    'ما الإجابة الصحيحة بالنسبة للمقطع القرآني',
    'حدّد التكملة الصحيحة للمقطع',
  ],
  truefalse: [
    'حدّد ما إذا كانت العبارة صحيحة أم خاطئة',
    'هل العبارة التالية صحيحة بالنسبة للمقطع',
    'تحقق من صحة العبارة اعتماداً على المصحف',
    'ما حكم العبارة التالية',
  ],
  complete: [
    'أكمل المقطع المخفي في صورة المصحف',
    'أكمل الآية التالية',
    'اكتب التكملة الصحيحة للنص القرآني',
    'أكمل من قوله تعالى',
  ],
  audio: [
    'اقرأ المقطع المطلوب بصوت عالٍ',
    'سجّل تلاوة المقطع المعروض',
    'تلو المقطع القرآني المحدد',
    'القرأة على الوجه المبين في المصحف',
  ],
}

// ===== توزيعetypes المطلوب لكل مجموعة أسئلة =====
interface DiversityPlan {
  type: QuestionType
  level: DifficultyLevel
  count: number
}

/**
 * خطة التنوع المثلى لمجموعة أسئلة
 *
 * توزع الأسئلة بحيث:
 * - لا يوجد نوع متكرر أكثر من مرة متتالية
 * - التنوع بين المستويات (40% سهل، 30% متوسط، 20% صعب، 10% متقدم)
 * - كل نوع يظهر على الأقل مرة واحدة إذا كان العدد كافياً
 */
export function generateDiversityPlan(totalCount: number): DiversityPlan[] {
  if (totalCount <= 0) return []

  // توزيع المستويات
  const levelDistribution: DifficultyLevel[] = []
  const easyCount = Math.max(1, Math.round(totalCount * 0.35))
  const mediumCount = Math.max(1, Math.round(totalCount * 0.30))
  const hardCount = Math.max(1, Math.round(totalCount * 0.20))
  const advancedCount = Math.max(0, totalCount - easyCount - mediumCount - hardCount)

  for (let i = 0; i < easyCount; i++) levelDistribution.push('easy')
  for (let i = 0; i < mediumCount; i++) levelDistribution.push('medium')
  for (let i = 0; i < hardCount; i++) levelDistribution.push('hard')
  for (let i = 0; i < advancedCount; i++) levelDistribution.push('advanced')

  // خلط عشوائي
  shuffle(levelDistribution)

  // توزيع الأنواع (تناوب)
  const types: QuestionType[] = ['mcq', 'truefalse', 'complete', 'audio']
  const typeRotation: QuestionType[] = []
  for (let i = 0; i < totalCount; i++) {
    typeRotation.push(types[i % types.length])
  }
  shuffle(typeRotation)

  // دمج النوع والمستوى
  const plan: DiversityPlan[] = []
  for (let i = 0; i < totalCount; i++) {
    plan.push({
      type: typeRotation[i],
      level: levelDistribution[i],
      count: 1,
    })
  }

  // ضمان عدم تكرار نفس النوع مرتين متتاليتين
  ensureNoConsecutiveTypes(plan)

  return plan
}

/**
 * خلط مصفوفة بشكل عشوائي (Fisher-Yates)
 */
function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * ضمان عدم تكرار نفس النوع مرتين متتاليتين
 */
function ensureNoConsecutiveTypes(plan: DiversityPlan[]): void {
  for (let i = 1; i < plan.length; i++) {
    if (plan[i].type === plan[i - 1].type) {
      // البحث عن عنصر مختلف للتبديل
      for (let j = i + 1; j < plan.length; j++) {
        if (plan[j].type !== plan[i].type && plan[j].type !== plan[i - 1].type) {
          // تبديل النوع
          const tempType = plan[i].type
          plan[i].type = plan[j].type
          plan[j].type = tempType
          break
        }
      }
    }
  }
}

/**
 * اقتراح قالب صياغة جديد (يتجنب القوالب المستخدمة حديثاً)
 */
export function suggestTemplate(
  type: QuestionType,
  usedTemplates: string[],
): string {
  const available = QUESTION_TEMPLATES[type].filter(
    t => !usedTemplates.some(used => similarityQuick(t, used) > 0.8)
  )
  return available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : QUESTION_TEMPLATES[type][Math.floor(Math.random() * QUESTION_TEMPLATES[type].length)]
}

/**
 * مقارنة سريعة بين نصين (نسبة التشابه التقريبية)
 */
function similarityQuick(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/))
  const wordsB = new Set(b.split(/\s+/))
  let intersection = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++
  }
  return intersection / Math.max(wordsA.size, wordsB.size)
}

/**
 * تحليل توزيع أنواع الأسئلة الحالية
 */
export function analyzeTypeDistribution(questions: Array<{ type: string }>): Record<string, number> {
  const dist: Record<string, number> = {}
  for (const q of questions) {
    dist[q.type] = (dist[q.type] || 0) + 1
  }
  return dist
}

/**
 * تحليل توزيع مستويات الصعوبة
 */
export function analyzeLevelDistribution(questions: Array<{ level: string }>): Record<string, number> {
  const dist: Record<string, number> = {}
  for (const q of questions) {
    dist[q.level] = (dist[q.level] || 0) + 1
  }
  return dist
}

/**
 * تحليل تكرار القوالب اللغوية
 */
export function detectTemplateRepetition(questions: Array<{ prompt: string }>): Array<{ template: string; count: number }> {
  const templateCounts = new Map<string, number>()
  for (const q of questions) {
    const template = extractSimpleTemplate(q.prompt)
    templateCounts.set(template, (templateCounts.get(template) || 0) + 1)
  }
  return Array.from(templateCounts.entries())
    .map(([template, count]) => ({ template, count }))
    .filter(item => item.count > 1)
    .sort((a, b) => b.count - a.count)
}

/**
 * استخراج قالب بسيط من السؤال
 */
function extractSimpleTemplate(text: string): string {
  return text
    .replace(/سورة\s+\S+/g, 'سورة [X]')
    .replace(/الآية\s+\S+/g, 'الآية [N]')
    .replace(/قوله\s+تعالى/g, '[Q]')
    .replace(/\d+/g, '[N]')
    .trim()
    .slice(0, 80)
}
