-- Optional: run after migration to populate demo Audio Sanctuary catalog.
-- Example: psql $DATABASE_URL -f supabase/seed_audio_sanctuary.sql

insert into public.classes (
  title,
  description,
  instructor_name,
  duration_minutes,
  price_in_cents,
  price_in_calma,
  scheduled_at,
  session_type,
  session_level,
  is_audio_sanctuary,
  audio_sanctuary_category,
  sanctuary_status,
  audio_credits,
  badge,
  usage_tip,
  audio_hls_atmos_key,
  audio_hls_stereo_key
)
values
  (
    'New Moon Abundance',
    'A lunar-aligned abundance transmission with theta entrainment.',
    'Maya',
    42,
    2900,
    0,
    now(),
    'guided_meditation',
    'all',
    true,
    'celestial_rituals',
    'active',
    '{"guide":"Maya","frequency":"528Hz / Theta Beats","studio":"Pro Audio Lab"}'::jsonb,
    'New Moon Protocol',
    'The 21-Day Quantum Protocol: Listen for 21 consecutive days during the New Moon cycle.',
    'new-moon-abundance/atmos/master.m3u8',
    'new-moon-abundance/stereo/master.m3u8'
  ),
  (
    'Full Moon Release',
    'Coming soon: ceremonial release under the Full Moon.',
    'Elena',
    38,
    2900,
    0,
    now() + interval '14 days',
    'guided_meditation',
    'all',
    true,
    'celestial_rituals',
    'coming_soon',
    '{"guide":"Elena","frequency":"432Hz / Delta Wash","studio":"Pro Audio Lab"}'::jsonb,
    'Quantum Exclusive',
    'Arrive with intention; we will notify you when the portal opens.',
    null,
    null
  )
on conflict do nothing;
