import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
}

type MuxPlaybackId = { id: string; policy?: string }

type MuxUploadRecord = {
  id: string
  status: string
  asset_id?: string | null
  error?: { type?: string; message?: string } | null
}

type MuxAssetRecord = {
  id: string
  status: string
  playback_ids?: MuxPlaybackId[]
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function muxHlsUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`
}

async function muxGet<T>(path: string, muxAuth: string): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const res = await fetch(`https://api.mux.com${path}`, {
    headers: { Authorization: `Basic ${muxAuth}` },
  })
  const raw = await res.text()
  let parsed: { data?: T; error?: { message?: string } } = {}
  try {
    parsed = raw ? JSON.parse(raw) : {}
  } catch {
    return { ok: false, message: `Mux invalid JSON (HTTP ${res.status})` }
  }
  if (!res.ok || !parsed.data) {
    return {
      ok: false,
      message: parsed.error?.message ?? `Mux API error (HTTP ${res.status})`,
    }
  }
  return { ok: true, data: parsed.data }
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
      return jsonResponse({ error: 'Mux credentials not configured' }, 500)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnon || !serviceKey) {
      return jsonResponse({ error: 'Supabase env missing' }, 500)
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser()

    if (userErr || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const db = createClient(supabaseUrl, serviceKey)
    const { data: member } = await db
      .from('members')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!member?.is_admin) {
      return jsonResponse({ error: 'Admin access required' }, 403)
    }

    const body = (await req.json().catch(() => ({}))) as { upload_id?: string }
    const uploadId = body.upload_id?.trim()
    if (!uploadId) {
      return jsonResponse({ error: 'upload_id required' }, 400)
    }

    const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`)
    const uploadResult = await muxGet<MuxUploadRecord>(
      `/video/v1/uploads/${encodeURIComponent(uploadId)}`,
      muxAuth,
    )

    if (!uploadResult.ok) {
      return jsonResponse({ error: uploadResult.message }, 502)
    }

    const upload = uploadResult.data

    if (upload.status === 'errored') {
      return jsonResponse({
        status: upload.status,
        error: upload.error?.message ?? 'Mux upload failed',
      })
    }

    if (upload.status === 'waiting') {
      return jsonResponse({ status: upload.status })
    }

    const assetId = upload.asset_id
    if (!assetId) {
      return jsonResponse({ status: upload.status })
    }

    const assetResult = await muxGet<MuxAssetRecord>(
      `/video/v1/assets/${encodeURIComponent(assetId)}`,
      muxAuth,
    )

    if (!assetResult.ok) {
      return jsonResponse({ error: assetResult.message }, 502)
    }

    const asset = assetResult.data
    const playbackId = asset.playback_ids?.[0]?.id ?? null

    if (asset.status !== 'ready' || !playbackId) {
      return jsonResponse({
        status: upload.status,
        asset_status: asset.status,
        asset_id: assetId,
      })
    }

    return jsonResponse({
      status: upload.status,
      asset_status: asset.status,
      asset_id: assetId,
      playback_id: playbackId,
      hls_url: muxHlsUrl(playbackId),
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return jsonResponse({ error: message }, 500)
  }
})
