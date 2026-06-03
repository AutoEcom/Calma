-- Landing-page featuring, URL slugs, live vs guided meditation separation, premium audio MIME types.

-- ---------------------------------------------------------------------------
-- 1. is_featured (homepage catalog)
-- ---------------------------------------------------------------------------

alter table public.classes
  add column if not exists is_featured boolean not null default false;

comment on column public.classes.is_featured is
  'When true, show on the public landing page featured section.';

create index if not exists classes_is_featured_idx
  on public.classes (is_featured)
  where is_featured = true;

-- ---------------------------------------------------------------------------
-- 2. slug (unique, URL-friendly; auto-generated from title when missing)
-- ---------------------------------------------------------------------------

alter table public.classes
  add column if not exists slug text;

comment on column public.classes.slug is
  'Unique URL slug, e.g. new-moon-manifestation. Auto-generated from title when empty.';

create or replace function public.classes_slug_from_title(p_title text, p_id uuid)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  base text;
  candidate text;
  n int := 0;
begin
  base := lower(trim(coalesce(p_title, '')));
  base := regexp_replace(base, '[^a-zA-Z0-9]+', '-', 'g');
  base := trim(both '-' from base);
  if base = '' then
    base := 'class';
  end if;
  base := left(base, 80);
  candidate := base;

  while exists (
    select 1 from public.classes c
    where c.slug = candidate and c.id is distinct from p_id
  ) loop
    n := n + 1;
    candidate := left(base, 72) || '-' || left(replace(p_id::text, '-', ''), 8);
    if n > 1 then
      candidate := candidate || '-' || n::text;
    end if;
  end loop;

  return candidate;
end;
$$;

-- Backfill existing rows
update public.classes c
set slug = public.classes_slug_from_title(c.title, c.id)
where c.slug is null or trim(c.slug) = '';

alter table public.classes
  alter column slug set not null;

alter table public.classes drop constraint if exists classes_slug_unique;
alter table public.classes
  add constraint classes_slug_unique unique (slug);

create index if not exists classes_slug_idx on public.classes (slug);

create or replace function public.classes_ensure_slug()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.slug is null or trim(new.slug) = '' then
    new.slug := public.classes_slug_from_title(new.title, new.id);
  else
    new.slug := trim(both '-' from regexp_replace(lower(trim(new.slug)), '[^a-z0-9]+', '-', 'g'));
    if new.slug = '' then
      new.slug := public.classes_slug_from_title(new.title, new.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists classes_ensure_slug_trigger on public.classes;
create trigger classes_ensure_slug_trigger
  before insert or update of title, slug on public.classes
  for each row
  execute function public.classes_ensure_slug();

-- ---------------------------------------------------------------------------
-- 3. Guided meditations must not appear "live" (Mux / is_live_active)
-- ---------------------------------------------------------------------------

-- Align flags for existing guided rows
update public.classes
set
  is_audio_sanctuary = true,
  is_live_active = false,
  mux_status = case
    when lower(coalesce(mux_status, 'idle')) = 'active' then 'idle'
    else coalesce(mux_status, 'idle')
  end
where session_type = 'guided_meditation'
   or is_audio_sanctuary = true;

alter table public.classes drop constraint if exists classes_guided_meditation_live_separation;
alter table public.classes
  add constraint classes_guided_meditation_live_separation check (
    (
      session_type <> 'guided_meditation'
      and not is_audio_sanctuary
    )
    or (
      is_audio_sanctuary = true
      and coalesce(is_live_active, false) = false
      and lower(coalesce(mux_status, 'idle')) <> 'active'
    )
  );

alter table public.classes drop constraint if exists classes_guided_meditation_type_sync;
alter table public.classes
  add constraint classes_guided_meditation_type_sync check (
    session_type <> 'guided_meditation' or is_audio_sanctuary = true
  );

comment on constraint classes_guided_meditation_live_separation on public.classes is
  'Audio Sanctuary rows cannot be marked live (Mux active / is_live_active).';

-- ---------------------------------------------------------------------------
-- 4. Storage: premium audio MIME types on meditations (+ class-media admin)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meditations',
  'meditations',
  false,
  524288000,
  array[
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'video/mp4',
    'application/vnd.apple.mpegurl',
    'audio/mpegurl',
    'application/x-mpegURL',
    'video/mp2t',
    'application/octet-stream'
  ]::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- class-media: keep images; allow optional short preview audio for admins
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class-media',
  'class-media',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'video/mp4',
    'application/vnd.apple.mpegurl',
    'audio/mpegurl',
    'application/x-mpegURL'
  ]::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
