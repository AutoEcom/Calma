import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, mux-signature',
}

type MuxWebhookEnvelope = {
  type?: string
  data?: Record<string, unknown>
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function hexEncode(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

async function verifyMuxSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false

  const parts: Record<string, string> = {}
  for (const piece of signatureHeader.split(',')) {
    const eq = piece.indexOf('=')
    if (eq === -1) continue
    parts[piece.slice(0, eq).trim()] = piece.slice(eq + 1)
  }

  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const ts = Number.parseInt(timestamp, 10)
  if (!Number.isFinite(ts)) return false
  const ageSec = Math.abs(Date.now() / 1000 - ts)
  if (ageSec > 300) return false

  const payload = `${timestamp}.${rawBody}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const expected = hexEncode(mac)
  return timingSafeEqualHex(expected, signature)
}

function playbackIdFromData(data: Record<string, unknown>): string | null {
  const ids = data.playback_ids as { id?: string }[] | undefined
  const first = ids?.[0]?.id
  return typeof first === 'string' && first.length > 0 ? first : null
}

async function resolveClassId(
  db: ReturnType<typeof createClient>,
  data: Record<string, unknown>,
): Promise<string | null> {
  const passthrough = typeof data.passthrough === 'string' ? data.passthrough.trim() : ''
  if (passthrough) {
    const { data: byPass } = await db.from('classes').select('id').eq('id', passthrough).maybeSingle()
    if (byPass?.id) return byPass.id
  }

  const liveStreamId =
    typeof data.id === 'string'
      ? data.id
      : typeof data.live_stream_id === 'string'
        ? data.live_stream_id
        : null

  if (!liveStreamId) return null

  const { data: byLive } = await db
    .from('classes')
    .select('id')
    .eq('mux_live_stream_id', liveStreamId)
    .maybeSingle()

  return byLive?.id ?? null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Response(null, { status: 200 })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const webhookSecret = Deno.env.get('MUX_WEBHOOK_SECRET')?.trim()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!webhookSecret) {
      return jsonResponse({ error: 'MUX_WEBHOOK_SECRET is not configured' }, 500)
    }
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: 'Supabase env missing' }, 500)
    }

    const rawBody = await req.text()
    const muxSignature = req.headers.get('Mux-Signature')

    const valid = await verifyMuxSignature(rawBody, muxSignature, webhookSecret)
    if (!valid) {
      console.error('Invalid Mux webhook signature')
      return jsonResponse({ error: 'Invalid signature' }, 401)
    }

    const event = JSON.parse(rawBody) as MuxWebhookEnvelope
    const type = event.type ?? ''
    const data = (event.data ?? {}) as Record<string, unknown>

    const db = createClient(supabaseUrl, serviceKey)

    if (type === 'video.live_stream.active') {
      const classId = await resolveClassId(db, data)
      if (!classId) {
        console.warn('live_stream.active: no matching class', data.id, data.passthrough)
        return jsonResponse({ received: true, ignored: 'no_class' })
      }

      const playbackId = playbackIdFromData(data)
      const patch: Record<string, unknown> = { mux_status: 'active' }
      if (playbackId) patch.mux_playback_id = playbackId
      if (typeof data.id === 'string') patch.mux_live_stream_id = data.id

      const { error } = await db.from('classes').update(patch).eq('id', classId)
      if (error) {
        return jsonResponse({ error: error.message }, 500)
      }
      return jsonResponse({ received: true, class_id: classId, mux_status: 'active' })
    }

    if (type === 'video.asset.ready') {
      const liveStreamId = typeof data.live_stream_id === 'string' ? data.live_stream_id : null
      if (!liveStreamId) {
        return jsonResponse({ received: true, ignored: 'not_live_asset' })
      }

      const classId = await resolveClassId(db, data)
      if (!classId) {
        console.warn('asset.ready: no matching class', liveStreamId, data.passthrough)
        return jsonResponse({ received: true, ignored: 'no_class' })
      }

      const recordingPlaybackId = playbackIdFromData(data)
      if (!recordingPlaybackId) {
        return jsonResponse({ error: 'asset.ready missing playback_ids' }, 400)
      }

      const vodUrl = `https://stream.mux.com/${recordingPlaybackId}.m3u8`

      const { error } = await db
        .from('classes')
        .update({
          mux_status: 'finished',
          mux_recording_playback_id: recordingPlaybackId,
          video_url: vodUrl,
          is_live_active: false,
        })
        .eq('id', classId)

      if (error) {
        return jsonResponse({ error: error.message }, 500)
      }

      return jsonResponse({
        received: true,
        class_id: classId,
        mux_status: 'finished',
        mux_recording_playback_id: recordingPlaybackId,
      })
    }

    return jsonResponse({ received: true, ignored: type })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return jsonResponse({ error: message }, 500)
  }
})
