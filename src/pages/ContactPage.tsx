export function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Contact</h1>
      <p className="leading-relaxed text-[var(--text-muted)]">
        Questions about memberships, private sessions, or partnerships?
      </p>
      <p>
        <a
          href="mailto:hello@calma.bg"
          className="text-lg font-medium text-[var(--accent)] hover:underline"
        >
          hello@calma.bg
        </a>
      </p>
    </div>
  )
}
