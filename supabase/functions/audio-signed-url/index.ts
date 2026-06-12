import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
}

const MEDITATIONS_BUCKET = 'meditations'
const SIGNED_URL_EXPIRY_SEC = 60

type Body = {
  classId?: string
  variant?: 'atmos' | 'stereo'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseAnon || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser()

  if (userErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const body = (await req.json().catch(() => ({}))) as Body
  const classId = body.classId
  const variant = body.variant === 'atmos' ? 'atmos' : 'stereo'

  if (!classId) {
    return new Response(JSON.stringify({ error: 'classId required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: cls, error: classErr } = await admin
    .from('classes')
    .select(
      'id,is_audio_sanctuary,sanctuary_status,audio_hls_atmos_key,audio_hls_stereo_key',
    )
    .eq('id', classId)
    .maybeSingle()

  if (classErr || !cls?.is_audio_sanctuary) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (cls.sanctuary_status !== 'active') {
    return new Response(JSON.stringify({ error: 'Not yet available' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: directAccess } = await admin
    .from('user_access')
    .select('id')
    .eq('member_id', user.id)
    .eq('class_id', classId)
    .not('access_granted', 'is', null)
    .limit(1)
    .maybeSingle()

  let allowed = !!directAccess

  if (!allowed) {
    const { data: bundleLinks } = await admin
      .from('bundle_classes')
      .select('bundle_id')
      .eq('class_id', classId)

    const bundleIds = (bundleLinks ?? []).map((r) => r.bundle_id)
    if (bundleIds.length > 0) {
      const { data: bundleAccess } = await admin
        .from('user_bundle_access')
        .select('id')
        .eq('member_id', user.id)
        .in('bundle_id', bundleIds)
        .limit(1)
        .maybeSingle()
      allowed = !!bundleAccess
    }
  }

  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Purchase required' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const storagePath =
    variant === 'atmos' ? cls.audio_hls_atmos_key : cls.audio_hls_stereo_key

  if (!storagePath) {
    return new Response(JSON.stringify({ error: 'Stream not configured' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const trimmedPath = storagePath.trim()
  const isMuxHls =
    trimmedPath.startsWith('https://stream.mux.com/') &&
    trimmedPath.endsWith('.m3u8')

  if (isMuxHls) {
    return new Response(
      JSON.stringify({
        url: trimmedPath,
        variant,
        expiresIn: SIGNED_URL_EXPIRY_SEC,
        storagePath: trimmedPath,
        source: 'mux',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const { data: signed, error: signErr } = await admin.storage
    .from(MEDITATIONS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SEC)

  if (signErr || !signed?.signedUrl) {
    console.error('createSignedUrl', signErr)
    return new Response(JSON.stringify({ error: 'Signing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(
    JSON.stringify({
      url: signed.signedUrl,
      variant,
      expiresIn: SIGNED_URL_EXPIRY_SEC,
      storagePath,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
