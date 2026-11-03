-- READ-ONLY schema inspection for UPS Creator Studio.
-- Run in Supabase SQL Editor. This query does not alter any data or schema.

select
  table_schema,
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'creator_projects')
order by table_name, ordinal_position;

-- Check whether RLS is enabled on expected tables.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'creator_projects')
  and c.relkind = 'r';

-- List existing policies; review before adding/changing any policy.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'creator_projects')
order by tablename, policyname;
