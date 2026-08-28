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
