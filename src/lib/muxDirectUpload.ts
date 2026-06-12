import { FunctionsHttpError } from '@supabase/supabase-js'
import { createUpload } from '@mux/upchunk'
import { supabase } from './supabase'

export type MuxDirectUploadSession = {
  upload_id: string
  upload_url: string
}

export type MuxUploadStatusResult = {
  status: string
  asset_status?: string
  asset_id?: string
  playback_id?: string
  hls_url?: string
  error?: string
}

export function muxHlsUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`
}

export function isMuxHlsUrl(value: string): boolean {
  return value.trim().startsWith('https://stream.mux.com/')
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

export async function requestMuxDirectUpload(options?: {
  passthrough?: string
}): Promise<{ data?: MuxDirectUploadSession; error?: string }> {
  const corsOrigin = typeof window !== 'undefined' ? window.location.origin : '*'

  const { data, error } = await supabase.functions.invoke<
    MuxDirectUploadSession & { error?: string }
  >('create-mux-upload', {
    body: {
      cors_origin: corsOrigin,
      passthrough: options?.passthrough,
    },
  })

  if (error) {
    if (error instanceof FunctionsHttpError) {
      return { error: await messageFromInvokeError(error) }
    }
    return { error: error.message }
  }

  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return { error: String(data.error) }
  }

  if (!data?.upload_id || !data?.upload_url) {
    return { error: 'Mux did not return an upload URL.' }
  }

  return { data: { upload_id: data.upload_id, upload_url: data.upload_url } }
}

export async function fetchMuxUploadStatus(
  uploadId: string,
): Promise<{ data?: MuxUploadStatusResult; error?: string }> {
  const { data, error } = await supabase.functions.invoke<MuxUploadStatusResult & { error?: string }>(
    'mux-upload-status',
    { body: { upload_id: uploadId } },
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

  return { data: data ?? undefined }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function waitForMuxHlsUrl(
  uploadId: string,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<{ hls_url: string; playback_id: string }> {
  const maxAttempts = options?.maxAttempts ?? 120
  const intervalMs = options?.intervalMs ?? 3000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await fetchMuxUploadStatus(uploadId)
    if (error) throw new Error(error)

    if (data?.status === 'errored') {
      throw new Error(data.error ?? 'Mux upload processing failed')
    }

    if (data?.hls_url && data.playback_id) {
      return { hls_url: data.hls_url, playback_id: data.playback_id }
    }

    await sleep(intervalMs)
  }

  throw new Error('Timed out waiting for Mux to prepare the HLS stream.')
}

export type MuxChunkUploadHandlers = {
  onProgress?: (percent: number) => void
  onError?: (message: string) => void
}

/** Chunked direct upload from browser → Mux (bypasses Supabase storage limits). */
export function uploadFileToMux(
  file: File,
  uploadUrl: string,
  handlers?: MuxChunkUploadHandlers,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const upload = createUpload({
      endpoint: uploadUrl,
      file,
      chunkSize: 5120,
    })

    upload.on('error', (err) => {
      const message = err.detail ?? 'Mux upload failed'
      handlers?.onError?.(message)
      reject(new Error(message))
    })

    upload.on('progress', (progress) => {
      handlers?.onProgress?.(progress.detail)
    })

    upload.on('success', () => {
      resolve()
    })
  })
}

export async function directUploadToMuxHls(
  file: File,
  options?: {
    passthrough?: string
    onProgress?: (percent: number) => void
  },
): Promise<{ hls_url: string; playback_id: string; upload_id: string }> {
  const session = await requestMuxDirectUpload({ passthrough: options?.passthrough })
  if (session.error || !session.data) {
    throw new Error(session.error ?? 'Could not create Mux upload session')
  }

  await uploadFileToMux(file, session.data.upload_url, {
    onProgress: options?.onProgress,
  })

  const ready = await waitForMuxHlsUrl(session.data.upload_id)
  return {
    ...ready,
    upload_id: session.data.upload_id,
  }
}
