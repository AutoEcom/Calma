-- Optional: add structured "what to expect" bullets (json array of strings)
alter table public.classes
  add column if not exists what_to_expect jsonb not null default '[]'::jsonb;

comment on column public.classes.what_to_expect is 'Array of bullet strings, e.g. ["Mat provided","Arrive 10 min early"]';

-- Public thumbnails for classes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class-media',
  'class-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Read thumbnails without auth
drop policy if exists "class_media_public_read" on storage.objects;
create policy "class_media_public_read"
  on storage.objects for select
  using (bucket_id = 'class-media');

-- Admins manage objects in class-media
drop policy if exists "class_media_admin_insert" on storage.objects;
create policy "class_media_admin_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'class-media'
    and exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  );

drop policy if exists "class_media_admin_update" on storage.objects;
create policy "class_media_admin_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'class-media'
    and exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  )
  with check (bucket_id = 'class-media');

drop policy if exists "class_media_admin_delete" on storage.objects;
create policy "class_media_admin_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'class-media'
    and exists (
      select 1 from public.members m
      where m.id = auth.uid() and coalesce(m.is_admin, false) = true
    )
  );
