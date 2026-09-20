-- ============================================================
-- Teacher Platform - Main Schema Migration
-- Run this in Supabase SQL Editor or via Supabase CLI
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SUBJECTS (المواد الدراسية)
-- ============================================================
create table if not exists public.subjects (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.subjects is 'جدول المواد الدراسية';
alter table public.subjects enable row level security;

create policy "subjects_all_read" on public.subjects for select using (true);
create policy "subjects_admin_insert" on public.subjects for insert to authenticated with check (true);
create policy "subjects_admin_update" on public.subjects for update to authenticated using (true);
create policy "subjects_admin_delete" on public.subjects for delete to authenticated using (true);

-- ============================================================
-- STUDENTS (الطلاب)
-- ============================================================
create table if not exists public.students (
    id uuid primary key default uuid_generate_v4(),
    
    -- Basic Info
    name text not null,
    username text unique,
    email text,
    mobile text,
    phone text,
    
    -- Parent Info
    parent text,
    parent_email text,
    parent_google_email text,
    parent_phone text,
    parent_pass text,
    
    -- Passwords
    password text,
    student_pass text,
    
    -- Google Auth
    google_email text,
    google_id text,
    
    -- Profile
    photo text,
    birth_date date,
    address text,
    notes text,
    
    -- Academic
    grade_level text,
    subjects uuid[] default '{}',
    assigned_teacher_id uuid,
    
    -- Status
    status text default 'active' check (status in ('active', 'inactive', 'suspended')),
    
    -- Metadata
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.students is 'جدول بيانات الطلاب';
alter table public.students enable row level security;

-- RLS Policies for Students
create policy "students_teacher_read" on public.students for select 
    to authenticated 
    using (true);

create policy "students_teacher_insert" on public.students for insert 
    to authenticated 
    with check (true);

create policy "students_teacher_update" on public.students for update 
    to authenticated 
    using (true);

create policy "students_teacher_delete" on public.students for delete 
    to authenticated 
    using (true);

-- ============================================================
-- ADMINISTRATORS (المسؤولون)
-- ============================================================
create table if not exists public.admins (
    id uuid primary key default uuid_generate_v4(),
    
    -- Basic Info
    name text not null,
    email text unique not null,
    mobile text unique,
    
    -- Password (hashed)
    password text not null,
    
    -- Google Auth
    google_email text,
    google_id text,
    
    -- Profile
    photo text,
    role text default 'admin' check (role in ('admin', 'super_admin')),
    
    -- Settings
    whatsapp text,
    settings jsonb default '{}',
    
    -- Metadata
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.admins is 'جدول حسابات المسؤولين';
alter table public.admins enable row level security;

-- ============================================================
-- ATTENDANCE (الحضور والغياب)
-- ============================================================
create table if not exists public.attendance (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    
    -- Date & Time
    date date not null,
    time_in time,
    time_out time,
    
    -- Status
    status text not null default 'present' check (status in ('present', 'absent', 'late', 'excused')),
    notes text,
    
    -- Recorder
    recorded_by uuid,
    recorded_at timestamptz not null default now(),
    
    unique(student_id, date)
);

comment on table public.attendance is 'جدول الحضور والغياب';
alter table public.attendance enable row level security;

create policy "attendance_read" on public.attendance for select to authenticated using (true);
create policy "attendance_insert" on public.attendance for insert to authenticated with check (true);
create policy "attendance_update" on public.attendance for update to authenticated using (true);
create policy "attendance_delete" on public.attendance for delete to authenticated using (true);

-- ============================================================
-- GRADES (الدرجات)
-- ============================================================
create table if not exists public.grades (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    subject_id uuid references public.subjects(id) on delete set null,
    
    -- Score Info
    score decimal(5,2),
    max_score decimal(5,2) default 100,
    grade_letter text,
    grade_points decimal(3,2),
    
    -- Exam Info
    exam_title text,
    exam_type text check (exam_type in ('quiz', 'midterm', 'final', 'homework', 'project', 'other')),
    exam_date date,
    
    -- Notes
    notes text,
    
    -- Metadata
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.grades is 'جدول الدرجات';
alter table public.grades enable row level security;

create policy "grades_read" on public.grades for select to authenticated using (true);
create policy "grades_insert" on public.grades for insert to authenticated with check (true);
create policy "grades_update" on public.grades for update to authenticated using (true);
create policy "grades_delete" on public.grades for delete to authenticated using (true);

-- ============================================================
-- EXAMS (الاختبارات)
-- ============================================================
create table if not exists public.exams (
    id uuid primary key default uuid_generate_v4(),
    
    -- Basic Info
    title text not null,
    description text,
    subject_id uuid references public.subjects(id) on delete set null,
    
    -- Exam Settings
    duration_minutes integer default 60,
    total_marks decimal(5,2) default 100,
    passing_marks decimal(5,2) default 50,
    
    -- Questions (stored as JSON)
    questions jsonb default '[]',
    answers jsonb default '{}',
    
    -- Type & Status
    exam_type text default 'quiz' check (exam_type in ('quiz', 'midterm', 'final', 'practice')),
    status text default 'draft' check (status in ('draft', 'published', 'archived')),
    
    -- Settings
    shuffle_questions boolean default false,
    shuffle_answers boolean default false,
    show_results boolean default true,
    allow_review boolean default true,
    max_attempts integer,
    
    -- Schedule
    available_from timestamptz,
    available_until timestamptz,
    
    -- Proctoring
    proctoring_enabled boolean default false,
    proctoring_config jsonb default '{}',
    
    -- Metadata
    created_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.exams is 'جدول الاختبارات';
alter table public.exams enable row level security;

create policy "exams_read" on public.exams for select to authenticated using (true);
create policy "exams_insert" on public.exams for insert to authenticated with check (true);
create policy "exams_update" on public.exams for update to authenticated using (true);
create policy "exams_delete" on public.exams for delete to authenticated using (true);

-- ============================================================
-- EXAM ATTEMPTS (محاولات الاختبار)
-- ============================================================
create table if not exists public.exam_attempts (
    id uuid primary key default uuid_generate_v4(),
    exam_id uuid not null references public.exams(id) on delete cascade,
    student_id uuid not null references public.students(id) on delete cascade,
    
    -- Progress
    current_question integer default 0,
    answers jsonb default '{}',
    completed boolean default false,
    
    -- Results
    score decimal(5,2),
    total_score decimal(5,2),
    time_spent_seconds integer,
    
    -- Proctoring
    risk_score integer default 0,
    risk_events jsonb default '[]',
    
    -- Timing
    started_at timestamptz not null default now(),
    submitted_at timestamptz,
    updated_at timestamptz not null default now()
);

comment on table public.exam_attempts is 'جدول محاولات الاختبار';
alter table public.exam_attempts enable row level security;

create policy "exam_attempts_read" on public.exam_attempts for select to authenticated using (true);
create policy "exam_attempts_insert" on public.exam_attempts for insert to authenticated with check (true);
create policy "exam_attempts_update" on public.exam_attempts for update to authenticated using (true);

-- ============================================================
-- RECITATION & READING (التسميع والقراءة)
-- ============================================================
create table if not exists public.recitations (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    
    -- Recitation Info
    surah_from integer check (surah_from >= 1 and surah_from <= 114),
    surah_to integer check (surah_to >= 1 and surah_to <= 114),
    ayah_from integer,
    ayah_to integer,
    
    -- Type
    type text default 'recitation' check (type in ('recitation', 'memorization', 'review', 'reading')),
    
    -- Evaluation
    grade text check (grade in ('excellent', 'very_good', 'good', 'acceptable', 'needs_work')),
    score decimal(5,2),
    evaluator_notes text,
    
    -- Audio
    audio_url text,
    audio_duration_seconds integer,
    
    -- AI Analysis
    ai_analysis jsonb default '{}',
    ai_confidence decimal(5,2),
    
    -- Metadata
    evaluated_by uuid,
    evaluated_at timestamptz,
    created_at timestamptz not null default now()
);

comment on table public.recitations is 'جدول التسميع والقراءة';
alter table public.recitations enable row level security;

create policy "recitations_read" on public.recitations for select to authenticated using (true);
create policy "recitations_insert" on public.recitations for insert to authenticated with check (true);
create policy "recitations_update" on public.recitations for update to authenticated using (true);

-- ============================================================
-- AI QUESTION HISTORY (تاريخ أسئلة الذكاء الاصطناعي)
-- ============================================================
create table if not exists public.ai_question_history (
    id uuid primary key default uuid_generate_v4(),
    
    -- Generation Info
    generated_by uuid,
    topic text,
    difficulty text check (difficulty in ('easy', 'medium', 'hard', 'mixed')),
    
    -- Questions
    questions jsonb not null default '[]',
    
    -- Source
    source text default 'gemini' check (source in ('gemini', 'groq', 'manual')),
    source_model text,
    
    -- Context
    context jsonb default '{}',
    
    -- Metadata
    created_at timestamptz not null default now()
);

comment on table public.ai_question_history is 'جدول تاريخ أسئلة الذكاء الاصطناعي';
alter table public.ai_question_history enable row level security;

create policy "ai_history_read" on public.ai_question_history for select to authenticated using (true);
create policy "ai_history_insert" on public.ai_question_history for insert to authenticated with check (true);

-- ============================================================
-- NOTIFICATIONS (الإشعارات)
-- ============================================================
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    
    -- Recipient
    user_id uuid,
    email text,
    recipient_id text,
    
    -- Content
    type text not null,
    category text,
    title text not null,
    message text,
    
    -- Status
    read boolean default false,
    read_at timestamptz,
    
    -- Related
    related_type text,
    related_id text,
    
    -- Metadata
    created_at timestamptz not null default now()
);

comment on table public.notifications is 'جدول الإشعارات';
alter table public.notifications enable row level security;

create policy "notifications_read" on public.notifications for select 
    to authenticated 
    using (user_id = (select auth.uid()) or email = (select auth.jwt()->>'email'));

create policy "notifications_update" on public.notifications for update 
    to authenticated 
    using (user_id = (select auth.uid()) or email = (select auth.jwt()->>'email'));

-- ============================================================
-- DEVICES (الأجهزة)
-- ============================================================
create table if not exists public.devices (
    id uuid primary key default uuid_generate_v4(),
    
    -- Device Info
    device_id text unique not null,
    user_id uuid,
    user_name text,
    
    -- Status
    role text,
    last_seen_at timestamptz not null default now(),
    current_page text,
    locked_page text,
    
    -- Browser
    user_agent text,
    
    -- Metadata
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.devices is 'جدول الأجهزة المسجلة';
alter table public.devices enable row level security;

create policy "devices_read" on public.devices for select to authenticated using (true);
create policy "devices_insert" on public.devices for insert to authenticated with check (true);
create policy "devices_update" on public.devices for update to authenticated using (true);

-- ============================================================
-- PROCTORING INCIDENTS (حادثات المراقبة)
-- ============================================================
create table if not exists public.proctoring_incidents (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid,
    student_id uuid references public.students(id) on delete set null,
    exam_attempt_id uuid references public.exam_attempts(id) on delete set null,
    
    -- Incident Info
    event_type text not null,
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
    risk_score integer default 0,
    
    -- Details
    description text,
    metadata jsonb default '{}',
    
    -- Timestamp
    occurred_at timestamptz not null default now()
);

comment on table public.proctoring_incidents is 'جدول حادثات المراقبة';
alter table public.proctoring_incidents enable row level security;

create policy "proctoring_read" on public.proctoring_incidents for select to authenticated using (true);
create policy "proctoring_insert" on public.proctoring_incidents for insert to authenticated with check (true);

-- ============================================================
-- JOIN REQUESTS (طلبات الانضمام)
-- ============================================================
create table if not exists public.join_requests (
    id uuid primary key default uuid_generate_v4(),
    
    -- Requester Info
    student_name text,
    parent_name text,
    email text,
    phone text,
    grade_level text,
    
    -- Status
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_by uuid,
    reviewed_at timestamptz,
    rejection_reason text,
    
    -- Notes
    notes text,
    
    -- Metadata
    created_at timestamptz not null default now()
);

comment on table public.join_requests is 'جدول طلبات الانضمام';
alter table public.join_requests enable row level security;

create policy "join_requests_read" on public.join_requests for select to authenticated using (true);
create policy "join_requests_insert" on public.join_requests for insert to authenticated with check (true);
create policy "join_requests_update" on public.join_requests for update to authenticated using (true);

-- ============================================================
-- RECORD ELEMENTS (عناصر التسجيل)
-- ============================================================
create table if not exists public.record_elements (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid references public.students(id) on delete cascade,
    
    -- Element Info
    type text not null,
    title text,
    description text,
    
    -- Data
    data jsonb default '{}',
    
    -- Metadata
    created_by uuid,
    created_at timestamptz not null default now()
);

comment on table public.record_elements is 'جدول عناصر التسجيل';
alter table public.record_elements enable row level security;

create policy "record_elements_read" on public.record_elements for select to authenticated using (true);
create policy "record_elements_insert" on public.record_elements for insert to authenticated with check (true);
create policy "record_elements_update" on public.record_elements for update to authenticated using (true);

-- ============================================================
-- EXTRA ELEMENTS (عناصر إضافية)
-- ============================================================
create table if not exists public.extra_elements (
    id uuid primary key default uuid_generate_v4(),
    
    -- Element Info
    type text not null,
    name text,
    description text,
    category text,
    
    -- Data
    data jsonb default '{}',
    
    -- Active
    active boolean default true,
    
    -- Metadata
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.extra_elements is 'جدول العناصر الإضافية';
alter table public.extra_elements enable row level security;

create policy "extra_elements_read" on public.extra_elements for select to authenticated using (true);
create policy "extra_elements_insert" on public.extra_elements for insert to authenticated with check (true);
create policy "extra_elements_update" on public.extra_elements for update to authenticated using (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to relevant tables
drop trigger if exists students_updated_at on public.students;
create trigger students_updated_at before update on public.students for each row execute function public.update_updated_at();

drop trigger if exists subjects_updated_at on public.subjects;
create trigger subjects_updated_at before update on public.subjects for each row execute function public.update_updated_at();

drop trigger if exists grades_updated_at on public.grades;
create trigger grades_updated_at before update on public.grades for each row execute function public.update_updated_at();

drop trigger if exists exams_updated_at on public.exams;
create trigger exams_updated_at before update on public.exams for each row execute function public.update_updated_at();

drop trigger if exists exam_attempts_updated_at on public.exam_attempts;
create trigger exam_attempts_updated_at before update on public.exam_attempts for each row execute function public.update_updated_at();

drop trigger if exists devices_updated_at on public.devices;
create trigger devices_updated_at before update on public.devices for each row execute function public.update_updated_at();

drop trigger if exists extra_elements_updated_at on public.extra_elements;
create trigger extra_elements_updated_at before update on public.extra_elements for each row execute function public.update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_students_email on public.students(lower(email));
create index if not exists idx_students_mobile on public.students(mobile);
create index if not exists idx_students_parent_phone on public.students(parent_phone);
create index if not exists idx_students_status on public.students(status);

create index if not exists idx_attendance_student_date on public.attendance(student_id, date);
create index if not exists idx_attendance_date on public.attendance(date);

create index if not exists idx_grades_student on public.grades(student_id);
create index if not exists idx_grades_subject on public.grades(subject_id);
create index if not exists idx_grades_exam_date on public.grades(exam_date);

create index if not exists idx_exam_attempts_student on public.exam_attempts(student_id);
create index if not exists idx_exam_attempts_exam on public.exam_attempts(exam_id);
create index if not exists idx_exam_attempts_completed on public.exam_attempts(completed);

create index if not exists idx_recitations_student on public.recitations(student_id);
create index if not exists idx_recitations_date on public.recitations(created_at);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read);
create index if not exists idx_notifications_created on public.notifications(created_at desc);

create index if not exists idx_devices_user on public.devices(user_id);
create index if not exists idx_devices_last_seen on public.devices(last_seen_at desc);

create index if not exists idx_ai_history_created on public.ai_question_history(created_at desc);

-- ============================================================
-- GRANTS
-- ============================================================
grant usage on schema public to authenticated, anon;
grant all on all tables in schema public to authenticated, anon;
grant all on all sequences in schema public to authenticated, anon;

-- ============================================================
-- VERIFICATION
-- ============================================================
select 'Migration completed successfully!' as status;
