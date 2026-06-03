/** Public/catalog queries — excludes mux_stream_key (OBS secret). */
export const CLASS_PUBLIC_SELECT =
  'id, slug, title, description, instructor_name, instructor_avatar_url, scheduled_at, duration_minutes, price_in_cents, price_in_calma, image_url, video_url, audio_cover_art_url, what_to_expect, is_live_active, is_featured, is_audio_sanctuary, audio_sanctuary_category, audio_credits, sanctuary_status, badge, usage_tip, play_count, created_at, created_by, max_capacity, session_type, session_level, mux_playback_id, mux_recording_playback_id, mux_status'
