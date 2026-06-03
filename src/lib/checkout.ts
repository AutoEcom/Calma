import { supabase } from './supabase'
import { sanctuaryDetailPath } from './classKind'

export async function startCheckoutForClass(
  classId: string,
): Promise<{ url?: string; error?: string }> {
  const origin = window.location.origin
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-checkout-session',
    {
      body: {
        classId,
        successUrl: `${origin}/class/${classId}?status=success`,
        cancelUrl: `${origin}/class/${classId}?status=cancel`,
      },
    },
  )

  if (error) {
    return { error: error.message }
  }
  if (data && 'error' in data && data.error) {
    return { error: String(data.error) }
  }
  if (!data?.url) {
    return { error: 'No checkout URL returned' }
  }
  return { url: data.url }
}

export type SanctuaryCheckoutTarget = {
  classId: string
  slug: string
}

/** Stripe checkout for a single meditation — returns to `/sanctuary/:slug`. */
export async function startCheckoutForSanctuarySession(
  target: SanctuaryCheckoutTarget,
): Promise<{ url?: string; error?: string }> {
  const origin = window.location.origin
  const path = sanctuaryDetailPath({ id: target.classId, slug: target.slug })
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-checkout-session',
    {
      body: {
        classId: target.classId,
        slug: target.slug,
        successUrl: `${origin}${path}?status=success`,
        cancelUrl: `${origin}${path}?status=cancel`,
      },
    },
  )

  if (error) return { error: error.message }
  if (data?.error) return { error: String(data.error) }
  if (!data?.url) return { error: 'No checkout URL returned' }
  return { url: data.url }
}

/** Stripe checkout for a bundle that includes this meditation. */
export async function startCheckoutForSanctuaryBundle(
  bundleId: string,
  returnTarget: SanctuaryCheckoutTarget,
): Promise<{ url?: string; error?: string }> {
  const origin = window.location.origin
  const path = sanctuaryDetailPath({ id: returnTarget.classId, slug: returnTarget.slug })
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'create-checkout-session',
    {
      body: {
        bundleId,
        classId: returnTarget.classId,
        slug: returnTarget.slug,
        successUrl: `${origin}${path}?status=success`,
        cancelUrl: `${origin}${path}?status=cancel`,
      },
    },
  )

  if (error) return { error: error.message }
  if (data?.error) return { error: String(data.error) }
  if (!data?.url) return { error: 'No checkout URL returned' }
  return { url: data.url }
}
