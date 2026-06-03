import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
}

type MuxLiveStreamData = {
  id: string
  status: string
  stream_key: string
  playback_ids?: { id: string; policy?: string }[]
}

type MuxErrorPayload = {
  type?: string
  message?: string
  messages?: string[]
}

type MuxCreateResponse = {
  data?: MuxLiveStreamData
  error?: MuxErrorPayload
  errors?: string[] | MuxErrorPayload[]
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function parseMuxError(payload: MuxCreateResponse, httpStatus: number): string {
  if (payload.error?.messages?.length) return payload.error.messages.join(', ')
  if (payload.error?.message) return payload.error.message
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const first = payload.errors[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object' && 'message' in first) {
      return String((first as MuxErrorPayload).message)
    }
  }
  return `Mux API error (HTTP ${httpStatus})`
}

async function createMuxLiveStream(
  muxTokenId: string,
  muxTokenSecret: string,
  classId: string,
  includeReducedLatency: boolean,
): Promise<{ ok: true; live: MuxLiveStreamData } | { ok: false; message: string }> {
  const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`)
  const body: Record<string, unknown> = {
    playback_policies: ['public'],
    new_asset_settings: { playback_policies: ['public'] },
    passthrough: classId,
    test: false,
  }
  if (includeReducedLatency) {
    body.latency_mode = 'reduced'
  }

  const muxRes = await fetch('https://api.mux.com/video/v1/live-streams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${muxAuth}`,
    },
    body: JSON.stringify(body),
  })

  const rawText = await muxRes.text()
  let muxJson: MuxCreateResponse = {}
  try {
    muxJson = rawText ? (JSON.parse(rawText) as MuxCreateResponse) : {}
  } catch {
    return {
      ok: false,
      message: `Mux returned invalid JSON (HTTP ${muxRes.status}): ${rawText.slice(0, 200)}`,
    }
  }

  if (!muxRes.ok || !muxJson.data) {
    const msg = parseMuxError(muxJson, muxRes.status)
    console.error('Mux create live stream failed', muxRes.status, rawText.slice(0, 800))
    return { ok: false, message: msg }
  }

  return { ok: true, live: muxJson.data }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const muxTokenId = Deno.env.get('MUX_TOKEN_ID')?.trim()
    const muxTokenSecret = Deno.env.get('MUX_TOKEN_SECRET')?.trim()
    if (!muxTokenId || !muxTokenSecret) {
      return jsonResponse(
        {
          error:
            'MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in Supabase Edge secrets (exact names, no extra spaces).',
        },
        500,
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnon || !serviceKey) {
      return jsonResponse({ error: 'Supabase env missing' }, 500)
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Missing Authorization header — log in again and retry.' }, 401)
    }

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()

    if (userErr || !user) {
      return jsonResponse(
        { error: userErr?.message ?? 'Unauthorized — session invalid or expired.' },
        401,
      )
    }

    const db = createClient(supabaseUrl, serviceKey)

    const { data: member, error: memberErr } = await db
      .from('members')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (memberErr) {
      return jsonResponse({ error: `Could not verify admin: ${memberErr.message}` }, 500)
    }

    if (!member?.is_admin) {
      return jsonResponse(
        {
          error:
            'Admin access required. Set is_admin = true for your user in the members table.',
        },
        403,
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      class_id?: string
      force?: boolean
    }

    const classId = body.class_id
    if (!classId) {
      return jsonResponse({ error: 'class_id is required' }, 400)
    }

    const { data: cls, error: classErr } = await db
      .from('classes')
      .select('id, title, mux_playback_id, mux_stream_key, mux_status')
      .eq('id', classId)
      .maybeSingle()

    if (classErr) {
      return jsonResponse({ error: classErr.message }, 500)
    }

    if (!cls) {
      return jsonResponse({ error: 'Class not found' }, 404)
    }

    if (cls.mux_playback_id && cls.mux_stream_key && !body.force) {
      return jsonResponse({
        playback_id: cls.mux_playback_id,
        stream_key: cls.mux_stream_key,
        mux_status: cls.mux_status ?? 'idle',
        already_exists: true,
      })
    }

    let muxResult = await createMuxLiveStream(muxTokenId, muxTokenSecret, classId, true)
    if (!muxResult.ok && muxResult.message.toLowerCase().includes('latency')) {
      muxResult = await createMuxLiveStream(muxTokenId, muxTokenSecret, classId, false)
    }

    if (!muxResult.ok) {
      if (
        muxResult.message.toLowerCase().includes('unauthorized') ||
        muxResult.message.includes('401')
      ) {
        return jsonResponse(
          {
            error:
              'Mux rejected the API credentials. Check MUX_TOKEN_ID / MUX_TOKEN_SECRET in Supabase secrets (Mux → Settings → Access Tokens).',
          },
          502,
        )
      }
      return jsonResponse({ error: muxResult.message }, 502)
    }

    const live = muxResult.live
    const playbackId = live.playback_ids?.[0]?.id ?? null
    const streamKey = live.stream_key
    const muxStatus = live.status ?? 'idle'

    if (!playbackId || !streamKey) {
      return jsonResponse(
        {
          error: 'Mux response missing playback id or stream key',
          mux_status: live.status,
        },
        502,
      )
    }

    const liveHls = `https://stream.mux.com/${playbackId}.m3u8`

    const { error: upErr } = await db
      .from('classes')
      .update({
        mux_playback_id: playbackId,
        mux_stream_key: streamKey,
        mux_status: muxStatus,
        mux_live_stream_id: live.id,
        video_url: liveHls,
      })
      .eq('id', classId)

    if (upErr) {
      return jsonResponse({ error: upErr.message }, 500)
    }

    return jsonResponse({
      playback_id: playbackId,
      stream_key: streamKey,
      mux_status: muxStatus,
      live_stream_id: live.id,
      playback_url: liveHls,
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return jsonResponse({ error: message }, 500)
  }
})
