/**
 * Supabase Database Integration Layer
 * 
 * This module provides type-safe database operations for the teacher platform.
 * All functions are designed to work with the server-side admin client for
 * full database access, while maintaining proper security through RLS policies.
 */

import { createSupabaseAdmin } from './server'

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
  answers?: Record<string, string>
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', attendance.student_id)
        .eq('date', attendance.date)
        .single()
      
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
      const { data: existing } = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', device.device_id)
        .single()
      
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    } catch (error) {
      handleError(error, 'جلب بيانات المسؤول')
    }
  },

  async create(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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
    try {
      const supabase = createSupabaseAdmin()
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

  async updateStatus(id: string, status: 'approved' | 'rejected', reviewedBy: string, rejectionReason?: string): Promise<JoinRequest> {
    try {
      const supabase = createSupabaseAdmin()
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

export async function checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const supabase = createSupabaseAdmin()
    const { error } = await supabase.from('students').select('id').limit(1)
    if (error) {
      return { connected: false, error: error.message }
    }
    return { connected: true }
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'فشل الاتصال بقاعدة البيانات' 
    }
  }
}
