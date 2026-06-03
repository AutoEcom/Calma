import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthFormDivider } from '../components/auth/AuthFormDivider'
import { OAuthButtons } from '../components/auth/OAuthButtons'
import { passwordResetRedirectUrl } from '../lib/authRedirect'
import { PasswordInput } from '../components/ui/PasswordInput'
import { zenCard } from '../lib/designSystem'
import { supabase } from '../lib/supabase'
import { cn } from '../lib/utils'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)
    if (signError) {
      setError(signError.message)
      return
    }
    navigate(from, { replace: true })
  }

  async function onForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }
    setError(null)
    setForgotLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: passwordResetRedirectUrl(),
    })
    setForgotLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setForgotSent(true)
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-0">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {forgotMode ? 'Reset password' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {forgotMode
            ? 'We will email you a secure link to choose a new password.'
            : 'Log in to continue your wellness journey.'}
        </p>
      </div>

      {forgotMode ? (
        <form
          onSubmit={onForgotPassword}
          className={cn('space-y-4 p-6', zenCard)}
        >
          <label className="block text-sm">
            <span className="text-[var(--text-muted)]">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {forgotSent ? (
            <p className="text-sm text-[var(--accent)]">
              Check your inbox for a password reset link.
            </p>
          ) : (
            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
            >
              {forgotLoading ? 'Sending…' : 'Send reset link'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setForgotMode(false)
              setForgotSent(false)
              setError(null)
            }}
            className="w-full text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ← Back to sign in
          </button>
        </form>
      ) : (
        <>
          <form
            onSubmit={onSubmit}
            className={cn('space-y-4 p-6', zenCard)}
          >
            <label className="block text-sm">
              <span className="text-[var(--text-muted)]">Email</span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[var(--text-muted)]">Password</span>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true)
                    setError(null)
                  }}
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <PasswordInput
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                inputClassName="rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <AuthFormDivider />
          <OAuthButtons />
        </>
      )}

      {!forgotMode && (
        <p className="text-center text-sm text-[var(--text-muted)]">
          No account?{' '}
          <Link to="/register" className="font-medium text-[var(--accent)] hover:underline">
            Create one
          </Link>
        </p>
      )}
    </div>
  )
}
