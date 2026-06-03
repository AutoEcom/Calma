-- VOD: link live stream to class + store recording playback id when asset is ready

alter table public.classes
  add column if not exists mux_live_stream_id text,
  add column if not exists mux_recording_playback_id text;

comment on column public.classes.mux_live_stream_id is 'Mux live stream id (webhook lookup)';
comment on column public.classes.mux_recording_playback_id is 'Mux asset playback id after live ends (VOD replay)';

create index if not exists classes_mux_live_stream_id_idx
  on public.classes (mux_live_stream_id)
  where mux_live_stream_id is not null;
