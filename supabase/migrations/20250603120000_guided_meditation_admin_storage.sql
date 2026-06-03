-- Guided meditation session type + admin upload access to private meditations bucket.

alter table public.classes drop constraint if exists classes_session_type_check;
alter table public.classes
  add constraint classes_session_type_check check (
    session_type in (
      'yoga',
      'pilates',
      'meditation',
      'guided_meditation',
      'hiit',
      'yin_yoga'
    )
  );

drop policy if exists "meditations_admin_all" on storage.objects;
create policy "meditations_admin_all"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'meditations'
    and public.is_studio_admin()
  )
  with check (
    bucket_id = 'meditations'
    and public.is_studio_admin()
  );
