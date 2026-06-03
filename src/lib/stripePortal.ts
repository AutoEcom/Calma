import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

async function portalInvokeErrorMessage(err: unknown): Promise<string> {
  if (err instanceof FunctionsFetchError) {
    return 'Billing portal is unavailable. The stripe-customer-portal edge function may not be deployed yet.'
  }
  if (err instanceof FunctionsHttpError) {
    try {
      const body = (await err.context.json()) as { error?: string }
      if (body?.error) return body.error
    } catch {
      /* ignore */
    }
    return err.message
  }
  if (err instanceof Error) return err.message
  return 'Could not open billing portal'
}

export async function openStripeCustomerPortal(): Promise<{ url?: string; error?: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token
  if (sessionError || !accessToken) {
    return { error: 'Please sign in again to manage billing.' }
  }

  const origin = window.location.origin
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
    'stripe-customer-portal',
    {
      body: {
        returnUrl: `${origin}/profile`,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (error) {
    return { error: await portalInvokeErrorMessage(error) }
  }
  if (data && 'error' in data && data.error) {
    return { error: String(data.error) }
  }
  if (!data?.url) {
    return { error: 'No portal URL returned' }
  }
  return { url: data.url }
}
