import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { authCallbackUrl } from '../../lib/authRedirect'
import { cn } from '../../lib/utils'

type Provider = 'google' | 'apple'

type Props = {
  className?: string
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}

const buttonBase =
  'flex w-full items-center justify-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:opacity-60'

export function OAuthButtons({ className }: Props) {
  const [loading, setLoading] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function signIn(provider: Provider) {
    setError(null)
    setLoading(provider)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authCallbackUrl(),
      },
    })
    setLoading(null)
    if (oauthError) {
      setError(oauthError.message)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => void signIn('apple')}
        className={cn(
          buttonBase,
          'border-slate-800 bg-slate-900 text-white hover:bg-slate-800',
          'dark:border-slate-600 dark:bg-slate-950 dark:hover:bg-slate-900',
        )}
      >
        {loading === 'apple' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AppleMark />
        )}
        Continue with Apple
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => void signIn('google')}
        className={cn(
          buttonBase,
          'border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
          'dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
        )}
      >
        {loading === 'google' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleMark />
        )}
        Continue with Google
      </button>
      {error && <p className="text-center text-sm text-red-400">{error}</p>}
    </div>
  )
}
