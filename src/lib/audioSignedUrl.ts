import { supabase } from './supabase'

export type AudioStreamVariant = 'atmos' | 'stereo'

import { MEDITATIONS_BUCKET } from './audioSanctuary'

export { MEDITATIONS_BUCKET }
export const SIGNED_URL_EXPIRY_SEC = 60

export type SignedAudioUrlResponse = {
  url: string
  variant: AudioStreamVariant
  expiresIn: number
  storagePath?: string
  source?: 'mux' | 'storage' | 'direct'
}

/** Short-lived signed URL for a path in the private `meditations` bucket. */
export async function createMeditationSignedUrl(
  storagePath: string,
  expiresIn = SIGNED_URL_EXPIRY_SEC,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MEDITATIONS_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Failed to sign meditation URL')
  }

  return data.signedUrl
}

/**
 * Resolves a playable HLS URL after server-side access check (edge function uses
 * service role `createSignedUrl`; client refresh uses the same Storage API).
 */
export async function fetchSignedAudioUrl(
  classId: string,
  variant: AudioStreamVariant,
): Promise<SignedAudioUrlResponse> {
  const { data, error } = await supabase.functions.invoke('audio-signed-url', {
    body: { classId, variant },
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to sign audio URL')
  }

  const payload = data as SignedAudioUrlResponse & { error?: string }
  if (payload.error || !payload.url) {
    throw new Error(payload.error ?? 'Invalid signed URL response')
  }

  return payload
}
