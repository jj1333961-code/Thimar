-- Migration 001: Add new tables for users, files, exam results, and question system
-- Run this against the PostgreSQL database

-- ===== جداول نظام توليد الأسئلة المحسّن =====

CREATE TABLE IF NOT EXISTS generated_questions (
  id TEXT PRIMARY KEY,
  question_text TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'medium',
  surah TEXT NOT NULL,
  surah_number INTEGER NOT NULL,
  from_ayah INTEGER NOT NULL,
  to_ayah INTEGER NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  normalized_fingerprint TEXT NOT NULL,
  metadata JSONB DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gq_topic ON generated_questions(topic);
CREATE INDEX IF NOT EXISTS idx_gq_surah_number ON generated_questions(surah_number);
CREATE INDEX IF NOT EXISTS idx_gq_type ON generated_questions(type);
CREATE INDEX IF NOT EXISTS idx_gq_level ON generated_questions(level);

CREATE TABLE IF NOT EXISTS question_fingerprints (
  id BIGSERIAL PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES generated_questions(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,
  fingerprint_type TEXT NOT NULL DEFAULT 'exact',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qfp_fingerprint ON question_fingerprints(fingerprint);
CREATE INDEX IF NOT EXISTS idx_qfp_question_id ON question_fingerprints(question_id);

CREATE TABLE IF NOT EXISTS question_generation_stats (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  total_count INTEGER DEFAULT 0 NOT NULL,
  rejected_count INTEGER DEFAULT 0 NOT NULL,
  last_generated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qgs_topic ON question_generation_stats(topic);

-- ===== جداول إدارة المستخدمين =====

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  password_hash TEXT,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  google_id TEXT,
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'ar',
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  teacher_id TEXT REFERENCES users(id),
  grade TEXT,
  current_surah TEXT,
  last_juz INTEGER DEFAULT 1,
  total_quizzes INTEGER DEFAULT 0,
  avg_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  class_code TEXT UNIQUE,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ===== جداول رفع الملفات =====

CREATE TABLE IF NOT EXISTS uploaded_files (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploading',
  category TEXT NOT NULL DEFAULT 'other',
  error_message TEXT,
  processing_result JSONB,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uf_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uf_status ON uploaded_files(status);
CREATE INDEX IF NOT EXISTS idx_uf_category ON uploaded_files(category);

-- ===== جداول نتائج الاختبارات =====

CREATE TABLE IF NOT EXISTS exam_results (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  wrong_count INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}' NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  reviewed BOOLEAN DEFAULT FALSE NOT NULL,
  teacher_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_er_student_id ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_er_quiz_id ON exam_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_er_score ON exam_results(score);
