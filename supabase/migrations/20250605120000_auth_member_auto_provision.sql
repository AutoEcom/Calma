-- Auto-provision public.members (+ wallet) on auth.users insert.
-- Enables frictionless email/password sign-up without client-side inserts.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_local text;
  v_display text;
begin
  v_email := coalesce(new.email, '');
  v_local := split_part(v_email, '@', 1);

  -- Clean email prefix for temporary display name (names edited later in profile).
  v_display := regexp_replace(v_local, '[^a-zA-Z0-9._-]', '', 'g');
  if v_display = '' then
    v_display := 'member';
  end if;
  v_display := initcap(v_display);

  insert into public.members (id, email, first_name, last_name, is_admin)
  values (new.id, v_email, v_display, '', false)
  on conflict (id) do update
    set email = excluded.email
    where public.members.email is distinct from excluded.email;

  insert into public.wallets (member_id, balance_calma)
  values (new.id, 0)
  on conflict (member_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Members: authenticated users can read and update their own row.
alter table public.members enable row level security;

drop policy if exists "members_select_public_instructors" on public.members;
create policy "members_select_public_instructors"
  on public.members
  for select
  to anon, authenticated
  using (coalesce(is_admin, false) = true);

drop policy if exists "members_select_self" on public.members;
create policy "members_select_self"
  on public.members
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "members_update_self" on public.members;
create policy "members_update_self"
  on public.members
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Wallets: allow members to read their own balance (created by trigger).
alter table public.wallets enable row level security;

drop policy if exists "wallets_select_self" on public.wallets;
create policy "wallets_select_self"
  on public.wallets
  for select
  to authenticated
  using (member_id = auth.uid());
