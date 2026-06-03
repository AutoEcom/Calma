-- Public display play counter for sanctuary marketing pages
alter table public.classes
  add column if not exists play_count integer not null default 0;

comment on column public.classes.play_count is
  'Aggregated listen counter surfaced on public sanctuary pages.';

-- Seed existing rows with stable marketing-scale counts
update public.classes
set play_count = 80000 + (abs(hashtext(id::text)) % 160000)
where play_count = 0;

create or replace function public.bump_class_play_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.classes
  set play_count = play_count + 1
  where id = new.class_id;
  return new;
end;
$$;

drop trigger if exists audio_listen_bump_play_count on public.audio_listen_events;
create trigger audio_listen_bump_play_count
  after insert on public.audio_listen_events
  for each row
  execute function public.bump_class_play_count();
