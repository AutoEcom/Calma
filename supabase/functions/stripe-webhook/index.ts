import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

/**
 * Checkout session metadata (must match create-checkout-session exactly):
 * - class_id OR bundle_id (Audio Sanctuary bundles)
 * - member_id
 * Fallback: client_reference_id === member_id (set on session create)
 */

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return new Response(null, { status: 200 })
  }

  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  /** Service role bypasses RLS for user_access writes */
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
      'Missing STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY',
    )
    return json(500, { error: 'Server misconfigured' })
  }

  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return json(400, { error: 'Missing stripe-signature' })
  }

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider()
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    )
  } catch (e) {
    console.error('Webhook signature verification failed', e)
    return json(400, { error: 'Invalid signature' })
  }

  if (event.type !== 'checkout.session.completed') {
    return json(200, { received: true, ignored: event.type })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const md = session.metadata ?? {}

  const classId = md.class_id ?? null
  const bundleId = md.bundle_id ?? null
  const memberId = md.member_id ?? session.client_reference_id ?? null

  if ((!classId && !bundleId) || !memberId) {
    console.error('checkout.session.completed missing class_id/bundle_id or member_id', {
      metadata: md,
      client_reference_id: session.client_reference_id,
    })
    return json(400, {
      error: 'Missing class_id or bundle_id, and member_id in session metadata',
    })
  }

  const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (bundleId) {
    const { data: existingBundle } = await admin
      .from('user_bundle_access')
      .select('id')
      .eq('transaction_id', session.id)
      .maybeSingle()

    if (existingBundle) {
      return json(200, { received: true, duplicate: true })
    }

    const { error: bundleErr } = await admin.from('user_bundle_access').insert({
      member_id: memberId,
      bundle_id: bundleId,
      payment_method: 'stripe',
      transaction_id: session.id,
      granted_at: new Date().toISOString(),
    })

    if (bundleErr) {
      console.error('user_bundle_access insert failed', bundleErr)
      return json(500, { error: bundleErr.message })
    }

    const { data: bundleClasses, error: linkErr } = await admin
      .from('bundle_classes')
      .select('class_id')
      .eq('bundle_id', bundleId)

    if (linkErr) {
      console.error('bundle_classes lookup failed', linkErr)
      return json(500, { error: linkErr.message })
    }

    for (const row of bundleClasses ?? []) {
      const { error: accessErr } = await admin.from('user_access').insert({
        member_id: memberId,
        class_id: row.class_id,
        bundle_id: bundleId,
        access_granted: 'full_access',
        payment_method: 'stripe',
        transaction_id: `${session.id}:${row.class_id}`,
        granted_at: new Date().toISOString(),
      })
      if (accessErr && accessErr.code !== '23505') {
        console.error('user_access bundle grant failed', accessErr)
      }
    }

    return json(200, { received: true, granted: true, bundle: true })
  }

  const { data: existing } = await admin
    .from('user_access')
    .select('id')
    .eq('transaction_id', session.id)
    .maybeSingle()

  if (existing) {
    return json(200, { received: true, duplicate: true })
  }

  const { error: insertErr } = await admin.from('user_access').insert({
    member_id: memberId,
    class_id: classId,
    access_granted: 'full_access',
    payment_method: 'stripe',
    transaction_id: session.id,
    granted_at: new Date().toISOString(),
  })

  if (insertErr) {
    console.error('user_access insert failed', insertErr)
    return json(500, { error: insertErr.message })
  }

  return json(200, { received: true, granted: true })
})
