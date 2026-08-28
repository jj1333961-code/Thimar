import { pgTable, text, integer, timestamp, jsonb, boolean, primaryKey, bigserial } from 'drizzle-orm/pg-core'

export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  questions: jsonb('questions').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  quizId: text('quiz_id').notNull(),
  currentQuestion: integer('current_question').default(0).notNull(),
  answers: jsonb('answers').default({}).notNull(),
  completed: boolean('completed').default(false).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const devRequests = pgTable('dev_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  prompt: text('prompt').notNull(),
  status: text('status').default('queued').notNull(),
  result: text('result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type QuizQuestion = { id: string; text: string; options: string[]; answer?: string; hours: number; minutes: number; seconds: number }
export const antiCheatGlobalConfig = pgTable('anti_cheat_global_config', {
  id: boolean('id').primaryKey().default(true).notNull(), enabled: boolean('enabled').default(false).notNull(), config: jsonb('config').default({}).notNull(), updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const antiCheatItemConfigs = pgTable('anti_cheat_item_configs', {
  itemId: text('item_id').notNull(), itemType: text('item_type').notNull(), enabled: boolean('enabled').default(false).notNull(), isOverride: boolean('is_override').default(true).notNull(), config: jsonb('config').default({}).notNull(), createdAt: timestamp('created_at').defaultNow().notNull(), updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [primaryKey({ columns: [table.itemId, table.itemType] })])

export const antiCheatSessions = pgTable('anti_cheat_sessions', {
  id: text('id').primaryKey(), studentId: text('student_id').notNull(), itemId: text('item_id').notNull(), itemType: text('item_type').notNull(), status: text('status').default('active').notNull(), riskScore: integer('risk_score').default(0).notNull(), severity: text('severity').default('NORMAL').notNull(), currentQuestion: integer('current_question'), attemptId: text('attempt_id'), startedAt: timestamp('started_at').defaultNow().notNull(), endedAt: timestamp('ended_at'), updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const antiCheatEvents = pgTable('anti_cheat_events', {
  id: text('id').primaryKey(), sessionId: text('session_id').notNull(), studentId: text('student_id').notNull(), itemId: text('item_id').notNull(), itemType: text('item_type').notNull(), eventType: text('event_type').notNull(), severity: text('severity').notNull(), decision: text('decision').notNull(), riskScore: integer('risk_score').notNull(), riskDelta: integer('risk_delta').default(0).notNull(), reason: text('reason').default('').notNull(), durationMs: integer('duration_ms').default(0).notNull(), timestamp: timestamp('timestamp').defaultNow().notNull(), metadata: jsonb('metadata').default({}).notNull(),
})

export type AntiCheatItemType = 'recitation' | 'exam' | 'task'

export const messages = pgTable('messages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  senderId: text('sender_id').notNull(), senderName: text('sender_name').notNull(), senderRole: text('sender_role').notNull(),
  recipientId: text('recipient_id').notNull(), recipientName: text('recipient_name').notNull(), recipientRole: text('recipient_role').notNull(),
  body: text('body').notNull(), createdAt: timestamp('created_at').defaultNow().notNull(), readAt: timestamp('read_at'),
})

export type QuizData = { id: string; title: string; questions: QuizQuestion[] }

// ===== جداول نظام توليد الأسئلة المحسّن =====

/** كل سؤال منشأ يُحفظ هنا لمنع التكرار عبر Sessions */
export const generatedQuestions = pgTable('generated_questions', {
  id: text('id').primaryKey(),
  /** نص السؤال بعد التنظيف */
  questionText: text('question_text').notNull(),
  /** نوع السؤال: mcq | truefalse | complete | audio */
  type: text('type').notNull(),
  /** مستوى الصعوبة: easy | medium | hard | advanced */
  level: text('level').notNull().default('medium'),
  /** اسم السورة */
  surah: text('surah').notNull(),
  /** رقم السورة */
  surahNumber: integer('surah_number').notNull(),
  /** من آية */
  fromAyah: integer('from_ayah').notNull(),
  /** إلى آية */
  toAyah: integer('to_ayah').notNull(),
  /** الموضوع الذي وُجد بناءً عليه */
  topic: text('topic').notNull().default(''),
  /** بصمة النص المُوحَّدة (للمقارنة) */
  normalizedFingerprint: text('normalized_fingerprint').notNull(),
  /** معلومات إضافية */
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  { topicIdx: { columns: [table.topic] },
    surahIdx: { columns: [table.surahNumber] },
    typeIdx: { columns: [table.type] },
    levelIdx: { columns: [table.level] },
  },
])

/** بصمات الأسئلة — لكل سؤال بصمة نصية مُوحَّدة للكشف عن التشابه */
export const questionFingerprints = pgTable('question_fingerprints', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  /** معرف السؤال المرجعي */
  questionId: text('question_id').notNull().references(() => generatedQuestions.id, { onDelete: 'cascade' }),
  /** البصمة المُوحَّدة */
  fingerprint: text('fingerprint').notNull(),
  /** نوع البصمة: exact | semantic | template */
  fingerprintType: text('fingerprint_type').notNull().default('exact'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  { fingerprintIdx: { columns: [table.fingerprint] },
    questionIdx: { columns: [table.questionId] },
  },
])

/** إحصائيات توليد الأسئلة لكل موضوع */
export const questionGenerationStats = pgTable('question_generation_stats', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  topic: text('topic').notNull(),
  totalCount: integer('total_count').default(0).notNull(),
  rejectedCount: integer('rejected_count').default(0).notNull(),
  lastGeneratedAt: timestamp('last_generated_at').defaultNow().notNull(),
}, (table) => [
  { topicIdx: { columns: [table.topic] } },
])

// ===== جداول إدارة المستخدمين =====

/** حسابات المستخدمين — يحل محل localStorage */
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  /** اسم المستخدم الفريد */
  username: text('username').notNull().unique(),
  /** البريد الإلكتروني (اختياري للتسجيل العادي) */
  email: text('email'),
  /** كلمة المرور المشفرة (null للحسابات الخارجية مثل Google) */
  passwordHash: text('password_hash'),
  /** الاسم الكامل */
  displayName: text('display_name').notNull(),
  /** الدور: admin | teacher | student | parent */
  role: text('role').notNull().default('student'),
  /** معرف Google OAuth (اختياري) */
  googleId: text('google_id'),
  /** صورة المستخدم */
  avatarUrl: text('avatar_url'),
  /** اللغة المفضلة: ar | en */
  language: text('language').notNull().default('ar'),
  /** هل الحساب مفعّل */
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => [
  { emailIdx: { columns: [table.email] } },
  { roleIdx: { columns: [table.role] } },
  { googleIdIdx: { columns: [table.googleId] } },
])

/** بيانات الطلاب — معلومات إضافية */
export const studentProfiles = pgTable('student_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  /** المعلم المسؤول */
  teacherId: text('teacher_id').references(() => users.id),
  /** المرحلة الدراسية */
  grade: text('grade'),
  /** Surah(s) being memorized */
  currentSurah: text('current_surah'),
  /** آخر جزء تم حفظه */
  lastJuz: integer('last_juz').default(1),
  /** الإحصائيات */
  totalQuizzes: integer('total_quizzes').default(0),
  avgScore: integer('avg_score').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

/** بيانات المعلمين — معلومات إضافية */
export const teacherProfiles = pgTable('teacher_profiles', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  /** رمز فصل المعلم (لإنشاء رابط دعوة) */
  classCode: text('class_code').unique(),
  /** وصف المعلم */
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ===== جداول رفع الملفات =====

/** ملفات مرفوعة — تتبع حالة الرفع والمعالجة */
export const uploadedFiles = pgTable('uploaded_files', {
  id: text('id').primaryKey(),
  /** معرف المستخدم صاحب الملف */
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  /** اسم الملف الأصلي */
  originalName: text('original_name').notNull(),
  /** مسار الملف في التخزين */
  storagePath: text('storage_path').notNull(),
  /** نوع MIME */
  mimeType: text('mime_type').notNull(),
  /** حجم الملف بالبايت */
  fileSize: integer('file_size').notNull(),
  /** حالة الملف: uploading | uploaded | processing | completed | failed */
  status: text('status').notNull().default('uploading'),
  /** نوع الملف: exam | recitation | assignment | other */
  category: text('category').notNull().default('other'),
  /** رسالة خطأ إن وجدت */
  errorMessage: text('error_message'),
  /** بيانات المعالجة (نتيجة AI مثلاً) */
  processingResult: jsonb('processing_result'),
  /** عدد محاولات إعادة المعالجة */
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => [
  { userIdx: { columns: [table.userId] } },
  { statusIdx: { columns: [table.status] } },
  { categoryIdx: { columns: [table.category] } },
])

// ===== جداول نتائج الاختبارات =====

/** نتائج الاختبارات — لكل محاولة طالب */
export const examResults = pgTable('exam_results', {
  id: text('id').primaryKey(),
  /** معرف الطالب */
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  /** معرف الاختبار */
  quizId: text('quiz_id').notNull().references(() => quizzes.id, { onDelete: 'cascade' }),
  /** درجة الطالب (0-100) */
  score: integer('score').notNull().default(0),
  /** عدد الإجابات الصحيحة */
  correctCount: integer('correct_count').default(0),
  /** عدد الإجابات الخاطئة */
  wrongCount: integer('wrong_count').default(0),
  /** إجابات الطالب التفصيلية */
  answers: jsonb('answers').default({}).notNull(),
  /** مدة الاختبار بالثواني */
  durationSeconds: integer('duration_seconds').default(0),
  /** هل تم المراجعة من المعلم */
  reviewed: boolean('reviewed').default(false).notNull(),
  /** ملاحظات المعلم */
  teacherNotes: text('teacher_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
}, (table) => [
  { studentIdx: { columns: [table.studentId] } },
  { quizIdx: { columns: [table.quizId] } },
  { scoreIdx: { columns: [table.score] } },
])
