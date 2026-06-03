import { supabase } from './supabase'

export async function openStripeCustomerPortal(): Promise<{ url?: string; error?: string }> {
  const origin = window.location.origin
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'stripe-customer-portal',
    {
      body: {
        returnUrl: `${origin}/profile`,
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
    return { error: 'No portal URL returned' }
  }
  return { url: data.url }
}
