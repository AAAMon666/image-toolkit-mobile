create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role text not null default 'user' check (role in ('super_admin', 'admin', 'user')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  remaining_credits integer not null default 0 check (remaining_credits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,
  related_request_id uuid,
  operator_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_credits integer not null check (requested_credits > 0),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.image_generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  ratio_key text not null,
  quality_key text not null,
  image_count integer not null check (image_count > 0),
  reference_count integer not null default 0 check (reference_count >= 0),
  credits_charged integer not null default 0 check (credits_charged >= 0),
  status text not null check (status in ('success', 'failed')),
  provider text not null default 'foropencode',
  provider_model text not null,
  error_message text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace trigger credit_accounts_set_updated_at
before update on public.credit_accounts
for each row
execute function public.set_updated_at();

create or replace function public.initialize_user_account(
  p_user_id uuid,
  p_username text,
  p_role text default 'user',
  p_initial_credits integer default 2
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.profiles (user_id, username, role)
  values (p_user_id, p_username, p_role)
  on conflict (user_id) do update
    set username = excluded.username,
        role = excluded.role;

  insert into public.credit_accounts (user_id, remaining_credits)
  values (p_user_id, greatest(p_initial_credits, 0))
  on conflict (user_id) do nothing;

  if p_initial_credits <> 0 and not exists (
    select 1
    from public.credit_ledger
    where user_id = p_user_id
      and reason = 'signup_bonus'
  ) then
    insert into public.credit_ledger (user_id, delta, reason)
    values (p_user_id, p_initial_credits, 'signup_bonus');
  end if;
end;
$$;

create or replace function public.consume_credits(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_related_request_id uuid default null,
  p_operator_user_id uuid default null
)
returns integer
language plpgsql
security definer
as $$
declare
  v_remaining integer;
begin
  if p_amount <= 0 then
    raise exception 'p_amount must be positive';
  end if;

  select remaining_credits
  into v_remaining
  from public.credit_accounts
  where user_id = p_user_id
  for update;

  if v_remaining is null then
    raise exception 'credit account missing';
  end if;

  if v_remaining < p_amount then
    raise exception 'insufficient_credits';
  end if;

  update public.credit_accounts
  set remaining_credits = remaining_credits - p_amount
  where user_id = p_user_id
  returning remaining_credits into v_remaining;

  insert into public.credit_ledger (user_id, delta, reason, related_request_id, operator_user_id)
  values (p_user_id, -p_amount, p_reason, p_related_request_id, p_operator_user_id);

  return v_remaining;
end;
$$;

create or replace function public.adjust_credits(
  p_user_id uuid,
  p_delta integer,
  p_reason text,
  p_operator_user_id uuid default null,
  p_related_request_id uuid default null
)
returns integer
language plpgsql
security definer
as $$
declare
  v_remaining integer;
begin
  insert into public.credit_accounts (user_id, remaining_credits)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  update public.credit_accounts
  set remaining_credits = greatest(remaining_credits + p_delta, 0)
  where user_id = p_user_id
  returning remaining_credits into v_remaining;

  insert into public.credit_ledger (user_id, delta, reason, related_request_id, operator_user_id)
  values (p_user_id, p_delta, p_reason, p_related_request_id, p_operator_user_id);

  return v_remaining;
end;
$$;

alter table public.profiles enable row level security;
alter table public.credit_accounts enable row level security;
alter table public.credit_ledger enable row level security;
alter table public.credit_applications enable row level security;
alter table public.image_generation_logs enable row level security;

create policy "users read own profile"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "users read own credit account"
on public.credit_accounts
for select
using (auth.uid() = user_id);

create policy "users read own ledger"
on public.credit_ledger
for select
using (auth.uid() = user_id);

create policy "users read own applications"
on public.credit_applications
for select
using (auth.uid() = user_id);

create policy "users create own applications"
on public.credit_applications
for insert
with check (auth.uid() = user_id);

create policy "users read own logs"
on public.image_generation_logs
for select
using (auth.uid() = user_id);
