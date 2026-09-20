-- Creates a minimal, ownership-scoped profile for every Supabase Auth user.
-- Apply this migration in the Supabase SQL editor or with the Supabase CLI.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'parent', 'teacher', 'admin')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'student';
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('student', 'parent', 'teacher', 'admin'));

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to postgres, service_role;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 120), ''),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;
grant execute on function private.handle_new_auth_user() to postgres, service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create or replace function private.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'profile id cannot be changed';
  end if;
  if new.role is distinct from old.role and current_user not in ('postgres', 'service_role') then
    new.role := old.role;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.protect_profile_role() from public, anon, authenticated;
grant execute on function private.protect_profile_role() to postgres, service_role;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute function private.protect_profile_role();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke insert, delete on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;

insert into public.profiles (id, display_name, role)
select u.id,
       nullif(left(coalesce(u.raw_user_meta_data ->> 'display_name', ''), 120), ''),
       'student'
from auth.users u
on conflict (id) do nothing;

comment on table public.profiles is 'User-owned profile; role is assigned by trusted database administration only.';
