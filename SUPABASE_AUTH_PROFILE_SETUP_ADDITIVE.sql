-- UPS Creator Studio: additive Auth/Profile/Projects setup
-- Review in Supabase SQL Editor before running. Take a database backup first.
-- This script is additive and does not delete user data or grant admin roles.
begin;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text,
  city text,
  role text not null default 'tester',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists user_id uuid;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists role text default 'tester';
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Ensure a user_id foreign key exists when the table predates this setup.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'f'
      and conkey = array[
        (select attnum from pg_attribute
         where attrelid = 'public.profiles'::regclass and attname = 'user_id')
      ]::smallint[]
  ) then
    alter table public.profiles
      add constraint ups_profiles_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create or replace function public.ups_handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first text;
  v_last text;
  v_city text;
  v_full text;
begin
  v_first := nullif(trim(new.raw_user_meta_data->>'first_name'), '');
  v_last := nullif(trim(new.raw_user_meta_data->>'last_name'), '');
  v_city := nullif(trim(new.raw_user_meta_data->>'city'), '');
  v_full := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name',
                                  concat_ws(' ', v_first, v_last))), '');

  insert into public.profiles
    (user_id, first_name, last_name, full_name, city, role, created_at, updated_at)
  values
    (new.id, v_first, v_last, v_full, v_city, 'tester', now(), now())
  on conflict (user_id) do update set
    first_name = coalesce(excluded.first_name, public.profiles.first_name),
    last_name = coalesce(excluded.last_name, public.profiles.last_name),
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    city = coalesce(excluded.city, public.profiles.city),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists ups_on_auth_user_created on auth.users;
create trigger ups_on_auth_user_created
after insert on auth.users
for each row execute procedure public.ups_handle_new_auth_user();

alter table public.profiles enable row level security;

drop policy if exists "UPS profiles read own" on public.profiles;
create policy "UPS profiles read own"
on public.profiles for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "UPS profiles update own" on public.profiles;
create policy "UPS profiles update own"
on public.profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- Prevent users from assigning themselves privileged roles.
create or replace function public.ups_guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.role := 'tester';
    elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
      raise exception 'Profile role changes require trusted administrator authorization';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ups_profiles_role_guard_insert on public.profiles;
drop trigger if exists ups_profiles_role_guard_update on public.profiles;
create trigger ups_profiles_role_guard_insert
before insert on public.profiles
for each row execute function public.ups_guard_profile_role();
create trigger ups_profiles_role_guard_update
before update of role on public.profiles
for each row execute function public.ups_guard_profile_role();

create table if not exists public.creator_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null default 'Untitled Project',
  project_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_projects enable row level security;

drop policy if exists "UPS users read own projects" on public.creator_projects;
create policy "UPS users read own projects"
on public.creator_projects for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "UPS users insert own projects" on public.creator_projects;
create policy "UPS users insert own projects"
on public.creator_projects for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "UPS users update own projects" on public.creator_projects;
create policy "UPS users update own projects"
on public.creator_projects for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "UPS users delete own projects" on public.creator_projects;
create policy "UPS users delete own projects"
on public.creator_projects for delete to authenticated
using (auth.uid() = user_id);

create index if not exists idx_ups_creator_projects_user_updated
on public.creator_projects(user_id, updated_at desc);

commit;

-- IMPORTANT:
-- 1) This does not configure Supabase Auth email confirmation or SMTP.
-- 2) Set Auth > URL Configuration: Site URL and Redirect URLs to the deployed site.
-- 3) Never expose service_role keys in browser code.
-- 4) Existing custom profile schemas must be reviewed before execution.
-- 5) The trigger grants only 'tester'; it never grants admin/super_admin.
