import { pgTable, text, integer, timestamp, jsonb, boolean, primaryKey, bigserial, serial } from 'drizzle-orm/pg-core'

export const appSnapshots = pgTable('app_snapshots', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Usually Supabase Auth ID
  email: text('email'),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'admin' | 'teacher' | 'student' | 'parent'
  phone: text('phone'),
  country: text('country'),
  identityCode: text('identity_code'),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  voiceFingerprintUrl: text('voice_fingerprint_url'),
})

export const joinRequests = pgTable('join_requests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  country: text('country').notNull(),
  phone: text('phone').notNull(),
  identityCode: text('identity_code').notNull(),
  age: integer('age'),
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const studentTeacher = pgTable('student_teacher', {
  studentId: text('student_id').notNull(),
  teacherId: text('teacher_id').notNull(),
}, (table) => [primaryKey({ columns: [table.studentId, table.teacherId] })])

export const studentParent = pgTable('student_parent', {
  studentId: text('student_id').notNull(),
  parentId: text('parent_id').notNull(),
}, (table) => [primaryKey({ columns: [table.studentId, table.parentId] })])

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  type: text('type').notNull(), // 'quran' | 'tuhfat-al-atfal' | 'homework' | 'exam'
  title: text('title').notNull(),
  description: text('description'),
  deadline: timestamp('deadline'),
  submissionMethod: text('submission_method'), // 'audio' | 'file' | 'video' | 'live' | 'anti-cheat'
  status: text('status').default('assigned').notNull(), // 'assigned' | 'submitted' | 'graded'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const recitations = pgTable('recitations', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull(),
  assignmentId: integer('assignment_id'),
  lawh: text('lawh'), // The current lesson
  surah: text('surah'), // Current surah
  pastNear: text('past_near'), // Al-Madhi al-Qareeb
  pastFar: text('past_far'), // Al-Madhi al-Baeed
  gradeLawh: text('grade_lawh'), // 'excellent' | 'very-good' | 'good' | 'repeat'
  gradeSurah: text('grade_surah'),
  gradePastNear: text('grade_past_near'),
  gradePastFar: text('grade_past_far'),
  feedback: text('feedback'),
  audioUrl: text('audio_url'),
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

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

export const messages = pgTable('messages', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  senderId: text('sender_id').notNull(),
  recipientId: text('recipient_id').notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id'), // null for global/admin alerts
  type: text('type').notNull(), // 'login' | 'signup' | 'assignment' | 'grade'
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type QuizQuestion = { id: string; text: string; options: string[]; answer?: string; hours: number; minutes: number; seconds: number }
export type QuizData = { id: string; title: string; questions: QuizQuestion[] }
