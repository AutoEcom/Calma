import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-requested-with',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY is not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnon) {
      return new Response(JSON.stringify({ error: 'Supabase env missing' }), {
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

    const body = (await req.json().catch(() => ({}))) as {
      classId?: string
      bundleId?: string
      slug?: string
      successUrl?: string
      cancelUrl?: string
    }

    const classId = body.classId
    const bundleId = body.bundleId
    const slug = body.slug?.trim() || null
    const successUrl = body.successUrl
    const cancelUrl = body.cancelUrl ?? successUrl

    if ((!classId && !bundleId) || !successUrl) {
      return new Response(
        JSON.stringify({ error: 'classId or bundleId, and successUrl are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const db =
      serviceKey != null && serviceKey.length > 0
        ? createClient(supabaseUrl, serviceKey)
        : userClient

    let lineItemName = 'Calma'
    let unitAmount = 0
    const metadata: Record<string, string> = {
      member_id: user.id,
    }
    if (slug) metadata.slug = slug
    if (classId) metadata.class_id = classId

    if (bundleId) {
      metadata.bundle_id = bundleId

      const { data: bundle, error: bundleErr } = await db
        .from('bundles')
        .select('id,title,price_in_cents,is_published')
        .eq('id', bundleId)
        .maybeSingle()

      if (bundleErr || !bundle) {
        return new Response(JSON.stringify({ error: 'Bundle not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!bundle.is_published) {
        return new Response(JSON.stringify({ error: 'Bundle is not available' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!bundle.price_in_cents || bundle.price_in_cents <= 0) {
        return new Response(JSON.stringify({ error: 'Bundle has no purchasable price' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      lineItemName = bundle.title
      unitAmount = bundle.price_in_cents
    } else if (classId) {
      const { data: cls, error: classErr } = await db
        .from('classes')
        .select(
          'id,title,price_in_cents,max_capacity,is_audio_sanctuary,session_type',
        )
        .eq('id', classId)
        .maybeSingle()

      if (classErr || !cls) {
        return new Response(JSON.stringify({ error: 'Class not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!cls.price_in_cents || cls.price_in_cents <= 0) {
        return new Response(JSON.stringify({ error: 'Class has no purchasable price' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const isSanctuary =
        cls.is_audio_sanctuary === true || cls.session_type === 'guided_meditation'

      if (!isSanctuary) {
        const maxCap =
          typeof cls.max_capacity === 'number' && cls.max_capacity > 0 ? cls.max_capacity : 20

        const { count: bookedCount, error: capErr } = await db
          .from('user_access')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', classId)
          .not('access_granted', 'is', null)

        if (capErr) {
          console.error('capacity count', capErr)
          return new Response(JSON.stringify({ error: 'Could not verify class capacity' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        if ((bookedCount ?? 0) >= maxCap) {
          return new Response(JSON.stringify({ error: 'This class is fully booked' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      lineItemName = cls.title
      unitAmount = cls.price_in_cents
    }

    const { data: member, error: memberErr } = await db
      .from('members')
      .select('id,email,first_name,last_name,stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (memberErr || !member) {
      return new Response(JSON.stringify({ error: 'Member profile missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const stripe = new Stripe(stripeSecret, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    let customerId = member.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: member.email,
        name: [member.first_name, member.last_name].filter(Boolean).join(' ') || undefined,
        metadata: { member_id: member.id },
      })
      customerId = customer.id

      if (serviceKey) {
        await db.from('members').update({ stripe_customer_id: customerId }).eq('id', member.id)
      }
    }

    const successJoin = successUrl.includes('?') ? '&' : '?'
    const successWithSession = `${successUrl}${successJoin}session_id={CHECKOUT_SESSION_ID}`

    // Webhook MUST read the same snake_case keys: class_id and/or bundle_id, member_id.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      client_reference_id: member.id,
      metadata,
      success_url: successWithSession,
      cancel_url: cancelUrl ?? successUrl,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: lineItemName,
            },
          },
          quantity: 1,
        },
      ],
    })

    if (!session.url) {
      return new Response(JSON.stringify({ error: 'Stripe did not return a URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
