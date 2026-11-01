-- Migration: 20261101000000_standby_schema.sql
-- Description: Standby full database schema with RLS, indexes, and security definer functions.

-- 1. Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(title) >= 1 and char_length(title) <= 120),
  kind text not null check (kind in ('wedding', 'birthday', 'community', 'other')),
  event_date date not null,
  guest_count int not null check (guest_count > 0 and guest_count <= 5000),
  budget_total numeric(12,2) not null check (budget_total >= 0),
  outdoor boolean not null default false,
  brief text not null check (char_length(brief) <= 1500),
  plan jsonb,
  created_at timestamptz not null default now()
);

-- 2. Risks table (Pre-Mortem)
create table if not exists public.risks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  likelihood int not null check (likelihood >= 1 and likelihood <= 5),
  impact int not null check (impact >= 1 and impact <= 5),
  plan_b text not null
);

-- 3. Tasks table (Call Sheet Timeline)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  duration_days int not null check (duration_days >= 1),
  depends_on uuid[] not null default '{}',
  due_date date,
  done boolean not null default false
);

-- 4. Vendors table
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  category text not null,
  name text not null default '',
  status text not null default 'to_call' check (status in ('to_call', 'quoted', 'booked', 'confirmed')),
  quote numeric(12,2),
  deadline date
);

-- 5. Budget items table (Monte Carlo Reality Simulator)
create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  min_cost numeric(12,2) not null,
  likely_cost numeric(12,2) not null,
  max_cost numeric(12,2) not null check (min_cost <= likely_cost and likely_cost <= max_cost),
  scales_with_guests boolean not null default false
);

-- 6. Share links table
create table if not exists public.share_links (
  token text primary key check (char_length(token) >= 32),
  event_id uuid not null references public.events(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  expires_at timestamptz not null
);

-- 7. AI usage quota tracking
create table if not exists public.ai_usage (
  owner_id uuid not null references auth.users(id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  count int not null default 0,
  primary key (owner_id, day)
);

-- =====================================================================
-- INDEXES on foreign keys and owner_id
-- =====================================================================
create index if not exists idx_events_owner on public.events(owner_id);
create index if not exists idx_events_date on public.events(event_date);

create index if not exists idx_risks_event on public.risks(event_id);
create index if not exists idx_risks_owner on public.risks(owner_id);

create index if not exists idx_tasks_event on public.tasks(event_id);
create index if not exists idx_tasks_owner on public.tasks(owner_id);
create index if not exists idx_tasks_due on public.tasks(due_date);

create index if not exists idx_vendors_event on public.vendors(event_id);
create index if not exists idx_vendors_owner on public.vendors(owner_id);

create index if not exists idx_budget_items_event on public.budget_items(event_id);
create index if not exists idx_budget_items_owner on public.budget_items(owner_id);

create index if not exists idx_share_links_event on public.share_links(event_id);
create index if not exists idx_share_links_owner on public.share_links(owner_id);
create index if not exists idx_share_links_expiry on public.share_links(expires_at);

create index if not exists idx_ai_usage_lookup on public.ai_usage(owner_id, day);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
alter table public.events enable row level security;
alter table public.risks enable row level security;
alter table public.tasks enable row level security;
alter table public.vendors enable row level security;
alter table public.budget_items enable row level security;
alter table public.share_links enable row level security;
alter table public.ai_usage enable row level security;

-- Events policy: only owner can read/write
create policy "events_owner_policy"
  on public.events
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Risks policy
create policy "risks_owner_policy"
  on public.risks
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Tasks policy
create policy "tasks_owner_policy"
  on public.tasks
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Vendors policy
create policy "vendors_owner_policy"
  on public.vendors
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Budget items policy
create policy "budget_items_owner_policy"
  on public.budget_items
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Share links policy
create policy "share_links_owner_policy"
  on public.share_links
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- AI usage policy
create policy "ai_usage_owner_policy"
  on public.ai_usage
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- =====================================================================
-- FUNCTIONS (Security Definer & Utilities)
-- =====================================================================

-- 1. ping(): returns now(), granted to anon
create or replace function public.ping()
returns timestamptz
language sql
stable
security definer
set search_path = ''
as $$
  select clock_timestamp();
$$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- 2. consume_ai_quota(p_max int): atomic quota check & increment
create or replace function public.consume_ai_quota(p_max int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_today date := (now() at time zone 'utc')::date;
  v_current_count int;
begin
  if v_user_id is null then
    return false;
  end if;

  insert into public.ai_usage (owner_id, day, count)
  values (v_user_id, v_today, 1)
  on conflict (owner_id, day)
  do update set count = public.ai_usage.count + 1
  returning count into v_current_count;

  if v_current_count > p_max then
    return false;
  end if;

  return true;
end;
$$;

revoke execute on function public.consume_ai_quota(int) from public;
grant execute on function public.consume_ai_quota(int) to authenticated;

-- 3. get_shared_event(p_token text): safe read-only payload, no owner IDs
create or replace function public.get_shared_event(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_result jsonb;
begin
  select event_id into v_event_id
  from public.share_links
  where token = p_token
    and expires_at > now();

  if v_event_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'event', (
      select jsonb_build_object(
        'id', e.id,
        'title', e.title,
        'kind', e.kind,
        'event_date', e.event_date,
        'guest_count', e.guest_count,
        'budget_total', e.budget_total,
        'outdoor', e.outdoor,
        'brief', e.brief,
        'plan', e.plan,
        'created_at', e.created_at
      )
      from public.events e
      where e.id = v_event_id
    ),
    'tasks', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'title', t.title,
          'duration_days', t.duration_days,
          'depends_on', t.depends_on,
          'due_date', t.due_date,
          'done', t.done
        ) order by t.due_date asc nulls last
      )
      from public.tasks t
      where t.event_id = v_event_id
    ), '[]'::jsonb),
    'risks', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'title', r.title,
          'likelihood', r.likelihood,
          'impact', r.impact,
          'plan_b', r.plan_b
        )
      )
      from public.risks r
      where r.event_id = v_event_id
    ), '[]'::jsonb),
    'vendors', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'category', v.category,
          'name', v.name,
          'status', v.status,
          'quote', v.quote,
          'deadline', v.deadline
        ) order by v.category asc
      )
      from public.vendors v
      where v.event_id = v_event_id
    ), '[]'::jsonb),
    'budget_items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'name', b.name,
          'min_cost', b.min_cost,
          'likely_cost', b.likely_cost,
          'max_cost', b.max_cost,
          'scales_with_guests', b.scales_with_guests
        )
      )
      from public.budget_items b
      where b.event_id = v_event_id
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.get_shared_event(text) from public;
grant execute on function public.get_shared_event(text) to anon, authenticated;
