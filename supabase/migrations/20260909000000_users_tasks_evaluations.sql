-- ============================================================
-- منصة ثِمار - تهيئة الجداول الرئيسية (المستخدمون، المهام، التقييمات)
-- Thimar Platform - Users, Tasks & Evaluations Schema
-- ============================================================

-- 1. تفعيل ملحق UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES & USERS (المستخدمون والملفات الشخصية)
-- ============================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'student' check (role in ('student', 'parent', 'teacher', 'admin', 'super_admin')),
    display_name text,
    phone text,
    national_id text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- سياسات الأمان للملفات الشخصية
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select 
    to authenticated using (id = auth.uid() or (select auth.jwt()->>'role') = 'service_role');

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update 
    to authenticated using (id = auth.uid() or (select auth.jwt()->>'role') = 'service_role');

-- ============================================================
-- TASKS (المهام والتكليفات القرآنية والتعليمية)
-- ============================================================
create table if not exists public.tasks (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    student_id uuid references public.students(id) on delete cascade,
    student_username text,
    subject_id uuid references public.subjects(id) on delete set null,
    task_type text not null default 'memorization' check (task_type in ('memorization', 'review', 'recitation', 'homework', 'exam', 'general')),
    surah integer check (surah >= 1 and surah <= 114),
    ayah_from integer,
    ayah_to integer,
    due_date timestamptz,
    status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
    priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
    completion_date timestamptz,
    student_notes text,
    teacher_notes text,
    assigned_by uuid,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.tasks is 'جدول مهام وتكليفات الطلاب (حفظ، مراجعة، واجبات)';
alter table public.tasks enable row level security;

-- سياسات المهام
drop policy if exists "tasks_read_all" on public.tasks;
create policy "tasks_read_all" on public.tasks for select to authenticated, anon using (true);

drop policy if exists "tasks_insert_auth" on public.tasks;
create policy "tasks_insert_auth" on public.tasks for insert to authenticated, anon with check (true);

drop policy if exists "tasks_update_auth" on public.tasks;
create policy "tasks_update_auth" on public.tasks for update to authenticated, anon using (true);

drop policy if exists "tasks_delete_auth" on public.tasks;
create policy "tasks_delete_auth" on public.tasks for delete to authenticated, anon using (true);

-- ============================================================
-- EVALUATIONS (التقييمات ودرجات التسميع والمتابعة)
-- ============================================================
create table if not exists public.evaluations (
    id uuid primary key default uuid_generate_v4(),
    student_id uuid not null references public.students(id) on delete cascade,
    student_username text,
    task_id uuid references public.tasks(id) on delete set null,
    evaluator_id uuid,
    evaluator_name text,
    evaluation_type text not null default 'recitation' check (evaluation_type in ('recitation', 'memorization', 'tajweed', 'behavior', 'exam', 'general')),
    score decimal(5,2),
    max_score decimal(5,2) default 100,
    rating text check (rating in ('ممتاز', 'جيد جدا', 'جيد', 'مقبول', 'يحتاج متابعة', 'excellent', 'very_good', 'good', 'acceptable', 'needs_work')),
    feedback text,
    mistakes_count integer default 0,
    tajweed_notes text,
    surah integer check (surah >= 1 and surah <= 114),
    ayah_from integer,
    ayah_to integer,
    audio_url text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.evaluations is 'جدول تقييمات الطلاب والتسميع والمتابعة الدورية';
alter table public.evaluations enable row level security;

-- سياسات التقييمات
drop policy if exists "evaluations_read_all" on public.evaluations;
create policy "evaluations_read_all" on public.evaluations for select to authenticated, anon using (true);

drop policy if exists "evaluations_insert_auth" on public.evaluations;
create policy "evaluations_insert_auth" on public.evaluations for insert to authenticated, anon with check (true);

drop policy if exists "evaluations_update_auth" on public.evaluations;
create policy "evaluations_update_auth" on public.evaluations for update to authenticated, anon using (true);

drop policy if exists "evaluations_delete_auth" on public.evaluations;
create policy "evaluations_delete_auth" on public.evaluations for delete to authenticated, anon using (true);

-- ============================================================
-- APP SNAPSHOTS (لقطات بيانات المنصة المستمرة)
-- ============================================================
create table if not exists public.app_snapshots (
    id text primary key,
    data jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

comment on table public.app_snapshots is 'جدول لقطات تخزين بيانات التطبيق في Supabase';
alter table public.app_snapshots enable row level security;

drop policy if exists "app_snapshots_read_all" on public.app_snapshots;
create policy "app_snapshots_read_all" on public.app_snapshots for select to authenticated, anon using (true);

drop policy if exists "app_snapshots_write_all" on public.app_snapshots;
create policy "app_snapshots_write_all" on public.app_snapshots for insert to authenticated, anon with check (true);

drop policy if exists "app_snapshots_update_all" on public.app_snapshots;
create policy "app_snapshots_update_all" on public.app_snapshots for update to authenticated, anon using (true);

-- ============================================================
-- فهارس تحسين الأداء (Indexes)
-- ============================================================
create index if not exists idx_tasks_student on public.tasks(student_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);

create index if not exists idx_evaluations_student on public.evaluations(student_id);
create index if not exists idx_evaluations_task on public.evaluations(task_id);
create index if not exists idx_evaluations_created on public.evaluations(created_at desc);

-- ============================================================
-- الصلاحيات العامة (Grants)
-- ============================================================
grant usage on schema public to authenticated, anon;
grant all on all tables in schema public to authenticated, anon;
grant all on all sequences in schema public to authenticated, anon;

-- نتيجة التنفيذ
select 'تم إنشاء جداول المستخدمين والمهام والتقييمات ولقطات التطبيق بنجاح!' as result;
