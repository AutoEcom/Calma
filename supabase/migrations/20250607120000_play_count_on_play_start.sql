-- Play-count bumps on play start; streaks still use completed / qualified listens.

alter table public.audio_listen_events
  add column if not exists counts_play_count boolean not null default true;

comment on column public.audio_listen_events.counts_play_count is
  'When true, this row increments classes.play_count via trigger.';

create or replace function public.bump_class_play_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.counts_play_count, true) then
    update public.classes
    set play_count = play_count + 1
    where id = new.class_id;
  end if;
  return new;
end;
$$;

create or replace function public.record_audio_listen(
  p_class_id uuid,
  p_duration_seconds integer default 0,
  p_completed boolean default false,
  p_play_start boolean default false
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

  if p_play_start then
    if exists (
      select 1
      from public.audio_listen_events e
      where e.member_id = v_member_id
        and e.class_id = p_class_id
        and e.counts_play_count = true
        and e.listened_at > now() - interval '30 seconds'
    ) then
      return null;
    end if;

    insert into public.audio_listen_events (
      member_id, class_id, duration_seconds, completed, counts_play_count
    )
    values (v_member_id, p_class_id, 0, false, true);

    return null;
  end if;

  if p_duration_seconds < v_min_seconds and not p_completed then
    return null;
  end if;

  insert into public.audio_listen_events (
    member_id, class_id, duration_seconds, completed, counts_play_count
  )
  values (
    v_member_id,
    p_class_id,
    greatest(p_duration_seconds, 0),
    p_completed,
    false
  );

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

revoke all on function public.record_audio_listen(uuid, integer, boolean, boolean) from public;
grant execute on function public.record_audio_listen(uuid, integer, boolean, boolean) to authenticated;
