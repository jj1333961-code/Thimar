/**
 * Supabase Database Integration Layer
 *
 * This module provides type-safe database operations for the teacher platform.
 * All functions are designed to work with the server-side admin client for
 * full database access, while maintaining proper security through RLS policies.
 *
 * When Supabase is not configured, falls back to in-memory storage so the
 * application continues to work without a database connection.
 */

import { createSupabaseAdmin, isServerSupabaseConfigured } from './server'
import { getPersistentSnapshot, upsertPersistentSnapshot } from '@/lib/storage/persistent-snapshot'

// In-memory fallback store when Supabase is not configured
const memoryStore: Map<string, { data: Record<string, unknown>; updated_at: string }> = new Map()

function getMemoryData(key: string): Record<string, unknown> {
  const entry = memoryStore.get(key)
  return entry?.data ?? {}
}

function setMemoryData(key: string, data: Record<string, unknown>): void {
  memoryStore.set(key, { data, updated_at: new Date().toISOString() })
}

function getMemoryUpdatedAt(key: string): string | null {
  return memoryStore.get(key)?.updated_at ?? null
}

// Simple in-memory collections keyed by table name for non-snapshot tables
const memoryTables: Map<string, Map<string, Record<string, unknown>>> = new Map()

function getMemoryTable(table: string): Map<string, Record<string, unknown>> {
  if (!memoryTables.has(table)) {
    memoryTables.set(table, new Map())
  }
  return memoryTables.get(table)!
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

// ============================================================
// Type Definitions
// ============================================================

export interface Student {
  id: string
  name: string
  username?: string
  email?: string
  mobile?: string
  phone?: string
  parent?: string
  parent_email?: string
  parent_google_email?: string
  parent_phone?: string
  parent_pass?: string
  password?: string
  student_pass?: string
  google_email?: string
  google_id?: string
  photo?: string
  birth_date?: string
  address?: string
  notes?: string
  grade_level?: string
  subjects?: string[]
  assigned_teacher_id?: string
  status?: 'active' | 'inactive' | 'suspended'
  created_at?: string
  updated_at?: string
}

export interface Subject {
  id: string
  name: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface Grade {
  id: string
  student_id: string
  subject_id?: string
  score?: number
  max_score?: number
  grade_letter?: string
  grade_points?: number
  exam_title?: string
  exam_type?: 'quiz' | 'midterm' | 'final' | 'homework' | 'project' | 'other'
  exam_date?: string
  notes?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface Exam {
  id: string
  title: string
  description?: string
  subject_id?: string
  duration_minutes?: number
  total_marks?: number
  passing_marks?: number
  questions?: ExamQuestion[]
  answers?: Record<string, unknown>
  exam_type?: 'quiz' | 'midterm' | 'final' | 'practice'
  status?: 'draft' | 'published' | 'archived'
  shuffle_questions?: boolean
  shuffle_answers?: boolean
  show_results?: boolean
  allow_review?: boolean
  max_attempts?: number
  available_from?: string
  available_until?: string
  proctoring_enabled?: boolean
  proctoring_config?: Record<string, unknown>
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface ExamQuestion {
  id: string
  text: string
  options?: string[]
  answer?: string
  hours?: number
  minutes?: number
  seconds?: number
}

export interface ExamAttempt {
  id: string
  exam_id: string
  student_id: string
  current_question?: number
  answers?: Record<string, string>
  completed?: boolean
  score?: number
  total_score?: number
  time_spent_seconds?: number
  risk_score?: number
  risk_events?: ProctoringEvent[]
  started_at?: string
  submitted_at?: string
  updated_at?: string
}

export interface ProctoringEvent {
  type: string
  timestamp: string
  risk_score: number
  metadata?: Record<string, unknown>
}

export interface Attendance {
  id: string
  student_id: string
  date: string
  time_in?: string
  time_out?: string
  status?: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  recorded_by?: string
  recorded_at?: string
}

export interface Recitation {
  id: string
  student_id: string
  surah_from?: number
  surah_to?: number
  ayah_from?: number
  ayah_to?: number
  type?: 'recitation' | 'memorization' | 'review' | 'reading'
  grade?: 'excellent' | 'very_good' | 'good' | 'acceptable' | 'needs_work'
  score?: number
  evaluator_notes?: string
  audio_url?: string
  audio_duration_seconds?: number
  ai_analysis?: Record<string, unknown>
  ai_confidence?: number
  evaluated_by?: string
  evaluated_at?: string
  created_at?: string
}

export interface Notification {
  id: string
  user_id?: string
  email?: string
  recipient_id?: string
  type: string
  category?: string
  title: string
  message?: string
  read?: boolean
  read_at?: string
  related_type?: string
  related_id?: string
  created_at?: string
}

export interface Device {
  id: string
  device_id: string
  user_id?: string
  user_name?: string
  role?: string
  last_seen_at?: string
  current_page?: string
  locked_page?: string
  user_agent?: string
  created_at?: string
  updated_at?: string
}

export interface AIQuestionHistory {
  id: string
  generated_by?: string
  topic?: string
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed'
  questions?: ExamQuestion[]
  source?: 'gemini' | 'groq' | 'manual'
  source_model?: string
  context?: Record<string, unknown>
  created_at?: string
}

export interface Admin {
  id: string
  name: string
  email: string
  mobile?: string
  password?: string
  google_email?: string
  google_id?: string
  photo?: string
  role?: 'admin' | 'super_admin'
  whatsapp?: string
  settings?: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface ProctoringIncident {
  id: string
  session_id?: string
  student_id?: string
  exam_attempt_id?: string
  event_type: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  risk_score?: number
  description?: string
  metadata?: Record<string, unknown>
  occurred_at?: string
}

export interface JoinRequest {
  id: string
  student_name?: string
  parent_name?: string
  email?: string
  phone?: string
  grade_level?: string
  status?: 'pending' | 'approved' | 'rejected'
  requested_by?: string
  reviewed_by?: string
  reviewed_at?: string
  rejection_reason?: string
  notes?: string
  created_at?: string
}

// ============================================================
// Database Error Handler
// ============================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

function handleError(error: unknown, operation: string): never {
  console.error(`[Supabase] ${operation} failed:`, error)
  if (error instanceof Error) {
    throw new DatabaseError(error.message)
  }
  throw new DatabaseError(`فشل ${operation}`)
}

// ============================================================
// Students Operations
// ============================================================

export const studentsDb = {
  async getAll(): Promise<Student[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('students')
      return Array.from(table.values()) as Student[]
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب قائمة الطلاب')
    }
  },

  async getById(id: string): Promise<Student | null> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return (getMemoryTable('students').get(id) as Student) || null
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    } catch (error) {
      handleError(error, 'جلب بيانات الطالب')
    }
  },

  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: Student = { ...student, id: generateId(), created_at: now, updated_at: now }
      getMemoryTable('students').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء طالب جديد')
    }
  },

  async update(id: string, updates: Partial<Student>): Promise<Student> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('students')
      const existing = table.get(id)
      if (!existing) throw new Error('Student not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as Student
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث بيانات الطالب')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('students').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف الطالب')
    }
  },

  async search(query: string): Promise<Student[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const q = query.toLowerCase()
      return Array.from(getMemoryTable('students').values()).filter((s) => {
        return [s.name, s.username, s.email].some((field) => String(field || '').toLowerCase().includes(q))
      }) as Student[]
    }
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${query}%,username.ilike.%${query}%,email.ilike.%${query}%`)
        .order('name')
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'البحث عن الطلاب')
    }
  }
}

// ============================================================
// Subjects Operations
// ============================================================

export const subjectsDb = {
  async getAll(): Promise<Subject[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('subjects').values()) as Subject[]
    }
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب قائمة المواد')
    }
  },

  async create(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: Subject = { ...subject, id: generateId(), created_at: now, updated_at: now }
      getMemoryTable('subjects').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء مادة جديدة')
    }
  },

  async update(id: string, updates: Partial<Subject>): Promise<Subject> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('subjects')
      const existing = table.get(id)
      if (!existing) throw new Error('Subject not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as Subject
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث المادة')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('subjects').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف المادة')
    }
  }
}

// ============================================================
// Grades Operations
// ============================================================

export const gradesDb = {
  async getByStudent(studentId: string): Promise<Grade[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('grades').values()).filter((g) => g.student_id === studentId) as Grade[]
    }
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .order('exam_date', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب درجات الطالب')
    }
  },

  async getBySubject(subjectId: string): Promise<Grade[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('grades').values()).filter((g) => g.subject_id === subjectId) as Grade[]
    }
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', subjectId)
        .order('exam_date', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب درجات المادة')
    }
  },

  async create(grade: Omit<Grade, 'id' | 'created_at' | 'updated_at'>): Promise<Grade> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: Grade = { ...grade, id: generateId(), created_at: now, updated_at: now }
      getMemoryTable('grades').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('grades')
        .insert(grade)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إضافة درجة جديدة')
    }
  },

  async update(id: string, updates: Partial<Grade>): Promise<Grade> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('grades')
      const existing = table.get(id)
      if (!existing) throw new Error('Grade not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as Grade
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('grades')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث الدرجة')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('grades').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف الدرجة')
    }
  }
}

// ============================================================
// Exams Operations
// ============================================================

export const examsDb = {
  async getAll(): Promise<Exam[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('exams').values()) as Exam[]
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب قائمة الاختبارات')
    }
  },

  async getById(id: string): Promise<Exam | null> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return (getMemoryTable('exams').get(id) as Exam) || null
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    } catch (error) {
      handleError(error, 'جلب بيانات الاختبار')
    }
  },

  async create(exam: Omit<Exam, 'id' | 'created_at' | 'updated_at'>): Promise<Exam> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: Exam = { ...exam, id: generateId(), created_at: now, updated_at: now }
      getMemoryTable('exams').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert(exam)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء اختبار جديد')
    }
  },

  async update(id: string, updates: Partial<Exam>): Promise<Exam> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('exams')
      const existing = table.get(id)
      if (!existing) throw new Error('Exam not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as Exam
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث الاختبار')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('exams').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف الاختبار')
    }
  },

  async getPublished(): Promise<Exam[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('exams').values()).filter((e) => e.status === 'published') as Exam[]
    }
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب الاختبارات المنشورة')
    }
  }
}

// ============================================================
// Exam Attempts Operations
// ============================================================

export const examAttemptsDb = {
  async getByStudent(studentId: string): Promise<ExamAttempt[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('exam_attempts').values()).filter((a) => a.student_id === studentId) as ExamAttempt[]
    }
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('student_id', studentId)
        .order('started_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب محاولات الطالب')
    }
  },

  async getByExam(examId: string): Promise<ExamAttempt[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('exam_attempts').values()).filter((a) => a.exam_id === examId) as ExamAttempt[]
    }
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .order('started_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب محاولات الاختبار')
    }
  },

  async create(attempt: Omit<ExamAttempt, 'id' | 'started_at' | 'updated_at'>): Promise<ExamAttempt> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: ExamAttempt = { ...attempt, id: generateId(), started_at: now, updated_at: now }
      getMemoryTable('exam_attempts').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .insert(attempt)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء محاولة جديدة')
    }
  },

  async update(id: string, updates: Partial<ExamAttempt>): Promise<ExamAttempt> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('exam_attempts')
      const existing = table.get(id)
      if (!existing) throw new Error('Exam attempt not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as ExamAttempt
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث المحاولة')
    }
  },

  async submit(id: string, score: number, timeSpentSeconds: number): Promise<ExamAttempt> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('exam_attempts')
      const existing = table.get(id)
      if (!existing) throw new Error('Exam attempt not found')
      const row = {
        ...existing,
        completed: true,
        score,
        time_spent_seconds: timeSpentSeconds,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ExamAttempt
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .update({
          completed: true,
          score,
          time_spent_seconds: timeSpentSeconds,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تسليم الاختبار')
    }
  }
}

// ============================================================
// Attendance Operations
// ============================================================

export const attendanceDb = {
  async getByStudent(studentId: string, fromDate?: string, toDate?: string): Promise<Attendance[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      let records = Array.from(getMemoryTable('attendance').values()).filter((a) => a.student_id === studentId) as Attendance[]
      if (fromDate) records = records.filter((r) => r.date >= fromDate)
      if (toDate) records = records.filter((r) => r.date <= toDate)
      return records
    }
    try {
      let query = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
      
      if (fromDate) {
        query = query.gte('date', fromDate)
      }
      if (toDate) {
        query = query.lte('date', toDate)
      }
      
      const { data, error } = await query.order('date', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب سجل الحضور')
    }
  },

  async getByDate(date: string): Promise<Attendance[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('attendance').values()).filter((a) => a.date === date) as Attendance[]
    }
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', date)
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب الحضور بتاريخ')
    }
  },

  async markAttendance(attendance: Omit<Attendance, 'id' | 'recorded_at'>): Promise<Attendance> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const table = getMemoryTable('attendance')
      const existing = Array.from(table.values()).find(
        (a) => a.student_id === attendance.student_id && a.date === attendance.date
      )
      if (existing) {
        const updated = { ...existing, ...attendance, recorded_at: now }
        table.set(existing.id || generateId(), updated as Attendance)
        return updated as Attendance
      }
      const row: Attendance = { ...attendance, id: generateId(), recorded_at: now }
      table.set(row.id, row)
      return row
    }
    try {
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', attendance.student_id)
        .eq('date', attendance.date)
        .maybeSingle()
      
      if (existing) {
        const { data, error } = await supabase
          .from('attendance')
          .update(attendance)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendance)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تسجيل الحضور')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('attendance').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف سجل الحضور')
    }
  }
}

// ============================================================
// Recitation Operations
// ============================================================

export const recitationsDb = {
  async getByStudent(studentId: string): Promise<Recitation[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('recitations').values()).filter((r) => r.student_id === studentId) as Recitation[]
    }
    try {
      const { data, error } = await supabase
        .from('recitations')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب سجل التسميع')
    }
  },

  async create(recitation: Omit<Recitation, 'id' | 'created_at'>): Promise<Recitation> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: Recitation = { ...recitation, id: generateId(), created_at: now }
      getMemoryTable('recitations').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('recitations')
        .insert(recitation)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إضافة تقييم تسميع')
    }
  },

  async update(id: string, updates: Partial<Recitation>): Promise<Recitation> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('recitations')
      const existing = table.get(id)
      if (!existing) throw new Error('Recitation not found')
      const row = { ...existing, ...updates } as Recitation
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('recitations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث تقييم التسميع')
    }
  }
}

// ============================================================
// Notifications Operations
// ============================================================

export const notificationsDb = {
  async getByUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      let records = Array.from(getMemoryTable('notifications').values()).filter((n) => n.user_id === userId) as Notification[]
      if (unreadOnly) records = records.filter((n) => !n.read)
      return records.slice(0, 100)
    }
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
      
      if (unreadOnly) {
        query = query.eq('read', false)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(100)
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب الإشعارات')
    }
  },

  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const row: Notification = { ...notification, id: generateId(), created_at: new Date().toISOString() }
      getMemoryTable('notifications').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء إشعار')
    }
  },

  async markAsRead(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('notifications')
      const existing = table.get(id)
      if (existing) {
        table.set(id, { ...existing, read: true, read_at: new Date().toISOString() })
      }
      return
    }
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'تحديد الإشعار كمقروء')
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('notifications')
      for (const [id, record] of table) {
        if ((record as Notification).user_id === userId && !(record as Notification).read) {
          table.set(id, { ...record, read: true, read_at: new Date().toISOString() })
        }
      }
      return
    }
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false)
      if (error) throw error
    } catch (error) {
      handleError(error, 'تحديد كل الإشعارات كمقروءة')
    }
  }
}

// ============================================================
// Devices Operations
// ============================================================

export const devicesDb = {
  async getAll(): Promise<Device[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('devices').values()) as Device[]
    }
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('last_seen_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب قائمة الأجهزة')
    }
  },

  async registerDevice(device: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<Device> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const table = getMemoryTable('devices')
      const existing = Array.from(table.values()).find((d) => d.device_id === device.device_id)
      if (existing) {
        const updated = { ...existing, ...device, last_seen_at: now, updated_at: now }
        table.set(existing.id || generateId(), updated as Device)
        return updated as Device
      }
      const row: Device = { ...device, id: generateId(), created_at: now, updated_at: now, last_seen_at: now }
      table.set(row.id, row)
      return row
    }
    try {
      const { data: existing } = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', device.device_id)
        .maybeSingle()
      
      if (existing) {
        const { data, error } = await supabase
          .from('devices')
          .update({ ...device, last_seen_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      
      const { data, error } = await supabase
        .from('devices')
        .insert(device)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تسجيل الجهاز')
    }
  },

  async updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('devices')
      const existing = Array.from(table.values()).find((d) => d.device_id === deviceId)
      if (!existing) throw new Error('Device not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as Device
      table.set(existing.id || deviceId, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('devices')
        .update(updates)
        .eq('device_id', deviceId)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث بيانات الجهاز')
    }
  }
}

// ============================================================
// AI Question History Operations
// ============================================================

export const aiHistoryDb = {
  async create(entry: Omit<AIQuestionHistory, 'id' | 'created_at'>): Promise<AIQuestionHistory> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const row: AIQuestionHistory = { ...entry, id: generateId(), created_at: new Date().toISOString() }
      getMemoryTable('ai_question_history').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('ai_question_history')
        .insert(entry)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'حفظ أسئلة الذكاء الاصطناعي')
    }
  },

  async getRecent(limit = 20): Promise<AIQuestionHistory[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('ai_question_history').values()).slice(0, limit) as AIQuestionHistory[]
    }
    try {
      const { data, error } = await supabase
        .from('ai_question_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب تاريخ الذكاء الاصطناعي')
    }
  }
}

// ============================================================
// Admin Operations
// ============================================================

export const adminsDb = {
  async getAll(): Promise<Admin[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('admins').values()) as Admin[]
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب قائمة المسؤولين')
    }
  },

  async getByEmail(email: string): Promise<Admin | null> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const lowered = email.toLowerCase()
      return (Array.from(getMemoryTable('admins').values()).find((a) => a.email === lowered) as Admin) || null
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'جلب بيانات المسؤول')
    }
  },

  async create(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: Admin = { ...admin, id: generateId(), created_at: now, updated_at: now }
      getMemoryTable('admins').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .insert(admin)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء حساب مسؤول')
    }
  },

  async update(id: string, updates: Partial<Admin>): Promise<Admin> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('admins')
      const existing = table.get(id)
      if (!existing) throw new Error('Admin not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as Admin
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث حساب المسؤول')
    }
  }
}

// ============================================================
// Proctoring Incidents Operations
// ============================================================

export const proctoringDb = {
  async create(incident: Omit<ProctoringIncident, 'id' | 'occurred_at'>): Promise<ProctoringIncident> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const row: ProctoringIncident = { ...incident, id: generateId(), occurred_at: new Date().toISOString() }
      getMemoryTable('proctoring_incidents').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('proctoring_incidents')
        .insert(incident)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تسجيل حادث مراقبة')
    }
  },

  async getByStudent(studentId: string): Promise<ProctoringIncident[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('proctoring_incidents').values()).filter((p) => p.student_id === studentId) as ProctoringIncident[]
    }
    try {
      const { data, error } = await supabase
        .from('proctoring_incidents')
        .select('*')
        .eq('student_id', studentId)
        .order('occurred_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب حوادث المراقبة')
    }
  }
}

// ============================================================
// Join Requests Operations
// ============================================================

export const joinRequestsDb = {
  async getAll(status?: 'pending' | 'approved' | 'rejected'): Promise<JoinRequest[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      let records = Array.from(getMemoryTable('join_requests').values()) as JoinRequest[]
      if (status) records = records.filter((r) => r.status === status)
      return records
    }
    try {
      let query = supabase
        .from('join_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب طلبات الانضمام')
    }
  },

  async create(request: Omit<JoinRequest, 'id' | 'created_at'>): Promise<JoinRequest> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const row: JoinRequest = { ...request, id: generateId(), created_at: new Date().toISOString() }
      getMemoryTable('join_requests').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('join_requests')
        .insert(request)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء طلب انضمام')
    }
  },

  async updateStatus(id: string, status: 'approved' | 'rejected', reviewedBy?: string, rejectionReason?: string): Promise<JoinRequest> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('join_requests')
      const existing = table.get(id) as JoinRequest | undefined
      if (!existing) throw new Error('Join request not found')
      const updates: Partial<JoinRequest> = {
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      }
      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason
      }
      const row: JoinRequest = { ...existing, ...updates }
      table.set(id, row)
      return row
    }
    try {
      const updates: Partial<JoinRequest> = {
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      }
      if (status === 'rejected' && rejectionReason) {
        updates.rejection_reason = rejectionReason
      }
      const { data, error } = await supabase
        .from('join_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث حالة طلب الانضمام')
    }
  }
}

// ============================================================
// Health Check
// ============================================================

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string; mode?: 'supabase' | 'memory' }> {
  const supabase = createSupabaseAdmin()
  if (!supabase) {
    return { connected: true, mode: 'memory' }
  }
  try {
    const { error } = await supabase.from('students').select('id').limit(1)
    if (error) {
      return { connected: false, error: error.message }
    }
    return { connected: true, mode: 'supabase' }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'فشل الاتصال بقاعدة البيانات'
    }
  }
}

export { isServerSupabaseConfigured }

// ============================================================
// App Snapshots Operations (للبيانات الهرمية المخزنة في JSONB)
// ============================================================

export interface AppSnapshot {
  id: string
  data: Record<string, unknown>
  updated_at: string
}

export const appSnapshotsDb = {
  async get(id: string): Promise<AppSnapshot | null> {
    return getPersistentSnapshot(id)
  },

  async upsert(id: string, data: Record<string, unknown>): Promise<AppSnapshot> {
    return upsertPersistentSnapshot(id, data)
  }
}

// ============================================================
// Messages Operations
// ============================================================

export interface Message {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  receiver_id?: string
  receiver_name?: string
  receiver_role?: string
  body: string
  sender_email?: string
  receiver_email?: string
  type?: 'direct' | 'admin' | 'system' | 'logout_request'
  approved?: boolean
  read?: boolean
  read_at?: string
  logout_request_id?: string
  created_at?: string
}

export const messagesDb = {
  async getAll(): Promise<Message[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const snapshot = await appSnapshotsDb.get('teacher-platform-v1')
      const data = snapshot?.data?.messages
      return Array.isArray(data) ? data.slice(0, 500) as Message[] : []
    }
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب الرسائل')
    }
  },

  async create(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const row: Message = { ...message, id: generateId(), created_at: new Date().toISOString() }
      const snapshot = await appSnapshotsDb.get('teacher-platform-v1')
      const data = snapshot?.data || {}
      const messages = Array.isArray(data.messages) ? data.messages : []
      await appSnapshotsDb.upsert('teacher-platform-v1', { ...data, messages: [row, ...messages].slice(0, 500) })
      return row
    }
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إرسال رسالة')
    }
  },

  async markRead(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const snapshot = await appSnapshotsDb.get('teacher-platform-v1')
      const data = snapshot?.data || {}
      const messages = Array.isArray(data.messages) ? data.messages : []
      const updated = messages.map((message) => String((message as Record<string, unknown>).id || '') === id
        ? { ...(message as Record<string, unknown>), read: true, read_at: new Date().toISOString() }
        : message)
      await appSnapshotsDb.upsert('teacher-platform-v1', { ...data, messages: updated })
      return
    }
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'تحديث الرسالة')
    }
  }
}

// ============================================================
// Record Elements Operations
// ============================================================

export interface RecordElement {
  id: string
  student_id?: string
  type: string
  title?: string
  description?: string
  data?: Record<string, unknown>
  created_by?: string
  created_at?: string
}

export const recordElementsDb = {
  async getAll(): Promise<RecordElement[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('record_elements').values()) as RecordElement[]
    }
    try {
      const { data, error } = await supabase
        .from('record_elements')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب عناصر التسجيل')
    }
  },

  async create(element: Omit<RecordElement, 'id' | 'created_at'>): Promise<RecordElement> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const row: RecordElement = { ...element, id: generateId(), created_at: new Date().toISOString() }
      getMemoryTable('record_elements').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('record_elements')
        .insert(element)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء عنصر تسجيل')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('record_elements').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('record_elements')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف عنصر تسجيل')
    }
  }
}

// ============================================================
// Extra Elements Operations
// ============================================================

export interface ExtraElement {
  id: string
  type: string
  name?: string
  description?: string
  category?: string
  data?: Record<string, unknown>
  active?: boolean
  created_at?: string
  updated_at?: string
}

export const extraElementsDb = {
  async getAll(): Promise<ExtraElement[]> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      return Array.from(getMemoryTable('extra_elements').values()) as ExtraElement[]
    }
    try {
      const { data, error } = await supabase
        .from('extra_elements')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      handleError(error, 'جلب العناصر الإضافية')
    }
  },

  async create(element: Omit<ExtraElement, 'id' | 'created_at' | 'updated_at'>): Promise<ExtraElement> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const now = new Date().toISOString()
      const row: ExtraElement = { ...element, id: generateId(), created_at: now, updated_at: now }
      getMemoryTable('extra_elements').set(row.id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('extra_elements')
        .insert(element)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'إنشاء عنصر إضافي')
    }
  },

  async update(id: string, updates: Partial<ExtraElement>): Promise<ExtraElement> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      const table = getMemoryTable('extra_elements')
      const existing = table.get(id)
      if (!existing) throw new Error('Extra element not found')
      const row = { ...existing, ...updates, updated_at: new Date().toISOString() } as ExtraElement
      table.set(id, row)
      return row
    }
    try {
      const { data, error } = await supabase
        .from('extra_elements')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      handleError(error, 'تحديث عنصر إضافي')
    }
  },

  async delete(id: string): Promise<void> {
    const supabase = createSupabaseAdmin()
    if (!supabase) {
      getMemoryTable('extra_elements').delete(id)
      return
    }
    try {
      const { error } = await supabase
        .from('extra_elements')
        .delete()
        .eq('id', id)
      if (error) throw error
    } catch (error) {
      handleError(error, 'حذف عنصر إضافي')
    }
  }
}
