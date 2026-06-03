import type { Tables } from './database.types'

export const MEDITATIONS_BUCKET = 'meditations'

export const AUDIO_SANCTUARY_CATEGORIES = [
  'celestial_rituals',
  'mind_body_healing',
  'self_mastery',
  'daily_frequencies',
  'neural_reset',
] as const

export type AudioSanctuaryCategory = (typeof AUDIO_SANCTUARY_CATEGORIES)[number]

export type AudioSanctuaryStatus = 'active' | 'coming_soon'

export type AudioCredits = {
  guide?: string
  frequency?: string
  studio?: string
  [key: string]: string | undefined
}

export type AudioSanctuaryClass = Tables<'classes'> & {
  is_audio_sanctuary: true
  audio_sanctuary_category: AudioSanctuaryCategory
  sanctuary_status: AudioSanctuaryStatus
  audio_credits: AudioCredits
}

export const CATEGORY_LABELS: Record<AudioSanctuaryCategory, string> = {
  celestial_rituals: 'Celestial Rituals',
  mind_body_healing: 'Mind & Body Healing',
  self_mastery: 'Self Mastery',
  daily_frequencies: 'Daily Frequencies',
  neural_reset: 'Neural Reset',
}

export const CATEGORY_BLURBS: Record<AudioSanctuaryCategory, string> = {
  celestial_rituals: 'New Moon & Full Moon protocols aligned with lunar cycles.',
  mind_body_healing: 'Yoga Nidra and deep somatic resets for the nervous system.',
  self_mastery: 'Abundance, sleep, and confidence journeys for subconscious healing.',
  daily_frequencies: 'Short-frequency anchors for morning and evening rhythm.',
  neural_reset: 'Theta-rich neural resets for focus, calm, and recovery.',
}

/** Public catalog fields — never selects private R2 keys. */
export const AUDIO_SANCTUARY_SELECT =
  'id, slug, title, description, instructor_name, instructor_avatar_url, duration_minutes, price_in_cents, price_in_calma, image_url, audio_cover_art_url, is_audio_sanctuary, is_featured, audio_sanctuary_category, audio_credits, sanctuary_status, badge, usage_tip, play_count, scheduled_at, created_at'

export function parseAudioCredits(raw: unknown): AudioCredits {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const o = raw as Record<string, unknown>
  const out: AudioCredits = {}
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === 'string') out[k] = v
  }
  return out
}

export function formatCreditsLine(credits: AudioCredits): string {
  const parts: string[] = []
  if (credits.guide) parts.push(`Guide: ${credits.guide}`)
  if (credits.frequency) parts.push(credits.frequency)
  if (credits.studio) parts.push(credits.studio)
  return parts.join(' · ')
}
