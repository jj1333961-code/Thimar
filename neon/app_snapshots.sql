-- Run once in the Neon SQL editor for this project.
-- The application creates the default admin account on its first password login.
create table if not exists public.app_snapshots (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
