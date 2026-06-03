/** Canonical site URL for Supabase OAuth and password-reset redirects. */
export function getAuthRedirectOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000'
}

export function authCallbackUrl(): string {
  return `${getAuthRedirectOrigin()}/dashboard`
}

export function passwordResetRedirectUrl(): string {
  return `${getAuthRedirectOrigin()}/profile?recovery=1`
}
