import { supabase } from './supabase'

const PLAY_COUNT_COOLDOWN_MS = 30_000

const lastPlayCountAt = new Map<string, number>()

/** Marketing play_count: +1 when audio actually starts (deduped client + server). */
export async function recordAudioPlayStart(classId: string): Promise<void> {
  const now = Date.now()
  const last = lastPlayCountAt.get(classId) ?? 0
  if (now - last < PLAY_COUNT_COOLDOWN_MS) return
  lastPlayCountAt.set(classId, now)

  await supabase.rpc('record_audio_listen', {
    p_class_id: classId,
    p_duration_seconds: 0,
    p_completed: false,
    p_play_start: true,
  })
}

/** Streak log when a session is fully completed (does not bump public play_count). */
export async function recordAudioListenComplete(
  classId: string,
  durationSeconds: number,
): Promise<void> {
  await supabase.rpc('record_audio_listen', {
    p_class_id: classId,
    p_duration_seconds: durationSeconds,
    p_completed: true,
    p_play_start: false,
  })
}
