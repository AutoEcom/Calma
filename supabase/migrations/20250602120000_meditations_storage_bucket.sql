-- Private Supabase Storage bucket for premium guided meditation HLS masters.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meditations',
  'meditations',
  false,
  524288000,
  array[
    'application/vnd.apple.mpegurl',
    'audio/mpegurl',
    'application/x-mpegURL',
    'audio/mpeg',
    'audio/mp4',
    'video/mp2t',
    'application/octet-stream'
  ]::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on column public.classes.audio_hls_atmos_key is
  'Path inside storage bucket meditations for Atmos HLS master (.m3u8), e.g. new-moon-abundance/atmos/master.m3u8';

comment on column public.classes.audio_hls_stereo_key is
  'Path inside storage bucket meditations for Studio Stereo HLS master (.m3u8).';
