-- Mux live streaming metadata on classes (stream key visible to admins in app only)

alter table public.classes
  add column if not exists mux_playback_id text,
  add column if not exists mux_stream_key text,
  add column if not exists mux_status text not null default 'idle';

comment on column public.classes.mux_playback_id is 'Mux public playback id for HLS (stream.mux.com)';
comment on column public.classes.mux_stream_key is 'Mux RTMP stream key for OBS — admin only in UI';
comment on column public.classes.mux_status is 'Mux live stream status: idle, active, disabled, etc.';

-- Helper for RLS / policies
create or replace function public.is_studio_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members m
    where m.id = auth.uid() and coalesce(m.is_admin, false) = true
  );
$$;

revoke all on function public.is_studio_admin() from public;
grant execute on function public.is_studio_admin() to authenticated, anon;
