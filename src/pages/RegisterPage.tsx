import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthFormDivider } from '../components/auth/AuthFormDivider'
import { OAuthButtons } from '../components/auth/OAuthButtons'
import { supabase } from '../lib/supabase'

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    if (data.session) {
      setLoading(false)
      navigate('/dashboard', { replace: true })
      return
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(
        signInError.message.includes('Email not confirmed')
          ? 'Account created. Disable “Confirm email” in Supabase Auth settings for instant access, or confirm your email first.'
          : signInError.message,
      )
      return
    }

    if (signInData.session) {
      navigate('/dashboard', { replace: true })
      return
    }

    setError('Account created. Please log in to continue.')
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
          Create your account
        </h1>
        <p className="mt-1 text-sm tracking-wide text-[var(--text-muted)]">
          Email and password — add your name anytime in your profile.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
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
          <span className="text-[var(--text-muted)]">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <AuthFormDivider />
      <OAuthButtons />

      <p className="text-center text-sm text-[var(--text-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[var(--accent)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}
