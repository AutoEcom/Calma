-- Dolby Atmos: bypass Mux HLS — store Google Drive / direct stream URL instead.
alter table public.classes
  add column if not exists atmos_source_url text;

comment on column public.classes.atmos_source_url is
  'Direct Dolby Atmos master URL (Google Drive share link or raw .mp4). Bypasses Mux transcoding for spatial metadata.';

comment on column public.classes.audio_hls_atmos_key is
  'DEPRECATED: legacy Mux/storage Atmos HLS path. Use atmos_source_url for new Atmos masters.';
