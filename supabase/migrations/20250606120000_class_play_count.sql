-- Marketing listen counter: admins set an initial value; real plays increment via trigger.
alter table public.classes
  add column if not exists play_count integer not null default 0;

comment on column public.classes.play_count is
  'Public display listen count. Set explicitly when creating or editing a class; increments +1 on each completed audio listen.';

alter table public.classes
  drop constraint if exists classes_play_count_nonneg;

alter table public.classes
  add constraint classes_play_count_nonneg check (play_count >= 0);

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
