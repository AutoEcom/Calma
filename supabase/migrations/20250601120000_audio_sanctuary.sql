-- Audio Sanctuary: guided meditations catalog, premium bundles, and consistency streaks.
-- Mirrors live-session ownership via public.classes + user_access / Stripe webhooks.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.audio_sanctuary_category as enum (
    'celestial_rituals',
    'mind_body_healing',
    'self_mastery',
    'daily_frequencies',
    'neural_reset'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.audio_sanctuary_status as enum (
    'active',
    'coming_soon'
  );
exception
  when duplicate_object then null;
end $$;

comment on type public.audio_sanctuary_category is
  'Audio Sanctuary transformation pillars: celestial rituals, somatic healing, self mastery, daily frequencies, neural reset.';

comment on type public.audio_sanctuary_status is
  'Catalog availability: active (streamable) vs coming_soon (waitlist / preview only).';

-- ---------------------------------------------------------------------------
-- classes: Audio Sanctuary metadata (nullable when row is a live session only)
-- ---------------------------------------------------------------------------

alter table public.classes
  add column if not exists is_audio_sanctuary boolean not null default false,
  add column if not exists audio_sanctuary_category public.audio_sanctuary_category,
  add column if not exists audio_credits jsonb not null default '{}'::jsonb,
  add column if not exists sanctuary_status public.audio_sanctuary_status,
  add column if not exists badge text,
  add column if not exists usage_tip text,
  add column if not exists audio_hls_atmos_key text,
  add column if not exists audio_hls_stereo_key text,
  add column if not exists audio_cover_art_url text;

comment on column public.classes.is_audio_sanctuary is
  'True when this class row is a guided meditation (Audio Sanctuary), not a live studio session.';

comment on column public.classes.audio_sanctuary_category is
  'One of five transformation categories for filter bar navigation.';

comment on column public.classes.audio_credits is
  'JSONB credits, e.g. {"guide":"Maya","frequency":"528Hz / Theta Beats","studio":"Pro Audio Lab"}.';

comment on column public.classes.sanctuary_status is
  'Audio availability: active vs coming_soon (maps to UI status).';

comment on column public.classes.badge is
  'Premium label, e.g. Best Seller, New Moon Protocol, Quantum Exclusive.';

comment on column public.classes.usage_tip is
  'Instructional protocol copy shown on the preview card.';

comment on column public.classes.audio_hls_atmos_key is
  'Path in private Storage bucket meditations for Dolby Atmos HLS master (.m3u8).';

comment on column public.classes.audio_hls_stereo_key is
  'Path in private Storage bucket meditations for Studio Stereo HLS master (.m3u8).';

comment on column public.classes.audio_cover_art_url is
  'Lock-screen / Media Session artwork (public CDN URL).';

alter table public.classes drop constraint if exists classes_audio_sanctuary_consistency;
alter table public.classes
  add constraint classes_audio_sanctuary_consistency check (
    (
      not is_audio_sanctuary
      and audio_sanctuary_category is null
      and sanctuary_status is null
    )
    or (
      is_audio_sanctuary
      and audio_sanctuary_category is not null
      and sanctuary_status is not null
    )
  );

create index if not exists classes_audio_sanctuary_category_idx
  on public.classes (audio_sanctuary_category)
  where is_audio_sanctuary = true;

create index if not exists classes_sanctuary_status_idx
  on public.classes (sanctuary_status)
  where is_audio_sanctuary = true;

-- ---------------------------------------------------------------------------
-- bundles + bundle_classes (Stripe-granted package access)
-- ---------------------------------------------------------------------------

create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  image_url text,
  badge text,
  price_in_cents integer not null default 0 check (price_in_cents >= 0),
  stripe_price_id text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.bundles is
  'Premium meditation bundles sold via Stripe; grants access to linked classes.';

create table if not exists public.bundle_classes (
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  sort_order integer not null default 0,
  primary key (bundle_id, class_id)
);

create index if not exists bundle_classes_class_id_idx on public.bundle_classes (class_id);

comment on table public.bundle_classes is
  'Many-to-many: which guided meditations belong to each bundle.';

-- Bundle access (parallel to user_access for single classes)
create table if not exists public.user_bundle_access (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  bundle_id uuid not null references public.bundles (id) on delete cascade,
  payment_method text,
  transaction_id text unique,
  granted_at timestamptz not null default now(),
  unique (member_id, bundle_id)
);

create index if not exists user_bundle_access_member_idx
  on public.user_bundle_access (member_id);

comment on table public.user_bundle_access is
  'Granted by Stripe checkout.session.completed when metadata.bundle_id is set.';

-- Extend user_access for bundle-origin grants (optional audit trail)
alter table public.user_access
  add column if not exists bundle_id uuid references public.bundles (id) on delete set null;

create index if not exists user_access_bundle_id_idx on public.user_access (bundle_id)
  where bundle_id is not null;

-- ---------------------------------------------------------------------------
-- user_streaks: 21-day consecutive listening foundation
-- ---------------------------------------------------------------------------

create table if not exists public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  target_days integer not null default 21 check (target_days > 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_listen_date date,
  streak_started_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, class_id)
);

create index if not exists user_streaks_member_idx on public.user_streaks (member_id);

comment on table public.user_streaks is
  'Per-member, per-meditation consistency matrix (e.g. 21-day quantum protocol).';

create table if not exists public.audio_listen_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  listened_at timestamptz not null default now(),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  completed boolean not null default false
);

create index if not exists audio_listen_events_member_class_idx
  on public.audio_listen_events (member_id, class_id, listened_at desc);

comment on table public.audio_listen_events is
  'Append-only listen log used to compute user_streaks (≥ threshold counts as a day).';

-- Coming-soon notification waitlist
create table if not exists public.audio_sanctuary_waitlist (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes (id) on delete cascade,
  email text not null,
  member_id uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (class_id, email)
);

-- ---------------------------------------------------------------------------
-- Streak updater (call from app after qualified listen)
-- ---------------------------------------------------------------------------

create or replace function public.record_audio_listen(
  p_class_id uuid,
  p_duration_seconds integer default 0,
  p_completed boolean default false
)
returns public.user_streaks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_min_seconds integer := 300;
  v_row public.user_streaks;
  v_last date;
begin
  if v_member_id is null then
    raise exception 'not authenticated';
  end if;

  if p_duration_seconds < v_min_seconds and not p_completed then
    return null;
  end if;

  insert into public.audio_listen_events (member_id, class_id, duration_seconds, completed)
  values (v_member_id, p_class_id, greatest(p_duration_seconds, 0), p_completed);

  select * into v_row
  from public.user_streaks
  where member_id = v_member_id and class_id = p_class_id
  for update;

  if not found then
    insert into public.user_streaks (
      member_id, class_id, current_streak, longest_streak,
      last_listen_date, streak_started_on, updated_at
    )
    values (v_member_id, p_class_id, 1, 1, v_today, v_today, now())
    returning * into v_row;
    return v_row;
  end if;

  v_last := v_row.last_listen_date;

  if v_last = v_today then
    update public.user_streaks set updated_at = now() where id = v_row.id
    returning * into v_row;
    return v_row;
  end if;

  if v_last = v_today - 1 then
    update public.user_streaks
    set
      current_streak = v_row.current_streak + 1,
      longest_streak = greatest(v_row.longest_streak, v_row.current_streak + 1),
      last_listen_date = v_today,
      updated_at = now()
    where id = v_row.id
    returning * into v_row;
  else
    update public.user_streaks
    set
      current_streak = 1,
      last_listen_date = v_today,
      streak_started_on = v_today,
      updated_at = now()
    where id = v_row.id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

revoke all on function public.record_audio_listen(uuid, integer, boolean) from public;
grant execute on function public.record_audio_listen(uuid, integer, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.bundles enable row level security;
alter table public.bundle_classes enable row level security;
alter table public.user_bundle_access enable row level security;
alter table public.user_streaks enable row level security;
alter table public.audio_listen_events enable row level security;
alter table public.audio_sanctuary_waitlist enable row level security;

drop policy if exists "bundles_public_select" on public.bundles;
create policy "bundles_public_select"
  on public.bundles for select
  using (is_published = true);

drop policy if exists "bundles_admin_write" on public.bundles;
create policy "bundles_admin_write"
  on public.bundles for all to authenticated
  using (public.is_studio_admin())
  with check (public.is_studio_admin());

drop policy if exists "bundle_classes_public_select" on public.bundle_classes;
create policy "bundle_classes_public_select"
  on public.bundle_classes for select
  using (true);

drop policy if exists "bundle_classes_admin_write" on public.bundle_classes;
create policy "bundle_classes_admin_write"
  on public.bundle_classes for all to authenticated
  using (public.is_studio_admin())
  with check (public.is_studio_admin());

drop policy if exists "user_bundle_access_own_select" on public.user_bundle_access;
create policy "user_bundle_access_own_select"
  on public.user_bundle_access for select to authenticated
  using (member_id = auth.uid());

drop policy if exists "user_streaks_own_select" on public.user_streaks;
create policy "user_streaks_own_select"
  on public.user_streaks for select to authenticated
  using (member_id = auth.uid());

drop policy if exists "user_streaks_own_insert" on public.user_streaks;
create policy "user_streaks_own_insert"
  on public.user_streaks for insert to authenticated
  with check (member_id = auth.uid());

drop policy if exists "audio_listen_events_own_select" on public.audio_listen_events;
create policy "audio_listen_events_own_select"
  on public.audio_listen_events for select to authenticated
  using (member_id = auth.uid());

drop policy if exists "audio_sanctuary_waitlist_insert" on public.audio_sanctuary_waitlist;
create policy "audio_sanctuary_waitlist_insert"
  on public.audio_sanctuary_waitlist for insert
  with check (true);

drop policy if exists "audio_sanctuary_waitlist_admin_select" on public.audio_sanctuary_waitlist;
create policy "audio_sanctuary_waitlist_admin_select"
  on public.audio_sanctuary_waitlist for select to authenticated
  using (public.is_studio_admin());
