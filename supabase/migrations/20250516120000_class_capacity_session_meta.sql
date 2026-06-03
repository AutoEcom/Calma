-- Class capacity + session type/level + public booking counts RPC

alter table public.classes
  add column if not exists max_capacity integer;

update public.classes set max_capacity = 20 where max_capacity is null;

alter table public.classes
  alter column max_capacity set not null,
  alter column max_capacity set default 20;

alter table public.classes drop constraint if exists classes_max_capacity_positive;
alter table public.classes
  add constraint classes_max_capacity_positive check (max_capacity > 0);

alter table public.classes
  add column if not exists session_type text not null default 'yoga';

alter table public.classes
  add column if not exists session_level text not null default 'all';

alter table public.classes drop constraint if exists classes_session_type_check;
alter table public.classes
  add constraint classes_session_type_check check (
    session_type in ('yoga', 'pilates', 'meditation', 'hiit', 'yin_yoga')
  );

alter table public.classes drop constraint if exists classes_session_level_check;
alter table public.classes
  add constraint classes_session_level_check check (
    session_level in ('beginner', 'intermediate', 'advanced', 'all')
  );

-- Aggregate booking counts (paid / granted access only). Callable by anon for catalog UI.
create or replace function public.class_booked_counts(p_ids uuid[])
returns table (class_id uuid, booked bigint)
language sql
security definer
set search_path = public
stable
as $$
  select ua.class_id, count(*)::bigint as booked
  from public.user_access ua
  where ua.class_id = any(p_ids)
    and ua.access_granted is not null
  group by ua.class_id;
$$;

revoke all on function public.class_booked_counts(uuid[]) from public;
grant execute on function public.class_booked_counts(uuid[]) to anon, authenticated;
