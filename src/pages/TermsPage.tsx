import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <h1 className="text-3xl font-semibold text-[var(--text)]">Terms of service</h1>
      <p className="text-sm text-[var(--text-muted)]">Last updated: May 2026</p>
      <div className="space-y-4 text-[var(--text-muted)]">
        <p>
          By using Calma (&quot;we&quot;, &quot;us&quot;) digital services, you agree to these
          terms. Classes, recordings, and live sessions are offered subject to availability and
          instructor discretion.
        </p>
        <p>
          Payments are processed securely via Stripe. Access to paid content is granted after
          successful payment and may be revoked in cases of fraud, chargebacks, or abuse.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your account and for all
          activity under your credentials.
        </p>
        <p>
          We may update these terms from time to time. Continued use after changes constitutes
          acceptance of the revised terms.
        </p>
      </div>
      <Link to="/" className="text-sm font-medium text-[var(--accent)] hover:underline">
        ← Back home
      </Link>
    </div>
  )
}
