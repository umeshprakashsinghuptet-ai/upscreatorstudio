-- UPS Creator Studio: additive Hybrid Payment + Subscription foundation
-- Run once in Supabase SQL Editor after taking a database backup.
-- Does NOT alter or delete existing profiles / creator_projects / auth users.

create extension if not exists pgcrypto;

create table if not exists public.subscription_packages (
  package_code text primary key,
  audience text not null check (audience in ('learning_hub','creative_studios')),
  display_name text not null,
  description text not null default '',
  amount_paise bigint,
  currency text not null default 'INR' check (currency = 'INR'),
  duration_days integer,
  enabled boolean not null default false,
  selectable boolean not null default true,
  features jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint package_price_valid check (amount_paise is null or amount_paise > 0),
  constraint package_duration_valid check (duration_days is null or duration_days > 0)
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  package_code text not null references public.subscription_packages(package_code) on update cascade on delete restrict,
  selected_study text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','manual_pending','active','expired','rejected','cancelled')),
  starts_at timestamptz,
  expires_at timestamptz,
  activated_by uuid references auth.users(id) on delete set null,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint selected_study_required check (package_code <> 'learning_single_subject' or nullif(trim(selected_study),'') is not null),
  constraint subscription_dates_valid check (expires_at is null or starts_at is null or expires_at > starts_at)
);

create index if not exists user_subscriptions_user_status_idx
  on public.user_subscriptions(user_id, status, expires_at desc);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  subscription_id uuid not null references public.user_subscriptions(id) on delete restrict,
  amount_paise bigint not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  payment_method text not null check (payment_method in ('razorpay','upi_manual')),
  provider text not null check (provider in ('razorpay','manual_upi')),
  provider_order_id text unique,
  provider_payment_id text unique,
  manual_reference text unique,
  utr_or_upi_ref text,
  status text not null default 'pending'
    check (status in ('pending','authorized','paid','manual_pending','rejected','failed','refunded')),
  gateway_signature_verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_transactions_user_created_idx
  on public.payment_transactions(user_id, created_at desc);
create index if not exists payment_transactions_status_idx
  on public.payment_transactions(status, created_at desc);

-- Prevent the same manually supplied UTR/reference from being reused.
create unique index if not exists payment_transactions_unique_utr_idx
  on public.payment_transactions(utr_or_upi_ref)
  where utr_or_upi_ref is not null;

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_idx
  on public.admin_audit_logs(created_at desc);

-- Package seeds. Prices are stored in paise (₹50 = 5000 paise).
insert into public.subscription_packages
(package_code,audience,display_name,description,amount_paise,currency,duration_days,enabled,selectable,features,limits,sort_order)
values
('learning_daily','learning_hub','Daily Plan','Learning Hub access for one day.',5000,'INR',1,true,true,'{"learning_hub":true,"all_studies":true}'::jsonb,'{}'::jsonb,10),
('learning_single_subject','learning_hub','One Subject Access','One selected subject for one month.',20000,'INR',30,true,true,'{"learning_hub":true,"single_subject":true}'::jsonb,'{}'::jsonb,20),
('learning_complete_monthly','learning_hub','Complete Learning Access','All available Learning Hub subjects for one month.',50000,'INR',30,true,true,'{"learning_hub":true,"all_studies":true}'::jsonb,'{}'::jsonb,30),
('learning_annual','learning_hub','Annual Learning Plan','All available Learning Hub subjects for twelve months.',2000000,'INR',365,true,true,'{"learning_hub":true,"all_studies":true}'::jsonb,'{}'::jsonb,40),
('creative_custom','creative_studios','Creative Studios — Admin Configured','Price and duration must be configured by an authorized administrator before enabling.',null,'INR',null,false,false,'{"video":false,"image":false,"poster":false,"dance":false,"film_maker":false,"podcast":false}'::jsonb,'{}'::jsonb,100)
on conflict (package_code) do nothing;

create or replace function public.ups_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'super_admin'
  );
$$;

revoke all on function public.ups_is_super_admin() from public;
grant execute on function public.ups_is_super_admin() to authenticated;

alter table public.subscription_packages enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Public catalogue is readable only for enabled packages; admin can read all.
drop policy if exists ups_packages_read_enabled_or_admin on public.subscription_packages;
create policy ups_packages_read_enabled_or_admin
on public.subscription_packages for select to authenticated
using (enabled = true or public.ups_is_super_admin());

-- Users can read only their own subscription rows. Admin can read all.
drop policy if exists ups_subscriptions_read_own_or_admin on public.user_subscriptions;
create policy ups_subscriptions_read_own_or_admin
on public.user_subscriptions for select to authenticated
using (user_id = auth.uid() or public.ups_is_super_admin());

-- Payment history is private to the payer and Super Admin.
drop policy if exists ups_payments_read_own_or_admin on public.payment_transactions;
create policy ups_payments_read_own_or_admin
on public.payment_transactions for select to authenticated
using (user_id = auth.uid() or public.ups_is_super_admin());

-- Audit logs are admin-only.
drop policy if exists ups_audit_read_admin on public.admin_audit_logs;
create policy ups_audit_read_admin
on public.admin_audit_logs for select to authenticated
using (public.ups_is_super_admin());

-- No direct client writes: payment and activation writes must go through Edge Functions.
revoke all on public.user_subscriptions from anon, authenticated;
revoke all on public.payment_transactions from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;
grant select on public.subscription_packages to authenticated;
grant select on public.user_subscriptions to authenticated;
grant select on public.payment_transactions to authenticated;
grant select on public.admin_audit_logs to authenticated;

-- Keep the existing profiles policies and role-protection triggers unchanged.

-- Expiry worker: invoke only from trusted server/Edge Function or SQL Editor.
create or replace function public.ups_expire_due_subscriptions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_count integer;
begin
  update public.user_subscriptions
     set status = 'expired', updated_at = now()
   where status = 'active' and expires_at is not null and expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.ups_expire_due_subscriptions() from public, anon, authenticated;
grant execute on function public.ups_expire_due_subscriptions() to service_role;

-- Read-only helper for the signed-in user's current subscription status.
create or replace function public.ups_my_active_subscriptions()
returns table (
  subscription_id uuid,
  package_code text,
  selected_study text,
  starts_at timestamptz,
  expires_at timestamptz,
  package_audience text,
  package_features jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select s.id, s.package_code, s.selected_study, s.starts_at, s.expires_at, p.audience, p.features
  from public.user_subscriptions s
  join public.subscription_packages p on p.package_code = s.package_code
  where s.user_id = auth.uid()
    and s.status = 'active'
    and s.starts_at <= now()
    and s.expires_at > now()
    and p.enabled = true;
$$;
grant execute on function public.ups_my_active_subscriptions() to authenticated;

-- Atomic gateway settlement: Edge Functions call this only after provider verification.
create or replace function public.ups_activate_paid_subscription(
  p_transaction_id uuid,
  p_provider_payment_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns table(result_status text, result_expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx public.payment_transactions%rowtype;
  v_sub public.user_subscriptions%rowtype;
  v_days integer;
  v_now timestamptz := now();
  v_expiry timestamptz;
begin
  select * into v_tx from public.payment_transactions
   where id = p_transaction_id for update;
  if not found then raise exception 'Payment transaction not found'; end if;
  select * into v_sub from public.user_subscriptions
   where id = v_tx.subscription_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  if v_tx.status = 'paid' then
    return query select v_sub.status, v_sub.expires_at;
    return;
  end if;
  if v_tx.status not in ('pending','authorized') then raise exception 'Payment transaction is not pending'; end if;
  if v_tx.provider <> 'razorpay' then raise exception 'Wrong payment provider'; end if;
  select duration_days into v_days from public.subscription_packages
   where package_code = v_sub.package_code and enabled = true;
  if v_days is null or v_days <= 0 then raise exception 'Package duration is unavailable'; end if;
  v_expiry := v_now + make_interval(days => v_days);
  update public.payment_transactions
     set provider_payment_id = p_provider_payment_id,
         status = 'paid', gateway_signature_verified = true,
         metadata = coalesce(metadata,'{}'::jsonb) || coalesce(p_metadata,'{}'::jsonb),
         updated_at = v_now
   where id = v_tx.id;
  update public.user_subscriptions
     set status = 'active', starts_at = v_now, expires_at = v_expiry,
         activated_at = v_now, updated_at = v_now
   where id = v_sub.id;
  return query select 'active'::text, v_expiry;
end;
$$;
revoke all on function public.ups_activate_paid_subscription(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.ups_activate_paid_subscription(uuid,text,jsonb) to service_role;


-- Atomic manual-payment review. The payment and subscription status change
-- together in one database transaction; an audit row is written in the same transaction.
create or replace function public.ups_review_manual_payment_atomic(
  p_transaction_id uuid,
  p_decision text,
  p_actor_user_id uuid,
  p_rejection_reason text default null
)
returns table(result_status text, result_expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx public.payment_transactions%rowtype;
  v_sub public.user_subscriptions%rowtype;
  v_days integer;
  v_now timestamptz := now();
  v_expiry timestamptz;
begin
  if p_decision not in ('approve','reject') then
    raise exception 'Invalid review decision';
  end if;
  if p_actor_user_id is null or not exists (
    select 1 from public.profiles p
    where p.user_id = p_actor_user_id and p.role = 'super_admin'
  ) then
    raise exception 'Super Admin permission required';
  end if;

  select * into v_tx from public.payment_transactions
   where id = p_transaction_id and provider = 'manual_upi'
   for update;
  if not found or v_tx.status <> 'manual_pending' then
    raise exception 'Pending manual payment not found';
  end if;
  select * into v_sub from public.user_subscriptions
   where id = v_tx.subscription_id for update;
  if not found or v_sub.status <> 'manual_pending' then
    raise exception 'Pending subscription not found';
  end if;

  if p_decision = 'reject' then
    update public.payment_transactions
       set status = 'rejected', reviewed_by = p_actor_user_id,
           reviewed_at = v_now,
           rejection_reason = coalesce(nullif(trim(p_rejection_reason),''),'Not verified'),
           updated_at = v_now
     where id = v_tx.id;
    update public.user_subscriptions
       set status = 'rejected', updated_at = v_now
     where id = v_sub.id;
    insert into public.admin_audit_logs(actor_user_id,action,target_table,target_id,details)
    values (p_actor_user_id,'manual_payment_rejected','payment_transactions',v_tx.id::text,
            jsonb_build_object('reason',p_rejection_reason,'subscription_id',v_sub.id));
    return query select 'rejected'::text, null::timestamptz;
    return;
  end if;

  select duration_days into v_days from public.subscription_packages
   where package_code = v_sub.package_code and enabled = true;
  if v_days is null or v_days <= 0 then raise exception 'Package duration missing or disabled'; end if;
  v_expiry := v_now + make_interval(days => v_days);
  update public.payment_transactions
     set status = 'paid', reviewed_by = p_actor_user_id,
         reviewed_at = v_now, updated_at = v_now
   where id = v_tx.id;
  update public.user_subscriptions
     set status = 'active', starts_at = v_now, expires_at = v_expiry,
         activated_by = p_actor_user_id, activated_at = v_now, updated_at = v_now
   where id = v_sub.id;
  insert into public.admin_audit_logs(actor_user_id,action,target_table,target_id,details)
  values (p_actor_user_id,'manual_payment_approved','payment_transactions',v_tx.id::text,
          jsonb_build_object('subscription_id',v_sub.id,'user_id',v_tx.user_id));
  return query select 'active'::text, v_expiry;
end;
$$;
revoke all on function public.ups_review_manual_payment_atomic(uuid,text,uuid,text) from public, anon, authenticated;
grant execute on function public.ups_review_manual_payment_atomic(uuid,text,uuid,text) to service_role;
