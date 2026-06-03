import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type MuxStreamResult = {
  playback_id: string
  stream_key: string
  mux_status: string
  playback_url?: string
  live_stream_id?: string
  already_exists?: boolean
}

async function messageFromInvokeError(error: FunctionsHttpError): Promise<string> {
  const res = error.context as Response | undefined
  if (res && typeof res.json === 'function') {
    try {
      const body = (await res.json()) as { error?: string; message?: string }
      if (body?.error) return body.error
      if (body?.message) return body.message
    } catch {
      try {
        const text = await res.text()
        if (text.trim()) return text.slice(0, 500)
      } catch {
        /* ignore */
      }
    }
    if (res.status) return `${error.message} (HTTP ${res.status})`
  }
  return error.message
}

export async function createMuxStreamForClass(
  classId: string,
  options?: { force?: boolean },
): Promise<{ data?: MuxStreamResult; error?: string }> {
  const { data, error } = await supabase.functions.invoke<MuxStreamResult & { error?: string }>(
    'create-mux-stream',
    {
      body: { class_id: classId, force: options?.force ?? false },
    },
  )

  if (error) {
    if (error instanceof FunctionsHttpError) {
      return { error: await messageFromInvokeError(error) }
    }
    return { error: error.message }
  }

  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return { error: String(data.error) }
  }

  if (!data?.playback_id || !data?.stream_key) {
    return { error: 'Mux stream was not created (missing playback id or stream key).' }
  }

  return { data }
}
