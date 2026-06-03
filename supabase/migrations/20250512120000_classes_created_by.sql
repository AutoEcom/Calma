alter table public.classes
  add column if not exists created_by uuid references public.members (id) on delete set null;

create index if not exists classes_created_by_idx on public.classes (created_by);

comment on column public.classes.created_by is 'Member who created the class (admin/instructor).';
