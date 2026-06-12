import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
}

type MuxUploadData = {
  id: string
  url: string
  status: string
  timeout: number
}

type MuxCreateUploadResponse = {
  data?: MuxUploadData
  error?: { type?: string; message?: string; messages?: string[] }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function parseMuxError(payload: MuxCreateUploadResponse, httpStatus: number): string {
  if (payload.error?.messages?.length) return payload.error.messages.join(', ')
  if (payload.error?.message) return payload.error.message
  return `Mux API error (HTTP ${httpStatus})`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const muxTokenId = Deno.env.get('MUX_TOKEN_ID')?.trim()
    const muxTokenSecret = Deno.env.get('MUX_TOKEN_SECRET')?.trim()
    if (!muxTokenId || !muxTokenSecret) {
      return jsonResponse(
        {
          error:
            'MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set in Supabase Edge secrets.',
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
      return jsonResponse({ error: 'Admin access required.' }, 403)
    }

    const body = (await req.json().catch(() => ({}))) as {
      cors_origin?: string
      passthrough?: string
    }

    const corsOrigin =
      typeof body.cors_origin === 'string' && body.cors_origin.trim()
        ? body.cors_origin.trim()
        : '*'

    const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`)
    const muxBody: Record<string, unknown> = {
      cors_origin: corsOrigin,
      timeout: 3600,
      new_asset_settings: {
        playback_policies: ['public'],
        video_quality: 'basic',
      },
    }

    if (body.passthrough && typeof body.passthrough === 'string') {
      muxBody.passthrough = body.passthrough.slice(0, 255)
    }

    const muxRes = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${muxAuth}`,
      },
      body: JSON.stringify(muxBody),
    })

    const rawText = await muxRes.text()
    let muxJson: MuxCreateUploadResponse = {}
    try {
      muxJson = rawText ? (JSON.parse(rawText) as MuxCreateUploadResponse) : {}
    } catch {
      return jsonResponse(
        { error: `Mux returned invalid JSON (HTTP ${muxRes.status}): ${rawText.slice(0, 200)}` },
        502,
      )
    }

    if (!muxRes.ok || !muxJson.data?.url || !muxJson.data?.id) {
      const msg = parseMuxError(muxJson, muxRes.status)
      console.error('Mux create upload failed', muxRes.status, rawText.slice(0, 800))
      return jsonResponse({ error: msg }, 502)
    }

    return jsonResponse({
      upload_id: muxJson.data.id,
      upload_url: muxJson.data.url,
      status: muxJson.data.status,
      timeout: muxJson.data.timeout,
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return jsonResponse({ error: message }, 500)
  }
})
