export const COOKIE_CONSENT_KEY = 'calma_cookie_consent' as const
export const COOKIE_CONSENT_VALUE = 'accepted' as const

export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === COOKIE_CONSENT_VALUE
  } catch {
    return true
  }
}

export function setCookieConsent(): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE)
  } catch {
    /* private mode / blocked storage */
  }
}
