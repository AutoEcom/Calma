import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <h1 className="text-3xl font-semibold text-[var(--text)]">Privacy policy</h1>
      <p className="text-sm text-[var(--text-muted)]">Last updated: May 2026</p>
      <div className="space-y-4 text-[var(--text-muted)]">
        <p>
          Calma collects information you provide (name, email, profile details) and technical
          data required to run the service (sessions, device data). We use Supabase for
          authentication and data storage, and Stripe for payments.
        </p>
        <p>
          We do not sell your personal data. Payment data is handled by Stripe according to their
          privacy practices. You may request access or deletion of your account data by contacting
          us at{' '}
          <a href="mailto:hello@calma.bg" className="text-[var(--accent)] hover:underline">
            hello@calma.bg
          </a>
          .
        </p>
        <p>
          We use cookies and similar technologies as needed for login and preferences. Analytics,
          if enabled, are configured to respect your privacy settings.
        </p>
      </div>
      <Link to="/" className="text-sm font-medium text-[var(--accent)] hover:underline">
        ← Back home
      </Link>
    </div>
  )
}
