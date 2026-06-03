-- Public catalog read; only studio admins can mutate classes
alter table public.classes enable row level security;

drop policy if exists "classes_public_select" on public.classes;
create policy "classes_public_select"
  on public.classes for select
  using (true);

drop policy if exists "classes_admin_write" on public.classes;
create policy "classes_admin_write"
  on public.classes for insert to authenticated
  with check (
    exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  );

drop policy if exists "classes_admin_update" on public.classes;
create policy "classes_admin_update"
  on public.classes for update to authenticated
  using (
    exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  )
  with check (
    exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  );

drop policy if exists "classes_admin_delete" on public.classes;
create policy "classes_admin_delete"
  on public.classes for delete to authenticated
  using (
    exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  );
