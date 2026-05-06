-- =========================================================================
-- Merkly: analytics events, upgraded_at, en LinkedIn campagne tracking
-- =========================================================================

-- 1. upgraded_at kolom in profiles
alter table public.profiles
  add column if not exists upgraded_at timestamptz default null;

-- 2. analytics_events tabel
create table if not exists public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  event_type  text not null,
  user_id     uuid references auth.users(id) on delete set null,
  guide_id    uuid references public.brand_guides(id) on delete set null,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

-- Index voor dashboardqueries
create index if not exists analytics_events_event_type_idx on public.analytics_events (event_type);
create index if not exists analytics_events_user_id_idx    on public.analytics_events (user_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at desc);

-- RLS: alleen service-role mag schrijven/lezen (admin dashboard gebruikt service-role client)
alter table public.analytics_events enable row level security;

-- 3. linkedin_campaigns tabel (handmatige invoer door admin)
create table if not exists public.linkedin_campaigns (
  id            uuid primary key default gen_random_uuid(),
  week_start    date not null unique,
  impressions   integer not null default 0,
  clicks        integer not null default 0,
  spend_euros   numeric(10,2) not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.linkedin_campaigns enable row level security;

-- Trigger om updated_at bij te houden
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists linkedin_campaigns_updated_at on public.linkedin_campaigns;
create trigger linkedin_campaigns_updated_at
  before update on public.linkedin_campaigns
  for each row execute function public.set_updated_at();
